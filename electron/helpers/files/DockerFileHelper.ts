import { CrmConfig } from "@shared/crm-docker-builder";
import { ConstantValues } from "../../config/constants";

// Помощник для работы с файлами Dockerfile
export class DockerFileHelper {
    /**
     * Генерирует содержимое файла Dockerfile
     * @returns - содержимое файла Dockerfile
     */
    public generateDockerFileContent(crmConfig: CrmConfig): string {
        if (crmConfig.crmType === "creatio" && crmConfig.netVersion === "8.0") {
            return this.getCreatioNet6();
        } else if (crmConfig.crmType === "bpmsoft" && crmConfig.netVersion === "8.0") {
            return this.getBPMSoftNet8();
        } else {
            throw new Error("Not supported crm type with .net version")
        }
    }

    /**
     * Генерирует содержимое файла Dockerfile для Creatio .NET6
     * @returns содержимое файла Dockerfile
     */
    private getCreatioNet6(): string {
        return `FROM mcr.microsoft.com/dotnet/sdk:8.0

ENV ASPNETCORE_ENVIRONMENT=Development \
    TZ=Europe/Moscow

RUN apt-get update && \
    apt-get -y --no-install-recommends install \
    libgdiplus \
    libc6-dev \
    gss-ntlmssp && \
    apt-get clean all && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/* && \
    sed -i 's/openssl_conf/#openssl_conf/g' /etc/ssl/openssl.cnf

WORKDIR ${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}
COPY . ./

EXPOSE 5000 5002
ENTRYPOINT ["dotnet", "Terrasoft.WebHost.dll"]`;
    }

    /**
     * Генерирует содержимое файла Dockerfile для BPMSoft .NET8
     * @returns содержимое файла Dockerfile
     */
    private getBPMSoftNet8(): string {
        return `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base
        
ENV ASPNETCORE_ENVIRONMENT Development \
    TZ Europe/Moscow

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

EXPOSE 5000 5002
ENV COMPlus_ThreadPool_ForceMinWorkerThreads 100
ENTRYPOINT ["dotnet", "BPMSoft.WebHost.dll"]`;
    }
}