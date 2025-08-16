import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ElectronService } from './services/electron.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Electron Angular App');
  isElectron = false;
  appVersion = '';
  systemInfo: any = null;

  constructor(private electronService: ElectronService) {}

  ngOnInit() {
    this.isElectron = this.electronService.isElectron;
    
    if (this.isElectron) {
      this.loadElectronInfo();
    }
  }

  private async loadElectronInfo() {
    try {
      this.appVersion = await this.electronService.getAppVersion();
      this.systemInfo = await this.electronService.getSystemInfo();
    } catch (error) {
      console.error('Ошибка загрузки информации Electron:', error);
    }
  }

  async showNotification() {
    if (this.isElectron) {
      try {
        await this.electronService.showNotification('Тест', 'Это уведомление из Electron!');
      } catch (error) {
        console.error('Ошибка показа уведомления:', error);
      }
    }
  }

  async openFile() {
    if (this.isElectron) {
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
}
