# Простой тест API заказов
$baseUrl = "http://localhost:3001"

Write-Host "=== Тест API заказов ===" -ForegroundColor Green

# 1. Проверка доступности API
Write-Host "`n1. Проверка доступности API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET
    Write-Host "API доступен, найдено товаров: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "API недоступен: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Регистрация пользователя
Write-Host "`n2. Регистрация пользователя..." -ForegroundColor Yellow
$registerData = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -Headers @{"Content-Type"="application/json"}
    Write-Host "Пользователь зарегистрирован" -ForegroundColor Green
} catch {
    Write-Host "Ошибка регистрации: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Вход в систему
Write-Host "`n3. Вход в систему..." -ForegroundColor Yellow
$loginData = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -Headers @{"Content-Type"="application/json"}
    $token = $loginResponse.access_token
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    Write-Host "Вход успешен" -ForegroundColor Green
} catch {
    Write-Host "Ошибка входа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Тест создания заказа с несуществующим товаром
Write-Host "`n4. Тест создания заказа с несуществующим товаром..." -ForegroundColor Yellow
$orderData = @{
    items = @(
        @{
            productId = "non-existent-id"
            quantity = 1
        }
    )
    description = "Тестовый заказ"
} | ConvertTo-Json -Depth 3

try {
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method POST -Body $orderData -Headers $authHeaders
    Write-Host "Заказ создан (неожиданно): $($orderResponse.id)" -ForegroundColor Yellow
} catch {
    Write-Host "Ошибка создания заказа (ожидаемо): $($_.Exception.Message)" -ForegroundColor Green
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Детали ошибки: $errorBody" -ForegroundColor Cyan
    }
}

Write-Host "`n=== Тест завершен ===" -ForegroundColor Green
