import path from 'path';
import { app, ipcMain, Menu } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { registerIpcHandlers } from './ipcHandlers';
import { runBackupService } from './backupService';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  console.log('App ready. Registering IPC handlers...');
  registerIpcHandlers();

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

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`);
});
