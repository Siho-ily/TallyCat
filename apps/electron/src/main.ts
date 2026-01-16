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
    const devUrl = process.env.VITE_DEV_SERVER_URL;
    if (devUrl) {
        mainWindow.loadURL(devUrl);
        mainWindow.webContents.openDevTools();
    } else {
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
                    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none';"
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
            db?.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);
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
        // Basic safety check: determine if it's a read or write
        if (sql.trim().toLowerCase().startsWith('select')) {
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
