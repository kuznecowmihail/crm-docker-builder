// Системные типы

// Типы для системной информации
export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
}

// API для работы с системой
export interface SystemAPI {
  // Получение информации о системе
  getSystemInfo: () => Promise<SystemInfo>;
  
  // Получение заголовка приложения
  getAppTitle: () => Promise<string>;
  
  // Получение версии приложения
  getAppVersion: () => Promise<string>;

  // Открытие диалога выбора папки
  openFolderDialog: (options: any) => Promise<string>;
  
  // Открытие диалога выбора файла
  openFileDialog: (options: any) => Promise<string[]>;
  
  // Показать уведомление
  showNotification: (title: string, body: string) => Promise<void>;
}
