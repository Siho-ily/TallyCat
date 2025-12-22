import { ipcMain, dialog, app } from 'electron';
import { getDb, Data, Record, Category, Settings, defaultData } from './db';
import { DateTime } from 'luxon';
import fs from 'fs-extra';
import path from 'path';
import * as XLSX from 'xlsx';
import { exec } from 'child_process';
import crypto from 'crypto';

// Helper for standardized error logging and response
async function handleIpc<T>(label: string, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    console.error(`IPC [${label}] failed:`, error);
    throw error;
  }
}

export function registerIpcHandlers() {
  // --- Records CRUD ---
  ipcMain.handle('get-records', () =>
    handleIpc('get-records', async () => {
      const db = await getDb();
      await db.read();
      return db.data?.records || [];
    })
  );

  ipcMain.handle('add-record', (_event, record: Omit<Record, 'id'>) =>
    handleIpc('add-record', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) throw new Error('DB data not initialized');

      const newRecord: Record = {
        ...record,
        id: crypto.randomUUID(),
        date: record.date || DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
      };
      db.data.records.unshift(newRecord); // Add to beginning
      await db.write();
      return newRecord;
    })
  );

  ipcMain.handle('update-record', (_event, updatedRecord: Record) =>
    handleIpc('update-record', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) return false;

      const index = db.data.records.findIndex(r => r.id === updatedRecord.id);
      if (index > -1) {
        db.data.records[index] = updatedRecord;
        await db.write();
        return true;
      }
      return false;
    })
  );

  ipcMain.handle('delete-record', (_event, id: string) =>
    handleIpc('delete-record', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) return false;

      db.data.records = db.data.records.filter(r => r.id !== id);
      await db.write();
      return true;
    })
  );

  // --- Categories CRUD ---
  ipcMain.handle('get-categories', () =>
    handleIpc('get-categories', async () => {
      const db = await getDb();
      await db.read();
      return db.data?.categories || [];
    })
  );

  ipcMain.handle('save-category', (_event, category: any) =>
    handleIpc('save-category', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) throw new Error('DB 데이터가 초기화되지 않았습니다.');

      if (!db.data.categories) {
        db.data.categories = [...defaultData.categories];
      }

      const generateId = () => {
        try {
          return crypto.randomUUID();
        } catch (e) {
          return Date.now().toString() + Math.random().toString(36).substring(2, 9);
        }
      };

      if (category.id) {
        const index = db.data.categories.findIndex(c => c.id === category.id);
        if (index > -1) {
          db.data.categories[index] = { ...db.data.categories[index], ...category };
        }
      } else {
        db.data.categories.push({
          id: generateId(),
          type: category.type || 'income',
          name: category.name || '미분류',
          is_active: true
        });
      }
      await db.write();
      return true;
    })
  );

  ipcMain.handle('delete-category', (_event, id: string) =>
    handleIpc('delete-category', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) throw new Error('DB 데이터가 초기화되지 않았습니다.');

      if (!db.data.categories) return false;

      const index = db.data.categories.findIndex(c => c.id === id);
      if (index > -1) {
        db.data.categories[index] = { ...db.data.categories[index], is_active: false };
        await db.write();
        return true;
      }
      return false;
    })
  );

  // --- Settings & Storage ---
  ipcMain.handle('get-settings', () =>
    handleIpc('get-settings', async () => {
      const db = await getDb();
      await db.read();
      return db.data?.settings || defaultData.settings;
    })
  );

  ipcMain.handle('reset-data', () =>
    handleIpc('reset-data', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) return false;
      db.data.records = [];
      await db.write();
      return true;
    })
  );

  ipcMain.handle('reset-system', () =>
    handleIpc('reset-system', async () => {
      const db = await getDb();
      // Use clean deep copy for full reset
      db.data = JSON.parse(JSON.stringify({ ...defaultData, records: [] }));
      await db.write();
      return true;
    })
  );

  ipcMain.handle('update-settings', (_event, settings: Settings) =>
    handleIpc('update-settings', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) throw new Error('DB data not initialized');

      db.data.settings = { ...db.data.settings, ...settings };
      await db.write();
      return true;
    })
  );

  ipcMain.handle('check-storage', async () => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db.json');

    let dbSize = 0;
    if (await fs.pathExists(dbPath)) {
      const stats = await fs.stat(dbPath);
      dbSize = stats.size; // bytes
    }

    // Disk space check using PowerShell on Windows (Non-blocking)
    let freeSpace = -1;
    try {
      const drive = path.parse(userDataPath).root.replace('\\', '');
      const getFreeSpace = () => {
        return new Promise<number>((resolve, reject) => {
          // Set a 3-second timeout for the powershell command
          const child = exec(
            `powershell "(Get-PSDrive ${drive[0]}).Free"`,
            { timeout: 3000 },
            (error, stdout) => {
              if (error) {
                reject(error);
                return;
              }
              const match = stdout.match(/\d+/);
              if (match) resolve(parseInt(match[0]));
              else reject(new Error('Format error'));
            }
          );
        });
      };
      freeSpace = await getFreeSpace();
    } catch (e) {
      console.warn('Disk space check timed out or failed:', e);
    }

    const db = await getDb();
    const settings = db.data.settings;

    const mainPath = settings.main_backup_path;
    const subPath = settings.sub_backup_path;

    const getFolderSize = async (dirPath: string): Promise<number> => {
      if (!dirPath || !(await fs.pathExists(dirPath))) return 0;
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        let total = 0;
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            total += await getFolderSize(fullPath);
          } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            total += stats.size;
          }
        }
        return total;
      } catch (e) {
        console.error(`Error calculating folder size for ${dirPath}:`, e);
        return 0;
      }
    };

    const mainTotalSize = await getFolderSize(mainPath);
    const subTotalSize = await getFolderSize(subPath);

    const maxMB = settings.main_max_backup_size_mb || 500;
    const mainPathExists = mainPath ? await fs.pathExists(mainPath) : false;
    const subPathExists = subPath ? await fs.pathExists(subPath) : false;

    return {
      dbSize, // bytes
      freeSpace, // bytes
      mainTotalSize,
      subTotalSize,
      limitReached: mainTotalSize > maxMB * 1024 * 1024,
      mainPathExists,
      subPathExists,
      mainBackupPath: mainPath,
      subBackupPath: subPath
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
      // Create a formatted data for Excel with Korean headers and category names
      const categories = db.data.categories || [];
      const excelData = db.data.records.map(record => {
        const category = categories.find(c => c.id === record.category_id);
        return {
          날짜: record.date,
          유형: record.type === 'income' ? '매출' : '매입',
          카테고리: category ? category.name : '기타',
          금액: record.amount, // Numeric value
          메모: record.note || ''
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Optional: Set column widths for better readability
      worksheet['!cols'] = [
        { wch: 20 }, // 날짜
        { wch: 10 }, // 유형
        { wch: 15 }, // 카테고리
        { wch: 12 }, // 금액
        { wch: 30 } // 메모
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '매출매입내역');
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
          let s = String(rawDate).trim().replace(/\./g, '-'); // . 을 - 로 치환하여 범용성 확보

          // Try various formats
          const dt =
            DateTime.fromFormat(s, 'yyyy-MM-dd HH:mm:ss') ||
            DateTime.fromFormat(s, 'yyyy-MM-dd HH:mm') ||
            DateTime.fromFormat(s, 'yyyy-MM-dd') ||
            DateTime.fromFormat(s, 'MM/dd/yyyy HH:mm:ss') ||
            DateTime.fromFormat(s, 'MM/dd/yyyy') ||
            DateTime.fromISO(s);

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
        } else if (
          typeStr.includes('수입') ||
          typeStr.includes('매출') ||
          typeStr.includes('income') ||
          typeStr.includes('in')
        ) {
          type = 'income';
        }

        // 4. Category Matching/Creation
        let catNameClean = String(catName).trim();
        let category = categories.find(c => c.name === catNameClean && c.type === type);

        // If not found, try to find in inactive categories too
        if (!category) {
          category = categories.find(c => c.name === catNameClean && c.type === type);
        }

        if (!category) {
          category = {
            id: crypto.randomUUID(),
            name: catNameClean,
            type: type,
            is_active: true
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
