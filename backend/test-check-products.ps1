# Проверка товаров в базе данных
$baseUrl = "http://localhost:3001"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Проверка товаров в базе данных ===" -ForegroundColor Green

# 1. Вход в систему как админ
Write-Host "`n1. Вход в систему как админ..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@example.com"
    password = "admin123"
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
    Write-Host "Попробуем зарегистрировать админа..." -ForegroundColor Yellow
    
    # Регистрация админа
    $registerData = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register-admin" -Method POST -Body $registerData -Headers $headers
        Write-Host "Админ зарегистрирован: $($registerResponse.user.email)" -ForegroundColor Green
        
        # Повторный вход
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -Headers $headers
        $token = $loginResponse.access_token
        $authHeaders = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }
        Write-Host "Вход успешен после регистрации" -ForegroundColor Green
    } catch {
        Write-Host "Ошибка регистрации админа: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 2. Получение списка товаров
Write-Host "`n2. Получение списка товаров..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -Headers $authHeaders
    Write-Host "Найдено товаров: $($productsResponse.Count)" -ForegroundColor Green
    
    if ($productsResponse.Count -eq 0) {
        Write-Host "Товары не найдены. Создадим тестовые товары..." -ForegroundColor Yellow
        
        # Получаем категории
        $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method GET -Headers $authHeaders
        if ($categoriesResponse.Count -eq 0) {
            Write-Host "Создаем тестовую категорию..." -ForegroundColor Yellow
            $categoryData = @{
                name = "Тестовая категория"
                description = "Категория для тестирования"
            } | ConvertTo-Json
            
            $categoryResponse = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method POST -Body $categoryData -Headers $authHeaders
            $categoryId = $categoryResponse.id
            Write-Host "Категория создана: $($categoryResponse.name)" -ForegroundColor Green
        } else {
            $categoryId = $categoriesResponse[0].id
            Write-Host "Используем существующую категорию: $($categoriesResponse[0].name)" -ForegroundColor Green
        }
        
        # Создаем тестовые товары
        $testProducts = @(
            @{
                name = "Тестовый товар 1"
                description = "Описание товара 1"
                categoryId = $categoryId
                price = 100.00
                stock = 10
            },
            @{
                name = "Тестовый товар 2"
                description = "Описание товара 2"
                categoryId = $categoryId
                price = 200.00
                stock = 5
            }
        )
        
        foreach ($productData in $testProducts) {
            try {
                $productResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method POST -Body ($productData | ConvertTo-Json) -Headers $authHeaders
                Write-Host "Товар создан: $($productResponse.name) (ID: $($productResponse.id), Остаток: $($productResponse.stock))" -ForegroundColor Green
            } catch {
                Write-Host "Ошибка создания товара '$($productData.name)': $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Получаем обновленный список товаров
        $productsResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -Headers $authHeaders
    }
    
    Write-Host "`nТовары в базе данных:" -ForegroundColor Green
    foreach ($product in $productsResponse) {
        Write-Host "  - $($product.name)" -ForegroundColor Cyan
        Write-Host "    ID: $($product.id)" -ForegroundColor White
        Write-Host "    Цена: $($product.price)" -ForegroundColor White
        Write-Host "    Остаток: $($product.stock)" -ForegroundColor White
        Write-Host "    Категория: $($product.category.name)" -ForegroundColor White
        Write-Host ""
    }
    
} catch {
    Write-Host "Ошибка получения товаров: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "=== Проверка завершена ===" -ForegroundColor Green
