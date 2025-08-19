import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../../services/electron.service';
import { ProjectConfig, SystemInfo } from '@shared/api';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  /**
   * Информация о системе
   */
  systemInfo: SystemInfo | null = null;

  /**
   * Конфиг проекта
   */
  projectConfig: ProjectConfig | null = null;

  /**
   * Event для передачи projectConfig в родительский компонент
   */
  @Output() projectConfigChange = new EventEmitter<ProjectConfig>();

  /**
   * Конструктор
   * @param electronService - сервис для работы с Electron
   */
  constructor(private electronService: ElectronService) {}

  /**
   * Инициализация компонента
   */
  ngOnInit() {
    this.loadElectronInfo();
  }

  private async loadElectronInfo() {
    try {
      this.systemInfo = await this.electronService.getSystemInfo();
    } catch (error) {
      console.error('Ошибка загрузки информации Electron:', error);
    }
  }

  /**
   * Открывает проект
   */
  async openProject() {
    try {
      const path = await this.electronService.openFolderDialog({
        title: 'Открыть проект'
      });

      if (!path) {
        return;
      }

      const result = await this.electronService.openProject(path);
      this.projectConfig = result.projectConfig;
      console.log('result', result);

      await this.electronService.showNotification('Открыть проект', result.message);

      // Передаем projectConfig в родительский компонент
      if (result.success && result.projectConfig) {
        this.projectConfigChange.emit(result.projectConfig);
      }
    } catch (error) {
      console.error('Ошибка открытия проекта:', error);

      await this.electronService.showNotification('Открыть проект', 'Ошибка при открытии проекта: ' + error);
    }
  }

  /**
   * Создает проект
   */
  async createProject() {
    try {
      const path = await this.electronService.openFolderDialog({
        title: 'Создать проект'
      });
      console.log('Выбранныя папка:', path);

      if (!path) {
        return;
      }

      const result = await this.electronService.createProject(path);
      this.projectConfig = result.projectConfig;
      console.log('result', result);

      await this.electronService.showNotification('Создать проект', result.message);

      // Передаем projectConfig в родительский компонент
      if (result.success && result.projectConfig) {
        this.projectConfigChange.emit(result.projectConfig);
      }
    } catch (error) {
      console.error('Ошибка создания проекта:', error);

      await this.electronService.showNotification('Создать проект', 'Ошибка при создании проекта: ' + error); 
    }
  }
}
