import { app } from 'electron';
import { AppManager } from './services/AppManager';
import { getAppIconPath, getAppRootPath } from './helpers/AssetPathHelper';

// Функция для установки иконки приложения
function setAppIcon() {
  const iconPath = getAppIconPath();
  console.log('🎨 Установка иконки приложения...');
  console.log('📁 iconPath:', iconPath);

  if (iconPath) {
    console.log(`✅ Устанавливаем иконку приложения: ${iconPath}`);
    app.setAppUserModelId('com.crm-docker-builder.app');
    
    // Для macOS устанавливаем иконку Dock
    if (process.platform === 'darwin' && app.dock) {
      console.log('🍎 Устанавливаем иконку для Dock macOS');
      app.dock.setIcon(iconPath);
    }
  }
}

console.log('📁 Корень приложения:', getAppRootPath());
console.log('📁 __dirname:', __dirname);
console.log('🖥️  Платформа:', process.platform);

// Устанавливаем иконку приложения
setAppIcon();

// Создаем и инициализируем менеджер приложения
const appManager = new AppManager();
appManager.initialize();
