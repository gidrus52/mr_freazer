# Простой тест авторизации
Write-Host "=== ПРОСТОЙ ТЕСТ АВТОРИЗАЦИИ ===" -ForegroundColor Green

# 1. Регистрируем нового пользователя
Write-Host "`n1. Регистрируем пользователя..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"simple@test.com","password":"123456"}'
    Write-Host "✅ Регистрация успешна: $($response.StatusCode)" -ForegroundColor Green
    $userData = $response.Content | ConvertFrom-Json
    Write-Host "   ID: $($userData.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка регистрации: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Входим как пользователь
Write-Host "`n2. Входим как пользователь..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"simple@test.com","password":"123456"}'
    Write-Host "✅ Вход успешен: $($response.StatusCode)" -ForegroundColor Green
    $loginData = $response.Content | ConvertFrom-Json
    Write-Host "   Получен токен доступа" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка входа: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ТЕСТ ЗАВЕРШЕН ===" -ForegroundColor Green 