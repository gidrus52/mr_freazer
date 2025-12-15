# Настройка тестовых данных
$baseUrl = "http://localhost:3001"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Настройка тестовых данных ===" -ForegroundColor Green

# 1. Регистрация админа
Write-Host "`n1. Регистрация админа..." -ForegroundColor Yellow
$registerData = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register-admin" -Method POST -Body $registerData -Headers $headers
    Write-Host "Админ зарегистрирован: $($registerResponse.user.email)" -ForegroundColor Green
} catch {
    Write-Host "Ошибка регистрации админа: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Вход в систему как админ
Write-Host "`n2. Вход в систему как админ..." -ForegroundColor Yellow
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
    exit 1
}

# 3. Создание категории
Write-Host "`n3. Создание категории..." -ForegroundColor Yellow
$categoryData = @{
    name = "Тестовая категория"
    description = "Категория для тестирования"
} | ConvertTo-Json

try {
    $categoryResponse = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method POST -Body $categoryData -Headers $authHeaders
    $categoryId = $categoryResponse.id
    Write-Host "Категория создана: $($categoryResponse.name)" -ForegroundColor Green
} catch {
    Write-Host "Ошибка создания категории: $($_.Exception.Message)" -ForegroundColor Red
    # Попробуем получить существующую категорию
    try {
        $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method GET -Headers $authHeaders
        $categoryId = $categoriesResponse[0].id
        Write-Host "Используем существующую категорию: $($categoriesResponse[0].name)" -ForegroundColor Green
    } catch {
        Write-Host "Ошибка получения категорий: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 4. Создание товара с остатком
Write-Host "`n4. Создание товара с остатком..." -ForegroundColor Yellow
$productData = @{
    name = "Тестовый товар с остатком"
    description = "Товар для тестирования заказов"
    categoryId = $categoryId
    price = 150.00
    stock = 20
} | ConvertTo-Json

try {
    $productResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method POST -Body $productData -Headers $authHeaders
    Write-Host "Товар создан успешно:" -ForegroundColor Green
    Write-Host "  ID: $($productResponse.id)" -ForegroundColor Cyan
    Write-Host "  Название: $($productResponse.name)" -ForegroundColor Cyan
    Write-Host "  Цена: $($productResponse.price)" -ForegroundColor Cyan
    Write-Host "  Остаток: $($productResponse.stock)" -ForegroundColor Cyan
} catch {
    Write-Host "Ошибка создания товара: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Тестовые данные созданы успешно ===" -ForegroundColor Green
