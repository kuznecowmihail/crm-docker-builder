import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProjectConfig } from '@shared/api';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-general-project-settings',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './general-project-settings.html',
  styleUrl: './general-project-settings.css'
})
export class GeneralProjectSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Название проекта
   */
  projectName: string = 'crm-docker-project';
  
  /**
   * Конструктор
   * @param electronService - сервис для работы с Electron
   */
  constructor(private electronService: ElectronService) {}

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('GeneralProjectSettings: Инициализация с конфигурацией:', this.projectConfig);
    
    if (this.projectConfig) {
      this.projectName = this.projectConfig.projectName || 'crm-docker-project';
    }
  }

  /**
   * Обработчик изменения названия проекта
   */
  onProjectNameChange() {
    console.log('GeneralProjectSettings: Изменение названия проекта:', this.projectName);
  }

  /**
   * Обработчик сохранения изменений
   */
  async onSaveChanges() {
    console.log('GeneralProjectSettings: Сохранение изменений:', {
      projectName: this.projectName,
    });

    if (this.projectConfig) {
      this.projectConfig.projectName = this.projectName;
      this.projectConfig.modifiedOn = new Date().toISOString();

      const result = await this.electronService.saveGeneralProjectSettings(this.projectConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);
    }
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('GeneralProjectSettings: Отмена изменений');

    if (this.projectConfig) {
      this.projectName = this.projectConfig.projectName || 'crm-docker-project';
    }
  }
}