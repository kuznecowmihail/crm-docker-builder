# Быстрый старт - Упаковка приложения

## 🚀 Быстрая сборка

### Для текущей платформы (macOS/Linux/Windows)
```bash
npm run dist
```

### Для конкретной платформы
```bash
# Windows (все архитектуры)
npm run dist:win

# Windows (только x64/AMD64)
npm run dist:win:x64

# Windows (только ARM64)
npm run dist:win:arm64

# macOS  
npm run dist:mac

# Linux
npm run dist:linux
```

## 📦 Что создается

### Windows
- `CRM Docker Builder-0.3.0-x64.exe` - установщик для x64
- `CRM Docker Builder-0.3.0-arm64.exe` - установщик для ARM64
- `CRM Docker Builder-0.3.0-x64.exe` - портативная версия для x64
- `CRM Docker Builder-0.3.0-arm64.exe` - портативная версия для ARM64
- `CRM Docker Builder-0.3.0-x64.zip` - архив для x64
- `CRM Docker Builder-0.3.0-arm64.zip` - архив для ARM64

### macOS
- `CRM Docker Builder.dmg` - образ диска
- `CRM Docker Builder.app.zip` - архив приложения

### Linux
- `CRM Docker Builder.AppImage` - универсальный формат
- `crm-docker-builder_*.deb` - Debian пакет
- `crm-docker-builder-*.rpm` - RPM пакет

## 🔧 Предварительные требования

### macOS
```bash
# Установить Xcode Command Line Tools
xcode-select --install
```

### Windows
```bash
# Установить Visual Studio Build Tools
# Скачать с: https://visualstudio.microsoft.com/downloads/
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install build-essential rpm

# CentOS/RHEL
sudo yum install gcc-c++ rpm-build
```

## 🎯 Команды для разработки

```bash
# Очистка
npm run clean

# Тестовая упаковка (без установщиков)
npm run pack

# Генерация иконок
npm run generate:icons

# Генерация фона DMG
npm run generate:dmg-background

# Тестирование сборки Windows
npm run test:windows
```

## 📁 Структура результатов

```
dist/
├── CRM Docker Builder-0.3.0.dmg                    # macOS установщик
├── CRM Docker Builder-0.3.0-mac.zip                # macOS архив
├── CRM Docker Builder-0.3.0-x64.exe               # Windows установщик (x64)
├── CRM Docker Builder-0.3.0-arm64.exe             # Windows установщик (ARM64)
├── CRM Docker Builder-0.3.0-x64.exe               # Windows портативная (x64)
├── CRM Docker Builder-0.3.0-arm64.exe             # Windows портативная (ARM64)
├── CRM Docker Builder-0.3.0-x64.zip               # Windows архив (x64)
├── CRM Docker Builder-0.3.0-arm64.zip             # Windows архив (ARM64)
├── CRM Docker Builder.AppImage                     # Linux AppImage
├── crm-docker-builder_0.3.0_amd64.deb             # Linux Debian
└── crm-docker-builder-0.3.0.x86_64.rpm            # Linux RPM
```

## ⚠️ Важные замечания

1. **macOS**: Для распространения нужен сертификат разработчика Apple
2. **Windows**: Для подписи нужен код-подписывающий сертификат
3. **Linux**: AppImage работает на большинстве дистрибутивов

## 🆘 Устранение проблем

### Ошибки сборки
```bash
# Очистить кэш
npm run clean
rm -rf node_modules
npm install
```

### Проблемы с зависимостями
```bash
# Пересобрать нативные модули
npm rebuild
```

### Проблемы с правами (macOS)
```bash
# Разрешить выполнение
chmod +x "dist/CRM Docker Builder.app/Contents/MacOS/CRM Docker Builder"
```

## 📚 Подробная документация

См. `PACKAGING_GUIDE.md` для полного руководства по упаковке.
