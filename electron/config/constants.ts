import { Constants, CrmConfig } from '@shared/api';

export const ConstantValues: Constants = {
  DEFAULT_WINDOW_CONFIG: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
  },
  DEV_SERVER_URL: 'http://localhost:4200',
  PATHS: {
    preload: '../preload.js',
    productionApp: './angular-app/dist/angular-app/browser/index.html',
  },
  IPC_CHANNELS: {
    SYSTEM: {
      INFO: 'system:info',
      TITLE: 'system:title',
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
  },
  DEFAULT_POSTGRES_CONFIG : {
    containerName: 'postgres',
    port: 5432,
    user: 'puser',
    password: 'ppassword',
  },
  DEFAULT_PGADMIN_CONFIG: {
    containerName: 'pgadmin',
    port: 5050,
    email: 'admin@example.com',
    password: 'pgpassword',
  },
  DEFAULT_REDIS_CONFIG: {
    containerName: 'redis',
    port: 6379,
    password: 'redis',
    dbCount: 16,
  },
  DEFAULT_RABBITMQ_CONFIG: {
    containerName: 'rabbitmq',
    port: 5672,
    user: 'rmuser',
    password: 'rmpassword',
    amqpPort: 5673,
  },
  DEFAULT_CRM_CONFIG: {
    containerName: 'crm-bpmsoft',
    port: 80,
    redisDb: 0,
    dbType: 'postgres',
    netVersion: '8.0',
    crmType: 'bpmsoft',
  },
  NET_VERSIONS: ['8.0', '3.1'],
  DB_TYPES: ['postgres', 'mysql'],
  CRM_TYPES: ['bpmsoft', 'creatio'],
  FOLDER_NAMES: {
    POSTGRES_VOLUMES: 'postgres-volumes',
    PGADMIN_VOLUMES: 'pgadmin-volumes',
    REDIS_VOLUMES: 'redis-volumes',
    RABBITMQ_VOLUMES: 'rabbitmq-volumes',
    CRM_VOLUMES: 'crm-volumes',
  },
};