import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../../services/electron.service';

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
  systemInfo: any = null;

  constructor(private electronService: ElectronService) {}

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

      console.log('Выбранныя папка:', path);
    } catch (error) {
      console.error('Ошибка открытия папки:', error);
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

      if (!path) {
        return;
      }

      console.log('Выбранныя папка:', path);

      await this.electronService.createProject(path);
    } catch (error) {
      console.error('Ошибка открытия папки:', error);
    }
  }
}
