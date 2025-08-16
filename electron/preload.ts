import { contextBridge, ipcRenderer } from 'electron';
import { SystemAPI, FileSystemAPI } from './types/api';

// IPC каналы (встроены прямо в preload для совместимости с Electron)
const IPC_CHANNELS = {
  SYSTEM: {
    INFO: 'system:info',
    VERSION: 'system:version',
  },
  DIALOG: {
    OPEN_FILE: 'dialog:open-file',
    SAVE_FILE: 'dialog:save-file',
  },
  NOTIFICATION: {
    SHOW: 'notification:show',
  },
  FILE_SYSTEM: {
    READ_FILE: 'fs:read-file',
    WRITE_FILE: 'fs:write-file',
    FILE_EXISTS: 'fs:file-exists',
    CREATE_DIR: 'fs:create-dir',
  },
} as const;

// Экспонируем API в безопасном контексте
contextBridge.exposeInMainWorld('systemAPI', {
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.INFO),
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.VERSION),
  openFileDialog: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.OPEN_FILE, options),
  saveFileDialog: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.SAVE_FILE, options),
  showNotification: (title: string, body: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION.SHOW, title, body),
} as SystemAPI);

contextBridge.exposeInMainWorld('fileSystemAPI', {
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SYSTEM.READ_FILE, filePath),
  writeFile: (filePath: string, content: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SYSTEM.WRITE_FILE, filePath, content),
  fileExists: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SYSTEM.FILE_EXISTS, filePath),
  createDirectory: (dirPath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SYSTEM.CREATE_DIR, dirPath),
} as FileSystemAPI);
