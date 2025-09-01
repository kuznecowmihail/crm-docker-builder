// Глобальные типы для Electron и Angular

// Импортируем типы из отдельных файлов
import { SystemAPI } from './system.d';
import { FileSystemAPI } from './filesystem.d';
import { CrmDockerBuilderSystemAPI } from './crm-docker-builder.d';
import { ElectronAPI } from './electron.d';

// Глобальные типы для window объекта
declare global {
  interface Window {
    systemAPI: SystemAPI;
    fileSystemAPI: FileSystemAPI;
    projectSystemAPI: ProjectSystemAPI;
    crmDockerBuilderSystemAPI: CrmDockerBuilderSystemAPI;
    crmDockerBuilderValidatorSystemAPI: CrmDockerBuilderValidatorSystemAPI;
    constantsAPI: ConstantsAPI;
    electronAPI?: ElectronAPI;
  }
}
