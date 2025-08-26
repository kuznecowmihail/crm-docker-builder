import { CrmConfig, ProjectConfig } from "@shared/crm-docker-builder";

export class PowershellHelper {

    /**
     * Generates content for WorkspaceConsoleHandler.ps1 file (PowerShell version)
     * @param crmConfig - CRM configuration
     * @returns - content of WorkspaceConsoleHandler.ps1 file
     */
    public generateWorkspaceConsoleHadlerContent(crmConfig: CrmConfig): string {
      return `# PowerShell script for Workspace Console on Windows
# Author: CRM Infrastructure Team
# Version: 1.0

# CRM container name
$PROJECT_NAME = "${crmConfig.containerName}"

$LOAD_PACKAGES_TO_FILE_SYSTEM_ARG = "-operation=LoadPackagesToFileSystem -workspaceName=Default -autoExit=True -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$LOAD_PACKAGES_TO_DB_ARG = "-operation=LoadPackagesToDB -workspaceName=Default -autoExit=True -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$BUILD_WORKSPACE_ARG = "-operation=BuildWorkspace -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$REBUILD_WORKSPACE_ARG = "-operation=RebuildWorkspace -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$BUILD_CONFIGURATION_ARG = "-operation=BuildConfiguration -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -destinationPath=/app -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
$INSTALL_FROM_REPOSITORY_ARG = "-operation=InstallFromRepository -workspaceName=Default -sourcePath=/app/_app_init/pkgs -destinationPath=/app/_app_init/temp -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -installPackageSqlScript=true -installPackageData=true -updateDBStructure=true -regenerateSchemaSources=true -continueIfError=true -skipValidateActions=true -updateSystemDBStructure=true -logPath=/app/WorkspaceConsoleLogs"
$REGENERATE_SCHEMA_SOURCES_ARG = "-operation=RegenerateSchemaSources -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"

# Output functions
function Write-Header {
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host "  Workspace Console - $PROJECT_NAME" -ForegroundColor Blue
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host ""
}

# Command line arguments processing
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
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Available commands: LoadPackagesToFileSystem, LoadPackagesToDB, BuildWorkspace, RebuildWorkspace, BuildConfiguration, RegenerateSchemaSources" -ForegroundColor Yellow
        break
    }
}`;
    }

