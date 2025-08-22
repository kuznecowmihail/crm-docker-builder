import * as fs from 'fs/promises';
import { CrmConfig, InitProjectResult, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig } from '@shared/api';
import { CrmDockerBuilderValidator } from './CrmDockerBuilderValidator';
import { FileSystemHelper } from './FileSystemHelper';
import path from 'path';
import { CrmDockerBuilderFileSystemHelper } from './CrmDockerBuilderFileSystemHelper';
import { DockerProcessHelper } from './DockerProcessHelper';

export class CrmDockerBuilderHelper {
  /**
   * Помощник для работы с файловой системой
   */
  private fileSystemHelper: FileSystemHelper;
  /**
   * Помощник для валидации настроек проекта
   */
  private crmDockerBuilderValidatorHelper: CrmDockerBuilderValidator;
  /**
   * Помощник для работы с файловой системой
   */
  private crmDockerBuilderFileSystemHelper: CrmDockerBuilderFileSystemHelper;

  constructor() {
    this.crmDockerBuilderValidatorHelper = new CrmDockerBuilderValidator();
    this.fileSystemHelper = new FileSystemHelper();
    this.crmDockerBuilderFileSystemHelper = new CrmDockerBuilderFileSystemHelper();
  }

    /**
   * Создает проект
   * @param path - путь к папке проекта
   * @returns результат создания проекта
   */
  public async createProject(path: string): Promise<InitProjectResult> {
    try {
      // Проверяем, существует ли папка
      const pathExists = await this.fileSystemHelper.pathExists(path);
      
      if (pathExists) {
        // Проверяем, пустая ли папка
        const isEmpty = await this.fileSystemHelper.isDirectoryEmpty(path);
        
        if (!isEmpty) {
          return {
            success: false,
            projectConfig: null,
            message: 'Папка не пустая. Пожалуйста, выберите пустую папку для создания проекта.'
          };
        }
      } else {
        return {
          success: false,
          projectConfig: null,
          message: 'Папка не существует. Пожалуйста, выберите существующую папку для создания проекта.'
        };
      }
      
      // Создаем файл конфигурации проекта
      // Создаем необходимые папки для проекта
      await this.createProjectDirectories(path);

      const configPath = `${path}/crm-docker-builder-config.json`;
      const сonfig: ProjectConfig = {
        projectName: path.split('/').pop() || 'crm-docker-project',
        projectPath: path,
        modifiedOn: new Date().toISOString(),
        postgresConfig: {
          id: this.generateId(),
          containerName: 'postgres',
          port: 5433,
          volumePath: `${path}/postgres-volumes`,
          user: 'puser',
          password: 'puser'
        },
        pgAdminConfig: {
          id: this.generateId(),
          containerName: 'pgadmin',
          port: 5434,
          volumePath: `${path}/pgadmin-volumes`,
          email: 'admin@example.com',
          password: 'puser'
        },
        redisConfig: {
          id: this.generateId(),
          containerName: 'redis',
          port: 6380,
          volumePath: `${path}/redis-volumes`,
          password: 'redis',
          dbCount: 16
        },
        rabbitmqConfig: {
          id: this.generateId(),
          containerName: 'rabbitmq',
          port: 15673,
          amqpPort: 5673,
          volumePath: `${path}/rabbitmq-volumes`,
          user: 'rmuser',
          password: 'rmpassword'
        },
        crmConfigs: []
      };

      await this.fileSystemHelper.writeFile(configPath, JSON.stringify(сonfig, null, 2));
      
      return {
        success: true,
        message: 'Проект успешно создан',
        projectConfig: сonfig
      };
    } catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при создании проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Открывает проект
   * @param path - путь к папке проекта
   * @returns результат открытия проекта
   */
  public async openProject(projectPath: string): Promise<InitProjectResult> {
    try {
      const configPath = path.join(projectPath, 'crm-docker-builder-config.json');
      console.log(configPath);
      const config = await fs.readFile(configPath, 'utf-8');
      return {
        success: true,
        message: 'Проект успешно открыт',
        projectConfig: JSON.parse(config)
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при открытии проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сохраняет настройки проекта
   * @param projectConfig - конфигурация проекта
   */
  public async saveGeneralProjectSettings(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    try {
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateGeneralProjectSettings(projectConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.projectName = projectConfig.projectName;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки проекта успешно сохранены',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сохранении настроек проекта (General): ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сохраняет настройки Postgres
   * @param projectConfig - конфигурация проекта
   * @param postgresConfig - конфигурация Postgres
   * @returns результат сохранения настроек
   */
  public async savePostgresSettings(projectConfig: ProjectConfig, postgresConfig: PostgresConfig): Promise<InitProjectResult> {
    try {
      // Создаем папку postgres-volumes, если она не существует
      await this.fileSystemHelper.ensureDirectoryExists(postgresConfig.volumePath);

      const validateResult = await this.crmDockerBuilderValidatorHelper.validatePostgresSettings(projectConfig, postgresConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.postgresConfig = postgresConfig;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки проекта успешно сохранены',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сохранении настроек проекта (Postgres): ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сохраняет настройки PgAdmin
   * @param projectConfig - конфигурация проекта
   * @param pgAdminConfig - конфигурация PgAdmin
   * @returns результат сохранения настроек
   */
  public async savePgAdminSettings(projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig): Promise<InitProjectResult> {
    try {
      // Создаем папку pgadmin-volumes, если она не существует
      await this.fileSystemHelper.ensureDirectoryExists(pgAdminConfig.volumePath);

      const validateResult = await this.crmDockerBuilderValidatorHelper.validatePgAdminSettings(projectConfig, pgAdminConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.pgAdminConfig = pgAdminConfig;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки проекта успешно сохранены',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сохранении настроек проекта (PgAdmin): ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сохраняет настройки Redis
   * @param projectConfig - конфигурация проекта
   * @param redisConfig - конфигурация Redis
   * @returns результат сохранения настроек
   */
  public async saveRedisSettings(projectConfig: ProjectConfig, redisConfig: RedisConfig): Promise<InitProjectResult> {
    try {
      // Создаем папку redis-volumes, если она не существует
      await this.fileSystemHelper.ensureDirectoryExists(redisConfig.volumePath);

      const validateResult = await this.crmDockerBuilderValidatorHelper.validateRedisSettings(projectConfig, redisConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.redisConfig = redisConfig;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectResult.projectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки проекта успешно сохранены',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сохранении настроек проекта (Redis): ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сохраняет настройки Rabbitmq
   * @param projectConfig - конфигурация проекта
   * @param rabbitmqConfig - конфигурация Rabbitmq
   * @returns результат сохранения настроек
   */
  public async saveRabbitmqSettings(projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig): Promise<InitProjectResult> {
    try {
      // Создаем папку rabbitmq-volumes, если она не существует
      await this.fileSystemHelper.ensureDirectoryExists(rabbitmqConfig.volumePath);

      const validateResult = await this.crmDockerBuilderValidatorHelper.validateRabbitmqSettings(projectConfig, rabbitmqConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.rabbitmqConfig = rabbitmqConfig;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectResult.projectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки проекта успешно сохранены',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сохранении настроек проекта (Rabbitmq): ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сохраняет настройки CRM
   * @param projectConfig - конфигурация проекта
   * @param crmConfig - конфигурация CRM
   * @returns результат сохранения настроек
   */
  public async saveCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<InitProjectResult> {
    try {
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateCrmSetting(projectConfig, crmConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        let existsCrmConfig = localProjectConfig.crmConfigs.find(crm => crm.id === crmConfig.id);
        if (existsCrmConfig) {
          existsCrmConfig.containerName = crmConfig.containerName;
          existsCrmConfig.port = crmConfig.port;
          existsCrmConfig.volumePath = crmConfig.volumePath;
          existsCrmConfig.appPath = crmConfig.appPath;
          existsCrmConfig.backupPath = crmConfig.backupPath;
          existsCrmConfig.redisDb = crmConfig.redisDb;
          existsCrmConfig.dbType = crmConfig.dbType;
          existsCrmConfig.netVersion = crmConfig.netVersion;
          existsCrmConfig.crmType = crmConfig.crmType;
        } else {
          localProjectConfig.crmConfigs.push(crmConfig);
        }
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки проекта успешно сохранены',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сохранении настроек проекта (CRM): ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сохраняет настройки CRM
   * @param projectConfig - конфигурация проекта
   * @returns результат сохранения настроек
   */
  public async saveCrmSettings(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    try {
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateCrmSettings(projectConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.crmConfigs = projectConfig.crmConfigs;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки проекта успешно сохранены',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сохранении настроек проекта (CRM): ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Сборка проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат сборки проекта
   */
  public async buildProject(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    try {
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateAll(projectConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      await this.crmDockerBuilderFileSystemHelper.buildDockerComposeFile(projectConfig);
      await this.crmDockerBuilderFileSystemHelper.handleCrmFiles(projectConfig);

      return {
        success: true,
        message: 'Проект успешно собран',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сборке проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Запускает проект
   * @param projectConfig - конфигурация проекта
   * @returns результат запуска проекта
   */
  public async runProject(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    try {
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateAll(projectConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      const dockerHelper = new DockerProcessHelper();

      // Проверяем Docker
      if (!await dockerHelper.isDockerInstalled()) {
        throw new Error('Docker не установлен');
      }

      if (!await dockerHelper.isDockerRunning()) {
        throw new Error('Docker daemon не запущен');
      }

      await dockerHelper.startDockerCompose(projectConfig.projectPath, projectConfig.projectName);

      await this.crmDockerBuilderFileSystemHelper.buildPostgresRestoreScript(projectConfig);
      await this.crmDockerBuilderFileSystemHelper.buildCreateTypeCastsPostgreSql(projectConfig);

      for (const crmConfig of projectConfig.crmConfigs) {
        const onLog = (log: string) => {
            console.log(`[${crmConfig.containerName}] ${log.trim()}`);
        };
        await this.fileSystemHelper.copyFile(crmConfig.backupPath, path.join(projectConfig.postgresConfig.volumePath, 'postgresql-data', `${crmConfig.containerName}.backup`));
        // Делаем файл исполняемым
        await dockerHelper.executeDockerCommandWithLogs(
          ['exec', projectConfig.postgresConfig.containerName, 'chmod', '+x', '/var/lib/postgresql/data/postgres.sh'], 
          projectConfig.projectPath, 
          onLog
        );
        
        // Запускаем скрипт
        await dockerHelper.executeDockerCommandWithLogs(
          ['exec', projectConfig.postgresConfig.containerName, 'bash', '-c', `/var/lib/postgresql/data/postgres.sh ${crmConfig.containerName} ${projectConfig.postgresConfig.user} /var/lib/postgresql/data`], 
          projectConfig.projectPath, 
          onLog
        );
      }
      
      
      return {
        success: true,
        message: 'Проект успешно запущен',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при запуске проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Создает необходимые папки для проекта
   * @param projectPath - путь к проекту
   */
  private async createProjectDirectories(projectPath: string): Promise<void> {
    try {
      const directories = [
        path.join(projectPath, 'postgres-volumes'),
        path.join(projectPath, 'pgadmin-volumes'),
        path.join(projectPath, 'redis-volumes'),
        path.join(projectPath, 'rabbitmq-volumes'),
        path.join(projectPath, 'crm-volumes')
      ];

      for (const dir of directories) {
        try {
          await this.fileSystemHelper.ensureDirectoryExists(dir);
          console.log(`Создана папка: ${dir}`);
        } catch (error) {
          console.warn(`Не удалось создать папку ${dir}:`, error);
        }
      }
    } catch (error) {
      console.error('Ошибка при создании папок проекта:', error);
      throw error;
    }
  }

  /**
   * Генерирует уникальный идентификатор
   * @returns уникальный идентификатор
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
