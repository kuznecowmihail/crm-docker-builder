import { contextBridge, ipcRenderer } from 'electron';
import { SystemAPI, FileSystemAPI, CrmDockerBuilderSystemAPI, ProjectConfig, PostgresConfig, PgAdminConfig, RedisConfig, CrmConfig, CrmDockerBuilderValidatorSystemAPI, RabbitmqConfig, ConstantsAPI } from '@shared/api';

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
    OPEN_PROJECT: 'crm-docker-builder:open-project',
    SAVE_GENERAL_PROJECT_SETTINGS: 'crm-docker-builder:save-general-project-settings',
    SAVE_POSTGRES_SETTINGS: 'crm-docker-builder:save-postgres-settings',
    SAVE_PGADMIN_SETTINGS: 'crm-docker-builder:save-pgadmin-settings',
    SAVE_REDIS_SETTINGS: 'crm-docker-builder:save-redis-settings',
    SAVE_RABBITMQ_SETTINGS: 'crm-docker-builder:save-rabbitmq-settings',
    SAVE_CRM_SETTING: 'crm-docker-builder:save-crm-setting',
    SAVE_CRM_SETTINGS: 'crm-docker-builder:save-crm-settings',
    BUILD_PROJECT: 'crm-docker-builder:build-project',
    RUN_PROJECT: 'crm-docker-builder:run-project',
  },
  CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM: {
    VALIDATE_GENERAL_PROJECT_SETTINGS: 'crm-docker-builder-validator:validate-general-project-settings',
    VALIDATE_POSTGRES_SETTINGS: 'crm-docker-builder-validator:validate-postgres-settings',
    VALIDATE_PGADMIN_SETTINGS: 'crm-docker-builder-validator:validate-pgadmin-settings',
    VALIDATE_REDIS_SETTINGS: 'crm-docker-builder-validator:validate-redis-settings',
    VALIDATE_RABBITMQ_SETTINGS: 'crm-docker-builder-validator:validate-rabbitmq-settings',
    VALIDATE_CRM_SETTINGS: 'crm-docker-builder-validator:validate-crm-settings',
    VALIDATE_CRM_SETTING: 'crm-docker-builder-validator:validate-crm-setting',
    VALIDATE_APP_PATH: 'crm-docker-builder-validator:validate-app-path',
    VALIDATE_BACKUP_PATH: 'crm-docker-builder-validator:validate-backup-path',
    VALIDATE_ALL: 'crm-docker-builder-validator:validate-all'
  },
  CONSTANTS_SYSTEM: {
    GET_CONSTANTS: 'constants:get-constants',
  }
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
  openProject: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.OPEN_PROJECT, path),
  saveGeneralProjectSettings: (projectConfig: ProjectConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_GENERAL_PROJECT_SETTINGS, projectConfig),
  savePostgresSettings: (projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_POSTGRES_SETTINGS, projectConfig, postgresConfig),
  savePgAdminSettings: (projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_PGADMIN_SETTINGS, projectConfig, pgAdminConfig),
  saveRedisSettings: (projectConfig: ProjectConfig, redisConfig: RedisConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_REDIS_SETTINGS, projectConfig, redisConfig),
  saveRabbitmqSettings: (projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_RABBITMQ_SETTINGS, projectConfig, rabbitmqConfig),
  saveCrmSetting: (projectConfig: ProjectConfig, crmConfig: CrmConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTING, projectConfig, crmConfig),
  saveCrmSettings: (projectConfig: ProjectConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTINGS, projectConfig),
  buildProject: (projectConfig: ProjectConfig, onLogCallback?: (log: string) => void) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.BUILD_PROJECT, projectConfig, onLogCallback),
  runProject: (projectConfig: ProjectConfig, onLogCallback?: (log: string) => void) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.RUN_PROJECT, projectConfig, onLogCallback),
} as CrmDockerBuilderSystemAPI);

contextBridge.exposeInMainWorld('crmDockerBuilderValidatorSystemAPI', {
  validateGeneralProjectSettings: (projectConfig: ProjectConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_GENERAL_PROJECT_SETTINGS, projectConfig),
  validatePostgresSettings: (projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_POSTGRES_SETTINGS, projectConfig, postgresConfig),
  validatePgAdminSettings: (projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_PGADMIN_SETTINGS, projectConfig, pgAdminConfig),
  validateRedisSettings: (projectConfig: ProjectConfig, redisConfig: RedisConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_REDIS_SETTINGS, projectConfig, redisConfig),
  validateRabbitmqSettings: (projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_RABBITMQ_SETTINGS, projectConfig, rabbitmqConfig),
  validateCrmSettings: (projectConfig: ProjectConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_CRM_SETTINGS, projectConfig),
  validateCrmSetting: (projectConfig: ProjectConfig, crmConfig: CrmConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_CRM_SETTING, projectConfig, crmConfig),
  validateAppPath: (projectPath: string, appPath: string) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_APP_PATH, projectPath, appPath),
  validateBackupPath: (backupPath: string) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_BACKUP_PATH, backupPath),
  validateAll: (projectConfig: ProjectConfig) => ipcRenderer.invoke(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_ALL, projectConfig),
} as CrmDockerBuilderValidatorSystemAPI);

// Экспонируем Electron API для работы с событиями
contextBridge.exposeInMainWorld('electronAPI', {
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, callback);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

contextBridge.exposeInMainWorld('constantsAPI', {
  getConstants: () => ipcRenderer.invoke(IPC_CHANNELS.CONSTANTS_SYSTEM.GET_CONSTANTS),
} as ConstantsAPI);