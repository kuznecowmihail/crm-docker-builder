# Общие типы (Shared Types)

Эта папка содержит общие типы TypeScript и константы, которые используются как в Electron, так и в Angular приложении.

## Структура файлов

### Основные файлы типов:
- `api.d.ts` - Главный файл экспорта всех типов и констант
- `system.d.ts` - Системные типы (SystemInfo, SystemAPI)
- `dialogs.d.ts` - Типы для диалогов (OpenDialogOptions)
- `filesystem.d.ts` - Типы для файловой системы (FileSystemAPI)
- `notifications.d.ts` - Типы для уведомлений (NotificationOptions)
- `crm-docker-builder.d.ts` - Типы для CRM Docker Builder (CreateProjectResult, CrmDockerBuilderSystemAPI)
- `constants.d.ts` - Общие константы (IPC каналы, конфигурация окна, пути)
- `global.d.ts` - Глобальные типы (Window интерфейс) - используется в обеих частях приложения

## Использование

### В Electron
```typescript
import { SystemAPI, FileSystemAPI, CreateProjectResult, IPC_CHANNELS } from '@shared/api';
```

### В Angular
```typescript
import { SystemAPI, FileSystemAPI, CreateProjectResult, IPC_CHANNELS } from '@shared/api';
```

### Импорт конкретных типов (опционально)
```typescript
// Можно импортировать только нужные типы
import { SystemInfo } from '@shared/system';
import { OpenDialogOptions } from '@shared/dialogs';
import { FileSystemAPI } from '@shared/filesystem';
```

## Преимущества новой структуры

1. **Модульность** - типы разделены по логическим группам
2. **Расширяемость** - легко добавлять новые типы в соответствующие файлы
3. **Читаемость** - понятная структура файлов
4. **Переиспользование** - можно импортировать только нужные типы
5. **Единый источник истины** - все типы и константы в одном месте
6. **Единые глобальные типы** - Window интерфейс определен в одном месте

## Настройка

Для работы с общими типами в проекте настроены path mappings:

- `@shared/*` → `../shared-types/*` (для Electron)
- `@shared/*` → `../shared-types/*` (для Angular)

## Добавление новых типов

### Для системных функций:
1. Добавьте типы в `system.d.ts`
2. Экспортируйте через `api.d.ts`

### Для диалогов:
1. Добавьте типы в `dialogs.d.ts`
2. Экспортируйте через `api.d.ts`

### Для файловой системы:
1. Добавьте типы в `filesystem.d.ts`
2. Экспортируйте через `api.d.ts`

### Для новых констант:
1. Добавьте константы в `constants.d.ts`
2. Они автоматически будут доступны через `@shared/api`

### Для глобальных типов:
1. Добавьте типы в `global.d.ts`
2. Они автоматически будут доступны в обеих частях приложения

## Примеры расширения

### Добавление нового API метода:
```typescript
// В system.d.ts
export interface SystemAPI {
  // ... существующие методы
  newMethod: () => Promise<string>;
}
```

### Добавление нового типа диалога:
```typescript
// В dialogs.d.ts
export interface NewDialogOptions {
  title: string;
  // ... другие свойства
}
```

### Добавление новой константы:
```typescript
// В constants.d.ts
export const NEW_CONSTANT = 'new-value' as const;
```

### Добавление нового глобального свойства:
```typescript
// В global.d.ts
declare global {
  interface Window {
    // ... существующие свойства
    newGlobalAPI: NewAPI;
  }
}
```
