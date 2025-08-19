import { Injectable } from '@angular/core';
import type { SystemAPI, FileSystemAPI, CrmDockerBuilderSystemAPI, SystemInfo, OpenDialogOptions, InitProjectResult } from '@shared/api';

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
}