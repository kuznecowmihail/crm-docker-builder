import { CrmConfig, ProjectConfig } from '@shared/api';
import { DockerProcessHelper } from '../DockerProcessHelper';

const SUPERVISOR_USERNAME = 'Supervisor';
const SUPERVISOR_EMAIL = 'supervisor@localhost.local';
const SUPERVISOR_PASSWORD = 'Supervisor';
const KEYCLOAK_INTERNAL_PORT = 8080;
const KCADM = '/opt/keycloak/bin/kcadm.sh';

interface KcadmEntity {
    id?: string;
    username?: string;
    name?: string;
    clientId?: string;
}

interface ClientSecretResponse {
    value?: string;
}

interface AuthLoginResponse {
    Code?: number;
    Message?: string;
}

class CrmLoginRejectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CrmLoginRejectedError';
    }
}

export interface OpenIdProvisionClient {
    containerName: string;
    port: number;
    clientSecret: string;
    discoveryUrl: string;
}

/** Провижининг Keycloak и запись OpenID-настроек в базы CRM */
export class KeycloakProvisionHelper {

    /**
     * Настраивает Keycloak и OpenID для всех CRM проекта
     */
    public async provision(
        projectConfig: ProjectConfig,
        processHelper: DockerProcessHelper,
        onLog?: (log: string) => void
    ): Promise<OpenIdProvisionClient[]> {
        if (projectConfig.crmConfigs.length === 0) {
            return [];
        }

        const { keycloakConfig, postgresConfig } = projectConfig;
        onLog?.('[KeycloakProvisionHelper] Начинаем провижининг Keycloak');

        await this.waitUntilReady(processHelper, keycloakConfig.containerName, keycloakConfig.user, keycloakConfig.password);

        const supervisorSysAdminUnitId = await this.resolveSupervisorSysAdminUnitId(
            projectConfig.crmConfigs,
            processHelper,
            postgresConfig.containerName,
            postgresConfig.user,
            projectConfig.projectPath
        );

        const keycloakUserId = await this.ensureSupervisor(
            processHelper,
            keycloakConfig.containerName,
            supervisorSysAdminUnitId
        );
        onLog?.('[KeycloakProvisionHelper] Пользователь Supervisor в Keycloak настроен');

        await this.ensureProfileMapper(processHelper, keycloakConfig.containerName);

        const openIdDiscoveryUrl =
            `http://${keycloakConfig.containerName}:${KEYCLOAK_INTERNAL_PORT}/realms/master/.well-known/openid-configuration`;

        const openIdClients: OpenIdProvisionClient[] = [];

        for (const crmConfig of projectConfig.crmConfigs) {
            const clientSecret = await this.ensureClient(processHelper, keycloakConfig.containerName, crmConfig);
            onLog?.(`[KeycloakProvisionHelper] Клиент OpenID для ${crmConfig.containerName} настроен`);

            await this.updateSupervisorInDatabase(
                processHelper,
                postgresConfig.containerName,
                postgresConfig.user,
                crmConfig.containerName,
                projectConfig.projectPath,
                keycloakUserId
            );
            onLog?.(`[KeycloakProvisionHelper] Supervisor обновлён в базе ${crmConfig.containerName}`);

            openIdClients.push({
                containerName: crmConfig.containerName,
                port: crmConfig.port,
                clientSecret,
                discoveryUrl: openIdDiscoveryUrl,
            });
        }

        onLog?.('[KeycloakProvisionHelper] Провижининг Keycloak завершён');
        return openIdClients;
    }

