# Скрипт для добавления категории "тет"
Write-Host "=== Добавление категории 'тет' ===" -ForegroundColor Green

# 1. Логин как админ
Write-Host "1. Логин как админ..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    Write-Host "Login response:" -ForegroundColor Cyan
    $loginResponse | ConvertTo-Json -Depth 3
    
    # Извлекаем access token
    $accessToken = $loginResponse.accessToken
    Write-Host "Access token: $accessToken" -ForegroundColor Cyan
    
    # 2. Создание категории "тет"
    Write-Host "`n2. Создание категории 'тет'..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "тет"
        description = "Категория тет"
        isActive = $true
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    
    $categoryResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method POST -Body $categoryBody -Headers $headers
    
    Write-Host "Category creation response:" -ForegroundColor Cyan
    $categoryResponse | ConvertTo-Json -Depth 3
    
    # 3. Получение списка категорий для проверки
    Write-Host "`n3. Получение списка категорий..." -ForegroundColor Yellow
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method GET
    
    Write-Host "Categories list:" -ForegroundColor Cyan
    $categoriesResponse | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== Категория 'тет' успешно добавлена ===" -ForegroundColor Green
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
} 