import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { AppManager } from './services/AppManager';

// Функция для установки иконки приложения
function setAppIcon() {
  const iconPath = path.join(process.cwd(), 'electron', 'assets', 'icons', 'icon-256x256.png');
  console.log('🎨 Установка иконки приложения...');
  console.log('📁 iconPath:', iconPath);

  if (fs.existsSync(iconPath)) {
    console.log(`✅ Устанавливаем иконку приложения: ${iconPath}`);
    app.setAppUserModelId('com.crm-docker-builder.app');
    
    // Для macOS устанавливаем иконку Dock
    if (process.platform === 'darwin' && app.dock) {
      console.log('🍎 Устанавливаем иконку для Dock macOS');
      app.dock.setIcon(iconPath);
    }
  }
}

console.log('📁 Текущая директория:', process.cwd());
console.log('📁 __dirname:', __dirname);
console.log('🖥️  Платформа:', process.platform);

// Устанавливаем иконку приложения
setAppIcon();

// Создаем и инициализируем менеджер приложения
const appManager = new AppManager();
appManager.initialize();
