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
}

export interface BaseContainerConfig {
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
}
