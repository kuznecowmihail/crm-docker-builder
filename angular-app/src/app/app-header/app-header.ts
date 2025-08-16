import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../services/electron.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css'
})
export class AppHeader {
  appTitle = '';
  appVersion = '';

  constructor(private electronService: ElectronService) {}

  ngOnInit() {
    this.loadElectronInfo();
  }

  private async loadElectronInfo() {
    try {
      this.appTitle = await this.electronService.getAppTitle();
      this.appVersion = await this.electronService.getAppVersion();
    } catch (error) {
      console.error('Ошибка загрузки информации Electron:', error);
    }
  }
}