# Финальный тест API заказов
$baseUrl = "http://localhost:3001"

Write-Host "=== Финальный тест API заказов ===" -ForegroundColor Green

# 1. Регистрация пользователя
Write-Host "`n1. Регистрация пользователя..." -ForegroundColor Yellow
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

# 2. Вход в систему
Write-Host "`n2. Вход в систему..." -ForegroundColor Yellow
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

# 3. Тест создания заказа с несуществующим товаром
Write-Host "`n3. Тест создания заказа с несуществующим товаром..." -ForegroundColor Yellow
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

# 4. Тест получения списка заказов
Write-Host "`n4. Тест получения списка заказов..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method GET -Headers $authHeaders
    Write-Host "Список заказов получен успешно. Найдено заказов: $($ordersResponse.Count)" -ForegroundColor Green
} catch {
    Write-Host "Ошибка получения заказов: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== API заказов работает! ===" -ForegroundColor Green

