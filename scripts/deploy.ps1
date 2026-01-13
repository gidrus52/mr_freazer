# PowerShell скрипт для деплоя на сервер
# Использование: .\scripts\deploy.ps1

param(
    [string]$SSH_HOST = "82.148.6.221",
    [string]$SSH_USER = "root",
    [string]$APP_DIR = "/opt/mr_freazer"
)

Write-Host "🚀 Начало деплоя на сервер ${SSH_USER}@${SSH_HOST}..." -ForegroundColor Green
Write-Host ""

# Проверка наличия SSH
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Ошибка: SSH не найден" -ForegroundColor Red
    Write-Host "Установите OpenSSH или используйте Git Bash / WSL" -ForegroundColor Yellow
    exit 1
}

# Команды для выполнения на сервере
$deployScript = @"
set -e
echo '📂 Переход в директорию приложения...'
cd $APP_DIR || {
  echo '❌ Директория $APP_DIR не найдена!'
  exit 1
}
echo '📥 Получение последних изменений из репозитория...'
git fetch origin
git pull origin main || {
  echo '⚠️  Предупреждение: Не удалось выполнить git pull'
}
echo '🐳 Обновление Docker образов...'
docker-compose pull || {
  echo '⚠️  Предупреждение: Не удалось выполнить docker-compose pull'
}
echo '🔨 Пересборка и запуск контейнеров...'
docker-compose up -d --build
echo '⏳ Ожидание запуска сервисов...'
sleep 5
echo '🧹 Очистка неиспользуемых Docker ресурсов...'
docker system prune -f
echo '✅ Проверка статуса контейнеров...'
docker-compose ps
echo ''
echo '🎉 Деплой успешно завершен!'
"@

# Сохраняем команды во временный файл
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline

# Выполняем команды на сервере
Write-Host "📤 Подключение к серверу и выполнение деплоя..." -ForegroundColor Blue

Get-Content $tempScript | ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" "bash -s"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Деплой успешно выполнен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Проверьте приложение:" -ForegroundColor Cyan
    Write-Host "  http://${SSH_HOST}" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при выполнении деплоя (код: $LASTEXITCODE)" -ForegroundColor Red
}

# Удаляем временный файл
if (Test-Path $tempScript) {
    Remove-Item $tempScript -Force -ErrorAction SilentlyContinue
}
