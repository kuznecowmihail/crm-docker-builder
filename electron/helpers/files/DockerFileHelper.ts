import { ConstantValues } from "../../config/constants";

export class DockerFileHelper {
    /**
     * Генерирует содержимое файла Dockerfile
     * @returns - содержимое файла Dockerfile
     */
    public generateDockerFileContent(): string {
        return `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base
EXPOSE 5000 5002
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
ENV ASPNETCORE_ENVIRONMENT Development
ENV TZ Europe/Moscow
ENV COMPlus_ThreadPool_ForceMinWorkerThreads 100
ENTRYPOINT ["dotnet", "BPMSoft.WebHost.dll"]`;
    }
}