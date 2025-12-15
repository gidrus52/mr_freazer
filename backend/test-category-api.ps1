# Тестирование API категорий

Write-Host "=== Тестирование Category API ===" -ForegroundColor Green

# 1. Получение всех категорий
Write-Host "`n1. Получение всех категорий:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/categories" -Method GET
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Создание новой категории
Write-Host "`n2. Создание новой категории:" -ForegroundColor Yellow
$newCategory = @{
    name = "Аксессуары"
    description = "Аксессуары для электроники"
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/categories" -Method POST -Headers @{"Content-Type"="application/json"} -Body $newCategory
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Получение категории по ID
Write-Host "`n3. Получение категории по ID (1):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/categories/1" -Method GET
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Обновление категории
Write-Host "`n4. Обновление категории (ID: 1):" -ForegroundColor Yellow
$updateData = @{
    name = "Премиум смартфоны"
    description = "Дорогие смартфоны премиум класса"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/categories/1" -Method PATCH -Headers @{"Content-Type"="application/json"} -Body $updateData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Мягкое удаление категории
Write-Host "`n5. Мягкое удаление категории (ID: 3):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/categories/3/soft" -Method DELETE
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Проверка списка после мягкого удаления
Write-Host "`n6. Проверка списка после мягкого удаления:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/categories" -Method GET
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тестирование завершено ===" -ForegroundColor Green 