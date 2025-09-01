import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { SystemAPI, FileSystemAPI, CrmDockerBuilderSystemAPI, SystemInfo, OpenDialogOptions, InitProjectResult, ProjectConfig, PostgresConfig, PgAdminConfig, RedisConfig, CrmConfig, ValidateProjectResult, CrmDockerBuilderValidatorSystemAPI, ValidateCrmResult, RabbitmqConfig, ConstantsAPI, Constants, ProjectSystemAPI } from '@shared/api';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  
  constructor() { }

  private _snackBar = inject(MatSnackBar);

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
   * Получает API для работы с проектом
   */
  get projectAPI(): ProjectSystemAPI | null {
    return this.isElectron ? window.projectSystemAPI : null;
  }

  /**
   * Получает API для работы с CRM Docker Builder
   */
  get crmDockerBuilderSystemAPI(): CrmDockerBuilderSystemAPI | null {
    return this.isElectron ? window.crmDockerBuilderSystemAPI : null;
  }

  /**
   * Получает API для работы с CRM Docker Builder Validator
   */
  get crmDockerBuilderValidatorSystemAPI(): CrmDockerBuilderValidatorSystemAPI | null {
    return this.isElectron ? window.crmDockerBuilderValidatorSystemAPI : null;
  }

  /**
   * Получает API для работы с Constants
   */
  get constantsAPI(): ConstantsAPI | null {
    return this.isElectron ? window.constantsAPI : null;
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
    this._snackBar.open(body, 'OK', {
      duration: 5000,
    });
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

  /**
   * Создает проект
   * @param path - путь к проекту
   * @returns результат создания проекта
   */
  async createProject(path: string): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }

    return await this.projectAPI.createProject(path);
  }

  /**
   * Открывает проект
   * @param path - путь к проекту
   * @returns результат открытия проекта
   */
  async openProject(path: string): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }

    return await this.projectAPI.openProject(path);
  }

  /**
   * Сохраняет настройки проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат сохранения настроек проекта
   */
  async saveGeneralProjectSettings(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.projectAPI.saveGeneralProjectSettings(projectConfig);
  }

  /**
   * Сохраняет настройки Postgres
   * @param projectConfig - конфигурация проекта
   * @param postgresConfig - конфигурация Postgres
   * @returns результат сохранения настроек Postgres
   */
  async savePostgresSettings(projectConfig: ProjectConfig, postgresConfig: PostgresConfig): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.projectAPI.savePostgresSettings(projectConfig, postgresConfig);
  }

  /**
   * Сохраняет настройки PgAdmin
   * @param projectConfig - конфигурация проекта
   * @param pgAdminConfig - конфигурация PgAdmin
   * @returns результат сохранения настроек PgAdmin
   */
  async savePgAdminSettings(projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.projectAPI.savePgAdminSettings(projectConfig, pgAdminConfig);
  }

  /**
   * Сохраняет настройки Redis
   * @param projectConfig - конфигурация проекта
   * @param redisConfig - конфигурация Redis
   * @returns результат сохранения настроек Redis
   */
  async saveRedisSettings(projectConfig: ProjectConfig, redisConfig: RedisConfig): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.projectAPI.saveRedisSettings(projectConfig, redisConfig);
  }

  /**
   * Сохраняет настройки Rabbitmq
   * @param projectConfig - конфигурация проекта
   * @param rabbitmqConfig - конфигурация Rabbitmq
   * @returns результат сохранения настроек Rabbitmq
   */
  async saveRabbitmqSettings(projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.projectAPI.saveRabbitmqSettings(projectConfig, rabbitmqConfig);
  }

  /**
   * Сохраняет настройки CRM
   * @param projectConfig - конфигурация проекта
   * @param crmConfig - конфигурация CRM
   * @returns результат сохранения настроек CRM
   */
  async saveCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.projectAPI.saveCrmSetting(projectConfig, crmConfig);
  }

  /**
   * Сохраняет настройки CRM
   * @param projectConfig - конфигурация проекта
   * @returns результат сохранения настроек CRM
   */
  async saveCrmSettings(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    if (!this.projectAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.projectAPI.saveCrmSettings(projectConfig);
  }

  /**
   * Собирает проект
   * @param projectConfig - конфигурация проекта
   * @returns результат сборки проекта
   */
  async buildProject(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {
      throw new Error('Electron API недоступен');
    }

    return await this.crmDockerBuilderSystemAPI.buildProject(projectConfig);
  }

  /**
   * Запускает проект
   * @param projectConfig - конфигурация проекта
   * @returns результат запуска проекта
   */
  async runProject(projectConfig: ProjectConfig): Promise<InitProjectResult> {
    if (!this.crmDockerBuilderSystemAPI) {  
      throw new Error('Electron API недоступен');
    }
    
    return await this.crmDockerBuilderSystemAPI.runProject(projectConfig);
  }

  /**
   * Подписывается на логи проекта в реальном времени
   * @param onLogCallback Колбэк для получения логов
   */
  subscribeToProjectLogs(onLogCallback: (log: string) => void): void {
    if (!this.isElectron) {
      console.warn('Electron API недоступен для подписки на логи');
      return;
    }
    
    window.electronAPI?.on('project-log', (event: any, log: string) => {
      onLogCallback(log);
    });
  }

  /**
   * Отписывается от логов проекта
   */
  unsubscribeFromProjectLogs(): void {
    if (!this.isElectron) {
      return;
    }
    
    window.electronAPI?.removeAllListeners('project-log');
  }

  /**
   * Проверяет настройки проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  async validateGeneralProjectSettings(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateGeneralProjectSettings(projectConfig);
  }

  /**
   * Проверяет настройки Postgres
   * @param projectConfig - конфигурация проекта
   * @param postgresConfig - конфигурация Postgres
   * @returns результат проверки
   */
  async validatePostgresSettings(projectConfig: ProjectConfig, postgresConfig: PostgresConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validatePostgresSettings(projectConfig, postgresConfig);
  }
  
  /**
   * Проверяет настройки PgAdmin
   * @param projectConfig - конфигурация проекта
   * @param pgAdminConfig - конфигурация PgAdmin
   * @returns результат проверки
   */
  async validatePgAdminSettings(projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validatePgAdminSettings(projectConfig, pgAdminConfig);
  }
  
  /**
   * Проверяет настройки Redis
   * @param projectConfig - конфигурация проекта
   * @param redisConfig - конфигурация Redis
   * @returns результат проверки
   */
  async validateRedisSettings(projectConfig: ProjectConfig, redisConfig: RedisConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateRedisSettings(projectConfig, redisConfig);
  }
  
  /**
   * Проверяет настройки Rabbitmq
   * @param projectConfig - конфигурация проекта
   * @param rabbitmqConfig - конфигурация Rabbitmq
   * @returns результат проверки
   */
  async validateRabbitmqSettings(projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateRabbitmqSettings(projectConfig, rabbitmqConfig);
  }
  
  /**
   * Проверяет настройки CRM
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  async validateCrmSettings(projectConfig: ProjectConfig): Promise<ValidateCrmResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateCrmSettings(projectConfig);
  }
  
  
  /**
   * Проверяет настройки CRM
   * @param projectConfig - конфигурация проекта
   * @param crmConfig - конфигурация CRM
   * @returns результат проверки
   */
  async validateCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateCrmSetting(projectConfig, crmConfig);
  }

  /**
   * Проверяет путь к приложению
   * @param projectPath - путь к проекту
   * @param appPath - путь к приложению
   * @returns результат проверки
   */
  async validateAppPath(projectPath: string, appPath: string): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateAppPath(projectPath, appPath);
  }
  
  /**
   * Проверяет путь к бэкапу
   * @param backupPath - путь к бэкапу
   * @returns результат проверки
   */
  async validateBackupPath(backupPath: string): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateBackupPath(backupPath);
  }
  
  /**
   * Проверяет все настройки проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  async validateAll(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    if (!this.crmDockerBuilderValidatorSystemAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.crmDockerBuilderValidatorSystemAPI.validateAll(projectConfig);
  }

  /**
   * Получает константы
   */
  async getConstants(): Promise<Constants> {
    if (!this.constantsAPI) {
      throw new Error('Electron API недоступен');
    }
    return await this.constantsAPI.getConstants();
  }
}