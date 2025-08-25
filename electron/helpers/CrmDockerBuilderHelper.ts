import * as fs from 'fs/promises';
import { CrmConfig, InitProjectResult, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig } from '@shared/api';
import { CrmDockerBuilderValidator } from './CrmDockerBuilderValidator';
import { FileSystemHelper } from './FileSystemHelper';
import * as path from 'path';
import { CrmDockerBuilderFileSystemHelper } from './CrmDockerBuilderFileSystemHelper';
import { DockerProcessHelper } from './DockerProcessHelper';
import { VscodeFilesHelper } from './VscodeFilesHelper';
import { ConstantValues } from '../config/constants';

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
  /**
   * Помощник для работы с vsdbg файлами
   */
  private vscodeFilesHelper: VscodeFilesHelper;
  /**
   * Помощник для работы с Docker
   */
  private dockerProcessHelper: DockerProcessHelper;

  /**
   * Конструктор
   */
  constructor() {
    this.crmDockerBuilderValidatorHelper = new CrmDockerBuilderValidator();
    this.fileSystemHelper = new FileSystemHelper();
    this.crmDockerBuilderFileSystemHelper = new CrmDockerBuilderFileSystemHelper();
    this.vscodeFilesHelper = new VscodeFilesHelper();
    this.dockerProcessHelper = new DockerProcessHelper();
  }

    /**
   * Создает проект
   * @param projectPath - путь к папке проекта
   * @returns результат создания проекта
   */
  public async createProject(projectPath: string): Promise<InitProjectResult> {
    try {
      // Проверяем, существует ли папка
      const pathExists = await this.fileSystemHelper.pathExists(projectPath);
      
      if (pathExists) {
        // Проверяем, пустая ли папка
        const isEmpty = await this.fileSystemHelper.isDirectoryEmpty(projectPath);
        
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
      await this.createProjectDirectories(projectPath);

      const configPath = `${path}/crm-docker-builder-config.json`;
      const сonfig: ProjectConfig = {
        projectName: projectPath.split('/').pop() || 'crm-docker-project',
        projectPath: projectPath,
        modifiedOn: new Date(),
        postgresConfig: {
          id: this.generateId(),
          containerName: ConstantValues.DEFAULT_POSTGRES_CONFIG.containerName,
          port: ConstantValues.DEFAULT_POSTGRES_CONFIG.port,
          volumePath: path.join(projectPath, ConstantValues.FOLDER_NAMES.POSTGRES_VOLUMES),
          user: ConstantValues.DEFAULT_POSTGRES_CONFIG.user,
          password: ConstantValues.DEFAULT_POSTGRES_CONFIG.password
        },
        pgAdminConfig: {
          id: this.generateId(),
          containerName: ConstantValues.DEFAULT_PGADMIN_CONFIG.containerName,
          port: ConstantValues.DEFAULT_PGADMIN_CONFIG.port,
          volumePath: path.join(projectPath, ConstantValues.FOLDER_NAMES.PGADMIN_VOLUMES),
          email: ConstantValues.DEFAULT_PGADMIN_CONFIG.email,
          password: ConstantValues.DEFAULT_PGADMIN_CONFIG.password
        },
        redisConfig: {
          id: this.generateId(),
          containerName: ConstantValues.DEFAULT_REDIS_CONFIG.containerName,
          port: ConstantValues.DEFAULT_REDIS_CONFIG.port,
          volumePath: path.join(projectPath, ConstantValues.FOLDER_NAMES.REDIS_VOLUMES),
          password: ConstantValues.DEFAULT_REDIS_CONFIG.password,
          dbCount: ConstantValues.DEFAULT_REDIS_CONFIG.dbCount
        },
        rabbitmqConfig: {
          id: this.generateId(),
          containerName: ConstantValues.DEFAULT_RABBITMQ_CONFIG.containerName,
          port: ConstantValues.DEFAULT_RABBITMQ_CONFIG.port,
          amqpPort: ConstantValues.DEFAULT_RABBITMQ_CONFIG.amqpPort,
          volumePath: path.join(projectPath, ConstantValues.FOLDER_NAMES.RABBITMQ_VOLUMES),
          user: ConstantValues.DEFAULT_RABBITMQ_CONFIG.user,
          password: ConstantValues.DEFAULT_RABBITMQ_CONFIG.password
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
        localProjectConfig.modifiedOn = projectConfig.modifiedOn;
        localProjectConfig.buildOn = projectConfig.buildOn;
        localProjectConfig.runOn = projectConfig.runOn;
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
        localProjectConfig.modifiedOn = new Date();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки Postgres успешно сохранены',
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
        localProjectConfig.modifiedOn = new Date();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки PgAdmin успешно сохранены',
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
        localProjectConfig.modifiedOn = new Date();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectResult.projectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки Redis успешно сохранены',
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
        localProjectConfig.modifiedOn = new Date();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectResult.projectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки Rabbitmq успешно сохранены',
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
        localProjectConfig.modifiedOn = new Date();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки CRM успешно сохранены',
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
        localProjectConfig.modifiedOn = new Date();
      }
      await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, 'crm-docker-builder-config.json'), JSON.stringify(localProjectConfig, null, 2));
      return {
        success: true,
        message: 'Настройки CRM успешно сохранены',
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
  public async buildProject(projectConfig: ProjectConfig, onLogCallback?: (log: string) => void): Promise<InitProjectResult> {
    try {
      onLogCallback?.(`[CrmDockerBuilderHelper] 🚀 Начинаем сборку проекта`);
      
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateAll(projectConfig, onLogCallback);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      // Скачиваем vsdbg файлы
      await this.vscodeFilesHelper.buildVsdbgFilesWithLogs(projectConfig, onLogCallback);
      // Создаем файл docker-compose.yml
      await this.crmDockerBuilderFileSystemHelper.buildDockerComposeFile(projectConfig, onLogCallback);
      // Обрабатываем файлы CRM
      await this.crmDockerBuilderFileSystemHelper.handleCrmFiles(projectConfig, onLogCallback);

      onLogCallback?.(`[CrmDockerBuilderHelper] ✅ Проект успешно собран`);

      return {
        success: true,
        message: 'Проект успешно собран',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      onLogCallback?.(`[CrmDockerBuilderHelper] ❌ Ошибка при сборке проекта: ${error instanceof Error ? error.message : String(error)}`);
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
  public async runProject(projectConfig: ProjectConfig, onLogCallback?: (log: string) => void): Promise<InitProjectResult> {
    try {
      onLogCallback?.(`[CrmDockerBuilderHelper] 🚀 Начинаем запуск проекта`);
      
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateAll(projectConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      // Проверяем Docker
      if (!await this.dockerProcessHelper.isDockerInstalled()) {
        throw new Error('Docker не установлен');
      }

      if (!await this.dockerProcessHelper.isDockerRunning()) {
        throw new Error('Docker daemon не запущен');
      }

      // Создаем сеть с именем проекта
      await this.dockerProcessHelper.createDockerNetwork(`${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}`, onLogCallback);
      // Запускаем Docker Compose
      await this.dockerProcessHelper.startDockerCompose(projectConfig.projectPath, projectConfig.projectName, onLogCallback);

      // Создаем скрипт для восстановления бэкапа в PostgreSQL
      await this.crmDockerBuilderFileSystemHelper.buildPostgresRestoreScript(projectConfig, onLogCallback);
      // Создаем скрипт для создания типов данных в PostgreSQL
      await this.crmDockerBuilderFileSystemHelper.buildCreateTypeCastsPostgreSql(projectConfig, onLogCallback);

      for (const crmConfig of projectConfig.crmConfigs) {
        // Копируем бэкап в папку postgres-volumes
        await this.fileSystemHelper.copyFile(
          crmConfig.backupPath,
          path.join(
            projectConfig.postgresConfig.volumePath,
            ConstantValues.FOLDER_NAMES.POSTGRES_PATHS.POSTGRES_DATA,
            `${crmConfig.containerName}.backup`
          ),
          onLogCallback
        );
        // Делаем файл ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT} исполняемым
        await this.dockerProcessHelper.executeDockerCommandWithLogs(
          ['exec', projectConfig.postgresConfig.containerName, 'chmod', '+x', `${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}/${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}`], 
          projectConfig.projectPath, 
          onLogCallback
        );
        // Запускаем скрипт ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT} для восстановления бэкапа
        await this.dockerProcessHelper.executeDockerCommandWithLogs(
          ['exec', projectConfig.postgresConfig.containerName, 'bash', '-c', `${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}/${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT} ${crmConfig.containerName} ${projectConfig.postgresConfig.user} ${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}`], 
          projectConfig.projectPath, 
          onLogCallback
        );

        // Копируем vsdbg файлы в папку приложения
        await this.fileSystemHelper.copyDirectory(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG), path.join(crmConfig.volumePath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG), onLogCallback);
        // Делаем файл vsdbg исполняемым
        await this.dockerProcessHelper.executeDockerCommandWithLogs(
          ['exec', crmConfig.containerName, 'chmod', '+x', `${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG}`], 
          projectConfig.projectPath, 
          onLogCallback
        );
      }

      onLogCallback?.(`[CrmDockerBuilderHelper] ✅ Проект успешно запущен`);
      
      return {
        success: true,
        message: 'Проект успешно запущен',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      onLogCallback?.(`[CrmDockerBuilderHelper] ❌ Ошибка при запуске проекта: ${error instanceof Error ? error.message : String(error)}`);
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
        path.join(projectPath, ConstantValues.FOLDER_NAMES.POSTGRES_VOLUMES),
        path.join(projectPath, ConstantValues.FOLDER_NAMES.PGADMIN_VOLUMES),
        path.join(projectPath, ConstantValues.FOLDER_NAMES.REDIS_VOLUMES),
        path.join(projectPath, ConstantValues.FOLDER_NAMES.RABBITMQ_VOLUMES),
        path.join(projectPath, ConstantValues.FOLDER_NAMES.CRM_VOLUMES)
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
