# Тестирование API заказов с множественными товарами
# Предполагается, что сервер запущен на порту 3000

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Тестирование API заказов с множественными товарами ===" -ForegroundColor Green

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
    if ($productsResponse.Count -ge 2) {
        $product1Id = $productsResponse[0].id
        $product2Id = $productsResponse[1].id
        Write-Host "Найдены товары:" -ForegroundColor Green
        Write-Host "  - $($productsResponse[0].name) (ID: $product1Id, Цена: $($productsResponse[0].price))" -ForegroundColor Cyan
        Write-Host "  - $($productsResponse[1].name) (ID: $product2Id, Цена: $($productsResponse[1].price))" -ForegroundColor Cyan
    } else {
        Write-Host "Недостаточно товаров. Создайте минимум 2 товара." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Ошибка получения товаров: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Создание заказа с несколькими товарами
Write-Host "`n4. Создание заказа с несколькими товарами..." -ForegroundColor Yellow
$orderData = @{
    items = @(
        @{
            productId = $product1Id
            quantity = 2
        },
        @{
            productId = $product2Id
            quantity = 1
        }
    )
    description = "Тестовый заказ с несколькими товарами"
} | ConvertTo-Json -Depth 3

try {
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -Body $orderData -Headers $authHeaders
    $orderId = $orderResponse.id
    Write-Host "Заказ создан успешно:" -ForegroundColor Green
    Write-Host "  ID: $($orderResponse.id)" -ForegroundColor Cyan
    Write-Host "  Статус: $($orderResponse.status)" -ForegroundColor Cyan
    Write-Host "  Описание: $($orderResponse.description)" -ForegroundColor Cyan
    Write-Host "  Общая сумма: $($orderResponse.totalAmount)" -ForegroundColor Cyan
    Write-Host "  Общее количество товаров: $($orderResponse.totalItems)" -ForegroundColor Cyan
    Write-Host "  Позиции заказа:" -ForegroundColor Cyan
    foreach ($item in $orderResponse.items) {
        Write-Host "    - $($item.product.name) x$($item.quantity) по цене $($item.price) = $([math]::Round($item.price * $item.quantity, 2))" -ForegroundColor White
    }
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
        Write-Host "  - Заказ $($order.id):" -ForegroundColor Cyan
        Write-Host "    Статус: $($order.status)" -ForegroundColor White
        Write-Host "    Сумма: $($order.totalAmount)" -ForegroundColor White
        Write-Host "    Товаров: $($order.totalItems)" -ForegroundColor White
        Write-Host "    Позиций: $($order.items.Count)" -ForegroundColor White
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
    Write-Host "  Статус: $($orderDetailResponse.status)" -ForegroundColor Cyan
    Write-Host "  Создан: $($orderDetailResponse.createdAt)" -ForegroundColor Cyan
    Write-Host "  Заказчик: $($orderDetailResponse.customer.email)" -ForegroundColor Cyan
    Write-Host "  Общая сумма: $($orderDetailResponse.totalAmount)" -ForegroundColor Cyan
    Write-Host "  Общее количество: $($orderDetailResponse.totalItems)" -ForegroundColor Cyan
    Write-Host "  Позиции заказа:" -ForegroundColor Cyan
    foreach ($item in $orderDetailResponse.items) {
        Write-Host "    - $($item.product.name)" -ForegroundColor White
        Write-Host "      Количество: $($item.quantity)" -ForegroundColor White
        Write-Host "      Цена за единицу: $($item.price)" -ForegroundColor White
        Write-Host "      Сумма позиции: $([math]::Round($item.price * $item.quantity, 2))" -ForegroundColor White
        Write-Host "      Остаток на складе: $($item.product.stock)" -ForegroundColor White
    }
} catch {
    Write-Host "Ошибка получения заказа: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Тест создания заказа с одним товаром
Write-Host "`n7. Создание заказа с одним товаром..." -ForegroundColor Yellow
$singleItemOrderData = @{
    items = @(
        @{
            productId = $product1Id
            quantity = 1
        }
    )
    description = "Заказ с одним товаром"
} | ConvertTo-Json -Depth 3

try {
    $singleOrderResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -Body $singleItemOrderData -Headers $authHeaders
    Write-Host "Заказ с одним товаром создан:" -ForegroundColor Green
    Write-Host "  ID: $($singleOrderResponse.id)" -ForegroundColor Cyan
    Write-Host "  Сумма: $($singleOrderResponse.totalAmount)" -ForegroundColor Cyan
    Write-Host "  Товаров: $($singleOrderResponse.totalItems)" -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка создания заказа с одним товаром: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тестирование завершено ===" -ForegroundColor Green
