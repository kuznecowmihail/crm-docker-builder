import { CrmConfig, ProjectConfig } from "@shared/crm-docker-builder";

export class PowershellHelper {

    /**
     * Генерирует содержимое файла WorkspaceConsoleHandler.ps1 (PowerShell версия)
     * @param crmConfig - конфигурация CRM
     * @returns - содержимое файла WorkspaceConsoleHandler.ps1
     */
    public generateWorkspaceConsoleHadlerContent(crmConfig: CrmConfig): string {
      return `# PowerShell скрипт для Workspace Console на Windows
# Автор: CRM Infrastructure Team
# Версия: 1.0

# Название контейнера CRM
$PROJECT_NAME = "${crmConfig.containerName}"

$LOAD_PACKAGES_TO_FILE_SYSTEM_ARG = "-operation=LoadPackagesToFileSystem -workspaceName=Default -autoExit=True -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$LOAD_PACKAGES_TO_DB_ARG = "-operation=LoadPackagesToDB -workspaceName=Default -autoExit=True -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$BUILD_WORKSPACE_ARG = "-operation=BuildWorkspace -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$REBUILD_WORKSPACE_ARG = "-operation=RebuildWorkspace -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$BUILD_CONFIGURATION_ARG = "-operation=BuildConfiguration -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -destinationPath=/app -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$INSTALL_FROM_REPOSITORY_ARG = "-operation=InstallFromRepository -workspaceName=Default -sourcePath=/app/_app_init/pkgs -destinationPath=/app/_app_init/temp -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -installPackageSqlScript=true -installPackageData=true -updateDBStructure=true -regenerateSchemaSources=true -continueIfError=true -skipValidateActions=true -updateSystemDBStructure=true -logPath=/app/WorkspaceConsoleLogs"
$REGENERATE_SCHEMA_SOURCES_ARG = "-operation=RegenerateSchemaSources -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"

# Функции для вывода
function Write-Header {
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host "  Workspace Console - $PROJECT_NAME" -ForegroundColor Blue
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host ""
}

# Обработка аргументов командной строки
param(
    [string]$Command = ""
)

switch ($Command) {
    "LoadPackagesToFileSystem" {
        Write-Header
        docker exec -it $PROJECT_NAME /bin/bash -c "dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $LOAD_PACKAGES_TO_FILE_SYSTEM_ARG"
        break
    }
    "LoadPackagesToDB" {
        Write-Header
        docker exec -it $PROJECT_NAME /bin/bash -c "dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $LOAD_PACKAGES_TO_DB_ARG"
        break
    }
    "BuildWorkspace" {
        Write-Header
        docker exec -it $PROJECT_NAME /bin/bash -c "dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $BUILD_WORKSPACE_ARG"
        break
    }
    "RebuildWorkspace" {
        Write-Header
        docker exec -it $PROJECT_NAME /bin/bash -c "dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $REBUILD_WORKSPACE_ARG"
        break
    }
    "BuildConfiguration" {
        Write-Header
        docker exec -it $PROJECT_NAME /bin/bash -c "dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $BUILD_CONFIGURATION_ARG"
        break
    }
    "RegenerateSchemaSources" {
        Write-Header
        docker exec -it $PROJECT_NAME /bin/bash -c "dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $REGENERATE_SCHEMA_SOURCES_ARG"
        break
    }
    default {
        Write-Host "Неизвестная команда: $Command" -ForegroundColor Red
        Write-Host "Доступные команды: LoadPackagesToFileSystem, LoadPackagesToDB, BuildWorkspace, RebuildWorkspace, BuildConfiguration, RegenerateSchemaSources" -ForegroundColor Yellow
        break
    }
}`;
    }

