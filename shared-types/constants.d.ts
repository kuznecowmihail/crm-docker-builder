// Общие константы для Electron и Angular приложений
export interface Constants {
  DEFAULT_WINDOW_CONFIG: {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
  };
  DEV_SERVER_URL: string;
  PATHS: {
    preload: string;
    productionApp: string;
  };
  IPC_CHANNELS: {
    SYSTEM: {
      TITLE: string,
      INFO: string,
      VERSION: string,
    },
    DIALOG: {
      OPEN_FOLDER: string,
      OPEN_FILE: string,
      SAVE_FILE: string,
    },
    NOTIFICATION: {
      SHOW: string,
    },
    FILE_SYSTEM: {
      READ_FILE: string,
      WRITE_FILE: string,
      FILE_EXISTS: string,
      CREATE_DIR: string,
    },
    CRM_DOCKER_BUILDER_SYSTEM: {
      CREATE_PROJECT: string,
      OPEN_PROJECT: string,
      SAVE_GENERAL_PROJECT_SETTINGS: string,
      SAVE_POSTGRES_SETTINGS: string,
      SAVE_PGADMIN_SETTINGS: string,
      SAVE_REDIS_SETTINGS: string,
      SAVE_RABBITMQ_SETTINGS: string,
      SAVE_CRM_SETTING: string,
      SAVE_CRM_SETTINGS: string,
      BUILD_PROJECT: string,
      RUN_PROJECT: string,
    },
    CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM: {
      VALIDATE_GENERAL_PROJECT_SETTINGS: string,
      VALIDATE_POSTGRES_SETTINGS: string,
      VALIDATE_PGADMIN_SETTINGS: string,
      VALIDATE_REDIS_SETTINGS: string,
      VALIDATE_RABBITMQ_SETTINGS: string,
      VALIDATE_CRM_SETTINGS: string,
      VALIDATE_CRM_SETTING: string,
      VALIDATE_APP_PATH: string,
      VALIDATE_BACKUP_PATH: string,
      VALIDATE_ALL: string,
    },
    CONSTANTS_SYSTEM: {
      GET_CONSTANTS: string,
    }
  },
  DEFAULT_POSTGRES_CONFIG: {
    containerName: string,
    port: number,
    user: string,
    password: string,
  },
  DEFAULT_PGADMIN_CONFIG: {
    containerName: string,
    port: number,
    email: string,
    password: string,
  },
  DEFAULT_REDIS_CONFIG: {
    containerName: string,
    port: number,
    password: string,
    dbCount: number,
  },
  DEFAULT_RABBITMQ_CONFIG: {
    containerName: string,
    port: number,
    user: string,
    password: string,
    amqpPort: number,
  },
  DEFAULT_CRM_CONFIG: {
    containerName: string,
    port: number,
    redisDb: number,
    dbType: string,
    netVersion: string,
    crmType: string,
  },
  NET_VERSIONS: string[],
  DB_TYPES: string[],
  CRM_TYPES: string[],
  FOLDER_NAMES: {
    POSTGRES_VOLUMES: string,
    PGADMIN_VOLUMES: string,
    REDIS_VOLUMES: string,
    RABBITMQ_VOLUMES: string,
    CRM_VOLUMES: string,
    LOG_FILES: string,

    POSTGRES_PATHS: {
      INIT_DATABASE: string,
      POSTGRES_DATA: string,
    },
    POSTGRES_PATHS_DOCKER: {
      INIT_DATABASE: string,
      POSTGRES_DATA: string,
    },
    PGADMIN_PATHS_DOCKER: {
      PGADMIN_DATA: string,
    },
    REDIS_PATHS: {
      REDIS_DATA: string,
      REDIS_CONF: string,
    },
    REDIS_PATHS_DOCKER: {
      REDIS_DATA: string,
      REDIS_CONF: string,
    },
    RABBITMQ_PATHS_DOCKER: {
      RABBITMQ_DATA: string,
    },
    CRM_PATHS_DOCKER: {
      APP: string,
      VSDBG: string,
      PROJ_FILES: string,
    },
  },
  FILE_NAMES: {
    CRM_DOCKER_BUILDER_CONFIG: string,
    DOCKER_COMPOSE: string,
    DOCKERFILE_BPM_SOFT_NET8: string,
    DOCKERFILE_BPM_SOFT_NET3: string,
    DOCKERFILE_CREATIO_NET8: string,
    DOCKERFILE_CREATIO_NET3: string,
    POSTGRES_RESTORE_SCRIPT: string,
    CREATE_TYPE_CASTS_POSTGRES_SQL: string,
    APP_HANDLER: string,
    APP_HANDLER_PS: string,
    WORKSPACE_CONSOLE_HANDLER: string,
    WORKSPACE_CONSOLE_HANDLER_PS: string,
  },
  NETWORK_PREFIX: string
}

// Типы для файловой системы

// API для работы с файловой системой
export interface ConstantsAPI {
  getConstants: () => Promise<Constants>;
}
