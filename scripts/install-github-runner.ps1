# Скрипт для установки GitHub Actions Self-Hosted Runner на Windows

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$true)]
    [string]$RunnerName,
    
    [string]$Labels = "self-hosted,windows",
    
    [string]$RunnerDir = "C:\actions-runner",
    
    [string]$Version = "2.311.0"
)

Write-Host "=== Установка GitHub Actions Self-Hosted Runner ===" -ForegroundColor Green
Write-Host ""

# Проверка прав администратора
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Ошибка: Запустите скрипт с правами администратора" -ForegroundColor Red
    exit 1
}

Write-Host "Настройка:" -ForegroundColor Yellow
Write-Host "  Директория: $RunnerDir"
Write-Host "  Имя runner'а: $RunnerName"
Write-Host "  Метки: $Labels"
Write-Host "  Версия: $Version"
Write-Host ""

$confirm = Read-Host "Продолжить? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    exit 1
}

# Создание директории
Write-Host "Создание директории $RunnerDir..." -ForegroundColor Green
if (Test-Path $RunnerDir) {
    Write-Host "Директория уже существует" -ForegroundColor Yellow
} else {
    New-Item -ItemType Directory -Path $RunnerDir -Force | Out-Null
}

# Скачивание runner'а
Write-Host "Скачивание runner'а версии $Version..." -ForegroundColor Green
$zipFile = "$RunnerDir\actions-runner-win-x64-$Version.zip"
$downloadUrl = "https://github.com/actions/runner/releases/download/v$Version/actions-runner-win-x64-$Version.zip"

Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile

# Распаковка
Write-Host "Распаковка архива..." -ForegroundColor Green
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $RunnerDir)

# Удаление архива
Remove-Item $zipFile

# Настройка runner'а
Write-Host "Настройка runner'а..." -ForegroundColor Green
Set-Location $RunnerDir
.\config.cmd --url $RepoUrl `
    --token $Token `
    --name $RunnerName `
    --labels $Labels `
    --work _work `
    --replace

# Установка как службы Windows
Write-Host "Установка как службы Windows..." -ForegroundColor Green
.\install.cmd

# Запуск службы
Write-Host "Запуск службы..." -ForegroundColor Green
$serviceName = Get-Service | Where-Object { $_.Name -like "*GitHub Actions Runner*" } | Select-Object -First 1 -ExpandProperty Name
if ($serviceName) {
    Start-Service $serviceName
    Write-Host "Служба '$serviceName' запущена" -ForegroundColor Green
} else {
    Write-Host "Предупреждение: Не удалось найти службу runner'а" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Runner успешно установлен и запущен!" -ForegroundColor Green
Write-Host ""
Write-Host "Полезные команды:" -ForegroundColor Yellow
Write-Host "  Статус: Get-Service | Where-Object { `$_.Name -like '*GitHub Actions Runner*' }"
Write-Host "  Перезапуск: Restart-Service '$serviceName'"
Write-Host "  Остановка: Stop-Service '$serviceName'"

