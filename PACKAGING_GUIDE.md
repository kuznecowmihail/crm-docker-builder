# Руководство по упаковке CRM Docker Builder

## Обзор

Это руководство описывает процесс упаковки Electron + Angular приложения для Windows, macOS и Linux с помощью Electron Builder.

## Предварительные требования

### Для всех платформ:
- Node.js 18+ 
- npm или yarn
- Git

### Для Windows:
- Windows 10/11 (x64 или ARM64)
- Visual Studio Build Tools (для нативных модулей)

### Для macOS:
- macOS 10.15+ (x64 или ARM64)
- Xcode Command Line Tools
- Подписанный сертификат разработчика (для распространения)

### Для Linux:
- Ubuntu 18.04+ или аналогичный дистрибутив
- build-essential
- rpm (для создания RPM пакетов)

## Установка зависимостей

```bash
npm install
```

## Сборка приложения

### Полная сборка (все платформы)
```bash
npm run dist
```

### Сборка для конкретной платформы

#### Windows
```bash
# Все архитектуры (x64 + ARM64)
npm run dist:win

# Только x64/AMD64
npm run dist:win:x64

# Только ARM64
npm run dist:win:arm64
```

#### macOS
```bash
npm run dist:mac
```

#### Linux
```bash
npm run dist:linux
```

### Тестовая упаковка (без создания установщиков)
```bash
npm run pack
```

## Результаты сборки

После успешной сборки файлы будут созданы в папке `dist/`:

### Windows
- `CRM Docker Builder-0.3.0-x64.exe` - установщик NSIS для x64
- `CRM Docker Builder-0.3.0-arm64.exe` - установщик NSIS для ARM64
- `CRM Docker Builder-0.3.0-x64.exe` - портативная версия для x64
- `CRM Docker Builder-0.3.0-arm64.exe` - портативная версия для ARM64
- `CRM Docker Builder-0.3.0-x64.zip` - архив для x64
- `CRM Docker Builder-0.3.0-arm64.zip` - архив для ARM64

### macOS
- `CRM Docker Builder.dmg` - образ диска для установки
- `CRM Docker Builder.app.zip` - архив приложения

### Linux
- `CRM Docker Builder.AppImage` - AppImage файл
- `crm-docker-builder_0.3.0_amd64.deb` - Debian пакет
- `crm-docker-builder-0.3.0.x86_64.rpm` - RPM пакет

## Настройки упаковки

### Основные настройки (package.json)
```json
{
  "build": {
    "appId": "com.crm-docker-builder.app",
    "productName": "CRM Docker Builder",
    "directories": {
      "output": "dist"
    }
  }
}
```

### Windows настройки
- **NSIS установщик** - стандартный установщик Windows
- **Портативная версия** - не требует установки
- **ZIP архив** - для ручной установки
- **Поддержка архитектур** - x64 (AMD64) и ARM64
- **Именование файлов** - включает архитектуру в название

### macOS настройки
- **DMG образ** - стандартный способ установки на macOS
- **Hardened Runtime** - требования безопасности Apple
- **Entitlements** - разрешения для приложения

### Linux настройки
- **AppImage** - универсальный формат для Linux
- **DEB пакет** - для Debian/Ubuntu
- **RPM пакет** - для Red Hat/Fedora

## Подписание приложений

### macOS
Для распространения через App Store или без предупреждений безопасности:

1. Получите сертификат разработчика Apple
2. Добавьте в package.json:
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

### Windows
Для подписания Windows приложений:

1. Получите код-подписывающий сертификат
2. Добавьте в package.json:
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password"
    }
  }
}
```

## Автоматизация сборки

### GitHub Actions
Создайте `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - run: npm ci
    - run: npm run dist:${{ matrix.os == 'windows-latest' && 'win' || matrix.os == 'macos-latest' && 'mac' || 'linux' }}
    
    - uses: actions/upload-artifact@v3
      with:
        name: ${{ matrix.os }}-builds
        path: dist/
```

## Устранение неполадок

### Ошибки сборки
1. Убедитесь, что все зависимости установлены
2. Проверьте версии Node.js и npm
3. Очистите кэш: `npm run clean`

### Проблемы с подписью (macOS)
1. Проверьте сертификат: `security find-identity -v -p codesigning`
2. Убедитесь, что сертификат не истек
3. Проверьте права доступа к ключам

### Проблемы с Windows
1. Установите Visual Studio Build Tools
2. Проверьте переменные окружения
3. Запустите от имени администратора

## Полезные команды

```bash
# Очистка
npm run clean

# Генерация иконок
npm run generate:icons

# Генерация фона DMG
npm run generate:dmg-background

# Просмотр конфигурации
npx electron-builder --help

# Сборка с отладкой
DEBUG=electron-builder npm run dist
```

## Структура проекта

```
├── electron/                 # Electron код
│   ├── assets/              # Ресурсы (иконки, entitlements)
│   ├── dist/                # Скомпилированный Electron код
│   └── ...
├── angular-app/             # Angular приложение
│   ├── dist/                # Скомпилированное Angular приложение
│   └── ...
├── dist/                    # Результаты упаковки
├── scripts/                 # Скрипты сборки
└── package.json             # Конфигурация проекта
```
