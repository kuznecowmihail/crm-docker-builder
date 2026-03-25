import { CrmConfig } from "@shared/crm-docker-builder";
import { ConstantValues } from "../../config/constants";
import path from "path";

// Помощник для работы с файлами Dockerfile
export class DockerFileHelper {
    /**
     * Генерирует содержимое файла Dockerfile
     * @returns - содержимое файла Dockerfile
     */
    public generateDockerFileContent(crmConfig: CrmConfig): { content: string, filePath: string } {
        if (crmConfig.crmType === "creatio" && crmConfig.netVersion === "8.0") {
            return {
                content: this.getCreatioNet6(),
                filePath: path.join(crmConfig.appPath, ConstantValues.FILE_NAMES.DOCKERFILE_CREATIO_NET8)
            };
        } else if (crmConfig.crmType === "bpmsoft" && crmConfig.netVersion === "8.0") {
            return {
                content: this.getBPMSoftNet8(),
                filePath: path.join(crmConfig.appPath, ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET8)
            };
        } else if (crmConfig.crmType === "bpmsoft" && crmConfig.netVersion === "3.1") {
            return {
                content: this.getBPMSoftNet3(),
                filePath: path.join(crmConfig.appPath, ConstantValues.FILE_NAMES.DOCKERFILE_BPM_SOFT_NET3)
            };
        } else if (crmConfig.crmType === "creatio" && crmConfig.netVersion === "3.1") {
            return {
                content: this.getCreatioNet3(),
                filePath: path.join(crmConfig.appPath, ConstantValues.FILE_NAMES.DOCKERFILE_CREATIO_NET3)
            };
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

    /**
     * Генерирует содержимое файла Dockerfile для BPMSoft .NET3
     * @returns содержимое файла Dockerfile
     */
    private getBPMSoftNet3(): string {
        return `FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS base

EXPOSE 5000 5002

ENV DEBIAN_FRONTEND=noninteractive
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    sed -i 's|security.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get -y --no-install-recommends install \
    libgdiplus \
    libc6-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

WORKDIR ${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}
COPY . ./
FROM base AS final
WORKDIR ${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}
        
ENV ASPNETCORE_ENVIRONMENT Development \
    TZ Europe/Moscow

ENV COMPlus_ThreadPool_ForceMinWorkerThreads 100
ENTRYPOINT ["dotnet", "BPMSoft.WebHost.dll"]`;
    }

    /**
     * Генерирует содержимое файла Dockerfile для Creatio .NET3
     * @returns содержимое файла Dockerfile
     */
    private getCreatioNet3(): string {
        return `FROM mcr.microsoft.com/dotnet/core/sdk:3.1

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

WORKDIR /app
COPY . ./

EXPOSE 5000 5002
ENTRYPOINT ["dotnet", "Terrasoft.WebHost.dll"]`;
    }
}