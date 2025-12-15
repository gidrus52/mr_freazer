# Тестирование API с правами администратора

Write-Host "=== Тестирование Admin API ===" -ForegroundColor Green

# Переменные
$baseUrl = "http://localhost:3002/api"
$adminToken = ""
$userToken = ""

# 1. Создание первого администратора
Write-Host "`n1. Создание первого администратора:" -ForegroundColor Yellow
$adminData = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Вход администратора
Write-Host "`n2. Вход администратора:" -ForegroundColor Yellow
$loginData = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    
    # Извлекаем токен из ответа
    $responseData = $response.Content | ConvertFrom-Json
    $adminToken = $responseData.accessToken
    Write-Host "Токен получен: $($adminToken.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Создание категории (требует права администратора)
Write-Host "`n3. Создание категории (с правами администратора):" -ForegroundColor Yellow
$categoryData = @{
    name = "Электроника"
    description = "Электронные устройства и гаджеты"
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/categories" -Method POST -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $adminToken"
    } -Body $categoryData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Создание продукта (требует права администратора)
Write-Host "`n4. Создание продукта (с правами администратора):" -ForegroundColor Yellow
$productData = @{
    name = "MacBook Pro"
    description = "Мощный ноутбук для профессионалов"
    categoryId = "1"  # Используем ID первой категории
    price = 2499.99
    stock = 25
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -Method POST -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $adminToken"
    } -Body $productData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Просмотр всех пользователей (требует права администратора)
Write-Host "`n5. Просмотр всех пользователей (с правами администратора):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/user" -Method GET -Headers @{
        "Authorization"="Bearer $adminToken"
    }
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Регистрация обычного пользователя
Write-Host "`n6. Регистрация обычного пользователя:" -ForegroundColor Yellow
$userData = @{
    email = "user@example.com"
    password = "user123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $userData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Вход обычного пользователя
Write-Host "`n7. Вход обычного пользователя:" -ForegroundColor Yellow
$userLoginData = @{
    email = "user@example.com"
    password = "user123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $userLoginData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    
    # Извлекаем токен пользователя
    $responseData = $response.Content | ConvertFrom-Json
    $userToken = $responseData.accessToken
    Write-Host "Токен пользователя получен: $($userToken.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Попытка создания продукта без прав администратора
Write-Host "`n8. Попытка создания продукта без прав администратора:" -ForegroundColor Yellow
$productDataUser = @{
    name = "iPhone 15"
    description = "Смартфон Apple"
    categoryId = "1"
    price = 999.99
    stock = 10
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -Method POST -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $userToken"
    } -Body $productDataUser
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ожидаемая ошибка (403 Forbidden): $($_.Exception.Message)" -ForegroundColor Yellow
}

# 9. Просмотр продуктов (доступно всем авторизованным)
Write-Host "`n9. Просмотр продуктов (с токеном пользователя):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -Method GET -Headers @{
        "Authorization"="Bearer $userToken"
    }
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тестирование завершено ===" -ForegroundColor Green 