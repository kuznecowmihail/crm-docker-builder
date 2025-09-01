import * as path from 'path';
import { CrmConfig, ProjectConfig } from "@shared/crm-docker-builder";
import { ConstantValues } from "../config/constants";
import { FileSystemHelper } from "./FileSystemHelper";
import { VscodeHelper } from "./files/VscodeHelper";
import { BashHelper } from "./files/BashHelper";
import { PowershellHelper } from "./files/PowershellHelper";
import { DockerFileHelper } from "./files/DockerFileHelper";

// Помощник для работы с CRM
export class CrmHelper {

    /**
     * Помощник для работы с файловой системой
     */
    private fileSystemHelper: FileSystemHelper;

    /**
     * Помощник для работы с файлами VSCode
     */
    private vscodeHelper: VscodeHelper;

    /**
     * Помощник для работы с файлами Bash
     */
    private bashHelper: BashHelper;

    /**
     * Помощник для работы с файлами PowerShell
     */
    private powershellHelper: PowershellHelper;

    /**
     * Помощник для работы с файлами Dockerfile
     */
    private dockerFileHelper: DockerFileHelper;

    /**
     * Конструктор
     */
    constructor() {
        this.fileSystemHelper = new FileSystemHelper();
        this.vscodeHelper = new VscodeHelper();
        this.bashHelper = new BashHelper();
        this.powershellHelper = new PowershellHelper();
        this.dockerFileHelper = new DockerFileHelper();
    }

    /**
     * Обрабатывает файлы CRM
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла docker-compose.yml
     */
    public async handleCrmFiles(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            for (const crmConfig of projectConfig.crmConfigs) {
                onLog?.(`[CrmDockerBuilderFileSystemHelper] Обработка файлов CRM для ${crmConfig.containerName}`);

                const connectionStringsPath = path.join(crmConfig.appPath, 'ConnectionStrings.config');
                const webHostConfigPath = path.join(crmConfig.appPath, 'BPMSoft.WebHost.dll.config');
                const workspaceConsoleConfigPath = path.join(crmConfig.appPath, 'WorkspaceConsole', 'BPMSoft.Tools.WorkspaceConsole.dll.config');

                const connectionStringsContent = await this.fileSystemHelper.readFile(connectionStringsPath);
                const webHostConfigContent = await this.fileSystemHelper.readFile(webHostConfigPath);
                const workspaceConsoleConfigContent = await this.fileSystemHelper.readFile(workspaceConsoleConfigPath);

                const updatedConnectionStringsContent = this.updateConnectionStrings(connectionStringsContent, projectConfig, crmConfig);
                const updatedWebHostConfigContent = this.updateWebHostConfig(webHostConfigContent);
                const updatedWorkspaceConsoleConfigContent = this.updateWorkspaceConsoleConfig(workspaceConsoleConfigContent, projectConfig, crmConfig);

                await this.fileSystemHelper.writeFile(connectionStringsPath, updatedConnectionStringsContent);
                onLog?.(`[CrmDockerBuilderFileSystemHelper] Файл ConnectionStrings.config успешно обновлен`);

                await this.fileSystemHelper.writeFile(webHostConfigPath, updatedWebHostConfigContent);
                onLog?.(`[CrmDockerBuilderFileSystemHelper] Файл BPMSoft.WebHost.dll.config успешно обновлен`);

                await this.fileSystemHelper.writeFile(workspaceConsoleConfigPath, updatedWorkspaceConsoleConfigContent);
                onLog?.(`[CrmDockerBuilderFileSystemHelper] Файл BPMSoft.Tools.WorkspaceConsole.dll.config успешно обновлен`);

                await this.buildDockerFile(crmConfig, onLog);
                await this.buildAppHandler(projectConfig, crmConfig, onLog);
                await this.buildWorkspaceConsoleHadler(crmConfig, onLog);

                await this.vscodeHelper.buildVsCodeFiles(crmConfig, onLog);
            }
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при обновлении файлов ConnectionStrings.config, BPMSoft.WebHost.dll.config и BPMSoft.Tools.WorkspaceConsole.dll.config: ${error}`);

            throw error;
        }
    }

    /**
     * 
     * @param xmlContent - содержимое файла ConnectionStrings.config
     * @param projectConfig - конфигурация проекта
     * @param crmConfig - конфигурация CRM
     * @returns - обновленное содержимое файла ConnectionStrings.config
     */
    private updateConnectionStrings(xmlContent: string, projectConfig: ProjectConfig, crmConfig: CrmConfig): string {
        const { postgresConfig, redisConfig, rabbitmqConfig } = projectConfig;
        
        // Обновляем строку подключения к PostgreSQL (db)
        const postgresConnectionString = `Pooling=true; Database=${crmConfig.containerName}; Host=${postgresConfig.containerName}; Port=${ConstantValues.DEFAULT_POSTGRES_CONFIG.port}; Username=${postgresConfig.user}; Password=${postgresConfig.password}; maxPoolSize=50; Timeout=5; CommandTimeout=400`;
        
        // Обновляем строку подключения к Redis
        const redisConnectionString = `host=${redisConfig.containerName};db=${crmConfig.redisDb};port=${ConstantValues.DEFAULT_REDIS_CONFIG.port}`;
        
        // Обновляем строку подключения к RabbitMQ
        const rabbitmqConnectionString = `amqp://${rabbitmqConfig.user}:${rabbitmqConfig.password}@${rabbitmqConfig.containerName}:${ConstantValues.DEFAULT_RABBITMQ_CONFIG.amqpPort}`;
        
        // Заменяем строки подключения в XML
        let updatedContent = xmlContent;
        
        // Заменяем строку подключения к PostgreSQL
        updatedContent = updatedContent.replace(
            /<add name="db" connectionString="[^"]*"/,
            `<add name="db" connectionString="${postgresConnectionString}"`
        );
        
