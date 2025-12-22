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

    const db = await getDb();
    const settings = db.data.settings;
    const maxGB = settings.main_max_backup_size_gb || 1.0;

    const mainPathExists = settings.main_backup_path
      ? await fs.pathExists(settings.main_backup_path)
      : false;
    const subPathExists = settings.sub_backup_path
      ? await fs.pathExists(settings.sub_backup_path)
      : false;

    return {
      dbSize, // bytes
      freeSpace, // bytes
      limitReached: dbSize > maxGB * 1024 * 1024 * 1024,
      mainPathExists,
      subPathExists,
      mainBackupPath: settings.main_backup_path,
      subBackupPath: settings.sub_backup_path
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

  ipcMain.handle('import-data', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: '데이터 불러오기 (복구)',
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (!filePaths || filePaths.length === 0) return { success: false, message: '취소되었습니다.' };

    try {
      const backupData = await fs.readJson(filePaths[0]);

      // Simple validation: check for core keys
      if (!backupData.records || !backupData.categories || !backupData.settings) {
        throw new Error('올바른 백업 파일 형식이 아닙니다.');
      }

      const db = await getDb();
      db.data = backupData;
      await db.write();
      await db.read(); // Final sync

      return { success: true, message: '데이터 복구가 완료되었습니다!' };
    } catch (error: any) {
      console.error('Import failed:', error);
      return {
        success: false,
        message: error.message || '데이터를 불러오는 중 오류가 발생했습니다.'
      };
    }
  });

  ipcMain.handle('import-excel', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: '엑셀 데이터 가져오기',
      filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
      properties: ['openFile']
    });

    if (!filePaths || filePaths.length === 0) return { success: false, message: '취소되었습니다.' };

    try {
      const workbook = XLSX.readFile(filePaths[0]);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet) as any[];

      if (rows.length === 0) throw new Error('데이터가 없는 엑셀 파일입니다.');

      const db = await getDb();
      await db.read();

      let importedCount = 0;
      const categories = db.data.categories;

      for (const row of rows) {
        // 1. Column Mapping (Flexible search)
        const findValue = (keywords: string[]) => {
          const key = Object.keys(row).find(k =>
            keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase()))
          );
          return key ? row[key] : null;
        };

        let rawDate = findValue(['날짜', '일자', 'date', '시간']);
        let rawAmount = findValue(['금액', '합계', 'amount', '가격']);
        let rawType = findValue(['유형', '구분', 'type', '수입', '매출', '지출', '매입']);
        let catName = findValue(['카테고리', '항목', 'category', '분류']) || '기타';
        let note = findValue(['메모', '비고', 'note', '설명']) || '';

        // Essential: Amount
        const amount = Number(String(rawAmount || '').replace(/[^0-9.-]+/g, ''));
        if (isNaN(amount) || amount === 0) continue;

        // 2. Date Parsing
        let dateStr: string;
        if (typeof rawDate === 'number' && rawDate > 30000) {
          // Excel serial date to ISO
          const date = new Date((rawDate - 25569) * 86400 * 1000);
          dateStr = DateTime.fromJSDate(date).toFormat('yyyy-MM-dd HH:mm:ss');
        } else if (rawDate) {
          const dt =
            DateTime.fromFormat(String(rawDate), 'yyyy-MM-dd') ||
            DateTime.fromFormat(String(rawDate), 'yyyy/MM/dd') ||
            DateTime.fromISO(String(rawDate));
          dateStr = dt.isValid
            ? dt.toFormat('yyyy-MM-dd HH:mm:ss')
            : DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
        } else {
          dateStr = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
        }

        // 3. Type Detection
        let type: 'income' | 'expense' = 'income';
        const typeStr = String(rawType || '').toLowerCase();
        if (
          typeStr.includes('지출') ||
          typeStr.includes('매입') ||
          typeStr.includes('expense') ||
          typeStr.includes('out')
        ) {
          type = 'expense';
        }

        // 4. Category Matching/Creation
        let category = categories.find(c => c.name === String(catName) && c.type === type);
        if (!category) {
          category = {
            id: crypto.randomUUID(),
            name: String(catName),
            type: type
          };
          categories.push(category);
        }

        // 5. Create Record
        db.data.records.unshift({
          id: crypto.randomUUID(),
          date: dateStr,
          type: type,
          category_id: category.id,
          amount: amount,
          note: String(note)
        });
        importedCount++;
      }

      await db.write();

      return {
        success: true,
        message: `${importedCount}개의 내역을 성공적으로 가져왔습니다.`
      };
    } catch (error: any) {
      console.error('Excel Import failed:', error);
      return {
        success: false,
        message: error.message || '엑셀 데이터를 불러오는 중 오류가 발생했습니다.'
      };
    }
  });

  ipcMain.handle('select-directory', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return filePaths[0] || null;
  });
}
