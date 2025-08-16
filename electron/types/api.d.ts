import { SystemInfo } from './services';
import { OpenDialogOptions, SaveDialogOptions } from './services';

// API для работы с системой
export interface SystemAPI {
  // Получение информации о системе
  getSystemInfo: () => Promise<SystemInfo>;
  
  // Получение версии приложения
  getAppVersion: () => Promise<string>;
  
  // Открытие диалога выбора файла
  openFileDialog: (options: OpenDialogOptions) => Promise<string[]>;
  
  // Открытие диалога сохранения файла
  saveFileDialog: (options: SaveDialogOptions) => Promise<string | undefined>;
  
  // Показать уведомление
  showNotification: (title: string, body: string) => Promise<void>;
}

// API для работы с файловой системой
export interface FileSystemAPI {
  // Чтение файла
  readFile: (filePath: string) => Promise<string>;
  
  // Запись файла
  writeFile: (filePath: string, content: string) => Promise<void>;
  
  // Проверка существования файла
  fileExists: (filePath: string) => Promise<boolean>;
  
  // Создание папки
  createDirectory: (dirPath: string) => Promise<void>;
}

// Глобальные типы для window объекта
declare global {
  interface Window {
    systemAPI: SystemAPI;
    fileSystemAPI: FileSystemAPI;
  }
}
