# 📋 Документация по NPM скриптам

## 🔨 Скрипты сборки

### `build:electron`
```bash
tsc -p electron/tsconfig.json && tsc -p electron/tsconfig.preload.json
```
**Описание:** Компиляция TypeScript файлов Electron (main и preload процессы)

### `build:angular`
```bash
cd angular-app && npm run build:electron
```
**Описание:** Сборка Angular приложения для Electron

### `build`
```bash
npm run build:angular && npm run build:electron
```
**Описание:** Полная сборка проекта (Angular + Electron)

## 🚀 Скрипты запуска

### `start:electron`
```bash
electron .
```
**Описание:** Запуск Electron в production режиме

### `start:angular`
```bash
cd angular-app && npm start
```
**Описание:** Запуск Angular dev server

### `start:electron:dev`
```bash
NODE_ENV=development electron .
```
**Описание:** Запуск Electron в development режиме с NODE_ENV=development

### `start:dev`
```bash
concurrently "npm run start:angular" "wait-on http://localhost:4200 && npm run start:electron"
```
**Описание:** Запуск Angular + Electron одновременно

### `dev:full`
```bash
concurrently "npm run start:angular" "wait-on http://localhost:4200 && npm run build:electron && npm run start:electron:dev"
```
**Описание:** Полный dev режим с пересборкой Electron

### `start`
```bash
npm run build && npm run start:electron
```
**Описание:** Сборка и запуск в production режиме

### `dev`
```bash
concurrently "npm run start:angular" "wait-on http://localhost:4200 && npm run build:electron && npm run start:electron"
```
**Описание:** Dev режим с пересборкой

## 🧹 Утилиты

### `clean`
```bash
rm -rf electron/dist angular-app/dist
```
**Описание:** Очистка папок сборки

### `generate:icons`
```bash
node scripts/generate-icons.js
```
**Описание:** Генерация иконок для разных платформ

### `generate:dmg-background`
```bash
node scripts/generate-dmg-background.js
```
**Описание:** Генерация фона для macOS DMG

### `test:windows`
```bash
node scripts/test-windows-build.js
```
**Описание:** Тестирование Windows сборки

## 📦 Скрипты упаковки

### `pack`
```bash
npm run build && electron-builder --dir
```
**Описание:** Создание неупакованной версии приложения

### `dist`
```bash
npm run build && electron-builder
```
**Описание:** Создание упакованных версий для всех платформ

### `dist:win`
```bash
npm run build && electron-builder --win
```
**Описание:** Создание Windows версий (x64 + arm64)

### `dist:win:x64`
```bash
npm run build && electron-builder --win --x64
```
**Описание:** Создание Windows версии только для x64

### `dist:win:arm64`
```bash
npm run build && electron-builder --win --arm64
```
**Описание:** Создание Windows версии только для ARM64

### `dist:mac`
```bash
npm run build && electron-builder --mac
```
**Описание:** Создание macOS версий (x64 + arm64)

### `dist:mac:x64`
```bash
npm run build && electron-builder --mac --x64
```
**Описание:** Создание macOS версии только для x64

### `dist:mac:arm64`
```bash
npm run build && electron-builder --mac --arm64
```
**Описание:** Создание macOS версии только для ARM64

### `dist:linux`
```bash
npm run build && electron-builder --linux
```
**Описание:** Создание Linux версий (x64 + arm64)

## 🎯 Рекомендуемые команды

### Для разработки:
```bash
npm run dev:full
```

### Для тестирования production сборки:
```bash
npm run start
```

### Для создания Windows версии:
```bash
npm run dist:win
```

### Для создания macOS версии:
```bash
npm run dist:mac
```

### Для создания Linux версии:
```bash
npm run dist:linux
```

