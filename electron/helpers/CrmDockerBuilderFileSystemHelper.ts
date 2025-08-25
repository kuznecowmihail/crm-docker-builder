import * as path from 'path';
import { FileSystemHelper } from './FileSystemHelper';
import { CrmConfig, ProjectConfig } from '@shared/crm-docker-builder';
import { VscodeFilesHelper } from './VscodeFilesHelper';
import { ConstantValues } from '../config/constants';

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
     * Создает файл docker-compose.yml
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла docker-compose.yml
     */
    public async buildDockerComposeFile(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const dockerComposeFile = this.generateDockerComposeContent(projectConfig);
            const filePath = path.join(projectConfig.projectPath, ConstantValues.FILE_NAMES.DOCKER_COMPOSE);
            await this.fileSystemHelper.writeFile(filePath, dockerComposeFile);
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл ${ConstantValues.FILE_NAMES.DOCKER_COMPOSE} успешно создан`);
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла ${ConstantValues.FILE_NAMES.DOCKER_COMPOSE}: ${error}`);

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
            const dockerFileContent = this.generateDockerFileContent();
            const filePath = path.join(crmConfig.appPath, ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8);
            await this.fileSystemHelper.writeFile(filePath, dockerFileContent);
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл ${ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8} успешно создан`);
        } catch (error) {
            onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла ${ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8}: ${error}`);

            throw error;
        }
    }

    /**
     * Создает файл ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
     */
    public async buildPostgresRestoreScript(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const postgresRestoreScript = this.generatePostgresRestoreScriptContent();
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
    public async buildCreateTypeCastsPostgreSql(projectConfig: ProjectConfig, onLog?: (log: string) => void): Promise<void> {
        try {
            const createTypeCastsPostgreSql = this.generateCreateTypeCastsPostgreSqlContent();
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

    /**
     * Создает файл AppHandler.sh
     * @param projectConfig - конфигурация проекта
     * @param crmConfig - конфигурация CRM
     * @returns - содержимое файла AppHandler.sh
     */
    public async buildAppHandler(projectConfig: ProjectConfig, crmConfig: CrmConfig, onLog?: (log: string) => void): Promise<void> {
      try {
        const appHandlerContent = this.generateAppHandlerContent(projectConfig, crmConfig);
        const appHandlerPath = path.join(crmConfig.appPath, ConstantValues.FILE_NAMES.APP_HANDLER);
        await this.fileSystemHelper.writeFile(appHandlerPath, appHandlerContent);
        onLog?.(`[CrmDockerBuilderFileSystemHelper] ✅ Файл AppHandler успешно создан`);
      } catch (error) {
        onLog?.(`[CrmDockerBuilderFileSystemHelper] ❌ Ошибка при создании файла AppHandler: ${error}`);
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
                await this.buildAppHandler(projectConfig, crmConfig, onLog);

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
      dockerfile: ${ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8}
      context: ./${appPath}
    ports:
      - ${appPort}:5000
    volumes:
      - ./${appPath}:${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}
    depends_on:
      postgres_container:
        condition: service_healthy
      redis_container:
        condition: service_healthy
    networks:
      - ${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}`
        }).join('\n\n');

        return `services:
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
      PGDATA: ${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}/pgdata
    volumes:
      - ./${getRelativePath(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.POSTGRES_VOLUMES, ConstantValues.FOLDER_NAMES.POSTGRES_PATHS.INIT_DATABASE))}:${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.INIT_DATABASE}
      - ./${getRelativePath(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.POSTGRES_VOLUMES, ConstantValues.FOLDER_NAMES.POSTGRES_PATHS.POSTGRES_DATA))}:${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}
    ports:
      - ${postgresConfig.port}:5432
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    networks:
      - ${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}

  # pgadmin
  pgadmin_container:
    container_name: ${pgAdminConfig.containerName}
    image: 'dpage/pgadmin4:latest'
    environment:
      PGADMIN_DEFAULT_EMAIL: ${pgAdminConfig.email}
      PGADMIN_DEFAULT_PASSWORD: ${pgAdminConfig.password}
      PGADMIN_CONFIG_SERVER_MODE: "False"
    volumes:
      - ./${getRelativePath(pgAdminConfig.volumePath)}:${ConstantValues.FOLDER_NAMES.PGADMIN_PATHS_DOCKER.PGADMIN_DATA}
    ports:
      - ${pgAdminConfig.port}:80
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 512M
    networks:
      - ${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}

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
      - ./${getRelativePath(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.REDIS_VOLUMES, ConstantValues.FOLDER_NAMES.REDIS_PATHS.REDIS_DATA))}:${ConstantValues.FOLDER_NAMES.REDIS_PATHS_DOCKER.REDIS_DATA}
      - ./${getRelativePath(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.REDIS_VOLUMES, ConstantValues.FOLDER_NAMES.REDIS_PATHS.REDIS_CONF))}:${ConstantValues.FOLDER_NAMES.REDIS_PATHS_DOCKER.REDIS_CONF}
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
      - ${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}

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
      - ./${getRelativePath(rabbitmqConfig.volumePath)}:${ConstantValues.FOLDER_NAMES.RABBITMQ_PATHS_DOCKER.RABBITMQ_DATA}
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
      - ${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}

${crmServices}

networks:
  ${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}:
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
WORKDIR ${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}
COPY . ./
FROM base AS final
WORKDIR ${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}
ENV ASPNETCORE_ENVIRONMENT Development
ENV TZ Europe/Moscow
ENV COMPlus_ThreadPool_ForceMinWorkerThreads 100
ENTRYPOINT ["dotnet", "BPMSoft.WebHost.dll"]`;
    }

    /**
     * Генерирует содержимое файла ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
     * @returns - содержимое файла ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
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
    psql -h localhost -U $postgresUser -d $dbName --file=$pgDataPath/${ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL}
    echo -e \"\${GREEN}Database \$dbName restored\${RESET}\"
fi`;
    }

    /**
     * Генерирует содержимое файла AppHandler
     * @param crmConfig - конфигурация CRM
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла AppHandler
     */
    private generateAppHandlerContent(projectConfig: ProjectConfig, crmConfig: CrmConfig): string {
      return `#!/bin/bash

# Универсальный скрипт для запуска Docker контейнеров на macOS
# Автор: CRM Infrastructure Team
# Версия: 1.0

# Цвета для вывода
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
PURPLE='\\033[0;35m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color

# Получаем название корневой папки для имени контейнера
PROJECT_NAME="${crmConfig.containerName}"

# Настройки контейнеров
CRM_PORT="${crmConfig.port}"
PGADMIN_PORT="${projectConfig.pgAdminConfig.port}"
POSTGRES_NAME="${projectConfig.postgresConfig.containerName}"
POSTGRES_USER="${projectConfig.postgresConfig.user}"
REDIS_NAME="${projectConfig.redisConfig.containerName}"
RABBITMQ_NAME="${projectConfig.rabbitmqConfig.containerName}"
PGADMIN_NAME="${projectConfig.pgAdminConfig.containerName}"
CONTAINERS=("$RABBITMQ_NAME" "$PGADMIN_NAME" "$POSTGRES_NAME" "$REDIS_NAME" "$PROJECT_NAME")

# Функции для вывода
print_header() {
    echo -e "\${BLUE}================================\${NC}"
    echo -e "\${BLUE}  CRM Infrastructure - \$PROJECT_NAME\${NC}"
    echo -e "\${BLUE}================================\${NC}"
    echo ""
}

print_status() {
    echo -e "\${GREEN}[✓]\${NC} \$1"
}

print_warning() {
    echo -e "\${YELLOW}[!]\$1"
}

print_error() {
    echo -e "\${RED}[✗]\${NC} \$1"
}

print_info() {
    echo -e "\${CYAN}[i]\${NC} \$1"
}

# Функция для проверки Docker
check_docker() {
    print_info "Проверяю Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен. Установите Docker Desktop для macOS"
        echo "Скачать: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker не запущен. Запустите Docker Desktop"
        echo "Откройте Docker Desktop и дождитесь полной загрузки"
        exit 1
    fi
    
    print_status "Docker готов к работе"
}

# Функция для запуска контейнера
start_container() {
    local container_name=$1
    local max_attempts=\${2:-10}
    local attempt=1
    
    print_info "Запускаю контейнер $container_name..."
    
    # Проверяем, существует ли контейнер
    if ! docker ps -a --format "table {{.Names}}" | grep -q "^$container_name$"; then
        print_warning "Контейнер $container_name не найден. Пропускаю..."
        return 1
    fi
    
    # Запускаем контейнер
    docker start "$container_name" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_status "Контейнер $container_name запущен"
        return 0
    else
        print_error "Ошибка при запуске контейнера $container_name"
        return 1
    fi
}

# Функция для проверки готовности PostgreSQL
wait_for_postgres() {
    print_info "Ожидаю готовности PostgreSQL..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec $POSTGRES_NAME pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
            print_status "PostgreSQL готов к работе"
            return 0
        fi
        
        print_info "Попытка $attempt/$max_attempts - PostgreSQL еще не готов..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "PostgreSQL не готов после $max_attempts попыток"
    return 1
}

# Функция для проверки готовности Redis
wait_for_redis() {
    print_info "Ожидаю готовности Redis..."
    
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec $REDIS_NAME redis-cli ping > /dev/null 2>&1; then
            print_status "Redis готов к работе"
            return 0
        fi
        
        print_info "Попытка $attempt/$max_attempts - Redis еще не готов..."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "Redis не готов после $max_attempts попыток"
    return 1
}

# Функция для показа статуса
show_status() {
    print_header
    print_info "Статус контейнеров:"
    echo ""
    
    for container in "\${CONTAINERS[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
            print_status "$container - запущен"
        elif docker ps -a --format "table {{.Names}}" | grep -q "^$container$"; then
            print_warning "$container - остановлен"
        else
            print_error "$container - не найден"
        fi
    done
    
    echo ""
    print_info "Использование ресурсов:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || print_warning "Не удалось получить статистику"
}

# Функция для открытия в браузере
open_browser() {
    local url="http://localhost:$CRM_PORT"
    print_info "Открываю приложение в Chrome..."
    
    # Проверяем, установлен ли Chrome
    if [ -d "/Applications/Google Chrome.app" ]; then
        open -a "Google Chrome" "$url"
    elif [ -d "/Applications/Chromium.app" ]; then
        open -a "Chromium" "$url"
    else
        print_warning "Chrome не найден, открываю в браузере по умолчанию..."
        open "$url"
    fi
}

# Основная функция
start() {
    print_header
    
    # Проверяем Docker
    check_docker
    
    echo ""
    print_info "Запускаю контейнеры в правильном порядке..."
    echo ""
    
    # Запускаем базовые контейнеры
    start_container "$RABBITMQ_NAME"
    start_container "$PGADMIN_NAME"
    start_container "$REDIS_NAME"
    start_container "$POSTGRES_NAME"
    
    # Ждем готовности Redis
    wait_for_redis
    
    # Ждем готовности PostgreSQL
    wait_for_postgres
    
    # Запускаем $PROJECT_NAME
    start_container "$PROJECT_NAME"
    
    echo ""
    print_header
    print_status "Все контейнеры запущены!"
    echo ""
    print_info "Доступные сервисы:"
    echo "  • $PROJECT_NAME: http://localhost:$CRM_PORT"
    echo "  • PgAdmin: http://localhost:$PGADMIN_PORT"
    echo ""
    print_info "Для просмотра логов используйте:"
    echo "  docker logs -f $PROJECT_NAME"
    echo ""
    print_info "Для остановки всех контейнеров:"
    echo "  docker stop pgadmin postgres redis $PROJECT_NAME"
    
    # Спрашиваем, открыть ли браузер
    echo ""
    read -p "Открыть приложение в браузере? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open_browser
    fi
}

# Обработка аргументов командной строки
case "\${1:-}" in
    "status")
        show_status
        exit 0
        ;;
    "start")
        start
        exit 0
        ;;
    "stop")
        print_info "Останавливаю контейнер $PROJECT_NAME..."
        docker stop "$PROJECT_NAME"
        print_status "Контейнер $PROJECT_NAME остановлен"
        exit 0
        ;;
    "stopall")
        print_info "Останавливаю все контейнеры..."
        docker stop "\${CONTAINERS[@]}" 2>/dev/null || true
        print_status "Все контейнеры остановлены"
        exit 0
        ;;
    "restart")
        print_info "Перезапускаю контейнер$PROJECT_NAME..."
        docker stop "$PROJECT_NAME"
        sleep 2
        docker start "$PROJECT_NAME"
        print_status "Контейнер $PROJECT_NAME перезапущен"
        exit 0  
        ;;
    "restartall")
        print_info "Перезапускаю все контейнеры..."
        docker stop "\${CONTAINERS[@]}" 2>/dev/null || true
        print_status "Все контейнеры остановлены"
        sleep 2
        start
        exit 0  
        ;;
    "logs")
        print_info "Показываю логи $PROJECT_NAME..."
        docker logs -f "$PROJECT_NAME"
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  status           - показать статус контейнеров"
        echo "  start            - запустить контейнер $PROJECT_NAME"
        echo "  stop             - остановить контейнер $PROJECT_NAME"
        echo "  stopall          - остановить все контейнеры"
        echo "  restart          - перезапустить контейнер $PROJECT_NAME"
        echo "  restartall       - перезапустить все контейнеры"
        echo "  logs             - показать логи $PROJECT_NAME"
        echo "  help             - показать эту справку"
        exit 0
        ;;
esac`;
    }

    /**
     * Генерирует содержимое файла ${ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL}
     * @returns - содержимое файла ${ConstantValues.FILE_NAMES.CREATE_TYPE_CASTS_POSTGRES_SQL}
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
