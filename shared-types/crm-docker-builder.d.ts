// Типы для CRM Docker Builder

// Результат инициализации проекта
export interface InitProjectResult {
  success: boolean;
  message: string;
  projectConfig: ProjectConfig | null;
}

// Конфиг проекта
export interface ProjectConfig {
  projectName: string;
  projectPath: string;
  modifiedOn: string;
  postgresConfig: PostgresConfig;
  pgAdminConfig: PgAdminConfig;
  redisConfig: RedisConfig;
  crmConfigs: CrmConfig[];
  isSave: boolean;
}

export interface BaseContainerConfig {
  id: string;
  containerName: string;
  port: number;
  volumePath: string;
  isSave: boolean;
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
  savePgAdminSettings: (projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => Promise<InitProjectResult>;
  // Сохранение настроек Redis
  saveRedisSettings: (projectConfig: ProjectConfig, redisConfig: RedisConfig) => Promise<InitProjectResult>;
  // Сохранение настроек CRM
  saveCrmSetting: (projectConfig: ProjectConfig, crmConfig: CrmConfig) => Promise<InitProjectResult>;
  saveCrmSettings: (projectConfig: ProjectConfig) => Promise<InitProjectResult>;
}
