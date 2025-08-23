import * as path from 'path';
import { FileSystemHelper } from './FileSystemHelper';
import { CrmConfig, ProjectConfig } from '@shared/crm-docker-builder';
import { VscodeFilesHelper } from './VscodeFilesHelper';

export class CrmDockerBuilderFileSystemHelper {
    /**
     * Помощник для работы с файловой системой
     */
    private fileSystemHelper: FileSystemHelper;

    /**
     * Помощник для работы с файлами VSCode
     */
    private vscodeFilesHelper: VscodeFilesHelper;

    /**
     * Конструктор
     */
    constructor() {
        this.fileSystemHelper = new FileSystemHelper();
        this.vscodeFilesHelper = new VscodeFilesHelper();
    }

    /**
     * 
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла docker-compose.yml
     */
    public async buildDockerComposeFile(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const dockerComposeFile = this.generateDockerComposeContent(projectConfig);
            const filePath = path.join(projectConfig.projectPath, 'docker-compose.yml');
            await this.fileSystemHelper.writeFile(filePath, dockerComposeFile);
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл docker-compose.yml успешно создан`);
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла docker-compose.yml: ${error}`);

            throw error;
        }
    }

    /**
     * Создает файл Dockerfile
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла Dockerfile
     */
    private async buildDockerFile(crmConfig: CrmConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const dockerFile = this.generateDockerFileContent();
            const filePath = path.join(crmConfig.appPath, 'DockerFile_bpmsoft_net8');
            await this.fileSystemHelper.writeFile(filePath, dockerFile);
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл Dockerfile успешно создан`);
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла Dockerfile: ${error}`);

            throw error;
        }
    }

    /**
     * Создает файл postgres.sh
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла postgres.sh
     */
    public async buildPostgresRestoreScript(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const postgresRestoreScript = this.generatePostgresRestoreScriptContent();
            const filePath = path.join(projectConfig.projectPath, 'postgres-volumes', 'postgresql-data', 'postgres.sh');
            await this.fileSystemHelper.writeFile(filePath, postgresRestoreScript);
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл postgres.sh успешно создан`);
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла postgres.sh: ${error}`);

            throw error;
        }
    }

    /**
     * Создает файл CreateTypeCastsPostgreSql.sql
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла CreateTypeCastsPostgreSql.sql
     */
    public async buildCreateTypeCastsPostgreSql(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const createTypeCastsPostgreSql = this.generateCreateTypeCastsPostgreSqlContent();
            const filePath = path.join(projectConfig.projectPath, 'postgres-volumes', 'postgresql-data', 'CreateTypeCastsPostgreSql.sql');
            await this.fileSystemHelper.writeFile(filePath, createTypeCastsPostgreSql);
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл CreateTypeCastsPostgreSql.sql успешно создан`);
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла CreateTypeCastsPostgreSql.sql: ${error}`);

            throw error;
        }
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

                await this.vscodeFilesHelper.buildVsCodeFiles(crmConfig, onLog);
            }
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при обновлении файлов ConnectionStrings.config, BPMSoft.WebHost.dll.config и BPMSoft.Tools.WorkspaceConsole.dll.config: ${error}`);

            throw error;
        }
    }

    /**
     * Генерирует содержимое файла docker-compose.yml
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла docker-compose.yml
     */
    private generateDockerComposeContent(projectConfig: ProjectConfig): string {
        const { postgresConfig, pgAdminConfig, redisConfig, rabbitmqConfig, crmConfigs } = projectConfig;
        
        // Вспомогательная функция для создания относительных путей
        const getRelativePath = (targetPath: string): string => {
            return path.relative(projectConfig.projectPath, targetPath);
        };
        
        // Генерация сервисов CRM
        const crmServices = crmConfigs.map((crmConfig, index) => {
            const serviceName = `${crmConfig.containerName.toLowerCase()}_container`;
            const containerName = crmConfig.containerName;
            const imageName = crmConfig.containerName.toLowerCase();
            const appPort = crmConfig.port;
            const appPath = getRelativePath(crmConfig.appPath);
            
            return `  ${serviceName}:
    container_name: ${containerName}
    image: ${imageName}
    restart: unless-stopped
    build:
      dockerfile: DockerFile_bpmsoft_net8
      context: ./${appPath}
    ports:
      - ${appPort}:5000
    volumes:
      - ./${appPath}:/app
    depends_on:
      postgres_container:
        condition: service_healthy
      redis_container:
        condition: service_healthy
    networks:
      - ${projectConfig.projectName}_network`
        }).join('\n\n');

        return `# docker-compose -p ${projectConfig.projectName}_network up --detach --wait
