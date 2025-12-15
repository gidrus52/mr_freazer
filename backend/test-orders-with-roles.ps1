# Тест создания заказа с номерами и проверка ролей пользователя

Write-Host "=== Тест заказов с номерами и ролями ===" -ForegroundColor Green

# 1. Регистрация пользователя
Write-Host "`n1. Регистрация пользователя..." -ForegroundColor Yellow
$registerBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "Пользователь зарегистрирован:" -ForegroundColor Green
    Write-Host "ID: $($registerResponse.id)" -ForegroundColor Cyan
    Write-Host "Email: $($registerResponse.email)" -ForegroundColor Cyan
    Write-Host "Роли: $($registerResponse.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка регистрации: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Вход пользователя
Write-Host "`n2. Вход пользователя..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "Вход выполнен успешно" -ForegroundColor Green
    Write-Host "Токен получен: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка входа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Получение информации о пользователе
Write-Host "`n3. Получение информации о пользователе..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = $token
}

try {
    $userResponse = Invoke-RestMethod -Uri "http://localhost:3001/user/testuser@example.com" -Method GET -Headers $headers
    Write-Host "Информация о пользователе:" -ForegroundColor Green
    Write-Host "ID: $($userResponse.id)" -ForegroundColor Cyan
    Write-Host "Email: $($userResponse.email)" -ForegroundColor Cyan
    Write-Host "Роли: $($userResponse.roles -join ', ')" -ForegroundColor Cyan
    Write-Host "Дата создания: $($userResponse.updatedAt)" -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка получения пользователя: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Создание заказа
Write-Host "`n4. Создание заказа..." -ForegroundColor Yellow
$orderBody = @{
    items = @(
        @{
            productId = "test-product-id"
            quantity = 2
        }
    )
    description = "Тестовый заказ с номером"
} | ConvertTo-Json -Depth 3

try {
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:3001/order" -Method POST -Body $orderBody -ContentType "application/json" -Headers $headers
    Write-Host "Заказ создан успешно:" -ForegroundColor Green
    Write-Host "ID заказа: $($orderResponse.id)" -ForegroundColor Cyan
    Write-Host "Номер заказа: $($orderResponse.orderNumber)" -ForegroundColor Cyan
    Write-Host "Статус: $($orderResponse.status)" -ForegroundColor Cyan
    Write-Host "Общая сумма: $($orderResponse.totalAmount)" -ForegroundColor Cyan
    Write-Host "Количество товаров: $($orderResponse.totalItems)" -ForegroundColor Cyan
    Write-Host "Информация о клиенте:" -ForegroundColor Yellow
    Write-Host "  ID клиента: $($orderResponse.customer.id)" -ForegroundColor Cyan
    Write-Host "  Email клиента: $($orderResponse.customer.email)" -ForegroundColor Cyan
    Write-Host "  Роли клиента: $($orderResponse.customer.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка создания заказа: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Детали ошибки: $($_.Exception.Response)" -ForegroundColor Red
}

# 5. Получение всех заказов
Write-Host "`n5. Получение всех заказов..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "http://localhost:3001/order" -Method GET -Headers $headers
    Write-Host "Найдено заказов: $($ordersResponse.Count)" -ForegroundColor Green
    foreach ($order in $ordersResponse) {
        Write-Host "`nЗаказ:" -ForegroundColor Yellow
        Write-Host "  ID: $($order.id)" -ForegroundColor Cyan
        Write-Host "  Номер: $($order.orderNumber)" -ForegroundColor Cyan
        Write-Host "  Статус: $($order.status)" -ForegroundColor Cyan
        Write-Host "  Сумма: $($order.totalAmount)" -ForegroundColor Cyan
        Write-Host "  Клиент: $($order.customer.email)" -ForegroundColor Cyan
        Write-Host "  Роли клиента: $($order.customer.roles -join ', ')" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Ошибка получения заказов: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тест завершен ===" -ForegroundColor Green
