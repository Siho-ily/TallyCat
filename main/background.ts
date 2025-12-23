import path from 'path';
import { app, ipcMain, Menu } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { registerIpcHandlers } from './ipcHandlers';
import { runBackupService } from './backupService';
import { getDb } from './db';
import { startAutomationScheduler } from './automation';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  // 백업일이 null이면 현재 시간으로 업데이트
  async function updateBackupDatesIfNull() {
    const db = await getDb();
    const now = new Date().toISOString();
    let updated = false;
    if (db.data?.settings) {
      if (!db.data.settings.last_main_backup_date) {
        db.data.settings.last_main_backup_date = now;
        updated = true;
      }
      if (!db.data.settings.last_sub_backup_date) {
        db.data.settings.last_sub_backup_date = now;
        updated = true;
      }
      if (updated) {
        await db.write();
      }
    }
  }

  await updateBackupDatesIfNull();

  console.log('App ready. Registering IPC handlers...');
  registerIpcHandlers();
  startAutomationScheduler();

  // Remove default menu bar (File, Edit, etc.)
  Menu.setApplicationMenu(null);

  // Run initial backup check after a short delay to prioritize UI loading
  setTimeout(async () => {
    try {
      await runBackupService();
    } catch (e) {
      console.error('Initial backup service failure:', e);
    }
  }, 5000);

  // Check every hour
  setInterval(async () => {
    try {
      await runBackupService();
    } catch (e) {
      console.error('Hourly backup service failure:', e);
    }
  }, 1000 * 60 * 60);

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isProd) {
    await mainWindow.loadURL('app://./');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', async () => {
  try {
    const db = await getDb();
    if (db.data?.settings?.auto_backup_on_close && db.data.settings.auto_backup) {
      console.log('[App] Running final backup before closure...');
      await runBackupService();
    }
  } catch (e) {
    console.error('Final backup failed:', e);
  }
  app.quit();
});

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`);
});
