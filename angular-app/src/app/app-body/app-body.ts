import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../services/electron.service';
import { HomePage } from './home-page/home-page';
import { ProjectWorkspace } from './project-workspace/project-workspace';
import { ProjectConfig } from '@shared/api';

@Component({
  selector: 'app-body',
  imports: [CommonModule, HomePage, ProjectWorkspace],
  templateUrl: './app-body.html',
  styleUrl: './app-body.css'
})
export class AppBody {
  /**
   * Флаг инициализации проекта
   */
  isProjectInitialized = false;

  /**
   * Конфигурация проекта
   */
  projectConfig: ProjectConfig | null = null;

  /**
   * Конструктор
   * @param electronService - сервис для работы с Electron
   */
  constructor(private electronService: ElectronService) {}

  /**
   * Обработчик изменения projectConfig от home-page
   */
  onProjectConfigChange(projectConfig: ProjectConfig) {
    console.log('AppBody: Получен projectConfig:', projectConfig);
    this.projectConfig = projectConfig;
    this.isProjectInitialized = true;
  }
}