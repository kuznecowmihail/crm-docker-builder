import { ProjectConfig } from "@shared/crm-docker-builder";
import { ConstantValues } from "../../config/constants";
import path from "path";

// Помощник для работы с файлами docker-compose.yml
export class DockerComposeHelper {

    /**
     * Экранирует значение для безопасной подстановки в YAML
     * @param value - значение для экранирования
     * @returns экранированная YAML-строка
     */
    private yaml(value: string | number): string {
        return JSON.stringify(String(value)).replace(/\$/g, '$$$$');
    }

    /**
     * Генерирует содержимое файла docker-compose.yml
     * @param projectConfig - конфигурация проекта
     * @returns - содержимое файла docker-compose.yml
     */
    public generateDockerComposeContent(projectConfig: ProjectConfig, secondRun: boolean = false): string {
        const { postgresConfig, pgAdminConfig, redisConfig, rabbitmqConfig, crmConfigs } = projectConfig;
        const networkName = `${projectConfig.projectName}${ConstantValues.NETWORK_PREFIX}`;
        
        // Вспомогательная функция для создания относительных путей
        const getRelativePath = (targetPath: string): string => {
            return path.relative(projectConfig.projectPath, targetPath).split(path.sep).join('/');
        };
        
        // Генерация сервисов CRM
        const crmServices = crmConfigs.filter(crmConfig => Boolean(crmConfig.runOn) || secondRun).map((crmConfig) => {
          let dockerFile = '';
          if (crmConfig.crmType === "creatio" && crmConfig.netVersion === "8.0") {
            dockerFile = ConstantValues.FILE_NAMES.DOCKERFILE_CREATIO_NET8;
          } else if (crmConfig.crmType === "bpmsoft" && crmConfig.netVersion === "8.0") {
            dockerFile = ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8;
          } else if (crmConfig.crmType === "bpmsoft" && crmConfig.netVersion === "3.1") {
            dockerFile = ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET3;
          } else if (crmConfig.crmType === "creatio" && crmConfig.netVersion === "3.1") {
            dockerFile = ConstantValues.FILE_NAMES.DOCKERFILE_CREATIO_NET3;
          } else {
            throw new Error(`Not supported crm type with .net version: ${crmConfig.crmType} ${crmConfig.netVersion}`)
          }
          const serviceName = `${crmConfig.containerName.toLowerCase()}_container`;
          const containerName = crmConfig.containerName;
          const imageName = crmConfig.containerName.toLowerCase();
          const appPort = crmConfig.port;
          const appPath = getRelativePath(crmConfig.appPath);
          
          return `  ${serviceName}:
    container_name: ${this.yaml(containerName)}
    image: ${this.yaml(imageName)}
    pull_policy: never
    restart: unless-stopped
    build:
      dockerfile: ${this.yaml(dockerFile)}
      context: ${this.yaml('./' + appPath)}
    ports:
      - ${this.yaml(`${appPort}:5000`)}
    volumes:
      - ${this.yaml(`./${appPath}:${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}`)}
    depends_on:
      postgres_container:
        condition: service_healthy
      redis_container:
        condition: service_healthy
    networks:
      - ${this.yaml(networkName)}`;
        }).join('\n\n');

        const postgresDataRel = getRelativePath(path.join(
            projectConfig.projectPath,
            ConstantValues.FOLDER_NAMES.POSTGRES_VOLUMES,
            ConstantValues.FOLDER_NAMES.POSTGRES_PATHS.POSTGRES_DATA
        ));
        const redisDataRel = getRelativePath(path.join(
            projectConfig.projectPath,
            ConstantValues.FOLDER_NAMES.REDIS_VOLUMES,
            ConstantValues.FOLDER_NAMES.REDIS_PATHS.REDIS_DATA
        ));
        const redisConfRel = getRelativePath(path.join(
            projectConfig.projectPath,
            ConstantValues.FOLDER_NAMES.REDIS_VOLUMES,
            ConstantValues.FOLDER_NAMES.REDIS_PATHS.REDIS_CONF
        ));

        return `services:
  # postgres
  postgres_container:
    container_name: ${this.yaml(postgresConfig.containerName)}
    image: ${this.yaml(postgresConfig.dockerImageName)}
    healthcheck:
      test: ["CMD-SHELL", ${this.yaml(`sh -c 'pg_isready -U ${postgresConfig.user} -d db'`)}]
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
      POSTGRES_DB: ${this.yaml("db")}
      POSTGRES_USER: ${this.yaml(postgresConfig.user)}
      POSTGRES_PASSWORD: ${this.yaml(postgresConfig.password)}
      PGDATA: ${this.yaml(`${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}/pgdata`)}
    volumes:
      - ${this.yaml(`./${postgresDataRel}:${ConstantValues.FOLDER_NAMES.POSTGRES_PATHS_DOCKER.POSTGRES_DATA}`)}
    ports:
      - ${this.yaml(`${postgresConfig.port}:5432`)}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    networks:
      - ${this.yaml(networkName)}

  # pgadmin
  pgadmin_container:
    container_name: ${this.yaml(pgAdminConfig.containerName)}
    image: ${this.yaml('dpage/pgadmin4:latest')}
    environment:
      PGADMIN_DEFAULT_EMAIL: ${this.yaml(pgAdminConfig.email)}
      PGADMIN_DEFAULT_PASSWORD: ${this.yaml(pgAdminConfig.password)}
      PGADMIN_CONFIG_SERVER_MODE: ${this.yaml("False")}
    volumes:
      - ${this.yaml(`./${getRelativePath(pgAdminConfig.volumePath)}:${ConstantValues.FOLDER_NAMES.PGADMIN_PATHS_DOCKER.PGADMIN_DATA}`)}
    ports:
      - ${this.yaml(`${pgAdminConfig.port}:80`)}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 512M
    networks:
      - ${this.yaml(networkName)}

  # redis
  redis_container:
    container_name: ${this.yaml(redisConfig.containerName)}
    image: ${this.yaml('redis:6')}
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
      # test: ["CMD-SHELL", "redis-cli -a password ping | grep PONG"]
      interval: 1s
      timeout: 3s
      retries: 5
    restart: unless-stopped
    ports:
      - ${this.yaml(`${redisConfig.port}:6379`)}
    volumes:
      - ${this.yaml(`./${redisDataRel}:${ConstantValues.FOLDER_NAMES.REDIS_PATHS_DOCKER.REDIS_DATA}`)}
      - ${this.yaml(`./${redisConfRel}:${ConstantValues.FOLDER_NAMES.REDIS_PATHS_DOCKER.REDIS_CONF}`)}
    environment:
      - ${this.yaml(`REDIS_PASSWORD=${redisConfig.password}`)}
      - ${this.yaml(`REDIS_DATABASES=${redisConfig.dbCount}`)}
      - ${this.yaml('REDIS_PORT=6379')}
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 512M
    networks:
      - ${this.yaml(networkName)}

  # rabbitmq
  rabbitmq_container:
    container_name: ${this.yaml(rabbitmqConfig.containerName)}
    image: ${this.yaml('rabbitmq:3.10.7-management')}
    restart: unless-stopped
    environment:
      - ${this.yaml(`RABBITMQ_DEFAULT_USER=${rabbitmqConfig.user}`)}
      - ${this.yaml(`RABBITMQ_DEFAULT_PASS=${rabbitmqConfig.password}`)}
      - ${this.yaml('RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS=-rabbit log_levels [{connection,error},{default,error}] disk_free_limit 2147483648')}
    volumes:
      - ${this.yaml(`./${getRelativePath(rabbitmqConfig.volumePath)}:${ConstantValues.FOLDER_NAMES.RABBITMQ_PATHS_DOCKER.RABBITMQ_DATA}`)}
    ports:
      - ${this.yaml(`${rabbitmqConfig.port}:15672`)}
      # amqp
      - ${this.yaml(`${rabbitmqConfig.amqpPort}:5672`)}
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 0.5G
    networks:
      - ${this.yaml(networkName)}

${crmServices}

networks:
  ${this.yaml(networkName)}:
    external: true`;
    }
}
