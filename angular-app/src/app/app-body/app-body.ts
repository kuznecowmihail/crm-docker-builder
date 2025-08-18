import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../services/electron.service';
import { HomePage } from './home-page/home-page';

@Component({
  selector: 'app-body',
  imports: [CommonModule, HomePage],
  templateUrl: './app-body.html',
  styleUrl: './app-body.css'
})
export class AppBody {
  /**
   * Флаг инициализации проекта
   */
  isProjectInitialized = false;

  constructor(private electronService: ElectronService) {}
}