    /**
     * Записывает настройки OpenID через CRM API после старта приложения
     */
    public async publishOpenIdSettings(
        crmConfig: CrmConfig,
        client: OpenIdProvisionClient,
        onLog?: (log: string) => void,
        onLoginRejected?: () => Promise<void>
    ): Promise<void> {
        const base = `http://localhost:${crmConfig.port}`;
        let session: { cookie: string; bpmcsrf: string };
        try {
            session = await this.loginToCrmWithRetry(base, crmConfig.containerName);
        } catch (error) {
            if (error instanceof CrmLoginRejectedError && onLoginRejected) {
                onLog?.(
                    `[KeycloakProvisionHelper] Вход в ${crmConfig.containerName} отклонён, сбрасываем кэш и перезапускаем контейнер`
                );
                await onLoginRejected();
                session = await this.loginToCrmWithRetry(base, crmConfig.containerName);
            } else {
                throw error;
            }
        }
        await this.postOpenIdSettings(base, session.cookie, session.bpmcsrf, client);
        onLog?.(`[KeycloakProvisionHelper] OpenID-настройки записаны через CRM для ${crmConfig.containerName}`);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private escapeSqlLiteral(value: string): string {
        return value.replace(/'/g, "''");
    }

    private parseKcadmJson<T>(stdout: string): T {
        const trimmed = stdout.trim();
        if (!trimmed) {
            return [] as unknown as T;
        }
        try {
            return JSON.parse(trimmed) as T;
        } catch {
            throw new Error('Не удалось разобрать ответ Keycloak Admin CLI');
        }
    }

    private async kcadm(
        processHelper: DockerProcessHelper,
        containerName: string,
        kcadmArgs: string[]
    ): Promise<string> {
        return processHelper.executeCommandWithOutput(['exec', containerName, KCADM, ...kcadmArgs]);
    }

    private async psql(
        processHelper: DockerProcessHelper,
        postgresContainer: string,
        postgresUser: string,
        database: string,
        sql: string,
        projectPath: string,
        tupleOnly = true
    ): Promise<string> {
        const args = [
            'exec',
            postgresContainer,
            'psql',
            '-h',
            'localhost',
            '-U',
            postgresUser,
            '-d',
            database,
        ];
        if (tupleOnly) {
            args.push('-t', '-A');
        }
        args.push('-v', 'ON_ERROR_STOP=1', '-c', sql);

        return processHelper.executeCommandWithOutput(args, projectPath);
    }

    private assertUpdateAffected(stdout: string, databaseName: string, operationDescription: string): void {
        const match = stdout.match(/UPDATE\s+(\d+)/i);
        if (!match || match[1] === '0') {
            throw new Error(
                `В базе ${databaseName} не обновлено ни одной строки: ${operationDescription}`
            );
        }
    }

    private async waitUntilReady(
        processHelper: DockerProcessHelper,
        keycloakContainer: string,
        adminUser: string,
        adminPassword: string
    ): Promise<void> {
        const maxAttempts = 30;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.kcadm(processHelper, keycloakContainer, [
                    'config',
                    'credentials',
                    '--server',
                    `http://localhost:${KEYCLOAK_INTERNAL_PORT}`,
                    '--realm',
                    'master',
                    '--user',
                    adminUser,
                    '--password',
                    adminPassword,
                ]);
                return;
            } catch {
                if (attempt === maxAttempts) {
                    throw new Error('Keycloak не готов');
                }
                await this.sleep(2000);
            }
        }
    }

    private async readSupervisorIdFromDatabase(
        processHelper: DockerProcessHelper,
        postgresContainer: string,
        postgresUser: string,
        databaseName: string,
        projectPath: string
    ): Promise<string> {
        const sql = `select "Id"::text from "SysAdminUnit" where lower("Name") = lower('${SUPERVISOR_USERNAME}')`;
        const stdout = await this.psql(
            processHelper,
            postgresContainer,
            postgresUser,
            databaseName,
            sql,
            projectPath
        );

        const ids = stdout
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (ids.length === 0) {
            throw new Error(`Supervisor не найден в базе ${databaseName}`);
        }

        const uniqueIds = [...new Set(ids)];
        if (uniqueIds.length > 1) {
            throw new Error(
                `В базе ${databaseName} найдено несколько записей Supervisor с разными Id`
            );
        }

        return uniqueIds[0];
    }

    private async resolveSupervisorSysAdminUnitId(
        crmConfigs: CrmConfig[],
        processHelper: DockerProcessHelper,
        postgresContainer: string,
        postgresUser: string,
        projectPath: string
    ): Promise<string> {
        const idsByDatabase: { databaseName: string; id: string }[] = [];

        for (const crmConfig of crmConfigs) {
            const id = await this.readSupervisorIdFromDatabase(
                processHelper,
                postgresContainer,
                postgresUser,
                crmConfig.containerName,
                projectPath
            );
            idsByDatabase.push({ databaseName: crmConfig.containerName, id });
        }

        const normalizedFirst = idsByDatabase[0].id.toLowerCase();
        const mismatched = idsByDatabase.filter((entry) => entry.id.toLowerCase() !== normalizedFirst);
        if (mismatched.length > 0) {
            const names = idsByDatabase.map((entry) => entry.databaseName).join(', ');
            throw new Error(
                `Id пользователя Supervisor различается между базами CRM: ${names}`
            );
        }

        return idsByDatabase[0].id;
    }

