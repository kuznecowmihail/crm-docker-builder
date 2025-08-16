import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../services/electron.service';

@Component({
  selector: 'app-body',
  imports: [CommonModule],
  templateUrl: './app-body.html',
  styleUrl: './app-body.css'
})
export class AppBody {
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

  async showNotification() {
    try {
      await this.electronService.showNotification('Тест', 'Это уведомление из Electron!');
    } catch (error) {
      console.error('Ошибка показа уведомления:', error);
    }
  }

  async openFile() {
    try {
      const files = await this.electronService.openFileDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      console.log('Выбранные файлы:', files);
    } catch (error) {
      console.error('Ошибка открытия файла:', error);
    }
  }
}
