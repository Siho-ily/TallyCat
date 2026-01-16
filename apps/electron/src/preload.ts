import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    dbQuery: (sql: string, params: any[] = []) => ipcRenderer.invoke('db-query', sql, params)
});