    private async findSupervisorKeycloakUserId(
        processHelper: DockerProcessHelper,
        keycloakContainer: string
    ): Promise<string | null> {
        const stdout = await this.kcadm(processHelper, keycloakContainer, [
            'get',
            'users',
            '-r',
            'master',
            '-q',
            `username=${SUPERVISOR_USERNAME}`,
            '--fields',
            'id,username',
        ]);

        const users = this.parseKcadmJson<KcadmEntity[]>(stdout);
        const user = users.find(
            (entry) => entry.username?.toLowerCase() === SUPERVISOR_USERNAME.toLowerCase()
        );
        return user?.id ?? null;
    }

    private buildSupervisorUserBody(sysAdminUnitId: string): string {
        return JSON.stringify({
            username: SUPERVISOR_USERNAME,
            email: SUPERVISOR_EMAIL,
            firstName: SUPERVISOR_USERNAME,
            enabled: true,
            emailVerified: true,
            attributes: {
                SysAdminUnitId: [sysAdminUnitId],
            },
        });
    }

    private parseCreatedUserId(stdout: string): string | null {
        const match = stdout.match(/Created new user with id '([^']+)'/);
        return match?.[1] ?? null;
    }

    private async ensureSupervisor(
        processHelper: DockerProcessHelper,
        keycloakContainer: string,
        sysAdminUnitId: string
    ): Promise<string> {
        const userBody = this.buildSupervisorUserBody(sysAdminUnitId);
        let userId = await this.findSupervisorKeycloakUserId(processHelper, keycloakContainer);

        if (!userId) {
            const createStdout = await this.kcadm(processHelper, keycloakContainer, [
                'create',
                'users',
                '-r',
                'master',
                '-b',
                userBody,
            ]);
            userId = this.parseCreatedUserId(createStdout)
                ?? await this.findSupervisorKeycloakUserId(processHelper, keycloakContainer);
            if (!userId) {
                throw new Error('Не удалось создать пользователя Supervisor в Keycloak');
            }
        } else {
            await this.kcadm(processHelper, keycloakContainer, [
                'update',
                `users/${userId}`,
                '-r',
                'master',
                '-b',
                userBody,
            ]);
        }

        await this.kcadm(processHelper, keycloakContainer, [
            'set-password',
            '-r',
            'master',
            '--userid',
            userId,
            '--new-password',
            SUPERVISOR_PASSWORD,
        ]);

        return userId;
    }

    private buildSysAdminUnitIdMapperBody(mapperId?: string): string {
        return JSON.stringify({
            ...(mapperId ? { id: mapperId } : {}),
            name: 'SysAdminUnitId',
            protocol: 'openid-connect',
            protocolMapper: 'oidc-usermodel-attribute-mapper',
            config: {
                'user.attribute': 'SysAdminUnitId',
                'claim.name': 'SysAdminUnitId',
                'jsonType.label': 'String',
                'id.token.claim': 'true',
                'access.token.claim': 'true',
                'userinfo.token.claim': 'true',
            },
        });
    }

    private async ensureProfileMapper(
        processHelper: DockerProcessHelper,
        keycloakContainer: string
    ): Promise<void> {
        const scopesStdout = await this.kcadm(processHelper, keycloakContainer, [
            'get',
            'client-scopes',
            '-r',
            'master',
            '-q',
            'name=profile',
            '--fields',
            'id,name',
        ]);
        const scopes = this.parseKcadmJson<KcadmEntity[]>(scopesStdout);
        const profileScope = scopes.find((scope) => scope.name === 'profile');
        if (!profileScope?.id) {
            throw new Error('Client scope profile не найден в Keycloak');
        }

        const mappersStdout = await this.kcadm(processHelper, keycloakContainer, [
            'get',
            `client-scopes/${profileScope.id}/protocol-mappers/models`,
            '-r',
            'master',
        ]);
        const mappers = this.parseKcadmJson<KcadmEntity[]>(mappersStdout);
        const existingMapper = mappers.find((mapper) => mapper.name === 'SysAdminUnitId');

        if (!existingMapper?.id) {
            await this.kcadm(processHelper, keycloakContainer, [
                'create',
                `client-scopes/${profileScope.id}/protocol-mappers/models`,
                '-r',
                'master',
                '-b',
                this.buildSysAdminUnitIdMapperBody(),
            ]);
        } else {
            await this.kcadm(processHelper, keycloakContainer, [
                'update',
                `client-scopes/${profileScope.id}/protocol-mappers/models/${existingMapper.id}`,
                '-r',
                'master',
                '-b',
                this.buildSysAdminUnitIdMapperBody(existingMapper.id),
            ]);
        }
    }

    private buildClientBody(crmConfig: CrmConfig): string {
        return JSON.stringify({
            clientId: crmConfig.containerName,
            protocol: 'openid-connect',
            publicClient: false,
            standardFlowEnabled: true,
            rootUrl: `http://localhost:${crmConfig.port}`,
            baseUrl: '/ServiceModel/AuthService.svc/OpenIdCallback',
            redirectUris: ['/ServiceModel/AuthService.svc/*'],
            webOrigins: ['/*'],
        });
    }

    private async findClientUuid(
        processHelper: DockerProcessHelper,
        keycloakContainer: string,
        clientId: string
    ): Promise<string | null> {
        const stdout = await this.kcadm(processHelper, keycloakContainer, [
            'get',
            'clients',
            '-r',
            'master',
            '-q',
            `clientId=${clientId}`,
            '--fields',
            'id,clientId',
        ]);
        const clients = this.parseKcadmJson<KcadmEntity[]>(stdout);
        const client = clients.find((entry) => entry.clientId === clientId);
        return client?.id ?? null;
    }

    private async ensureClient(
        processHelper: DockerProcessHelper,
        keycloakContainer: string,
        crmConfig: CrmConfig
    ): Promise<string> {
        const clientId = crmConfig.containerName;
        const clientBody = this.buildClientBody(crmConfig);
        let clientUuid = await this.findClientUuid(processHelper, keycloakContainer, clientId);

        if (!clientUuid) {
            await this.kcadm(processHelper, keycloakContainer, [
                'create',
                'clients',
                '-r',
                'master',
                '-b',
                clientBody,
            ]);
            clientUuid = await this.findClientUuid(processHelper, keycloakContainer, clientId);
            if (!clientUuid) {
                throw new Error(`Не удалось создать клиент OpenID ${clientId} в Keycloak`);
            }
        } else {
            await this.kcadm(processHelper, keycloakContainer, [
                'update',
                `clients/${clientUuid}`,
                '-r',
                'master',
                '-b',
                clientBody,
            ]);
        }

        const secretStdout = await this.kcadm(processHelper, keycloakContainer, [
            'get',
            `clients/${clientUuid}/client-secret`,
            '-r',
            'master',
        ]);
        const secretResponse = this.parseKcadmJson<ClientSecretResponse>(secretStdout);
        if (!secretResponse.value) {
            throw new Error(`Секрет клиента OpenID ${clientId} не получен из Keycloak`);
        }

        return secretResponse.value;
    }

    private async runSqlUpdate(
        processHelper: DockerProcessHelper,
        postgresContainer: string,
        postgresUser: string,
        databaseName: string,
        projectPath: string,
        sql: string,
        operationDescription: string
    ): Promise<void> {
        const stdout = await this.psql(
            processHelper,
            postgresContainer,
            postgresUser,
            databaseName,
            sql,
            projectPath,
            false
        );
        this.assertUpdateAffected(stdout, databaseName, operationDescription);
    }

    private isRetryableLoginHttpStatus(status: number): boolean {
        return status === 502 || status === 503 || status === 504;
    }

    private shouldRetryCrmLogin(error: unknown): boolean {
        if (error instanceof TypeError) {
            return true;
        }
        if (error instanceof Error && error.message.startsWith('RETRY_HTTP:')) {
            return true;
        }
        return false;
    }

    private getSetCookieHeaders(headers: Headers): string[] {
        if ('getSetCookie' in headers) {
            const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
            if (typeof getSetCookie === 'function') {
                return getSetCookie.call(headers);
            }
        }
        const setCookie = headers.get('set-cookie');
        return setCookie ? [setCookie] : [];
    }

    private buildSessionFromSetCookies(setCookies: string[]): { cookie: string; bpmcsrf: string } {
        const pairs: string[] = [];
        let bpmcsrf = '';

        for (const setCookie of setCookies) {
            const nameValue = setCookie.split(';')[0]?.trim();
            if (!nameValue) {
                continue;
            }
            pairs.push(nameValue);
            const eqIndex = nameValue.indexOf('=');
            if (eqIndex > 0 && nameValue.slice(0, eqIndex) === 'BPMCSRF') {
                bpmcsrf = nameValue.slice(eqIndex + 1);
            }
        }

        if (!bpmcsrf) {
            throw new Error('BPMCSRF не получен при входе в CRM');
        }

        return { cookie: pairs.join('; '), bpmcsrf };
    }

    private async loginToCrm(base: string): Promise<{ cookie: string; bpmcsrf: string }> {
        const response = await fetch(`${base}/ServiceModel/AuthService.svc/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                UserName: SUPERVISOR_USERNAME,
                UserPassword: SUPERVISOR_PASSWORD,
                WorkspaceName: 'Default',
                TimeZoneOffset: 0,
            }),
            redirect: 'manual',
        });

        if (this.isRetryableLoginHttpStatus(response.status)) {
            throw new Error(`RETRY_HTTP:${response.status}`);
        }
        if (response.status !== 200) {
            throw new Error(`Вход в CRM завершился с HTTP ${response.status}`);
        }

        const body = (await response.json()) as AuthLoginResponse;
        if (body.Code !== 0) {
            throw new CrmLoginRejectedError(body.Message ?? 'Вход в CRM не выполнен');
        }

        return this.buildSessionFromSetCookies(this.getSetCookieHeaders(response.headers));
    }

    private async loginToCrmWithRetry(
        base: string,
        containerName: string
    ): Promise<{ cookie: string; bpmcsrf: string }> {
        const maxAttempts = 15;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await this.loginToCrm(base);
            } catch (error) {
                if (!this.shouldRetryCrmLogin(error)) {
                    throw error;
                }
                if (attempt === maxAttempts) {
                    throw new Error(
                        `CRM не ответил на вход для ${containerName} после ${maxAttempts} попыток`
                    );
                }
                await this.sleep(1000);
            }
        }

        throw new Error(`Не удалось войти в CRM для ${containerName}`);
    }

    private async postOpenIdSettings(
        base: string,
        cookie: string,
        bpmcsrf: string,
        client: OpenIdProvisionClient
    ): Promise<void> {
        const response = await fetch(`${base}/DataService/json/SyncReply/PostSysSettingsValues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Cookie: cookie,
                BPMCSRF: bpmcsrf,
            },
            body: JSON.stringify({
                isPersonal: false,
                sysSettingsValues: {
                    OpenIDIdentityServerUrl: client.discoveryUrl,
                    OpenIDIdentityServerClientId: client.containerName,
                    OpenIDIdentityServerClientSecret: client.clientSecret,
                    ShowOpenIDConnectLogin: true,
                    OIDCprovider: 'Keycloak',
                },
            }),
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`PostSysSettingsValues завершился с HTTP ${response.status}`);
        }
    }

    private async updateSupervisorInDatabase(
        processHelper: DockerProcessHelper,
        postgresContainer: string,
        postgresUser: string,
        databaseName: string,
        projectPath: string,
        keycloakUserId: string
    ): Promise<void> {
        const escapedUserId = this.escapeSqlLiteral(keycloakUserId);

        await this.runSqlUpdate(
            processHelper,
            postgresContainer,
            postgresUser,
            databaseName,
            projectPath,
            `update "SysAdminUnit" set "OpenIDSub" = '${escapedUserId}' where lower("Name") = lower('${SUPERVISOR_USERNAME}')`,
            'обновление OpenIDSub для Supervisor'
        );

        await this.runSqlUpdate(
            processHelper,
            postgresContainer,
            postgresUser,
            databaseName,
            projectPath,
            `update "SysAdminUnit" set "ForceChangePassword" = false where lower("Name") = lower('${SUPERVISOR_USERNAME}')`,
            'сброс ForceChangePassword для Supervisor'
        );

        await this.runSqlUpdate(
            processHelper,
            postgresContainer,
            postgresUser,
            databaseName,
            projectPath,
            `update "SysAdminUnit" set "PasswordExpireDate" = null, "UserPassword" = 'VJXm6hSrAIEZQOafko5.YOy60ic0TZN0oYlGcq7p/HZ6Iea/nvhUq' where lower("Name") = lower('${SUPERVISOR_USERNAME}')`,
            'сброс UserPassword для Supervisor'
        );
    }
}
