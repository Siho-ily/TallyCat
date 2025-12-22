import { getDb } from './db';
import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { DateTime } from 'luxon';

export async function runBackupService() {
  const db = await getDb();
  await db.read();
  const settings = db.data.settings;

  if (!settings.auto_backup) return;

  // 1. Check if backup is needed based on interval
  const now = DateTime.now();
  const lastBackup = settings.last_backup_date ? DateTime.fromISO(settings.last_backup_date) : null;

  const shouldBackup = !lastBackup || now.diff(lastBackup, 'days').days >= settings.backup_interval;

  if (shouldBackup) {
    console.log('Running automatic backup...');
    await performBackup(settings.main_backup_path, 'main');
    await performBackup(settings.sub_backup_path, 'sub');

    // Update last backup date
    settings.last_backup_date = now.toISO();
    await db.write();
  }

  // 2. Run cleanup if configured
  await runCleanupService(settings);
}

async function performBackup(targetPath: string, label: string) {
  if (!targetPath) return;

  try {
    const userDataPath = app.getPath('userData');
    const sourceDb = path.join(userDataPath, 'db.json');

    if (!(await fs.pathExists(sourceDb))) return;

    const timestamp = DateTime.now().toFormat('yyyyMMdd_HHmmss');
    const fileName = `db_backup_${label}_${timestamp}.json`;
    const fullDestPath = path.join(targetPath, fileName);

    await fs.ensureDir(targetPath);
    await fs.copy(sourceDb, fullDestPath);
    console.log(`Backup successful: ${fullDestPath}`);
  } catch (error) {
    console.error(`Backup to ${label} failed:`, error);
  }
}

async function runCleanupService(settings: any) {
  if (settings.auto_delete_months <= 0) return;

  const paths = [settings.main_backup_path, settings.sub_backup_path].filter(p => !!p);
  const cutoffDate = DateTime.now().minus({ months: settings.auto_delete_months });

  for (const backupPath of paths) {
    try {
      if (!(await fs.pathExists(backupPath))) continue;

      const files = await fs.readdir(backupPath);
      const backupFiles = files.filter(f => f.startsWith('db_backup_') && f.endsWith('.json'));

      for (const file of backupFiles) {
        const filePath = path.join(backupPath, file);
        const stats = await fs.stat(filePath);
        const fileDate = DateTime.fromJSDate(stats.mtime);

        if (fileDate < cutoffDate) {
          await fs.remove(filePath);
          console.log(`Auto-deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error(`Cleanup failed for path ${backupPath}:`, error);
    }
  }
}
