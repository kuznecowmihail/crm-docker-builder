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
    OPEN_FOLDER: 'dialog:open-folder',
    OPEN_FILE: 'dialog:open-file',
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
    OPEN_PROJECT: 'crm-docker-builder:open-project',
    SAVE_GENERAL_PROJECT_SETTINGS: 'crm-docker-builder:save-general-project-settings',
    SAVE_POSTGRES_SETTINGS: 'crm-docker-builder:save-postgres-settings',
    SAVE_PGADMIN_SETTINGS: 'crm-docker-builder:save-pgadmin-settings',
    SAVE_REDIS_SETTINGS: 'crm-docker-builder:save-redis-settings',
    SAVE_CRM_SETTING: 'crm-docker-builder:save-crm-setting',
    SAVE_CRM_SETTINGS: 'crm-docker-builder:save-crm-settings',
    SAVE_ALL: 'crm-docker-builder:save-all'
  }
} as const;