    /**
     * Генерирует содержимое файла AppHandler.ps1 (PowerShell версия)
     * @param projectConfig - конфигурация проекта
     * @param crmConfig - конфигурация CRM
     * @returns - содержимое файла AppHandler.ps1
     */
    public generateAppHandlerContent(projectConfig: ProjectConfig, crmConfig: CrmConfig): string {
      return `# PowerShell скрипт для запуска Docker контейнеров на Windows
# Автор: CRM Infrastructure Team
# Версия: 1.0

# Название контейнера CRM
$PROJECT_NAME = "${crmConfig.containerName}"

# Настройки контейнеров
$CRM_PORT = "${crmConfig.port}"
$PGADMIN_PORT = "${projectConfig.pgAdminConfig.port}"
$POSTGRES_NAME = "${projectConfig.postgresConfig.containerName}"
$POSTGRES_USER = "${projectConfig.postgresConfig.user}"
$REDIS_NAME = "${projectConfig.redisConfig.containerName}"
$RABBITMQ_NAME = "${projectConfig.rabbitmqConfig.containerName}"
$PGADMIN_NAME = "${projectConfig.pgAdminConfig.containerName}"
$REDIS_DB_COUNT = "${crmConfig.redisDb}"
$CONTAINERS = @($RABBITMQ_NAME, $PGADMIN_NAME, $POSTGRES_NAME, $REDIS_NAME, $PROJECT_NAME)

# Функции для вывода
function Write-Header {
    Write-Host "================================" -ForegroundColor Blue
    Write-Host "  CRM Infrastructure - $PROJECT_NAME" -ForegroundColor Blue
    Write-Host "================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Status {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor Cyan
}

# Функция для проверки Docker
function Test-Docker {
    Write-Info "Проверяю Docker..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker не установлен. Установите Docker Desktop для Windows"
        Write-Host "Скачать: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
    
    try {
        docker info | Out-Null
    } catch {
        Write-Error "Docker не запущен. Запустите Docker Desktop"
        Write-Host "Откройте Docker Desktop и дождитесь полной загрузки" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Status "Docker готов к работе"
}

# Функция для запуска контейнера
function Start-Container {
    param(
        [string]$ContainerName,
        [int]$MaxAttempts = 10
    )
    
    Write-Info "Запускаю контейнер $ContainerName..."
    
    # Проверяем, существует ли контейнер
    $containerExists = docker ps -a --format "table {.Names}" | Select-String "^$ContainerName$"
    if (-not $containerExists) {
        Write-Warning "Контейнер $ContainerName не найден. Пропускаю..."
        return $false
    }
    
    # Запускаем контейнер
    try {
        docker start $ContainerName | Out-Null
        Write-Status "Контейнер $ContainerName запущен"
        return $true
    } catch {
        Write-Error "Ошибка при запуске контейнера $ContainerName"
        return $false
    }
}

# Функция для проверки готовности PostgreSQL
function Wait-ForPostgres {
    Write-Info "Ожидаю готовности PostgreSQL..."
    
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            docker exec $POSTGRES_NAME pg_isready -U $POSTGRES_USER | Out-Null
            Write-Status "PostgreSQL готов к работе"
            return $true
        } catch {
            Write-Info "Попытка $attempt/$maxAttempts - PostgreSQL еще не готов..."
            Start-Sleep -Seconds 2
            $attempt++
        }
    }
    
    Write-Error "PostgreSQL не готов после $maxAttempts попыток"
    return $false
}

# Функция для проверки готовности Redis
function Wait-ForRedis {
    Write-Info "Ожидаю готовности Redis..."
    
    $maxAttempts = 15
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            docker exec $REDIS_NAME redis-cli ping | Out-Null
            Write-Status "Redis готов к работе"
            return $true
        } catch {
            Write-Info "Попытка $attempt/$maxAttempts - Redis еще не готов..."
            Start-Sleep -Seconds 1
            $attempt++
        }
    }
    
    Write-Error "Redis не готов после $maxAttempts попыток"
    return $false
}

# Функция для открытия в браузере
function Open-Browser {
    $url = "http://localhost:$CRM_PORT"
    Write-Info "Открываю приложение в браузере..."
    
    try {
        Start-Process $url
    } catch {
        Write-Warning "Не удалось открыть браузер автоматически"
        Write-Host "Откройте вручную: $url" -ForegroundColor Yellow
    }
}

# Основная функция
function Start-All {
    Write-Header
    
    # Проверяем Docker
    Test-Docker
    
    Write-Host ""
    Write-Info "Запускаю контейнеры в правильном порядке..."
    Write-Host ""
    
    # Запускаем базовые контейнеры
    Start-Container $RABBITMQ_NAME
    Start-Container $PGADMIN_NAME
    Start-Container $REDIS_NAME
    Start-Container $POSTGRES_NAME
    
    # Ждем готовности Redis
    Wait-ForRedis
    
    # Ждем готовности PostgreSQL
    Wait-ForPostgres
    
    # Запускаем $PROJECT_NAME
    Start-Container $PROJECT_NAME
    
    Write-Host ""
    Write-Header
    Write-Status "Все контейнеры запущены!"
    Write-Host ""
    Write-Info "Доступные сервисы:"
    Write-Host "  • $PROJECT_NAME: http://localhost:$CRM_PORT" -ForegroundColor Green
    Write-Host "  • PgAdmin: http://localhost:$PGADMIN_PORT" -ForegroundColor Green
    Write-Host ""
    Write-Info "Для просмотра логов используйте:"
    Write-Host "  docker logs -f $PROJECT_NAME" -ForegroundColor Yellow
    Write-Host ""
    Write-Info "Для остановки всех контейнеров:"
    Write-Host "  docker stop pgadmin postgres redis $PROJECT_NAME" -ForegroundColor Yellow
    
    # Спрашиваем, открыть ли браузер
    Write-Host ""
    $response = Read-Host "Открыть приложение в браузере? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Open-Browser
    }
}

# Обработка аргументов командной строки
param(
    [string]$Command = "start"
)

switch ($Command) {
    "start" {
        Start-All
        break
    }
    "stop" {
        Write-Info "Останавливаю контейнер $PROJECT_NAME..."
        docker stop $PROJECT_NAME
        Write-Status "Контейнер $PROJECT_NAME остановлен"
        break
    }
    "stopall" {
        Write-Info "Останавливаю все контейнеры..."
        docker stop $CONTAINERS 2>$null
        Write-Status "Все контейнеры остановлены"
        break
    }
    "restart" {
        Write-Info "Перезапускаю контейнер $PROJECT_NAME..."
        docker stop $PROJECT_NAME
        Start-Sleep -Seconds 2
        docker start $PROJECT_NAME
        Write-Status "Контейнер $PROJECT_NAME перезапущен"
        break
    }
    "redisflushdb" {
        Write-Info "Очищаю Redis базу данных $REDIS_DB_COUNT..."
        docker exec -it $REDIS_NAME redis-cli -n $REDIS_DB_COUNT FLUSHDB
        Write-Status "Redis база данных $REDIS_DB_COUNT очищена"
        break
    }
    default {
        Write-Error "Неизвестная команда: $Command"
        Write-Host "Доступные команды: status, start, stop, stopall, restart, redisflushall" -ForegroundColor Yellow
        break
    }
}`;
    }
}