services:
  # postgres
  postgres_container:
    container_name: ${postgresConfig.containerName}
    image: 'postgres:alpine'
    healthcheck:
      test: ["CMD-SHELL", "sh -c 'pg_isready -U ${postgresConfig.user} -d db'"]
      interval: 10s
      timeout: 5s
      retries: 30
    command:
      - "postgres"
      - "-c"
      - "shared_buffers=1GB"
      - "-c"
      - "max_connections=500"
      - "-c"
      - "log_min_duration_statement=1000"
    environment:
      POSTGRES_DB: "db"
      POSTGRES_USER: ${postgresConfig.user}
      POSTGRES_PASSWORD: ${postgresConfig.password}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - ./${getRelativePath(path.join(projectConfig.projectPath, 'postgres-volumes', 'init-database'))}:/docker-entrypoint-initdb.d
      - ./${getRelativePath(path.join(projectConfig.projectPath, 'postgres-volumes', 'postgresql-data'))}:/var/lib/postgresql/data
    ports:
      - ${postgresConfig.port}:5432
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    networks:
      - ${projectConfig.projectName}_network

  # pgadmin
  pgadmin_container:
    container_name: ${pgAdminConfig.containerName}
    image: 'dpage/pgadmin4:latest'
    environment:
      PGADMIN_DEFAULT_EMAIL: ${pgAdminConfig.email}
      PGADMIN_DEFAULT_PASSWORD: ${pgAdminConfig.password}
      PGADMIN_CONFIG_SERVER_MODE: "False"
    volumes:
      - ./${getRelativePath(pgAdminConfig.volumePath)}:/var/lib/pgadmin
    ports:
      - ${pgAdminConfig.port}:80
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 512M
    networks:
      - ${projectConfig.projectName}_network

  # redis
  redis_container:
    container_name: ${redisConfig.containerName}
    image: 'redis:6'
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
      # test: ["CMD-SHELL", "redis-cli -a password ping | grep PONG"]
      interval: 1s
      timeout: 3s
      retries: 5
    restart: unless-stopped
    ports:
      - ${redisConfig.port}:6379
    volumes:
      - ./${getRelativePath(path.join(projectConfig.projectPath, 'redis-volumes', 'data'))}:/data
      - ./${getRelativePath(path.join(projectConfig.projectPath, 'redis-volumes', 'redis.conf'))}:/usr/local/etc/redis/redis.conf
    environment:
      - REDIS_PASSWORD=${redisConfig.password}
      - REDIS_DATABASES=${redisConfig.dbCount}
      - REDIS_PORT=6379
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 512M
    networks:
      - ${projectConfig.projectName}_network

  # rabbitmq
  rabbitmq_container:
    container_name: ${rabbitmqConfig.containerName}
    image: rabbitmq:3.10.7-management
    restart: unless-stopped
    environment:
      - RABBITMQ_DEFAULT_USER=${rabbitmqConfig.user}
      - RABBITMQ_DEFAULT_PASS=${rabbitmqConfig.password}
      - RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS=-rabbit log_levels [{connection,error},{default,error}] disk_free_limit 2147483648
    volumes:
      - ./${getRelativePath(rabbitmqConfig.volumePath)}:/var/lib/rabbitmq
    ports:
      - ${rabbitmqConfig.port}:15672
      # amqp
      - ${rabbitmqConfig.amqpPort}:5672
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 0.5G
    networks:
      - ${projectConfig.projectName}_network

${crmServices}

networks:
  ${projectConfig.projectName}_network:
    external: true`;
    }

    /**
     * Генерирует содержимое файла Dockerfile
     * @returns - содержимое файла Dockerfile
     */
    private generateDockerFileContent(): string {
        return `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base
