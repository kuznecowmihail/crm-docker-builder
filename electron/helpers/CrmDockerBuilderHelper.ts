import * as path from 'path';
import { InitProjectResult, ProjectConfig } from '@shared/api';
import { CrmDockerBuilderValidator } from './CrmDockerBuilderValidator';
import { FileSystemHelper } from './FileSystemHelper';
import { DockerProcessHelper } from './DockerProcessHelper';
import { CrmHelper } from './CrmHelper';
import { BashHelper } from './files/BashHelper';
import { SqlHelper } from './files/SqlHelper';
import { VscodeHelper } from './files/VscodeHelper';
import { DockerComposeHelper } from './files/DockerComposeHelper';
import { ConstantValues } from '../config/constants';
import { ProjectHelper } from './ProjectHelper';

// Помощник для работы с CRM Docker Builder
export class CrmDockerBuilderHelper {
  /**
   * Помощник для работы с файловой системой
   */
  private fileSystemHelper: FileSystemHelper;

  /**
   * Помощник для работы с проектом
   */
  private projectHelper: ProjectHelper;

  /**
   * Помощник для валидации настроек проекта
   */
  private crmDockerBuilderValidatorHelper: CrmDockerBuilderValidator;

  /**
   * Помощник для работы с файлами CRM
   */
  private crmHelper: CrmHelper;

  /**
   * Помощник для работы с vsdbg файлами
   */
  private vscodeHelper: VscodeHelper;
  /**
   * Помощник для работы с Docker
   */
  private dockerProcessHelper: DockerProcessHelper;

  /**
   * Помощник для работы с файлами Bash
   */
  private bashHelper: BashHelper;

  /**
   * Помощник для работы с файлами SQL
   */
  private sqlHelper: SqlHelper;

  /**
   * Помощник для работы с файлами Docker Compose
   */
  private dockerComposeHelper: DockerComposeHelper;

  /**
   * Конструктор
   */
  constructor() {
    this.crmDockerBuilderValidatorHelper = new CrmDockerBuilderValidator();
    this.fileSystemHelper = new FileSystemHelper();
    this.projectHelper = new ProjectHelper();
    this.vscodeHelper = new VscodeHelper();
    this.dockerProcessHelper = new DockerProcessHelper();
    this.crmHelper = new CrmHelper();
    this.bashHelper = new BashHelper();
    this.sqlHelper = new SqlHelper();
    this.dockerComposeHelper = new DockerComposeHelper();
  }

