FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/WordBattle.Api/WordBattle.Api.csproj", "src/WordBattle.Api/"]
COPY ["src/WordBattle.Application/WordBattle.Application.csproj", "src/WordBattle.Application/"]
COPY ["src/WordBattle.Domain/WordBattle.Domain.csproj", "src/WordBattle.Domain/"]
COPY ["src/WordBattle.Infrastructure/WordBattle.Infrastructure.csproj", "src/WordBattle.Infrastructure/"]

RUN dotnet restore "src/WordBattle.Api/WordBattle.Api.csproj"

COPY . .

RUN dotnet publish "src/WordBattle.Api/WordBattle.Api.csproj" \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "WordBattle.Api.dll"]
