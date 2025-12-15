# Тестирование API продукта

Write-Host "=== Тестирование Product API ===" -ForegroundColor Green

# 1. Получение всех продуктов
Write-Host "`n1. Получение всех продуктов:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products" -Method GET
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Создание нового продукта
Write-Host "`n2. Создание нового продукта:" -ForegroundColor Yellow
$newProduct = @{
    name = "iPad Pro"
    description = "Планшет Apple iPad Pro"
    categoryId = "3"
    price = 1299.99
    stock = 15
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products" -Method POST -Headers @{"Content-Type"="application/json"} -Body $newProduct
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 2.1. Создание продукта с указанной категорией
Write-Host "`n2.1. Создание продукта с указанной категорией:" -ForegroundColor Yellow
$newProductWithCategory = @{
    name = "MacBook Air"
    description = "Легкий ноутбук Apple MacBook Air"
    categoryId = "2"
    price = 1499.99
    stock = 20
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products" -Method POST -Headers @{"Content-Type"="application/json"} -Body $newProductWithCategory
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Получение продукта по ID
Write-Host "`n3. Получение продукта по ID (1):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products/1" -Method GET
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Обновление продукта
Write-Host "`n4. Обновление продукта (ID: 1):" -ForegroundColor Yellow
$updateData = @{
    categoryId = "1"
    price = 949.99
    stock = 45
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products/1" -Method PATCH -Headers @{"Content-Type"="application/json"} -Body $updateData
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Мягкое удаление продукта
Write-Host "`n5. Мягкое удаление продукта (ID: 2):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products/2/soft" -Method DELETE
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Проверка списка после мягкого удаления
Write-Host "`n6. Проверка списка после мягкого удаления:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products" -Method GET
    Write-Host "Статус: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Ответ: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тестирование завершено ===" -ForegroundColor Green 