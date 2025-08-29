import { CrmConfig, ProjectConfig } from "@shared/crm-docker-builder";
import { ConstantValues } from "../../config/constants";

export class BashHelper {
  /**
   * Генерирует содержимое файла AppHandler
   * @param crmConfig - конфигурация CRM
   * @param projectConfig - конфигурация проекта
   * @returns - содержимое файла AppHandler
   */
  public generateAppHandlerContent(projectConfig: ProjectConfig, crmConfig: CrmConfig): string {
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

# Название контейнера CRM
PROJECT_NAME="${crmConfig.containerName}"

# Настройки контейнеров
CRM_PORT="${crmConfig.port}"
PGADMIN_PORT="${projectConfig.pgAdminConfig.port}"
POSTGRES_NAME="${projectConfig.postgresConfig.containerName}"
POSTGRES_USER="${projectConfig.postgresConfig.user}"
REDIS_NAME="${projectConfig.redisConfig.containerName}"
RABBITMQ_NAME="${projectConfig.rabbitmqConfig.containerName}"
PGADMIN_NAME="${projectConfig.pgAdminConfig.containerName}"
REDIS_DB_COUNT="${crmConfig.redisDb}"
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
  "redisflushdb")
      print_info "Очищаю Redis базу данных \${REDIS_DB_COUNT}..."
      docker exec -it $REDIS_NAME redis-cli -n \${REDIS_DB_COUNT} FLUSHDB
      print_status "Redis база данных \${REDIS_DB_COUNT} очищена"
      exit 0  
      ;;
esac`;
  }

  /**
   * Генерирует содержимое файла WorkspaceConsoleHandler.sh
   * @returns - содержимое файла WorkspaceConsoleHandler.sh
   */
  public generateWorkspaceConsoleHadlerContent(crmConfig: CrmConfig): string {
    return `#!/bin/bash

# Цвета для вывода
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
PURPLE='\\033[0;35m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color

# Название контейнера CRM
PROJECT_NAME="${crmConfig.containerName}"

LOAD_PACKAGES_TO_FILE_SYSTEM_ARG="-operation=LoadPackagesToFileSystem -workspaceName=Default -autoExit=True -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
LOAD_PACKAGES_TO_DB_ARG="-operation=LoadPackagesToDB -workspaceName=Default -autoExit=True -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
BUILD_WORKSPACE_ARG="-operation=BuildWorkspace -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
REBUILD_WORKSPACE_ARG="-operation=RebuildWorkspace -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
BUILD_CONFIGURATION_ARG="-operation=BuildConfiguration -force=True -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -destinationPath=/app -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"
INSTALL_FROM_REPOSITORY_ARG="-operation=InstallFromRepository -workspaceName=Default -sourcePath=/app/_app_init/pkgs -destinationPath=/app/_app_init/temp -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -installPackageSqlScript=true -installPackageData=true -updateDBStructure=true -regenerateSchemaSources=true -continueIfError=true -skipValidateActions=true -updateSystemDBStructure=true -logPath=/app/WorkspaceConsoleLogs"
REGENERATE_SCHEMA_SOURCES_ARG="-operation=RegenerateSchemaSources -autoExit=True -workspaceName=Default -webApplicationPath=/app -configurationPath=/app/BPMSoft.Configuration -confRuntimeParentDirectory=/app/conf -logPath=/app/WorkspaceConsoleLogs"

# Функции для вывода
print_header() {
  echo -e "\${BLUE}==============================================\${NC}"
  echo -e "\${BLUE}  Workspace Console - \${PROJECT_NAME}\${NC}"
  echo -e "\${BLUE}==============================================\${NC}"
  echo ""
}

# Обработка аргументов командной строки
case "\${1:-}" in
  "LoadPackagesToFileSystem")
      print_header
      docker exec -it $PROJECT_NAME /bin/bash -c \"dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $LOAD_PACKAGES_TO_FILE_SYSTEM_ARG\"
      exit 0
      ;;
  "LoadPackagesToDB")
      print_header
      docker exec -it $PROJECT_NAME /bin/bash -c \"dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $LOAD_PACKAGES_TO_DB_ARG\"
      exit 0
      ;;
  "BuildWorkspace")
      print_header
      docker exec -it $PROJECT_NAME /bin/bash -c \"dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $BUILD_WORKSPACE_ARG\"
      exit 0
      ;;
  "RebuildWorkspace")
      print_header
      docker exec -it $PROJECT_NAME /bin/bash -c \"dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $REBUILD_WORKSPACE_ARG\"
      exit 0
      ;;
  "BuildConfiguration")
      print_header
      docker exec -it $PROJECT_NAME /bin/bash -c \"dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $BUILD_CONFIGURATION_ARG\"
      exit 0  
      ;;
  "RegenerateSchemaSources")
      print_header
      docker exec -it $PROJECT_NAME /bin/bash -c \"dotnet WorkspaceConsole/BPMSoft.Tools.WorkspaceConsole.dll $REGENERATE_SCHEMA_SOURCES_ARG\"
      exit 0
      ;;
esac`;
  }

  /**
   * Генерирует содержимое файла ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
   * @returns - содержимое файла ${ConstantValues.FILE_NAMES.POSTGRES_RESTORE_SCRIPT}
   */
  public generatePostgresRestoreScriptContent(): string {
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
}