EXPOSE 5000 5002
RUN apt-get update && \
apt-get -y --no-install-recommends install \
libgdiplus \
libc6-dev && \
apt-get clean all && \
rm -rf /var/lib/apt/lists/* /var/cache/apt/*
WORKDIR /app
COPY . ./
FROM base AS final
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT Development
ENV TZ Europe/Moscow
ENV COMPlus_ThreadPool_ForceMinWorkerThreads 100
ENTRYPOINT ["dotnet", "BPMSoft.WebHost.dll"]`;
    }

    /**
     * Генерирует содержимое файла postgres.sh
     * @returns - содержимое файла postgres.sh
     */
    private generatePostgresRestoreScriptContent(): string {
        return `#!/bin/sh
# Цвета для вывода
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[0;33m'
BLUE='\\033[0;34m'
RESET='\\033[0m'

dbName=\"$1\"
postgresUser=\"$2\"
pgDataPath=\"$3\"

if psql -lqt -h localhost -U $postgresUser | cut -d \\| -f 1 | grep -qw \"$dbName\"; then
    echo -e \"\${YELLOW}Database \$dbName already exists\${RESET}\"
else
    psql -h localhost -U $postgresUser -d postgres -c \"CREATE DATABASE $dbName WITH OWNER = puser ENCODING='UTF8' CONNECTION LIMIT = -1\"
    pg_restore -h localhost -U $postgresUser -d $dbName --no-owner --no-privileges $pgDataPath/$dbName.backup --verbose
    psql -h localhost -U $postgresUser -d $dbName --file=$pgDataPath/CreateTypeCastsPostgreSql.sql
    echo -e \"\${GREEN}Database \$dbName restored\${RESET}\"
fi`;
    }

    /**
     * Генерирует содержимое файла CreateTypeCastsPostgreSql.sql
     * @returns - содержимое файла CreateTypeCastsPostgreSql.sql
     */
    private generateCreateTypeCastsPostgreSqlContent(): string {
        return `--Enabling implicit type conversions

DROP CAST IF EXISTS (varchar AS integer);
CREATE CAST (varchar AS integer) WITH INOUT AS IMPLICIT;

DROP CAST IF EXISTS (varchar AS uuid);
CREATE CAST (varchar AS uuid) WITH INOUT AS IMPLICIT;

DROP CAST IF EXISTS (text AS integer);
CREATE CAST (text AS integer) WITH INOUT AS IMPLICIT;

DROP CAST IF EXISTS (uuid AS text);
CREATE CAST (uuid AS text) WITH INOUT AS IMPLICIT;

DROP CAST IF EXISTS (text AS boolean);
CREATE CAST (text AS boolean) WITH INOUT AS IMPLICIT;

DROP CAST IF EXISTS (text AS numeric);
CREATE CAST (text AS numeric) WITH INOUT AS IMPLICIT;

DROP CAST IF EXISTS (text AS uuid);
CREATE CAST (text AS uuid) WITH INOUT AS IMPLICIT;

DROP FUNCTION IF EXISTS public.\"fn_CastTimeToDateTime\" CASCADE;
CREATE FUNCTION public.\"fn_CastTimeToDateTime\"(sourceValue TIME WITHOUT TIME ZONE)
RETURNS TIMESTAMP WITHOUT TIME ZONE
AS $BODY$
BEGIN
    RETURN (MAKE_DATE(1900, 01, 01) + sourceValue)::TIMESTAMP WITHOUT TIME ZONE;
END;
$BODY$
LANGUAGE PLPGSQL;

DROP CAST IF EXISTS (TIME WITHOUT TIME ZONE AS TIMESTAMP WITHOUT TIME ZONE);
CREATE CAST (TIME WITHOUT TIME ZONE AS TIMESTAMP WITHOUT TIME ZONE)
    WITH FUNCTION public.\"fn_CastTimeToDateTime\"(TIME WITHOUT TIME ZONE) AS IMPLICIT;`;
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
        const postgresConnectionString = `Pooling=true; Database=${crmConfig.containerName}; Host=${postgresConfig.containerName}; Port=5432; Username=${postgresConfig.user}; Password=${postgresConfig.password}; maxPoolSize=50; Timeout=5; CommandTimeout=400`;
        
        // Обновляем строку подключения к Redis
        const redisConnectionString = `host=${redisConfig.containerName};db=${crmConfig.redisDb};port=6379`;
        
        // Обновляем строку подключения к RabbitMQ
        const rabbitmqConnectionString = `amqp://${rabbitmqConfig.user}:${rabbitmqConfig.password}@${rabbitmqConfig.containerName}:${rabbitmqConfig.amqpPort}`;
        
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
        const postgresConnectionString = `Pooling=true; Database=db; Host=${postgresConfig.containerName}; Port=${postgresConfig.port}; Username=${postgresConfig.user}; Password=${postgresConfig.password}; maxPoolSize=50; Timeout=5; CommandTimeout=400`;
        
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
}
