import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ElectronService } from './services/electron.service';
import { CommonModule } from '@angular/common';
import { AppHeader } from './app-header/app-header';
import { AppBody } from './app-body/app-body';
import { AppFooter } from './app-footer/app-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, AppHeader, AppBody, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isElectron = false;
  systemInfo: any = null;

  constructor(private electronService: ElectronService) {}

  ngOnInit() {
    this.isElectron = this.electronService.isElectron;
  }
}
