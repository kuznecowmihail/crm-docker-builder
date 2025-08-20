import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import { CrmConfig, InitProjectResult, PgAdminConfig, PostgresConfig, ProjectConfig, RedisConfig } from '@shared/api';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class CrmDockerBuilderService implements IService {
  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.CREATE_PROJECT, async (event, path: string) => {
      return await this.createProject(path);
    });

    // Открытие проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.OPEN_PROJECT, async (event, path: string) => {
      return await this.openProject(path);
    });

    // Сохранение настроек проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_GENERAL_PROJECT_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.saveGeneralProjectSettings(projectConfig);
    });
    
    // Сохранение настроек Postgres
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_POSTGRES_SETTINGS, async (event, projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => {
      return await this.savePostgresSettings(projectConfig, postgresConfig);
    });
    
    // Сохранение настроек PgAdmin
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_PGADMIN_SETTINGS, async (event, projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => {
      return await this.savePgAdminSettings(projectConfig, pgAdminConfig);
    });
    
    // Сохранение настроек Redis
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_REDIS_SETTINGS, async (event, projectConfig: ProjectConfig, redisConfig: RedisConfig) => {
      return await this.saveRedisSettings(projectConfig, redisConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTING, async (event, projectConfig: ProjectConfig, crmConfig: CrmConfig) => {
      return await this.saveCrmSetting(projectConfig, crmConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.saveCrmSettings(projectConfig);
    });

    // Сохранение всех настроек
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_ALL, async (event, projectConfig: ProjectConfig) => {
      return await this.saveAll(projectConfig);
    });
  }

  /**
   * Создает проект
   * @param path - путь к папке проекта
   * @returns результат создания проекта
   */
  public async createProject(path: string): Promise<InitProjectResult> {
    try {
      // Проверяем, существует ли папка
      const pathExists = await this.pathExists(path);
      
      if (pathExists) {
        // Проверяем, пустая ли папка
        const isEmpty = await this.isDirectoryEmpty(path);
        
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
      const configPath = `${path}/crm-docker-builder-config.json`;
      const сonfig: ProjectConfig = {
        projectName: path.split('/').pop() || 'crm-docker-project',
        projectPath: path,
        isSave: true,
        modifiedOn: new Date().toISOString(),
        postgresConfig: {
          id: this.generateId(),
          containerName: 'postgres',
          port: 5433,
          volumePath: `${path}/postgres-volumes`,
          user: 'puser',
          password: 'puser',
          isSave: true
        },
        pgAdminConfig: {
          id: this.generateId(),
          containerName: 'pgadmin',
          port: 5434,
          volumePath: `${path}/pgadmin-volumes`,
          email: 'admin@example.com',
          password: 'puser',
          isSave: true
        },
        redisConfig: {
          id: this.generateId(),
          containerName: 'redis',
          port: 6380,
          volumePath: `${path}/redis-volumes`,
          password: 'redis',
          dbCount: 16,
          isSave: true
        },
        crmConfigs: []
      };

      await fs.writeFile(configPath, JSON.stringify(сonfig, null, 2), 'utf-8');
      
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
  public async openProject(path: string): Promise<InitProjectResult> {
    try {
      const configPath = `${path}/crm-docker-builder-config.json`;
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
      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.projectName = projectConfig.projectName;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await fs.writeFile(projectConfig.projectPath + '/crm-docker-builder-config.json', JSON.stringify(localProjectConfig, null, 2), 'utf-8');
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
        message: `Ошибка при сохранении настроек проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  public async savePostgresSettings(projectConfig: ProjectConfig, postgresConfig: PostgresConfig): Promise<InitProjectResult> {
    try {
      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.postgresConfig = postgresConfig;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await fs.writeFile(projectConfig.projectPath + '/crm-docker-builder-config.json', JSON.stringify(localProjectConfig, null, 2), 'utf-8');
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
        message: `Ошибка при сохранении настроек проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  public async savePgAdminSettings(projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig): Promise<InitProjectResult> {
    try {
      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.pgAdminConfig = pgAdminConfig;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await fs.writeFile(projectConfig.projectPath + '/crm-docker-builder-config.json', JSON.stringify(localProjectConfig, null, 2), 'utf-8');
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
        message: `Ошибка при сохранении настроек проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  public async saveRedisSettings(projectConfig: ProjectConfig, redisConfig: RedisConfig): Promise<InitProjectResult> {
    try {
      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.redisConfig = redisConfig;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await fs.writeFile(projectConfig.projectPath + '/crm-docker-builder-config.json', JSON.stringify(localProjectResult.projectConfig, null, 2), 'utf-8');
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
        message: `Ошибка при сохранении настроек проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  public async saveCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<InitProjectResult> {
    try {
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
          existsCrmConfig.isSave = true;
        } else {
          localProjectConfig.crmConfigs.push(crmConfig);
        }
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await fs.writeFile(projectConfig.projectPath + '/crm-docker-builder-config.json', JSON.stringify(localProjectConfig, null, 2), 'utf-8');
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
        message: `Ошибка при сохранении настроек проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  public async saveCrmSettings(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    try {
      const localProjectResult = await this.openProject(projectConfig.projectPath);
      let localProjectConfig = localProjectResult.projectConfig;

      if (localProjectResult.success && localProjectConfig) {
        localProjectConfig.crmConfigs = projectConfig.crmConfigs;
        localProjectConfig.modifiedOn = new Date().toISOString();
      }
      await fs.writeFile(projectConfig.projectPath + '/crm-docker-builder-config.json', JSON.stringify(localProjectConfig, null, 2), 'utf-8');
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
        message: `Ошибка при сохранении настроек проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  public async saveAll(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    try {
      await this.saveGeneralProjectSettings(projectConfig);
      await this.savePostgresSettings(projectConfig, projectConfig.postgresConfig);
      await this.savePgAdminSettings(projectConfig, projectConfig.pgAdminConfig);
      await this.saveRedisSettings(projectConfig, projectConfig.redisConfig);
      await this.saveCrmSettings(projectConfig);
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
        message: `Ошибка при сохранении настроек проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Проверяет, пустая ли папка
   * @param path - путь к папке
   * @returns true, если папка пустая, false в противном случае
   */
  private async isDirectoryEmpty(path: string): Promise<boolean> {
    try {
      const files = await fs.readdir(path);
      return files.length === 0;
    } catch (error) {
      return false;
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
