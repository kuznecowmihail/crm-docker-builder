import { ChildProcess, spawn } from "child_process";

export class DockerProcessHelper {
    /**
     * Процесс Docker
     */
    private dockerProcess: ChildProcess | null = null;

    /**
     * Создает Docker сеть для проекта
     * @param projectConfig - конфигурация проекта
     * @returns - Promise<void>
     */
    private async createDockerNetwork(networkName: string, onLog?: (log: string) => void): Promise<void> {
        try {
            await this.executeDockerCommand(['network', 'create', networkName]);
            onLog?.(`Docker сеть ${networkName} успешно создана`);
        } catch (error) {
            // Если сеть уже существует, это не ошибка
            if (error instanceof Error && error.message.includes('already exists')) {
                console.log(`Docker сеть ${networkName} уже существует`);
            } else {
                console.error(`Ошибка при создании Docker сети ${networkName}:`, error);
                throw error;
            }
        }
    }

    /**
     * Запускает docker-compose
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта (для создания сети)
     * @param onLog - callback для логов в реальном времени
     * @returns - Promise<void>
     */
    public async startDockerCompose(projectPath: string, projectName: string, onLog?: (log: string) => void): Promise<void> {
        try {
            // Создаем сеть с именем проекта
            const networkName = `${projectName}_network`;
            await this.createDockerNetwork(networkName, onLog);

            // Запускаем с ожиданием готовности всех контейнеров и логированием
            await this.executeDockerCommandWithLogs(
                ['compose', '-p', projectName, '-f', 'docker-compose.yml', 'up', '--detach', '--wait'], 
                projectPath, 
                onLog
            );
            console.log('Docker Compose успешно запущен и все контейнеры готовы');
        } catch (error) {
            console.error('Ошибка при запуске Docker Compose:', error);
            throw error;
        }
    }

    /**
     * Останавливает docker-compose
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @returns - Promise<void>
     */
    public async stopDockerCompose(projectPath: string, projectName: string): Promise<void> {
        try {
            await this.executeDockerCommand(['compose', '-p', projectName, '-f', 'docker-compose.yml', 'down'], projectPath);
            console.log('Docker Compose успешно остановлен');
        } catch (error) {
            console.error('Ошибка при остановке Docker Compose:', error);
            throw error;
        }
    }

    /**
     * Перезапускает docker-compose
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @returns - Promise<void>
     */
    public async restartDockerCompose(projectPath: string, projectName: string): Promise<void> {
        try {
            await this.stopDockerCompose(projectPath, projectName);
            await this.startDockerCompose(projectPath, projectName);
            console.log('Docker Compose успешно перезапущен');
        } catch (error) {
            console.error('Ошибка при перезапуске Docker Compose:', error);
            throw error;
        }
    }

    /**
     * Показывает статус контейнеров
     * @param projectPath - путь к проекту
     * @param projectName - имя проекта
     * @returns - Promise<string>
     */
    public async getDockerComposeStatus(projectPath: string, projectName: string): Promise<string> {
        try {
            const result = await this.executeDockerCommandWithOutput(['compose', '-p', projectName, '-f', 'docker-compose.yml', 'ps'], projectPath);
            return result;
        } catch (error) {
            console.error('Ошибка при получении статуса Docker Compose:', error);
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
    public async getDockerComposeLogs(projectPath: string, projectName: string, serviceName?: string): Promise<string> {
        try {
            const args = ['compose', '-p', projectName, '-f', 'docker-compose.yml', 'logs'];
            if (serviceName) {
                args.push(serviceName);
            }
            const result = await this.executeDockerCommandWithOutput(args, projectPath);
            return result;
        } catch (error) {
            console.error('Ошибка при получении логов Docker Compose:', error);
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
    public async getDockerComposeLogsRealtime(projectPath: string, projectName: string, serviceName?: string, onLog?: (log: string) => void): Promise<void> {
        try {
            const args = ['compose', '-p', projectName, '-f', 'docker-compose.yml', 'logs', '--follow'];
            if (serviceName) {
                args.push(serviceName);
            }
            await this.executeDockerCommandWithLogs(args, projectPath, onLog);
        } catch (error) {
            console.error('Ошибка при получении логов Docker Compose в реальном времени:', error);
            throw error;
        }
    }

    /**
     * Выполняет Docker команду
     * @param args - аргументы команды
     * @param cwd - рабочая директория (опционально)
     * @returns - Promise<void>
     */
    public executeDockerCommand(args: string[], cwd?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn('docker', args, {
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
                    reject(new Error(`Docker команда завершилась с кодом ${code}. Stderr: ${stderr}`));
                }
            });

            dockerProcess.on('error', (error) => {
                reject(new Error(`Ошибка выполнения Docker команды: ${error.message}`));
            });
        });
    }

    /**
     * Выполняет Docker команду и возвращает вывод
     * @param args - аргументы команды
     * @param cwd - рабочая директория (опционально)
     * @returns - Promise<string>
     */
    private executeDockerCommandWithOutput(args: string[], cwd?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn('docker', args, {
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
                    reject(new Error(`Docker команда завершилась с кодом ${code}. Stderr: ${stderr}`));
                }
            });

            dockerProcess.on('error', (error) => {
                reject(new Error(`Ошибка выполнения Docker команды: ${error.message}`));
            });
        });
    }

    /**
     * Выполняет Docker команду с логированием в реальном времени
     * @param args - аргументы команды
     * @param cwd - рабочая директория (опционально)
     * @param onLog - callback для логов
     * @returns - Promise<void>
     */
    public executeDockerCommandWithLogs(args: string[], cwd?: string, onLog?: (log: string) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn('docker', args, {
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
                    onLog?.(`[DockerProcessHelper] ✅ Docker команда завершилась с кодом ${code}`);
                    resolve();
                } else {
                    onLog?.(`[DockerProcessHelper] ❌ Docker команда завершилась с кодом ${code}. Stderr: ${stderr}`);
                    reject(new Error(`Docker команда завершилась с кодом ${code}. Stderr: ${stderr}`));
                }
            });

            dockerProcess.on('error', (error) => {
                onLog?.(`[DockerProcessHelper] ❌ Ошибка выполнения Docker команды: ${error.message}`);
                reject(new Error(`Ошибка выполнения Docker команды: ${error.message}`));
            });
        });
    }

    /**
     * Проверяет, установлен ли Docker
     * @returns - Promise<boolean>
     */
    public async isDockerInstalled(): Promise<boolean> {
        try {
            await this.executeDockerCommand(['--version']);
            return true;
        } catch (error) {
            console.error('Docker не установлен или недоступен:', error);
            return false;
        }
    }

    /**
     * Проверяет, запущен ли Docker daemon
     * @returns - Promise<boolean>
     */
    public async isDockerRunning(): Promise<boolean> {
        try {
            await this.executeDockerCommand(['info']);
            return true;
        } catch (error) {
            console.error('Docker daemon не запущен:', error);
            return false;
        }
    }
}