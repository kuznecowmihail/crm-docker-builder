import { CrmConfig, InitProjectResult, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig } from "@shared/api";
import { FileSystemHelper } from "./FileSystemHelper";
import { ConstantValues } from "../config/constants";
import { CrmDockerBuilderValidator } from "./CrmDockerBuilderValidator";
import path from "path";

// Помощник для работы с проектами
export class ProjectHelper {
    /**
     * Помощник для работы с файловой системой
     */
    private fileSystemHelper: FileSystemHelper;
    /**
     * Помощник для работы с CRM Docker Builder Validator
     */
    private crmDockerBuilderValidatorHelper: CrmDockerBuilderValidator;
    
    /**
     * Конструктор
     */
    constructor() {
        this.fileSystemHelper = new FileSystemHelper();
        this.crmDockerBuilderValidatorHelper = new CrmDockerBuilderValidator();
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

        const configPath = path.join(projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG);
        const сonfig: ProjectConfig = {
            projectName: path.basename(projectPath),
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
        const configPath = path.join(projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG);
        console.log(configPath);
        const config = await this.fileSystemHelper.readFile(configPath);
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
        await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG), JSON.stringify(localProjectConfig, null, 2));
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
        await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG), JSON.stringify(localProjectConfig, null, 2));
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
        await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG), JSON.stringify(localProjectConfig, null, 2));
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
        await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG), JSON.stringify(localProjectResult.projectConfig, null, 2));
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
        await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG), JSON.stringify(localProjectResult.projectConfig, null, 2));
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
        await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG), JSON.stringify(localProjectConfig, null, 2));
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
        await this.fileSystemHelper.writeFile(path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.CRM_DOCKER_BUILDER_CONFIG), JSON.stringify(localProjectConfig, null, 2));
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