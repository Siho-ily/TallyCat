import { ipcMain, dialog, app } from 'electron';
import { getDb, Data, Record, Category, Settings, defaultData, AutomationRule } from './db';
import { DateTime } from 'luxon';
import fs from 'fs-extra';
import path from 'path';
import * as XLSX from 'xlsx';
import { execSync } from 'child_process';
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

  // --- Automation Rules CRUD ---
  ipcMain.handle('get-automation-rules', () =>
    handleIpc('get-automation-rules', async () => {
      const db = await getDb();
      await db.read();
      return db.data?.automation_rules || [];
    })
  );

  ipcMain.handle('save-automation-rule', (_event, rule: AutomationRule) =>
    handleIpc('save-automation-rule', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) return false;

      const index = db.data.automation_rules.findIndex(r => r.id === rule.id);
      if (index > -1) {
        db.data.automation_rules[index] = rule;
      } else {
        db.data.automation_rules.push({
          ...rule,
          id: rule.id || crypto.randomUUID()
        });
      }
      await db.write();
      return true;
    })
  );

  ipcMain.handle('delete-automation-rule', (_event, id: string) =>
    handleIpc('delete-automation-rule', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) return false;

      db.data.automation_rules = db.data.automation_rules.filter(r => r.id !== id);
      await db.write();
      return true;
    })
  );

  ipcMain.handle('toggle-automation-rule', (_event, id: string) =>
    handleIpc('toggle-automation-rule', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) return false;

      const rule = db.data.automation_rules.find(r => r.id === id);
      if (rule) {
        rule.is_active = !rule.is_active;
        await db.write();
        return true;
      }
      return false;
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
          // If this category is being set as default, unset others of same type
          if (category.is_default) {
            const type = category.type || db.data.categories[index].type;
            db.data.categories.forEach(c => {
              if (c.type === type) c.is_default = false;
            });
          }
          db.data.categories[index] = { ...db.data.categories[index], ...category };
        }
      } else {
        const type = category.type || 'income';
        // If new category is default, unset others of same type
        if (category.is_default) {
          db.data.categories.forEach(c => {
            if (c.type === type) c.is_default = false;
          });
        }
        db.data.categories.push({
          id: generateId(),
          name: category.name || '미분류',
          type,
          is_active: true,
          is_default: !!category.is_default,
          default_amount: category.default_amount
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

  // --- Payment Methods CRUD ---
  ipcMain.handle('get-payment-methods', () =>
    handleIpc('get-payment-methods', async () => {
      const db = await getDb();
      await db.read();
      return db.data?.payment_methods || [];
    })
  );

  ipcMain.handle('save-payment-method', (_event, paymentMethod: any) =>
    handleIpc('save-payment-method', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) throw new Error('DB 데이터가 초기화되지 않았습니다.');

      if (!db.data.payment_methods) {
        db.data.payment_methods = [...defaultData.payment_methods];
      }

      const generateId = () => {
        try {
          return crypto.randomUUID();
        } catch (e) {
          return Date.now().toString() + Math.random().toString(36).substring(2, 9);
        }
      };

      if (paymentMethod.id) {
        const index = db.data.payment_methods.findIndex(pm => pm.id === paymentMethod.id);
        if (index > -1) {
          db.data.payment_methods[index] = { ...db.data.payment_methods[index], ...paymentMethod };
        }
      } else {
        db.data.payment_methods.push({
          id: generateId(),
          name: paymentMethod.name || '미분류',
          is_active: true
        });
      }
      await db.write();
      return true;
    })
  );

  ipcMain.handle('delete-payment-method', (_event, id: string) =>
    handleIpc('delete-payment-method', async () => {
      const db = await getDb();
      await db.read();
      if (!db.data) throw new Error('DB 데이터가 초기화되지 않았습니다.');

      if (!db.data.payment_methods) return false;

      const index = db.data.payment_methods.findIndex(pm => pm.id === id);
      if (index > -1) {
        db.data.payment_methods[index] = { ...db.data.payment_methods[index], is_active: false };
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
      db.data = { ...defaultData, records: [] };
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
      const paymentMethods = db.data.payment_methods || [];
      const excelData = db.data.records.map(record => {
        const category = categories.find(c => c.id === record.category_id);
        const paymentMethod = paymentMethods.find(pm => pm.id === record.payment_method_id);
        return {
          날짜: record.date,
          유형: record.type === 'income' ? '매출' : record.type === 'purchase' ? '매입' : '지출',
          카테고리: category ? category.name : '미지정',
          결제방식: paymentMethod ? paymentMethod.name : '미지정',
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
        { wch: 12 }, // 결제방식
        { wch: 12 }, // 금액
        { wch: 30 } // 메모
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '매출비용내역');
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
        let catName = findValue(['카테고리', '항목', 'category', '분류']) || '미지정';
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
        let type: 'income' | 'purchase' | 'spending' = 'income';
        const typeStr = String(rawType || '').toLowerCase();
        if (typeStr.includes('지출') || typeStr.includes('spending')) {
          type = 'spending';
        } else if (
          typeStr.includes('매입') ||
          typeStr.includes('purchase') ||
          typeStr.includes('expense') ||
          typeStr.includes('out')
        ) {
          type = 'purchase';
        } else if (
          typeStr.includes('수입') ||
          typeStr.includes('매출') ||
          typeStr.includes('income') ||
          typeStr.includes('in')
        ) {
          type = 'income';
        }

        // 4. Category Handling
        let catNameClean = String(catName).trim();
        let categoryId = ''; // Default to "미지정" (empty string ID)

        if (catNameClean && catNameClean !== '미지정') {
          let category = categories.find(c => c.name === catNameClean);
          if (!category) {
            category = {
              id: crypto.randomUUID(),
              name: catNameClean,
              type: type, // Assign current record type
              is_active: true
            };
            categories.push(category);
          }
          categoryId = category.id;
        }

        // 5. Payment Method Handling
        const paymentMethods = db.data.payment_methods;
        const rawPm = findValue(['결제', '방식', 'payment', 'method', '수단']);
        let paymentMethodId = ''; // Default to "미지정" (empty string ID)

        if (rawPm) {
          const pmNameClean = String(rawPm).trim();
          if (pmNameClean && pmNameClean !== '미지정') {
            // 1. Try exact name match
            let matchedPm = paymentMethods.find(pm => pm.name === pmNameClean);

            // 2. Keyword matching for common types (Cash/Card)
            if (!matchedPm) {
              const pmStrLower = pmNameClean.toLowerCase();
              if (pmStrLower.includes('cash') || pmStrLower.includes('현금')) {
                matchedPm = paymentMethods.find(pm => pm.name.includes('현금'));
              } else if (pmStrLower.includes('card') || pmStrLower.includes('카드')) {
                matchedPm = paymentMethods.find(pm => pm.name.includes('카드'));
              }
            }

            // 3. Create new one if still no match
            if (!matchedPm) {
              matchedPm = {
                id: crypto.randomUUID(),
                name: pmNameClean,
                is_active: true
              };
              paymentMethods.push(matchedPm);
            }
            paymentMethodId = matchedPm.id;
          }
        }

        // 6. Create Record
        db.data.records.unshift({
          id: crypto.randomUUID(),
          date: dateStr,
          type: type,
          category_id: categoryId,
          payment_method_id: paymentMethodId,
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