  /**
   * Сборка проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат сборки проекта
   */
  public async buildProject(projectConfig: ProjectConfig, onLogCallback?: (log: string) => void): Promise<InitProjectResult> {
    try {
      onLogCallback?.(`[CrmDockerBuilderHelper] 🚀 Начинаем сборку проекта`);
      
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateAll(projectConfig, onLogCallback);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      // Скачиваем vsdbg файлы
      await this.vscodeHelper.buildVsdbgFilesWithLogs(projectConfig, onLogCallback);
      // Создаем файл docker-compose.yml (без новых CRM контейнеров)
      await this.buildDockerComposeFile(projectConfig, false, onLogCallback);
      // Обрабатываем файлы CRM
      await this.crmHelper.handleCrmFiles(projectConfig, onLogCallback);

      onLogCallback?.(`[CrmDockerBuilderHelper] ✅ Проект успешно собран`);

      return {
        success: true,
        message: 'Проект успешно собран',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      onLogCallback?.(`[CrmDockerBuilderHelper] ❌ Ошибка при сборке проекта: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при сборке проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Запускает проект
   * @param projectConfig - конфигурация проекта
   * @returns результат запуска проекта
   */
  public async runProject(projectConfig: ProjectConfig, onLogCallback?: (log: string) => void): Promise<InitProjectResult> {
    try {
      // Проблема:
      // Если CRM контейнеры запускать первоначально с БД контейнерами, то docker-compose падает в ошибку
      // Тк приложение еще не имеет БД и перезапускается
      // Поэтому запускаем первый раз без новых CRM контейнеров (восстанвливаем БД новых CRM)
      // А затем запускаем второй раз с новыми CRM контейнерами
      let secondRun = false;
      
      onLogCallback?.(`[CrmDockerBuilderHelper] 🚀 Начинаем запуск проекта`);
      
      const validateResult = await this.crmDockerBuilderValidatorHelper.validateAll(projectConfig);
      if (!validateResult.success) {
        return {
          success: false,
          projectConfig: null,
          message: validateResult.message
        };
      }

      // Проверяем Docker
      if (!await this.dockerProcessHelper.isDockerInstalled()) {
        throw new Error('Docker не установлен');
      }

      if (!await this.dockerProcessHelper.isDockerRunning()) {
        throw new Error('Docker daemon не запущен');
      }

      // Создаем сеть с именем проекта
      await this.dockerProcessHelper.createDockerNetwork(`${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}`, onLogCallback);
      // Запускаем Docker Compose
      await this.dockerProcessHelper.startDockerCompose(projectConfig.projectPath, projectConfig.projectName, onLogCallback);

      // Создаем файл для восстановления бэкапа в PostgreSQL
      await this.buildPostgresRestoreScript(projectConfig, onLogCallback);
      // Делаем файл для восстановления бэкапа в PostgreSQL исполняемым
      await this.dockerProcessHelper.executeDockerCommandWithLogs(
        ['exec', projectConfig.postgresConfig.containerName, 'chmod', '+x', `${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}/${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}`], 
        projectConfig.projectPath, 
        onLogCallback
      );
      // Создаем скрипт для создания типов данных в PostgreSQL
      await this.buildCreateTypeCastsPostgreSql(projectConfig, onLogCallback);

      for (const crmConfig of projectConfig.crmConfigs) {
        // Копируем бэкап в папку postgres-volumes
        await this.fileSystemHelper.copyFile(
          crmConfig.backupPath,
          path.join(
            projectConfig.postgresConfig.volumePath,
            ConstantValues.FOLDER_NAMES.POSTGRES_PATHS.POSTGRES_DATA,
            `${crmConfig.containerName}.backup`
          ),
          onLogCallback
        );
        // Запускаем файл для восстановления бэкапа в PostgreSQL
        await this.dockerProcessHelper.executeDockerCommandWithLogs(
          ['exec', projectConfig.postgresConfig.containerName, 'bash', '-c', `${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}/${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT} ${crmConfig.containerName} ${projectConfig.postgresConfig.user} ${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}`], 
          projectConfig.projectPath, 
          onLogCallback
        );

        if (!crmConfig.runOn) {
          secondRun = true;
        }
      }

      onLogCallback?.(`[CrmDockerBuilderHelper] ✅ Проект успешно запущен`);

      if (secondRun) {
        onLogCallback?.(`[CrmDockerBuilderHelper] 🚀 Начинаем запуск проекта (второй раз)`);
        // Создаем файл docker-compose.yml (добавляются новые CRM контейнеры)
        await this.buildDockerComposeFile(projectConfig, true, onLogCallback);
        // Запускаем Docker Compose (добавляются новые CRM контейнеры)
        await this.dockerProcessHelper.startDockerCompose(projectConfig.projectPath, projectConfig.projectName, onLogCallback);
        onLogCallback?.(`[CrmDockerBuilderHelper] ✅ Проект успешно запущен (второй раз)`);
      }

      for (const crmConfig of projectConfig.crmConfigs) {
        const vsdbgPath = path.join(crmConfig.volumePath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG);
        const vsdgPathExists = await this.fileSystemHelper.pathExists(vsdbgPath);

        if (!vsdgPathExists) {
          // Копируем vsdbg файлы в папку приложения
          await this.fileSystemHelper.copyDirectory(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG), path.join(crmConfig.volumePath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG), onLogCallback);
          // Делаем файл vsdbg исполняемым
          await this.dockerProcessHelper.executeDockerCommandWithLogs(
            ['exec', crmConfig.containerName, 'chmod', '+x', `${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG}`], 
            projectConfig.projectPath, 
            onLogCallback
          );
        }
        // // Делаем файл app-handler.sh исполняемым
        // await this.dockerProcessHelper.executeDockerCommandWithLogs(
        //   ['exec', crmConfig.containerName, 'chmod', '+x', `${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${ConstantValues.FILE_NAMES.APP_HANDLER}`], 
        //   projectConfig.projectPath, 
        //   onLogCallback
        // );
        // // Делаем файл workspace-console-handler.sh исполняемым
        // await this.dockerProcessHelper.executeDockerCommandWithLogs(
        //   ['exec', crmConfig.containerName, 'chmod', '+x', `${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${ConstantValues.FILE_NAMES.WORKSPACE_CONSOLE_HANDLER}`], 
        //   projectConfig.projectPath, 
        //   onLogCallback
        // );

        // Очищаем Redis базу данных
        await this.dockerProcessHelper.executeDockerCommandWithLogs(
          ['exec', projectConfig.redisConfig.containerName, 'redis-cli', 'FLUSHALL'], 
          projectConfig.projectPath, 
          onLogCallback
        );

        // Перезапускаем контейнер CRM
        await this.dockerProcessHelper.executeDockerCommandWithLogs(
          ['restart', crmConfig.containerName], 
          projectConfig.projectPath, 
          onLogCallback
        );

        // После успешной сборки помечаем CRM контейнеры датой запуска
        crmConfig.runOn = new Date();
        await this.projectHelper.saveCrmSetting(projectConfig, crmConfig);
      }
      
      return {
        success: true,
        message: 'Проект успешно запущен',
        projectConfig: projectConfig
      };
    }
    catch (error) {
      onLogCallback?.(`[CrmDockerBuilderHelper] ❌ Ошибка при запуске проекта: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        projectConfig: null,
        message: `Ошибка при запуске проекта: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Создает файл docker-compose.yml
   * @param projectConfig - конфигурация проекта
   * @returns - содержимое файла docker-compose.yml
   */
  private async buildDockerComposeFile(projectConfig: ProjectConfig, secondRun: boolean, onLog?: (log: string) => void): Promise<void> {
      try {
          console.log('buildDockerComposeFile');
          const dockerComposeFile = this.dockerComposeHelper.generateDockerComposeContent(projectConfig, secondRun);
          const filePath = path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.DOCKER_COMPOSE);
          await this.fileSystemHelper.writeFile(filePath, dockerComposeFile);
          onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл ${ConstantValues.FILE_NAMES.DOCKER_COMPOSE} успешно создан.`);
      } catch (error) {
          onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла ${ConstantValues.FILE_NAMES.DOCKER_COMPOSE}: ${error}`);

          throw error;
      }
  }

  /**
   * Создает файл ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
   * @param projectConfig - конфигурация проекта
   * @returns - содержимое файла ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
   */
  private async buildPostgresRestoreScript(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
      try {
          const postgresRestoreScript = this.bashHelper.generatePostgresRestoreScriptContent();
          const filePath = path.join(
            projectConfig.projectPath,
            ConstantValues.FOLDER_NAMES.POSTGRES_VOLUMES,
            ConstantValues.FOLDER_NAMES.POSTGRES_PATHS.POSTGRES_DATA,
            ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT
          );
          await this.fileSystemHelper.writeFile(filePath, postgresRestoreScript);
          onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT} успешно создан`);
      } catch (error) {
          onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}: ${error}`);

          throw error;
      }
  }

  /**
   * Создает файл ${ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL}
   * @param projectConfig - конфигурация проекта
   * @returns - содержимое файла ${ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL}
   */
  private async buildCreateTypeCastsPostgreSql(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
      try {
          const createTypeCastsPostgreSql = this.sqlHelper.generateCreateTypeCastsPostgreSqlContent();
          const filePath = path.join(
            projectConfig.projectPath,
            ConstantValues.FOLDER_NAMES.POSTGRES_VOLUMES,
            ConstantValues.FOLDER_NAMES.POSTGRES_PATHS.POSTGRES_DATA,
            ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL
          );
          await this.fileSystemHelper.writeFile(filePath, createTypeCastsPostgreSql);
          onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл ${ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL} успешно создан`);
      } catch (error) {
          onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла ${ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL}: ${error}`);

          throw error;
      }
  }
}
