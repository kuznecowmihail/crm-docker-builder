import { spawn } from "child_process";
import { ContainerRuntime } from "@shared/api";
import { ConstantValues } from "../config/constants";

// Помощник для работы с Docker
export class DockerProcessHelper {
    private readonly containerRuntime: ContainerRuntime;

    constructor(containerRuntime: ContainerRuntime = 'docker') {
        this.containerRuntime = containerRuntime;
    }

    private getRuntimeDisplayName(): string {
        return this.containerRuntime.charAt(0).toUpperCase() + this.containerRuntime.slice(1);
    }

    /**
     * Создает сеть для проекта
     * @param networkName - имя сети
     * @param onLog - callback для логов в реальном времени
     * @returns - Promise<void>
     */
    public async createNetwork(networkName: string, onLog?: (log: string) => void): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            await this.executeCommand(['network', 'create', networkName]);
            onLog?.(`${runtimeName} сеть ${networkName} успешно создана`);
        } catch (error) {
            // Если сеть уже существует, это не ошибка
            if (error instanceof Error && error.message.includes('already exists')) {
                console.log(`${runtimeName} сеть ${networkName} уже существует`);
            } else {
                console.error(`Ошибка при создании ${runtimeName} сети ${networkName}:`, error);
                throw error;
            }
        }
    }
    /**
     * Удаляет сеть для проекта
     * @param networkName - имя сети
     * @param onLog - callback для логов в реальном времени
     * @returns - Promise<void>
     */
    public async removeNetwork(networkName: string, onLog?: (log: string) => void): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            await this.executeCommand(['network', 'rm', networkName]);
            onLog?.(`${runtimeName} сеть ${networkName} успешно удалена`);
        } catch (error) {
            // Если сеть не существует, это не ошибка
            if (error instanceof Error && error.message.includes('not found')) {
                console.log(`${runtimeName} сеть ${networkName} не существует`);
            } else {
                console.error(`Ошибка при удалении ${runtimeName} сети ${networkName}:`, error);
                throw error;
            }
        }
    }

    /**
     * Запускает compose
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта (для создания сети)
     * @param onLog - callback для логов в реальном времени
     * @returns - Promise<void>
     */
    public async startCompose(projectPath: string, projectName: string, onLog?: (log: string) => void): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            // Запускаем с ожиданием готовности всех контейнеров и логированием
            await this.executeCommandWithLogs(
                ['compose', '-p', projectName, '-f', ConstantValues.FILE_NAMES.DOCKER_COMPOSE, 'up', '--detach', '--wait'], 
                projectPath, 
                onLog
            );
            onLog?.(`${runtimeName} Compose успешно запущен и все контейнеры готовы`);
        } catch (error) {
            onLog?.(`Ошибка при запуске ${runtimeName} Compose: ${error}`);
            throw error;
        }
    }

    /**
     * Останавливает compose
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @param onLog - callback для логов в реальном времени
     * @returns - Promise<void>
     */
    public async stopCompose(projectPath: string, projectName: string, onLog?: (log: string) => void): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            await this.executeCommand(['compose', '-p', projectName, '-f', ConstantValues.FILE_NAMES.DOCKER_COMPOSE, 'down'], projectPath);
            onLog?.(`${runtimeName} Compose успешно остановлен`);
        } catch (error) {
            onLog?.(`Ошибка при остановке ${runtimeName} Compose: ${error}`);
            throw error;
        }
    }

    /**
     * Перезапускает compose
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @param onLog - callback для логов в реальном времени
     * @returns - Promise<void>
     */
    public async restartCompose(projectPath: string, projectName: string, onLog?: (log: string) => void): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            await this.stopCompose(projectPath, projectName, onLog);
            await this.startCompose(projectPath, projectName, onLog);
            onLog?.(`${runtimeName} Compose успешно перезапущен`);
        } catch (error) {
            onLog?.(`Ошибка при перезапуске ${runtimeName} Compose: ${error}`);
            throw error;
        }
    }

    /**
     * Показывает статус контейнеров
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @returns - Promise<string>
     */
    public async getComposeStatus(projectPath: string, projectName: string): Promise<string> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            const result = await this.executeCommandWithOutput(['compose', '-p', projectName, '-f', ConstantValues.FILE_NAMES.DOCKER_COMPOSE, 'ps'], projectPath);
            return result;
        } catch (error) {
            console.error(`Ошибка при получении статуса ${runtimeName} Compose:`, error);
            throw error;
        }
    }

    /**
     * Показывает логи контейнеров
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @param serviceName - имя сервиса (опционально)
     * @returns - Promise<string>
     */
    public async getComposeLogs(projectPath: string, projectName: string, serviceName?: string): Promise<string> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            const args = ['compose', '-p', projectName, '-f', ConstantValues.FILE_NAMES.DOCKER_COMPOSE, 'logs'];
            if (serviceName) {
                args.push(serviceName);
            }
            const result = await this.executeCommandWithOutput(args, projectPath);
            return result;
        } catch (error) {
            console.error(`Ошибка при получении логов ${runtimeName} Compose:`, error);
            throw error;
        }
    }

    /**
     * Показывает логи контейнеров в реальном времени
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @param serviceName - имя сервиса (опционально)
     * @param onLog - callback для логов в реальном времени
     * @returns - Promise<void>
     */
    public async getComposeLogsRealtime(projectPath: string, projectName: string, serviceName?: string): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            const args = ['compose', '-p', projectName, '-f', ConstantValues.FILE_NAMES.DOCKER_COMPOSE, 'logs', '--follow'];
            if (serviceName) {
                args.push(serviceName);
            }
            await this.executeCommandWithLogs(args, projectPath);
        } catch (error) {
            console.error(`Ошибка при получении логов ${runtimeName} Compose в реальном времени:`, error);
            throw error;
        }
    }

    /**
     * Выполняет команду контейнерного runtime
     * @param args - аргументы команды
     * @param cwd - рабочая директория (опционально)
     * @returns - Promise<void>
     */
    public executeCommand(args: string[], cwd?: string): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn(this.containerRuntime, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: cwd
            });

            let stderr = '';

            dockerProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            dockerProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`${runtimeName} команда завершилась с кодом ${code}. Stderr: ${stderr}`));
                }
            });

            dockerProcess.on('error', (error) => {
                reject(new Error(`Ошибка выполнения ${runtimeName} команды: ${error.message}`));
            });
        });
    }

    /**
     * Выполняет команду контейнерного runtime и возвращает вывод
     * @param args - аргументы команды
     * @param cwd - рабочая директория (опционально)
     * @returns - Promise<string>
     */
    private executeCommandWithOutput(args: string[], cwd?: string): Promise<string> {
        const runtimeName = this.getRuntimeDisplayName();
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn(this.containerRuntime, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: cwd
            });

            let stdout = '';
            let stderr = '';

            dockerProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            dockerProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            dockerProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`${runtimeName} команда завершилась с кодом ${code}. Stderr: ${stderr}`));
                }
            });

            dockerProcess.on('error', (error) => {
                reject(new Error(`Ошибка выполнения ${runtimeName} команды: ${error.message}`));
            });
        });
    }

    /**
     * Выполняет команду контейнерного runtime с логированием в реальном времени
     * @param args - аргументы команды
     * @param cwd - рабочая директория (опционально)
     * @param onLog - callback для логов
     * @returns - Promise<void>
     */
    public executeCommandWithLogs(args: string[], cwd?: string, onLog?: (log: string) => void): Promise<void> {
        const runtimeName = this.getRuntimeDisplayName();
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn(this.containerRuntime, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: cwd
            });

            let stderr = '';

            dockerProcess.stdout.on('data', (data) => {
                const logLine = data.toString();
                onLog?.(`[DockerProcessHelper] ${logLine}`);
            });

            dockerProcess.stderr.on('data', (data) => {
                const logLine = data.toString();
                stderr += logLine;
                onLog?.(`[DockerProcessHelper] ${logLine}`);
            });

            dockerProcess.on('close', (code) => {
                if (code === 0) {
                    onLog?.(`[DockerProcessHelper] ✅ ${runtimeName} команда завершилась с кодом ${code}`);
                    resolve();
                } else {
                    onLog?.(`[DockerProcessHelper] ❌ ${runtimeName} команда завершилась с кодом ${code}. Stderr: ${stderr}`);
                    reject(new Error(`${runtimeName} команда завершилась с кодом ${code}. Stderr: ${stderr}`));
                }
            });

            dockerProcess.on('error', (error) => {
                onLog?.(`[DockerProcessHelper] ❌ Ошибка выполнения ${runtimeName} команды: ${error.message}`);
                reject(new Error(`Ошибка выполнения ${runtimeName} команды: ${error.message}`));
            });
        });
    }

    /**
     * Проверяет, установлен ли контейнерный runtime
     * @returns - Promise<boolean>
     */
    public async isRuntimeInstalled(): Promise<boolean> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            await this.executeCommand(['--version']);
            return true;
        } catch (error) {
            console.error(`${runtimeName} не установлен или недоступен:`, error);
            return false;
        }
    }

    /**
     * Проверяет, запущен ли daemon контейнерного runtime
     * @returns - Promise<boolean>
     */
    public async isRuntimeRunning(): Promise<boolean> {
        const runtimeName = this.getRuntimeDisplayName();
        try {
            await this.executeCommand(['info']);
            return true;
        } catch (error) {
            console.error(`${runtimeName} daemon не запущен:`, error);
            return false;
        }
    }
}
