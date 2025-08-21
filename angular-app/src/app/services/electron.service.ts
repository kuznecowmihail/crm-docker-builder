import { Injectable } from '@angular/core';
import type { SystemAPI, FileSystemAPI, CrmDockerBuilderSystemAPI, SystemInfo, OpenDialogOptions, InitProjectResult, ProjectConfig, PostgresConfig, PgAdminConfig, RedisConfig, CrmConfig, ValidateProjectResult, CrmDockerBuilderValidatorSystemAPI } from '@shared/api';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  
  constructor() { }

  /**
   * Проверяет, запущено ли приложение в Electron
   */
  get isElectron(): boolean {
    return !!(window && window.systemAPI);
  }

  /**
   * Получает API для работы с системой
   */
  get systemAPI(): SystemAPI | null {
    return this.isElectron ? window.systemAPI : null;
  }

  /**
   * Получает API для работы с файловой системой
   */
  get fileSystemAPI(): FileSystemAPI | null {
    return this.isElectron ? window.fileSystemAPI : null;
  }

  /**
   * Получает API для работы с CRM Docker Builder
   */
  get crmDockerBuilderSystemAPI(): CrmDockerBuilderSystemAPI | null {
    return this.isElectron ? window.crmDockerBuilderSystemAPI : null;
  }

  /**
   * Получает API для работы с CRM Docker Builder Validator
  /**
   * Получает API для работы с CRM Docker Builder Validator
   */
  get crmDockerBuilderValidatorSystemAPI(): CrmDockerBuilderValidatorSystemAPI | null {
    return this.isElectron ? window.crmDockerBuilderValidatorSystemAPI : null;
  }

  /**
   * Получает информацию о системе
   */
  async getSystemInfo(): Promise<SystemInfo> {
    if (!this.systemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.systemAPI.getSystemInfo();
  }

  /**
   * Получает заголовок приложения
   */
  async getAppTitle(): Promise<string> {
    if (!this.systemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.systemAPI.getAppTitle();
  }

  /**
   * Получает версию приложения
   */
  async getAppVersion(): Promise<string> {
    if (!this.systemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.systemAPI.getAppVersion();
  }

  /**
   * Открывает диалог выбора файла
   */
  async openFolderDialog(options: OpenDialogOptions): Promise<string> {
    if (!this.systemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.systemAPI.openFolderDialog(options);
  }

  /**
   * Открывает диалог выбора файла
   */
  async openFileDialog(options: OpenDialogOptions): Promise<string[]> {
    if (!this.systemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.systemAPI.openFileDialog(options);
  }

  /**
   * Показывает уведомление
   */
  async showNotification(title: string, body: string): Promise<void> {
    if (!this.systemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.systemAPI.showNotification(title, body);
  }

  /**
   * Читает файл
   */
  async readFile(filePath: string): Promise<string> {
    if (!this.fileSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.fileSystemAPI.readFile(filePath);
  }

  /**
   * Записывает файл
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    if (!this.fileSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.fileSystemAPI.writeFile(filePath, content);
  }

  /**
   * Проверяет существование файла
   */
  async fileExists(filePath: string): Promise<boolean> {
    if (!this.fileSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.fileSystemAPI.fileExists(filePath);
  }

  /**
   * Создает папку
   */
  async createDirectory(dirPath: string): Promise<void> {
    if (!this.fileSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.fileSystemAPI.createDirectory(dirPath);
  }

  async createProject(path: string): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }

    return await this.crmDockerBuilderSystemAPI.createProject(path);
  }

  async openProject(path: string): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }

    return await this.crmDockerBuilderSystemAPI.openProject(path);
  }

  async saveGeneralProjectSettings(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderSystemAPI.saveGeneralProjectSettings(projectConfig);
  }

  async savePostgresSettings(projectConfig: ProjectConfig, postgresConfig: PostgresConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderSystemAPI.savePostgresSettings(projectConfig, postgresConfig);
  }

  async savePgAdminSettings(projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderSystemAPI.savePgAdminSettings(projectConfig, pgAdminConfig);
  }

  async saveRedisSettings(projectConfig: ProjectConfig, redisConfig: RedisConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderSystemAPI.saveRedisSettings(projectConfig, redisConfig);
  }

  async saveCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderSystemAPI.saveCrmSetting(projectConfig, crmConfig);
  }

  async saveCrmSettings(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderSystemAPI.saveCrmSettings(projectConfig);
  }

  async validateGeneralProjectSettings(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateGeneralProjectSettings(projectConfig);
  }

  async validatePostgresSettings(projectConfig: ProjectConfig, postgresConfig: PostgresConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validatePostgresSettings(projectConfig, postgresConfig);
  }
  
  async validatePgAdminSettings(projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validatePgAdminSettings(projectConfig, pgAdminConfig);
  }
  
  async validateRedisSettings(projectConfig: ProjectConfig, redisConfig: RedisConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateRedisSettings(projectConfig, redisConfig);
  }
  
  
  async validateCrmSettings(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateCrmSettings(projectConfig);
  }
  
  
  async validateCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateCrmSetting(projectConfig, crmConfig);
  }

  async validateAppPath(projectPath: string, appPath: string): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateAppPath(projectPath, appPath);
  }
  
  
  async validateBackupPath(backupPath: string): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateBackupPath(backupPath);
  }
  
  async validateAll(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateAll(projectConfig);
  }
}