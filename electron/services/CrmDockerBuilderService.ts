import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import { CreateProjectResult } from '@shared/api';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class CrmDockerBuilderService implements IService {
  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.CREATE_PROJECT, async (event, options) => {
      return this.createProject(options);
    });
  }

  public async createProject(path: string): Promise<CreateProjectResult> {
    try {
      // Проверяем, существует ли папка
      const pathExists = await this.pathExists(path);
      
      if (pathExists) {
        // Проверяем, пустая ли папка
        const isEmpty = await this.isDirectoryEmpty(path);
        
        if (!isEmpty) {
          return {
            success: false,
            message: 'Папка не пустая. Пожалуйста, выберите пустую папку для создания проекта.'
          };
        }
      } else {
        return {
          success: false,
          message: 'Папка не существует. Пожалуйста, выберите существующую папку для создания проекта.'
        };
      }
      
      // Создаем файл конфигурации проекта
      const configPath = `${path}/crm-docker-builder-config.json`;
      const configContent = {
        projectName: path.split('/').pop() || 'crm-docker-project',
        modifiedOn: new Date().toISOString(),
        version: '1.0.0',
        description: 'CRM Docker Builder Project Configuration'
      };
      
      await fs.writeFile(configPath, JSON.stringify(configContent, null, 2), 'utf-8');
      
      return {
        success: true,
        message: 'Проект успешно создан'
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка при создании проекта: ${error instanceof Error ? error.message : String(error)}`
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