        // Заменяем строку подключения к Redis
        updatedContent = updatedContent.replace(
            /<add name="redis" connectionString="[^"]*"/,
            `<add name="redis" connectionString="${redisConnectionString}"`
        );
        
        // Заменяем строку подключения к RabbitMQ
        updatedContent = updatedContent.replace(
            /<add name="messageBroker" connectionString="[^"]*"/,
            `<add name="messageBroker" connectionString="${rabbitmqConnectionString}"`
        );
        
        return updatedContent;
    }

    /**
     * 
     * @param xmlContent - содержимое файла BPMSoft.WebHost.dll.config
     * @returns - обновленное содержимое файла BPMSoft.WebHost.dll.config
     */
    private updateWebHostConfig(xmlContent: string): string {
        // Заменяем строки подключения в XML
        let updatedContent = xmlContent;
        
        // Обновляем настройки приложения
        updatedContent = updatedContent.replace(
            /<add key="UseStaticFileContent" value="[^"]*"/,
            `<add key="UseStaticFileContent" value="false"`
        );
        
        updatedContent = updatedContent.replace(
            /<fileDesignMode enabled="[^"]*"/,
            `<fileDesignMode enabled="true"`
        );
        
        updatedContent = updatedContent.replace(
            /<add key="CookiesSameSiteMode" value="[^"]*"/,
            `<add key="CookiesSameSiteMode" value="Lax"`
        );
        
        return updatedContent;
    }

    /**
     * @param xmlContent - содержимое файла BPMSoft.Tools.WorkspaceConsole.dll.config
     * @param projectConfig - конфигурация проекта
     * @param crmConfig - конфигурация CRM
     * @returns - обновленное содержимое файла BPMSoft.Tools.WorkspaceConsole.dll.config
     */
    private updateWorkspaceConsoleConfig(xmlContent: string, projectConfig: ProjectConfig, crmConfig: CrmConfig): string {
        const { postgresConfig } = projectConfig;

        // Обновляем строку подключения к PostgreSQL (db)
        const postgresConnectionString = `Pooling=true; Database=${crmConfig.containerName}; Host=${postgresConfig.containerName}; Port=${ConstantValues.DEFAULT_POSTGRES_CONFIG.port}; Username=${postgresConfig.user}; Password=${postgresConfig.password}; maxPoolSize=50; Timeout=5; CommandTimeout=400`;
        
        // Заменяем строки подключения в XML
        let updatedContent = xmlContent;
        
        // Заменяем строку подключения к PostgreSQL
        updatedContent = updatedContent.replace(
            /<add name="db" connectionString="[^"]*"/,
            `<add name="db" connectionString="${postgresConnectionString}"`
        );
        
        // Обновляем настройки приложения
        updatedContent = updatedContent.replace(
            /<add key="UseStaticFileContent" value="[^"]*"/,
            `<add key="UseStaticFileContent" value="false"`
        );
        
        updatedContent = updatedContent.replace(
            /<fileDesignMode enabled="[^"]*"/,
            `<fileDesignMode enabled="true"`
        );
        
        updatedContent = updatedContent.replace(
            /<add key="CookiesSameSiteMode" value="[^"]*"/,
            `<add key="CookiesSameSiteMode" value="Lax"`
        );
        
        return updatedContent;
    }

    /**
     * Создает файл Dockerfile
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла Dockerfile
     */
    private async buildDockerFile(crmConfig: CrmConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const dockerFileContent = this.dockerFileHelper.generateDockerFileContent();
            const filePath = path.join(crmConfig.appPath, ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8);
            await this.fileSystemHelper.writeFile(filePath, dockerFileContent);
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл ${ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8} успешно создан`);
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла ${ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8}: ${error}`);

            throw error;
        }
    }

    /**
     * Создает файл AppHandler.sh
     * @param projectConfig - конфигурация проекта
     * @param crmConfig - конфигурация CRM
     * @returns - содержимое файла AppHandler.sh
     */
    private async buildAppHandler(projectConfig: ProjectConfig, crmConfig: CrmConfig, onLog?: (log: string) => void): Promise<void> {
      try {
        await this.fileSystemHelper.ensureDirectoryExists(path.join(crmConfig.appPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES));

        const platform = process.platform;
        const arch = process.arch;

        let appHandlerContent = '';
        let appHandlerPath = '';

        if (platform === 'win32' && (arch === 'x64' || arch === 'arm64')) {
          appHandlerContent = this.powershellHelper.generateAppHandlerContent(projectConfig, crmConfig);
          appHandlerPath = path.join(crmConfig.appPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES, ConstantValues.FILE_NAMES.APP_HANDLER_PS);
        } else if (platform === 'darwin' || platform === 'linux') {
          appHandlerContent = this.bashHelper.generateAppHandlerContent(projectConfig, crmConfig);
          appHandlerPath = path.join(crmConfig.appPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES, ConstantValues.FILE_NAMES.APP_HANDLER);
        } else {
          throw new Error(`Неподдерживаемая платформа: ${platform}`);
        }
        
        await this.fileSystemHelper.writeFileWithEncoding(appHandlerPath, appHandlerContent);

        onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл AppHandler успешно создан`);
      } catch (error) {
        onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла AppHandler: ${error}`);
      }
    }

    /**
     * Создает файл WorkspaceConsoleHandler.sh
     * @param projectConfig - конфигурация проекта
     * @param crmConfig - конфигурация CRM
     * @returns - содержимое файла WorkspaceConsoleHandler.sh
     */
    private async buildWorkspaceConsoleHadler(crmConfig: CrmConfig, onLog?: (log: string) => void): Promise<void> {
      try {
        await this.fileSystemHelper.ensureDirectoryExists(path.join(crmConfig.appPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES));

        const platform = process.platform;
        const arch = process.arch;

        let workspaceConsoleContent = '';
        let workspaceConsolePath = '';

        if (platform === 'win32' && (arch === 'x64' || arch === 'arm64')) {
          workspaceConsoleContent = this.powershellHelper.generateWorkspaceConsoleHadlerContent(crmConfig);
          workspaceConsolePath = path.join(crmConfig.appPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES, ConstantValues.FILE_NAMES.WORKSPACE_CONSOLE_HANDLER_PS);
        } else if (platform === 'darwin' || platform === 'linux') {
          workspaceConsoleContent = this.bashHelper.generateWorkspaceConsoleHadlerContent(crmConfig);
          workspaceConsolePath = path.join(crmConfig.appPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES, ConstantValues.FILE_NAMES.WORKSPACE_CONSOLE_HANDLER);
        } else {
          throw new Error(`Неподдерживаемая платформа: ${platform}`);
        }

        await this.fileSystemHelper.writeFileWithEncoding(workspaceConsolePath, workspaceConsoleContent);

        onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл WorkspaceConsoleHandler успешно создан`);
      } catch (error) {
        onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла WorkspaceConsoleHandler: ${error}`);
      }
    }
}