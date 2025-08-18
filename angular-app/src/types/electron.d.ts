// Типы для Electron API
export interface SystemAPI {
  getSystemInfo: () => Promise<any>;
  getAppTitle: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  openFolderDialog: (options: any) => Promise<string>;
  openFileDialog: (options: any) => Promise<string[]>;
  saveFileDialog: (options: any) => Promise<string>;
  showNotification: (title: string, body: string) => Promise<void>;
}

export interface FileSystemAPI {
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  fileExists: (filePath: string) => Promise<boolean>;
  createDirectory: (dirPath: string) => Promise<void>;
}

export interface CrmDockerBuilderSystemAPI {
  createProject: (path: string) => Promise<any>;
}

// Расширяем глобальный Window интерфейс
declare global {
  interface Window {
    systemAPI: SystemAPI;
    fileSystemAPI: FileSystemAPI;
  }
}

export {};
