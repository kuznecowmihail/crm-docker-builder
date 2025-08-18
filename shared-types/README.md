# Общие типы (Shared Types)

Эта папка содержит общие типы TypeScript, которые используются как в Electron, так и в Angular приложении.

## Структура

- `api.d.ts` - Основные API интерфейсы и типы для взаимодействия между Electron и Angular

## Использование

### В Electron
```typescript
import { SystemAPI, FileSystemAPI, CreateProjectResult } from '@shared/api';
```

### В Angular
```typescript
import { SystemAPI, FileSystemAPI, CreateProjectResult } from '@shared/api';
```

## Преимущества

1. **Единый источник истины** - все типы определены в одном месте
2. **Автоматическая синхронизация** - изменения в типах автоматически применяются к обеим частям приложения
3. **Лучшая типизация** - более строгая типизация между Electron и Angular
4. **Упрощение поддержки** - не нужно дублировать код

## Настройка

Для работы с общими типами в проекте настроены path mappings:

- `@shared/*` → `../shared-types/*` (для Electron)
- `@shared/*` → `../shared-types/*` (для Angular)

## Добавление новых типов

При добавлении новых типов:

1. Добавьте их в соответствующий файл в `shared-types/`
2. Экспортируйте через `export *` в `api.d.ts`
3. Используйте через импорт `@shared/api` в обеих частях приложения
