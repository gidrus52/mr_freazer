# Простой тест API заказов
$baseUrl = "http://localhost:3001"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Простой тест API заказов ===" -ForegroundColor Green

# 1. Регистрация пользователя
Write-Host "`n1. Регистрация пользователя..." -ForegroundColor Yellow
$registerData = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -Headers $headers
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
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -Headers $headers
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
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -Headers $authHeaders
    Write-Host "Найдено товаров: $($productsResponse.Count)" -ForegroundColor Green
    
    # Найдем товар с достаточным остатком
    $availableProduct = $productsResponse | Where-Object { $_.stock -gt 0 } | Select-Object -First 1
    
    if ($availableProduct) {
        Write-Host "Найден товар с остатком:" -ForegroundColor Green
        Write-Host "  - $($availableProduct.name) (ID: $($availableProduct.id), Остаток: $($availableProduct.stock))" -ForegroundColor Cyan
        $productId = $availableProduct.id
    } else {
        Write-Host "Нет товаров с достаточным остатком. Создадим товар с остатком..." -ForegroundColor Yellow
        
        # Получаем категории
        $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method GET -Headers $authHeaders
        $categoryId = $categoriesResponse[0].id
        
        # Создаем товар с остатком
        $productData = @{
            name = "Тестовый товар с остатком"
            description = "Товар для тестирования заказов"
            categoryId = $categoryId
            price = 100.00
            stock = 10
        } | ConvertTo-Json
        
        try {
            $newProductResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method POST -Body $productData -Headers $authHeaders
            $productId = $newProductResponse.id
            Write-Host "Товар создан: $($newProductResponse.name) (ID: $productId, Остаток: $($newProductResponse.stock))" -ForegroundColor Green
        } catch {
            Write-Host "Ошибка создания товара: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "Ошибка получения товаров: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Создание заказа
Write-Host "`n4. Создание заказа..." -ForegroundColor Yellow
$orderData = @{
    items = @(
        @{
            productId = $productId
            quantity = 1
        }
    )
    description = "Тестовый заказ"
} | ConvertTo-Json -Depth 3

try {
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method POST -Body $orderData -Headers $authHeaders
    Write-Host "Заказ создан успешно:" -ForegroundColor Green
    Write-Host "  ID: $($orderResponse.id)" -ForegroundColor Cyan
    Write-Host "  Статус: $($orderResponse.status)" -ForegroundColor Cyan
    Write-Host "  Общая сумма: $($orderResponse.totalAmount)" -ForegroundColor Cyan
    Write-Host "  Общее количество товаров: $($orderResponse.totalItems)" -ForegroundColor Cyan
    Write-Host "  Позиции заказа:" -ForegroundColor Cyan
    foreach ($item in $orderResponse.items) {
        Write-Host "    - $($item.product.name) x$($item.quantity) по цене $($item.price)" -ForegroundColor White
    }
} catch {
    Write-Host "Ошибка создания заказа: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Детали ошибки: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n=== Тест завершен ===" -ForegroundColor Green
