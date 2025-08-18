// Типы для CRM Docker Builder

// Результат создания проекта
export interface CreateProjectResult {
  success: boolean;
  message: string;
}

// API для работы с системой CRM Docker Builder
export interface CrmDockerBuilderSystemAPI {
  // Создание проекта
  createProject: (path: string) => Promise<CreateProjectResult>;
}
