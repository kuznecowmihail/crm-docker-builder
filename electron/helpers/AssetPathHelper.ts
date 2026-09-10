import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const ICON_FILE = 'icon-512x512.png';

/**
 * Возвращает корень ресурсов приложения: в упакованном виде — resources/, иначе — корень репозитория
 * @returns абсолютный путь
 */
export function getAppRootPath(): string {
  return app.isPackaged ? process.resourcesPath : app.getAppPath();
}

/**
 * Возвращает путь к иконке приложения (упакованное: resources/assets/icons, dev: electron/assets/icons)
 * @returns путь к PNG или undefined, если файл не найден
 */
export function getAppIconPath(): string | undefined {
  const candidates = app.isPackaged
    ? [
        path.join(process.resourcesPath, 'assets', 'icons', ICON_FILE),
        path.join(app.getAppPath(), 'electron', 'assets', 'icons', ICON_FILE),
      ]
    : [path.join(app.getAppPath(), 'electron', 'assets', 'icons', ICON_FILE)];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

/**
 * Возвращает путь к собранному index.html Angular-приложения.
 * В упакованном виде app.getAppPath() указывает на app.asar — Electron читает его прозрачно.
 * @returns абсолютный путь к index.html
 */
export function getProductionIndexPath(): string {
  return path.join(app.getAppPath(), 'angular-app', 'dist', 'angular-app', 'browser', 'index.html');
}
