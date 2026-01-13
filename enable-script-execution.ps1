# Скрипт для включения выполнения PowerShell скриптов в Windows
# Запустите этот скрипт от имени администратора для изменения политики на уровне машины
# Или запустите без прав администратора для изменения политики текущего пользователя

Write-Host "Текущая политика выполнения:" -ForegroundColor Yellow
Get-ExecutionPolicy -List | Format-Table -AutoSize

Write-Host "`nВыберите действие:" -ForegroundColor Cyan
Write-Host "1. Установить RemoteSigned для текущего пользователя (рекомендуется)"
Write-Host "2. Установить Bypass для текущего пользователя (менее безопасно)"
Write-Host "3. Установить RemoteSigned для всей машины (требует прав администратора)"
Write-Host "4. Установить Bypass для всей машины (требует прав администратора, менее безопасно)"
Write-Host "5. Показать текущую политику и выйти"

$choice = Read-Host "`nВведите номер (1-5)"

switch ($choice) {
    "1" {
        Write-Host "Установка RemoteSigned для текущего пользователя..." -ForegroundColor Green
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "Готово! Политика установлена." -ForegroundColor Green
    }
    "2" {
        Write-Host "Установка Bypass для текущего пользователя..." -ForegroundColor Yellow
        Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser -Force
        Write-Host "Готово! Политика установлена." -ForegroundColor Green
    }
    "3" {
        Write-Host "Попытка установки RemoteSigned для всей машины..." -ForegroundColor Green
        try {
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force
            Write-Host "Готово! Политика установлена для всей машины." -ForegroundColor Green
        }
        catch {
            Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Возможно, требуются права администратора. Попробуйте запустить PowerShell от имени администратора." -ForegroundColor Yellow
        }
    }
    "4" {
        Write-Host "Попытка установки Bypass для всей машины..." -ForegroundColor Yellow
        try {
            Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope LocalMachine -Force
            Write-Host "Готово! Политика установлена для всей машины." -ForegroundColor Green
        }
        catch {
            Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Возможно, требуются права администратора. Попробуйте запустить PowerShell от имени администратора." -ForegroundColor Yellow
        }
    }
    "5" {
        Write-Host "Текущая политика выполнения:" -ForegroundColor Cyan
        Get-ExecutionPolicy -List | Format-Table -AutoSize
        exit
    }
    default {
        Write-Host "Неверный выбор." -ForegroundColor Red
        exit
    }
}

Write-Host "`nОбновленная политика выполнения:" -ForegroundColor Yellow
Get-ExecutionPolicy -List | Format-Table -AutoSize

Write-Host "`nТеперь вы можете запускать PowerShell скрипты!" -ForegroundColor Green

