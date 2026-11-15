"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const AppManager_1 = require("./services/AppManager");
const AssetPathHelper_1 = require("./helpers/AssetPathHelper");
const ProcessPathHelper_1 = require("./helpers/ProcessPathHelper");
(0, ProcessPathHelper_1.augmentProcessPath)();
// Функция для установки иконки приложения
function setAppIcon() {
    const iconPath = (0, AssetPathHelper_1.getAppIconPath)();
    console.log('🎨 Установка иконки приложения...');
    console.log('📁 iconPath:', iconPath);
    if (iconPath) {
        console.log(`✅ Устанавливаем иконку приложения: ${iconPath}`);
        electron_1.app.setAppUserModelId('com.crm-docker-builder.app');
        // Для macOS устанавливаем иконку Dock
        if (process.platform === 'darwin' && electron_1.app.dock) {
            console.log('🍎 Устанавливаем иконку для Dock macOS');
            electron_1.app.dock.setIcon(iconPath);
        }
    }
}
console.log('📁 Корень приложения:', (0, AssetPathHelper_1.getAppRootPath)());
console.log('📁 __dirname:', __dirname);
console.log('🖥️  Платформа:', process.platform);
// Устанавливаем иконку приложения
setAppIcon();
// Создаем и инициализируем менеджер приложения
const appManager = new AppManager_1.AppManager();
appManager.initialize();
//# sourceMappingURL=main.js.map