# Обертка для запуска скриптов с обходом политики выполнения
# Использование: .\run-script.ps1 -ScriptPath ".\backend\test-login.ps1"

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptPath
)

if (-not (Test-Path $ScriptPath)) {
    Write-Host "Ошибка: Файл $ScriptPath не найден!" -ForegroundColor Red
    exit 1
}

Write-Host "Запуск скрипта: $ScriptPath" -ForegroundColor Cyan
Write-Host "Используется обход политики выполнения для текущей сессии..." -ForegroundColor Yellow

# Устанавливаем Bypass только для текущего процесса
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Запускаем скрипт
& $ScriptPath

