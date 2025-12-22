import { ipcMain, dialog, app } from 'electron';
import { getDb, Data, Record, Category, Settings, defaultData } from './db';
import { DateTime } from 'luxon';
import fs from 'fs-extra';
import path from 'path';
import * as XLSX from 'xlsx';
import { execSync } from 'child_process';
import crypto from 'crypto';

export function registerIpcHandlers() {
  // --- Records CRUD ---
  ipcMain.handle('get-records', async () => {
    try {
      const db = await getDb();
      await db.read();
      if (!db.data) db.data = { ...defaultData };
      return db.data.records;
    } catch (error) {
      console.error('IPC get-records failed:', error);
      throw error;
    }
  });

  ipcMain.handle('add-record', async (_event, record: Omit<Record, 'id'>) => {
    const db = await getDb();
    await db.read();
    const newRecord: Record = {
      ...record,
      id: crypto.randomUUID(),
      date: record.date || DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
    };
    db.data.records.push(newRecord);
    await db.write();
    return newRecord;
  });

  ipcMain.handle('update-record', async (_event, updatedRecord: Record) => {
    const db = await getDb();
    await db.read();
    const index = db.data.records.findIndex(r => r.id === updatedRecord.id);
    if (index > -1) {
      db.data.records[index] = updatedRecord;
      await db.write();
      return true;
    }
    return false;
  });

  ipcMain.handle('delete-record', async (_event, id: string) => {
    const db = await getDb();
    await db.read();
    db.data.records = db.data.records.filter(r => r.id !== id);
    await db.write();
    return true;
  });

  // --- Categories CRUD ---
  ipcMain.handle('get-categories', async () => {
    try {
      const db = await getDb();
      await db.read();
      if (!db.data) db.data = { ...defaultData };
      // Ensure '기타' exists if collection is empty or missing them
      if (db.data.categories.length === 0) {
        db.data.categories = [...defaultData.categories];
        await db.write();
      }
      return db.data.categories;
    } catch (error) {
      console.error('IPC get-categories failed:', error);
      throw error;
    }
  });

  ipcMain.handle('save-category', async (_event, category: Category) => {
    const db = await getDb();
    await db.read();
    if (!db.data) db.data = { ...defaultData };
    if (!db.data.categories) db.data.categories = [];

    if (category.id) {
      const index = db.data.categories.findIndex(c => c.id === category.id);
      if (index > -1) db.data.categories[index] = category;
    } else {
      db.data.categories.push({ ...category, id: crypto.randomUUID() });
    }
    await db.write();
    return true;
  });

  ipcMain.handle('delete-category', async (_event, id: string) => {
    const db = await getDb();
    await db.read();
    db.data.categories = db.data.categories.filter(c => c.id !== id);
    await db.write();
    return true;
  });

  // --- Settings & Storage ---
  ipcMain.handle('get-settings', async () => {
    try {
      const db = await getDb();
      // Ensure settings exist (migration/safety)
      if (!db.data.settings) {
        db.data.settings = { ...defaultData.settings };
      } else {
        // Migration: If old keys exist but new ones don't
        if ((db.data.settings as any).backup_interval && !db.data.settings.main_backup_interval) {
          db.data.settings.main_backup_interval = [
            Number((db.data.settings as any).backup_interval)
          ];
          db.data.settings.sub_backup_interval = [
            Number((db.data.settings as any).backup_interval)
          ];
        }
        // Ensure intervals are arrays even if migration already happened partially
        if (!Array.isArray(db.data.settings.main_backup_interval)) {
          db.data.settings.main_backup_interval = [
            Number(db.data.settings.main_backup_interval) || 7
          ];
        }
        if (!Array.isArray(db.data.settings.sub_backup_interval)) {
          db.data.settings.sub_backup_interval = [
            Number(db.data.settings.sub_backup_interval) || 30
          ];
        }
        if ((db.data.settings as any).last_backup_date && !db.data.settings.last_main_backup_date) {
          db.data.settings.last_main_backup_date = (db.data.settings as any).last_backup_date;
          db.data.settings.last_sub_backup_date = (db.data.settings as any).last_backup_date;
        }

        if (
          (db.data.settings as any).max_backup_size_gb &&
          !db.data.settings.main_max_backup_size_gb
        ) {
          db.data.settings.main_max_backup_size_gb = (db.data.settings as any).max_backup_size_gb;
          db.data.settings.sub_max_backup_size_gb = (db.data.settings as any).max_backup_size_gb;
        }
        if (
          (db.data.settings as any).auto_delete_months &&
          !db.data.settings.main_auto_delete_months
        ) {
          db.data.settings.main_auto_delete_months = (db.data.settings as any).auto_delete_months;
          db.data.settings.sub_auto_delete_months = (db.data.settings as any).auto_delete_months;
        }

        // Ensure new numeric fields are never NaN or missing
        if (!db.data.settings.main_max_backup_size_gb)
          db.data.settings.main_max_backup_size_gb = defaultData.settings.main_max_backup_size_gb;
        if (!db.data.settings.sub_max_backup_size_gb)
          db.data.settings.sub_max_backup_size_gb = defaultData.settings.sub_max_backup_size_gb;
        if (!db.data.settings.main_auto_delete_months)
          db.data.settings.main_auto_delete_months = defaultData.settings.main_auto_delete_months;
        if (!db.data.settings.sub_auto_delete_months)
          db.data.settings.sub_auto_delete_months = defaultData.settings.sub_auto_delete_months;

        // --- NEW: Default Path Logic ---
        const docsPath = app.getPath('documents');
        const defaultBase = path.join(docsPath, 'HairShop_Backups');

        if (!db.data.settings.main_backup_path) {
          db.data.settings.main_backup_path = path.join(defaultBase, 'Main');
        }
        if (!db.data.settings.sub_backup_path) {
          db.data.settings.sub_backup_path = path.join(defaultBase, 'Sub');
        }

        // Multi-layer merge to ensure all new keys are present
        db.data.settings = { ...defaultData.settings, ...db.data.settings };
      }
      await db.write();
      return db.data.settings;
    } catch (error) {
      console.error('IPC get-settings failed:', error);
      throw error;
    }
  });

  ipcMain.handle('update-settings', async (_event, settings: Settings) => {
    const db = await getDb();
    await db.read();
    db.data.settings = { ...db.data.settings, ...settings };
    await db.write();
    return true;
  });

  ipcMain.handle('check-storage', async () => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db.json');

    let dbSize = 0;
    if (await fs.pathExists(dbPath)) {
      const stats = await fs.stat(dbPath);
      dbSize = stats.size; // bytes
    }

    // Disk space check using PowerShell on Windows
    let freeSpace = -1;
    try {
      const drive = path.parse(userDataPath).root.replace('\\', '');
      const output = execSync(`powershell "Get-PSDrive ${drive} | Select-Object Free"`, {
        encoding: 'utf8'
      });
      const match = output.match(/\d+/);
      if (match) freeSpace = parseInt(match[0]);
    } catch (e) {
      console.error('Disk space check failed', e);
    }

    return {
      dbSize, // bytes
      freeSpace, // bytes
      limitReached: dbSize > 1 * 1024 * 1024 * 1024 // 1GB default
    };
  });

  // --- Backup & Export ---
  ipcMain.handle('export-data', async (_event, format: 'xlsx' | 'json') => {
    const db = await getDb();
    await db.read();

    const { filePath } = await dialog.showSaveDialog({
      title: '데이터 내보내기',
      defaultPath: `매출전표_백업_${DateTime.now().toFormat('yyyyMMdd_HHmmss')}.${format}`,
      filters: [{ name: format.toUpperCase(), extensions: [format] }]
    });

    if (!filePath) return false;

    if (format === 'json') {
      await fs.writeJson(filePath, db.data, { spaces: 2 });
    } else {
      const worksheet = XLSX.utils.json_to_sheet(db.data.records);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
      XLSX.writeFile(workbook, filePath);
    }

    return true;
  });

  ipcMain.handle('select-directory', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return filePaths[0] || null;
  });
}
