import { Constants, CrmConfig } from '@shared/api';

export const ConstantValues: Constants = {
  DEFAULT_WINDOW_CONFIG: {
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
  },
  DEV_SERVER_URL: 'http://localhost:4200',
  PATHS: {
    preload: '../preload.js',
    productionApp: './angular-app/dist/angular-app/browser/index.html'
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
    password: 'password',
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

    POSTGRES_PATHS: {
      INIT_DATABASE: 'init-database',
      POSTGRES_DATA: 'postgresql-data',
    },
    POSTGRES_PATHS_DOCKER: {
      INIT_DATABASE: '/docker-entrypoint-initdb.d',
      POSTGRES_DATA: '/var/lib/postgresql/data',
    },
    REDIS_PATHS: {
      REDIS_DATA: 'data',
      REDIS_CONF: 'redis.conf',
    },
    PGADMIN_PATHS_DOCKER: {
      PGADMIN_DATA: '/var/lib/pgadmin',
    },
    REDIS_PATHS_DOCKER: {
      REDIS_DATA: '/data',
      REDIS_CONF: '/usr/local/etc/redis/redis.conf',
    },
    RABBITMQ_PATHS_DOCKER: {
      RABBITMQ_DATA: '/var/lib/rabbitmq',
    },
    CRM_PATHS_DOCKER: {
      APP: '/app',
      VSDBG: 'vsdbg',
      PROJ_FILES: 'crm-docker-files',
    },
  },
  FILE_NAMES: {
    CRM_DOCKER_BUILDER_CONFIG: 'crm-docker-builder-config.json',
    DOCKER_COMPOSE: 'docker-compose.yml',
    DOCKERFILE_BPM_SOFT_NET8: 'DockerFile_bpmsoft_net8',
    DOCKERFILE_BPM_SOFT_NET3: 'DockerFile_bpmsoft_net3',
    DOCKERFILE_CREATIO_NET8: 'DockerFile_creation_net8',
    DOCKERFILE_CREATIO_NET3: 'DockerFile_creation_net3',
    POSTGRES_RESTORE_SCRIPT: 'restore.sh',
    CREATE_TYPE_CASTS_POSTGRES_SQL: 'CreateTypeCastsPostgreSql.sql',
    APP_HANDLER: 'app-handler.sh',
    APP_HANDLER_PS: 'app-handler.ps1',
    WORKSPACE_CONSOLE_HANDLER: 'workspace-console-handler.sh',
    WORKSPACE_CONSOLE_HANDLER_PS: 'workspace-console-handler.ps1',
  },
  NETWORK_PREFIX: '-network',
};