    /**
     * Generates content for AppHandler.ps1 file (PowerShell version)
     * @param projectConfig - project configuration
     * @param crmConfig - CRM configuration
     * @returns - content of AppHandler.ps1 file
     */
    public generateAppHandlerContent(projectConfig: ProjectConfig, crmConfig: CrmConfig): string {
      return `# PowerShell script for running Docker containers on Windows
# Author: CRM Infrastructure Team
# Version: 1.0

# CRM container name
$PROJECT_NAME = "${crmConfig.containerName}"

# Container settings
$CRM_PORT = "${crmConfig.port}"
$PGADMIN_PORT = "${projectConfig.pgAdminConfig.port}"
$POSTGRES_NAME = "${projectConfig.postgresConfig.containerName}"
$POSTGRES_USER = "${projectConfig.postgresConfig.user}"
$REDIS_NAME = "${projectConfig.redisConfig.containerName}"
$RABBITMQ_NAME = "${projectConfig.rabbitmqConfig.containerName}"
$PGADMIN_NAME = "${projectConfig.pgAdminConfig.containerName}"
$REDIS_DB_COUNT = "${crmConfig.redisDb}"
$CONTAINERS = @($RABBITMQ_NAME, $PGADMIN_NAME, $POSTGRES_NAME, $REDIS_NAME, $PROJECT_NAME)

# Output functions
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

# Function to check Docker
function Test-Docker {
    Write-Info "Checking Docker..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed. Install Docker Desktop for Windows"
        exit 1
    }
    
    try {
        docker info | Out-Null
    } catch {
        Write-Error "Docker is not running. Start Docker Desktop"
        Write-Host "Open Docker Desktop and wait for full loading" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Status "Docker is ready"
}

# Function to start container
function Start-Container {
    param(
        [string]$ContainerName,
        [int]$MaxAttempts = 10
    )
    
    Write-Info "Starting container $ContainerName..."
    
    # Check if container exists
    $containerExists = docker ps -a --format "table {.Names}" | Select-String "^$ContainerName$"
    if (-not $containerExists) {
        Write-Warning "Container $ContainerName not found. Skipping..."
        return $false
    }
    
    # Start container
    try {
        docker start $ContainerName | Out-Null
        Write-Status "Container $ContainerName started"
        return $true
    } catch {
        Write-Error "Error starting container $ContainerName"
        return $false
    }
}

# Function to check PostgreSQL readiness
function Wait-ForPostgres {
    Write-Info "Waiting for PostgreSQL readiness..."
    
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            docker exec $POSTGRES_NAME pg_isready -U $POSTGRES_USER | Out-Null
            Write-Status "PostgreSQL is ready"
            return $true
        } catch {
            Write-Info "Attempt $attempt/$maxAttempts - PostgreSQL not ready yet..."
            Start-Sleep -Seconds 2
            $attempt++
        }
    }
    
    Write-Error "PostgreSQL not ready after $maxAttempts attempts"
    return $false
}

# Function to check Redis readiness
function Wait-ForRedis {
    Write-Info "Waiting for Redis readiness..."
    
    $maxAttempts = 15
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            docker exec $REDIS_NAME redis-cli ping | Out-Null
            Write-Status "Redis is ready"
            return $true
        } catch {
            Write-Info "Attempt $attempt/$maxAttempts - Redis not ready yet..."
            Start-Sleep -Seconds 1
            $attempt++
        }
    }
    
    Write-Error "Redis not ready after $maxAttempts attempts"
    return $false
}

# Function to open in browser
function Open-Browser {
    $url = "http://localhost:$CRM_PORT"
    Write-Info "Opening application in browser..."
    
    try {
        Start-Process $url
    } catch {
        Write-Warning "Failed to open browser automatically"
        Write-Host "Open manually: $url" -ForegroundColor Yellow
    }
}

# Main function
function Start-All {
    Write-Header
    
    # Check Docker
    Test-Docker
    
    Write-Host ""
    Write-Info "Starting containers in correct order..."
    Write-Host ""
    
    # Start base containers
    Start-Container $RABBITMQ_NAME
    Start-Container $PGADMIN_NAME
    Start-Container $REDIS_NAME
    Start-Container $POSTGRES_NAME
    
    # Wait for Redis readiness
    Wait-ForRedis
    
    # Wait for PostgreSQL readiness
    Wait-ForPostgres
    
    # Start $PROJECT_NAME
    Start-Container $PROJECT_NAME
    
    Write-Host ""
    Write-Header
    Write-Status "All containers started!"
    Write-Host ""
    Write-Info "Available services:"
    Write-Host "  - $PROJECT_NAME: http://localhost:$CRM_PORT" -ForegroundColor Green
    Write-Host "  - PgAdmin: http://localhost:$PGADMIN_PORT" -ForegroundColor Green
    Write-Host ""
    Write-Info "To view logs use:"
    Write-Host "  docker logs -f $PROJECT_NAME" -ForegroundColor Yellow
    Write-Host ""
    Write-Info "To stop all containers:"
    Write-Host "  docker stop pgadmin postgres redis $PROJECT_NAME" -ForegroundColor Yellow
    
    # Ask to open browser
    Write-Host ""
    $response = Read-Host "Open application in browser? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Open-Browser
    }
}

# Command line arguments processing
param(
    [string]$Command = "start"
)

switch ($Command) {
    "start" {
        Start-All
        break
    }
    "stop" {
        Write-Info "Stopping container $PROJECT_NAME..."
        docker stop $PROJECT_NAME
        Write-Status "Container $PROJECT_NAME stopped"
        break
    }
    "stopall" {
        Write-Info "Stopping all containers..."
        docker stop $CONTAINERS 2>$null
        Write-Status "All containers stopped"
        break
    }
    "restart" {
        Write-Info "Restarting container $PROJECT_NAME..."
        docker stop $PROJECT_NAME
        Start-Sleep -Seconds 2
        docker start $PROJECT_NAME
        Write-Status "Container $PROJECT_NAME restarted"
        break
    }
    "redisflushdb" {
        Write-Info "Clearing Redis database $REDIS_DB_COUNT..."
        docker exec -it $REDIS_NAME redis-cli -n $REDIS_DB_COUNT FLUSHDB
        Write-Status "Redis database $REDIS_DB_COUNT cleared"
        break
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host "Available commands: start, stop, stopall, restart, redisflushdb" -ForegroundColor Yellow
        break
    }
}`;
    }
}
