import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import { InitProjectResult, ProjectConfig } from '@shared/api';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class CrmDockerBuilderService implements IService {
  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.CREATE_PROJECT, async (event, options) => {
      return this.createProject(options);
    });

    // Открытие проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.OPEN_PROJECT, async (event, options) => {
      return this.openProject(options);
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
        modifiedOn: new Date().toISOString(),
        postgresConfig: {
          containerName: 'postgres',
          port: 5433,
          volumePath: `${path}/postgres`,
          user: 'postgres',
          password: 'postgres'
        },
        pgAdminConfig: {
          containerName: 'pgadmin',
          port: 8081,
          volumePath: `${path}/pgadmin`,
          email: 'admin@example.com',
          password: 'admin'
        },
        redisConfig: {
          containerName: 'redis',
          port: 6380,
          volumePath: `${path}/redis`,
          password: 'redis',
          dbCount: 1
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

  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private async isDirectoryEmpty(path: string): Promise<boolean> {
    try {
      const files = await fs.readdir(path);
      return files.length === 0;
    } catch (error) {
      return false;
    }
  }
}
