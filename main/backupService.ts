import { getDb } from './db';
import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { DateTime } from 'luxon';

export async function runBackupService() {
  const db = await getDb();
  await db.read(); // Ensure we have the latest settings and backup dates from disk

  if (!db.data || !db.data.settings) return;
  const settings = db.data.settings;

  if (!settings.auto_backup) return;

  const now = DateTime.now();

  // 1. Check Main Backup
  const lastMain = settings.last_main_backup_date
    ? DateTime.fromISO(settings.last_main_backup_date)
    : null;
  let shouldMain = false;

  if (settings.main_backup_mode === 'monthly') {
    // Check if it's one of the target days OR it's the last day of month and some target days are "late"
    const isTargetDay = settings.main_backup_interval.includes(now.day);
    const isLastDay = now.day === now.daysInMonth;
    const hasLateDays = settings.main_backup_interval.some(d => d > now.daysInMonth);

    const isBackupTime = isTargetDay || (isLastDay && hasLateDays);
    const alreadyDoneToday = lastMain && lastMain.hasSame(now, 'day');
    shouldMain = isBackupTime && !alreadyDoneToday;
  } else {
    // Interval mode
    const interval = settings.main_backup_interval[0] || 7;
    if (!lastMain) {
      shouldMain = true;
    } else {
      const diffInDays = now.diff(lastMain, 'days').days;
      shouldMain = diffInDays >= interval;
    }
  }

  if (shouldMain && settings.main_backup_path) {
    console.log(`[Backup] Running main backup (${settings.main_backup_mode})...`);
    const success = await performBackup(settings.main_backup_path, 'main');
    if (success) {
      settings.last_main_backup_date = now.toISO();
      await db.write();
      console.log(`[Backup] Main backup date updated: ${settings.last_main_backup_date}`);
    }
  }

  // 2. Check Sub Backup
  const lastSub = settings.last_sub_backup_date
    ? DateTime.fromISO(settings.last_sub_backup_date)
    : null;
  let shouldSub = false;

  if (settings.sub_backup_mode === 'monthly') {
    const isTargetDay = settings.sub_backup_interval.includes(now.day);
    const isLastDay = now.day === now.daysInMonth;
    const hasLateDays = settings.sub_backup_interval.some(d => d > now.daysInMonth);

    const isBackupTime = isTargetDay || (isLastDay && hasLateDays);
    const alreadyDoneToday = lastSub && lastSub.hasSame(now, 'day');
    shouldSub = isBackupTime && !alreadyDoneToday;
  } else {
    const interval = settings.sub_backup_interval[0] || 30;
    if (!lastSub) {
      shouldSub = true;
    } else {
      const diffInDays = now.diff(lastSub, 'days').days;
      shouldSub = diffInDays >= interval;
    }
  }

  if (shouldSub && settings.sub_backup_path) {
    console.log(`[Backup] Running sub backup (${settings.sub_backup_mode})...`);
    const success = await performBackup(settings.sub_backup_path, 'sub');
    if (success) {
      settings.last_sub_backup_date = now.toISO();
      await db.write();
      console.log(`[Backup] Sub backup date updated: ${settings.last_sub_backup_date}`);
    }
  }

  // 3. Run individual cleanups
  await runCleanupService(
    'main',
    settings.main_backup_path,
    settings.main_auto_delete_enabled,
    settings.main_retention_years,
    settings.main_retention_months,
    settings.main_retention_days,
    settings.main_retention_count
  );
  await runCleanupService(
    'sub',
    settings.sub_backup_path,
    settings.sub_auto_delete_enabled,
    settings.sub_retention_years,
    settings.sub_retention_months,
    settings.sub_retention_days,
    settings.sub_retention_count
  );
}

async function performBackup(targetPath: string, label: string): Promise<boolean> {
  if (!targetPath) return false;

  try {
    const userDataPath = app.getPath('userData');
    const sourceDb = path.join(userDataPath, 'db.json');

    if (!(await fs.pathExists(sourceDb))) return false;

    const timestamp = DateTime.now().toFormat('yyyyMMdd_HHmmss');
    const fileName = `db_backup_${label}_${timestamp}.json`;
    const fullDestPath = path.join(targetPath, fileName);

    await fs.ensureDir(targetPath);
    await fs.copy(sourceDb, fullDestPath);
    console.log(`Backup successful: ${fullDestPath}`);
    return true;
  } catch (error) {
    console.error(`Backup to ${label} failed:`, error);
    return false;
  }
}

async function runCleanupService(
  label: string,
  backupPath: string,
  enabled: boolean,
  years: number,
  months: number,
  days: number,
  maxCount: number
) {
  // If explicitly disabled, do nothing
  if (!enabled || !backupPath) return;

  try {
    if (!(await fs.pathExists(backupPath))) return;

    const files = await fs.readdir(backupPath);
    // Only clean files with the matching label
    const backupFiles = files.filter(
      f => f.startsWith(`db_backup_${label}_`) && f.endsWith('.json')
    );

    if (backupFiles.length === 0) return;

    // Get stats for all files to sort by time
    const fileStats = await Promise.all(
      backupFiles.map(async f => {
        const filePath = path.join(backupPath, f);
        const stats = await fs.stat(filePath);
        return { name: f, path: filePath, mtime: DateTime.fromJSDate(stats.mtime) };
      })
    );

    // Sort by modification time (descending: newest first)
    fileStats.sort((a, b) => b.mtime.toMillis() - a.mtime.toMillis());

    // 1. Time-based cleanup (Delete files older than the retention period)
    const cutoffDate = DateTime.now().minus({
      years: years || 0,
      months: months || 0,
      days: days || 0
    });

    // We only perform time-based cleanup if at least one period unit is set
    const hasTimeRetention = years > 0 || months > 0 || days > 0;

    let remainingAfterTime: typeof fileStats = [];

    if (hasTimeRetention) {
      for (const file of fileStats) {
        if (file.mtime < cutoffDate) {
          await fs.remove(file.path);
          console.log(`Auto-deleted old ${label} backup (time): ${file.name}`);
        } else {
          remainingAfterTime.push(file);
        }
      }
    } else {
      remainingAfterTime = [...fileStats];
    }

    // 2. Count-based cleanup (Keep only the N most recent files)
    if (maxCount > 0 && remainingAfterTime.length > maxCount) {
      const filesToDelete = remainingAfterTime.slice(maxCount);
      for (const file of filesToDelete) {
        await fs.remove(file.path);
        console.log(`Auto-deleted old ${label} backup (count): ${file.name}`);
      }
    }
  } catch (error) {
    console.error(`Cleanup failed for ${label} at ${backupPath}:`, error);
  }
}
