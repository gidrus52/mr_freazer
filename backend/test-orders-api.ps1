# Тестирование API заказов
# Предполагается, что сервер запущен на порту 3000

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Тестирование API заказов ===" -ForegroundColor Green

# 1. Регистрация пользователя
Write-Host "`n1. Регистрация пользователя..." -ForegroundColor Yellow
$registerData = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -Headers $headers
    Write-Host "Регистрация успешна: $($registerResponse.user.email)" -ForegroundColor Green
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
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -Headers $headers
    $token = $loginResponse.access_token
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    Write-Host "Вход успешен, получен токен" -ForegroundColor Green
} catch {
    Write-Host "Ошибка входа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Получение списка товаров
Write-Host "`n3. Получение списка товаров..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $authHeaders
    if ($productsResponse.Count -gt 0) {
        $productId = $productsResponse[0].id
        Write-Host "Найден товар: $($productsResponse[0].name) (ID: $productId)" -ForegroundColor Green
    } else {
        Write-Host "Товары не найдены. Создайте товар сначала." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Ошибка получения товаров: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Создание заказа
Write-Host "`n4. Создание заказа..." -ForegroundColor Yellow
$orderData = @{
    productId = $productId
    quantity = 2
    description = "Тестовый заказ"
} | ConvertTo-Json

try {
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -Body $orderData -Headers $authHeaders
    $orderId = $orderResponse.id
    Write-Host "Заказ создан успешно:" -ForegroundColor Green
    Write-Host "  ID: $($orderResponse.id)" -ForegroundColor Cyan
    Write-Host "  Товар: $($orderResponse.product.name)" -ForegroundColor Cyan
    Write-Host "  Количество: $($orderResponse.quantity)" -ForegroundColor Cyan
    Write-Host "  Статус: $($orderResponse.status)" -ForegroundColor Cyan
    Write-Host "  Описание: $($orderResponse.description)" -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка создания заказа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Получение списка заказов
Write-Host "`n5. Получение списка заказов..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method GET -Headers $authHeaders
    Write-Host "Найдено заказов: $($ordersResponse.Count)" -ForegroundColor Green
    foreach ($order in $ordersResponse) {
        Write-Host "  - Заказ $($order.id): $($order.product.name) x$($order.quantity) [$($order.status)]" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Ошибка получения заказов: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Получение конкретного заказа
Write-Host "`n6. Получение заказа по ID..." -ForegroundColor Yellow
try {
    $orderDetailResponse = Invoke-RestMethod -Uri "$baseUrl/orders/$orderId" -Method GET -Headers $authHeaders
    Write-Host "Детали заказа:" -ForegroundColor Green
    Write-Host "  ID: $($orderDetailResponse.id)" -ForegroundColor Cyan
    Write-Host "  Товар: $($orderDetailResponse.product.name)" -ForegroundColor Cyan
    Write-Host "  Цена: $($orderDetailResponse.product.price)" -ForegroundColor Cyan
    Write-Host "  Количество: $($orderDetailResponse.quantity)" -ForegroundColor Cyan
    Write-Host "  Статус: $($orderDetailResponse.status)" -ForegroundColor Cyan
    Write-Host "  Создан: $($orderDetailResponse.createdAt)" -ForegroundColor Cyan
    Write-Host "  Заказчик: $($orderDetailResponse.customer.email)" -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка получения заказа: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тестирование завершено ===" -ForegroundColor Green
