// Типы для CRM Docker Builder

// Результат инициализации проекта
export interface InitProjectResult {
  success: boolean;
  message: string;
  projectConfig: ProjectConfig | null;
}

// Результат валидации проекта
export interface ValidateProjectResult {
  success: boolean;
  message: string;
}

// Результат валидации проекта
export interface ValidateCrmResult {
  success: boolean;
  message: string;
  crmConfig: CrmConfig | null;
}

// Конфиг проекта
export interface ProjectConfig {
  projectName: string;
  projectPath: string;
  modifiedOn: Date;
  buildOn?: Date;
  runOn?: Date;
  postgresConfig: PostgresConfig;
  pgAdminConfig: PgAdminConfig;
  redisConfig: RedisConfig;
  rabbitmqConfig: RabbitmqConfig;
  crmConfigs: CrmConfig[];
}

export interface BaseContainerConfig {
  id: string;
  containerName: string;
  port: number;
  volumePath: string;
}

export interface PostgresConfig extends BaseContainerConfig {
  user: string;
  password: string;
}

export interface PgAdminConfig extends BaseContainerConfig {
  email: string;
  password: string;
  }

  export interface RedisConfig extends BaseContainerConfig {
    password: string;
    dbCount: number;
  }

export interface RabbitmqConfig extends BaseContainerConfig {
  user: string;
  password: string;
  amqpPort: number;
}

export interface CrmConfig extends BaseContainerConfig {
  appPath: string;
  backupPath: string;
  redisDb: number;
  dbType: string;
  netVersion: string;
  crmType: string;
}

// API для работы с системой CRM Docker Builder
export interface CrmDockerBuilderSystemAPI {
  // Создание проекта
  createProject: (path: string) => Promise<InitProjectResult>;
  // Открытие проекта
  openProject: (path: string) => Promise<InitProjectResult>;
  // Сохранение проекта
  saveGeneralProjectSettings: (projectConfig: ProjectConfig) => Promise<InitProjectResult>;
  // Сохранение настроек Postgres 
  savePostgresSettings: (projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => Promise<InitProjectResult>;
  // Сохранение настроек PgAdmin
  savePgAdminSettings: (projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => Promise<InitProjectResult>;
  // Сохранение настроек Redis
  saveRedisSettings: (projectConfig: ProjectConfig, redisConfig: RedisConfig) => Promise<InitProjectResult>;
  // Сохранение настроек Rabbitmq
  saveRabbitmqSettings: (projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => Promise<InitProjectResult>;
  // Сохранение настроек CRM
  saveCrmSetting: (projectConfig: ProjectConfig, crmConfig: CrmConfig) => Promise<InitProjectResult>;
  // Сохранение настроек CRM
  saveCrmSettings: (projectConfig: ProjectConfig) => Promise<InitProjectResult>;
  // Сборка проекта
  buildProject: (projectConfig: ProjectConfig) => Promise<InitProjectResult>;
  // Запуск проекта
  runProject: (projectConfig: ProjectConfig) => Promise<InitProjectResult>;
}

export interface CrmDockerBuilderValidatorSystemAPI {
  // Проверка настроек проекта
  validateGeneralProjectSettings: (projectConfig: ProjectConfig) => Promise<ValidateProjectResult>;
  // Проверка настроек Postgres
  validatePostgresSettings: (projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => Promise<ValidateProjectResult>;
  // Проверка настроек PgAdmin
  validatePgAdminSettings: (projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => Promise<ValidateProjectResult>;
  // Проверка настроек Redis
  validateRedisSettings: (projectConfig: ProjectConfig, redisConfig: RedisConfig) => Promise<ValidateProjectResult>;
  // Проверка настроек Rabbitmq
  validateRabbitmqSettings: (projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => Promise<ValidateProjectResult>;
  // Проверка настроек CRM
  validateCrmSettings: (projectConfig: ProjectConfig) => Promise<ValidateCrmResult>;
  // Проверка настроек CRM
  validateCrmSetting: (projectConfig: ProjectConfig, crmConfig: CrmConfig) => Promise<ValidateProjectResult>;
  // Проверка пути к папке приложения
  validateAppPath: (projectPath: string, appPath: string) => Promise<ValidateProjectResult>;
  // Проверка пути к файлу резервных копий
  validateBackupPath: (backupPath: string) => Promise<ValidateProjectResult>;
  // Проверка всех настроек
  validateAll: (projectConfig: ProjectConfig) => Promise<ValidateProjectResult>;
}