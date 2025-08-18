import { contextBridge, ipcRenderer } from 'electron';
import { SystemAPI, FileSystemAPI, CrmDockerBuilderSystemAPI } from '@shared/api';

// IPC каналы (встроены прямо в preload для совместимости с Electron)
const IPC_CHANNELS = {
  SYSTEM: {
    TITLE: 'system:title',
    INFO: 'system:info',
    VERSION: 'system:version',
  },
  DIALOG: {
    OPEN_FOLDER: 'dialog:open-folder',
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
  CRM_DOCKER_BUILDER_SYSTEM: {
    CREATE_PROJECT: 'crm-docker-builder:create-project',
  },
} as const;

// Экспонируем API в безопасном контексте
contextBridge.exposeInMainWorld('systemAPI', {
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.INFO),
  getAppTitle: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.TITLE),
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.VERSION),
  openFolderDialog: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.OPEN_FOLDER, options),
  openFileDialog: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.OPEN_FILE, options),
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

contextBridge.exposeInMainWorld('crmDockerBuilderSystemAPI', {
  createProject: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.CREATE_PROJECT, path),
} as CrmDockerBuilderSystemAPI);
