# Простой тест создания категории
Write-Host "=== Простой тест создания категории ===" -ForegroundColor Green

# Ждем немного, чтобы сервер запустился
Start-Sleep -Seconds 5

# 1. Логин
Write-Host "1. Логин..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login успешен!" -ForegroundColor Green
    Write-Host "Access token получен" -ForegroundColor Cyan
    
    # 2. Создание категории
    Write-Host "`n2. Создание категории..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "Тестовая категория"
        description = "Описание тестовой категории"
        isActive = $true
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = $loginResponse.accessToken
        "Content-Type" = "application/json"
    }

    $categoryResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method POST -Body $categoryBody -Headers $headers
    Write-Host "Категория создана успешно!" -ForegroundColor Green
    Write-Host "ID категории: $($categoryResponse.id)" -ForegroundColor Cyan
    
    # 3. Получение списка категорий
    Write-Host "`n3. Получение списка категорий..." -ForegroundColor Yellow
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method GET
    Write-Host "Найдено категорий: $($categoriesResponse.Count)" -ForegroundColor Green
    
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Детали: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Тест завершен ===" -ForegroundColor Green 