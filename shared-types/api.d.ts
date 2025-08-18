// Общие типы для API между Electron и Angular

// Типы для системной информации
export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
}

// Типы для диалогов файлов
export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
  message?: string;
  securityScopedBookmarks?: boolean;
}

// Типы для уведомлений
export interface NotificationOptions {
  title: string;
  body: string;
  subtitle?: string;
  silent?: boolean;
  icon?: string;
  hasReply?: boolean;
  timeoutType?: 'default' | 'never';
  replyPlaceholder?: string;
  sound?: string;
  urgency?: 'low' | 'normal' | 'critical';
  actions?: Array<{
    type: 'button';
    text: string;
  }>;
  closeButtonText?: string;
}

// Результат создания проекта
export interface CreateProjectResult {
  success: boolean;
  message: string;
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
  openFolderDialog: (options: OpenDialogOptions) => Promise<string>;
  
  // Открытие диалога выбора файла
  openFileDialog: (options: OpenDialogOptions) => Promise<string[]>;
  
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

// API для работы с системой CRM Docker Builder
export interface CrmDockerBuilderSystemAPI {
  // Создание проекта
  createProject: (path: string) => Promise<CreateProjectResult>;
}

// Глобальные типы для window объекта
declare global {
  interface Window {
    systemAPI: SystemAPI;
    fileSystemAPI: FileSystemAPI;
    crmDockerBuilderSystemAPI: CrmDockerBuilderSystemAPI;
  }
}
