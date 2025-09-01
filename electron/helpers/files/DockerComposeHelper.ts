import { ProjectConfig } from "@shared/crm-docker-builder";
import { ConstantValues } from "../../config/constants";
import path from "path";

// Помощник для работы с файлами docker-compose.yml
export class DockerComposeHelper {

    /**
     * Генерирует содержимое файла docker-compose.yml
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла docker-compose.yml
     */
    public generateDockerComposeContent(projectConfig: ProjectConfig, secondRun: boolean = false): string {
        const { postgresConfig, pgAdminConfig, redisConfig, rabbitmqConfig, crmConfigs } = projectConfig;
        
        // Вспомогательная функция для создания относительных путей
        const getRelativePath = (targetPath: string): string => {
            return path.relative(projectConfig.projectPath, targetPath);
        };
        
        // Генерация сервисов CRM
        const crmServices = crmConfigs.filter(crmConfig => Boolean(crmConfig.runOn) || secondRun).map((crmConfig, index) => {
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
}