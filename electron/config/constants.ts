// Конфигурация окна по умолчанию
export const DEFAULT_WINDOW_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
} as const;

// URL для разработки
export const DEV_SERVER_URL = 'http://localhost:4200';

// Пути к файлам
export const PATHS = {
  preload: '../preload.js',
  productionApp: './angular-app/dist/angular-app/browser/index.html',
} as const;

// Названия IPC каналов
export const IPC_CHANNELS = {
  SYSTEM: {
    INFO: 'system:info',
    TITLE: 'system:title',
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
