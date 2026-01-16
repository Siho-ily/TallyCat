import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import sqlite3 from 'sqlite3';

// Security: Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
}

let mainWindow: BrowserWindow | null = null;
let db: sqlite3.Database | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Security: Disable Node integration in renderer
            contextIsolation: true, // Security: Enable Context Isolation
            sandbox: true,          // Security: Enable Sandbox
        },
    });

    // Load the React app
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL(devUrl);
        mainWindow.webContents.openDevTools();
    } else {
        // 빌드된 파일의 경로는 ../../dist/web/index.html 또는 패키지 구조에 따라 다름
        // 여기서는 패키징된 구조를 고려하여 설정
        mainWindow.loadFile(path.join(__dirname, '../web/index.html'));
    }

    // Security: Block navigation to external sites
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('file:') && !url.startsWith('http://localhost')) {
            event.preventDefault();
            console.warn(`Blocked navigation to: ${url}`);
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Security: Deny all new window creation requests
        if (!url.startsWith('file:')) {
            console.warn(`Blocked new window for: ${url}`);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

// Security: Set secure CSP headers globally
app.on('web-contents-created', (_, contents) => {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none';"
                ]
            }
        });
    });
});

app.whenReady().then(() => {
    // Initialize Database
    const dbPath = path.join(app.getPath('userData'), 'tallycat.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Failed to open database:', err);
            return;
        }
        console.log(`Database initialized at ${dbPath}`);

        db?.serialize(() => {
            // Foreign Key 활성화
            db?.run('PRAGMA foreign_keys = ON;');

            // 1) Categories (카테고리)
            db?.run(`
                CREATE TABLE IF NOT EXISTS categories (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  type_scope TEXT NOT NULL CHECK (type_scope IN ('INCOME','PURCHASE','EXPENSE')),
                  sort_order INTEGER NOT NULL DEFAULT 0,
                  is_active INTEGER NOT NULL DEFAULT 1,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                  UNIQUE(name, type_scope)
                )
            `);
            db?.run('CREATE INDEX IF NOT EXISTS idx_categories_scope_order ON categories(type_scope, sort_order);');
            db?.run('CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);');

            // 2) Payment Methods (결제 방식)
            db?.run(`
                CREATE TABLE IF NOT EXISTS payment_methods (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL UNIQUE,
                  sort_order INTEGER NOT NULL DEFAULT 0,
                  is_active INTEGER NOT NULL DEFAULT 1,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
            `);
            db?.run('CREATE INDEX IF NOT EXISTS idx_payment_methods_order ON payment_methods(sort_order);');
            db?.run('CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);');

            // 3) Presets
            db?.run(`
                CREATE TABLE IF NOT EXISTS presets (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  type TEXT NOT NULL CHECK (type IN ('INCOME','PURCHASE','EXPENSE')),
                  category_id INTEGER NULL,
                  payment_method_id INTEGER NULL,
                  amount INTEGER NULL CHECK (amount IS NULL OR amount >= 0),
                  memo_template TEXT NULL,
                  color TEXT NULL,
                  sort_order INTEGER NOT NULL DEFAULT 0,
                  is_active INTEGER NOT NULL DEFAULT 1,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE,
                  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON UPDATE CASCADE
                )
            `);
            db?.run('CREATE INDEX IF NOT EXISTS idx_presets_type_order ON presets(type, sort_order);');
            db?.run('CREATE INDEX IF NOT EXISTS idx_presets_active ON presets(is_active);');

            // 4) Transactions (내역 원본)
            db?.run(`
                CREATE TABLE IF NOT EXISTS transactions (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  occurred_at TEXT NOT NULL,
                  type TEXT NOT NULL CHECK (type IN ('INCOME','PURCHASE','EXPENSE')),
                  category_id INTEGER NULL,
                  payment_method_id INTEGER NULL,
                  amount INTEGER NOT NULL CHECK (amount >= 0),
                  memo TEXT NULL,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE,
                  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON UPDATE CASCADE
                )
            `);
            db?.run('CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at);');
            db?.run('CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);');

            // Settings Table
            db?.run(`
                CREATE TABLE IF NOT EXISTS settings (
                  key TEXT PRIMARY KEY,
                  value TEXT
                )
            `);

            // 기본 데이터 초기화 로직 (카테고리, 결제 방식 등이 비어있을 때)
            db?.get("SELECT COUNT(*) as count FROM payment_methods", (err, row: any) => {
                if (!err && row.count === 0) {
                    const methods = ['현금', '카드', '계좌이체'];
                    methods.forEach((m, i) => {
                        db?.run('INSERT INTO payment_methods (name, sort_order) VALUES (?, ?)', [m, i]);
                    });
                }
            });

            db?.get("SELECT COUNT(*) as count FROM settings", (err, row: any) => {
                if (!err && row.count === 0) {
                    const defaultSettings = {
                        theme: 'system',
                        font_size: 'medium', // 작음, 보통, 큼 중 하나
                        backup_alert_interval: 7,
                        auto_backup: {
                            active: false,
                            interval: 1,
                            path: null,
                            file_name: null,
                            file_limit_count: 5
                        }
                    };
                    db?.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['app_settings', JSON.stringify(defaultSettings)]);
                }
            });
        });
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (db) {
        db.close();
    }
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('db-query', async (_, sql: string, params: any[]) => {
    if (!db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
        const lowerSql = sql.trim().toLowerCase();
        if (lowerSql.startsWith('select')) {
            db?.all(sql, params, (err, rows) => {
                if (err) reject(err.message);
                else resolve(rows);
            });
        } else {
            db?.run(sql, params, function (err) {
                if (err) reject(err.message);
                else resolve({ changes: this.changes, lastID: this.lastID });
            });
        }
    });
});
