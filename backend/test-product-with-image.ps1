# Тест создания товара с изображением
Write-Host "=== ТЕСТ СОЗДАНИЯ ТОВАРА С ИЗОБРАЖЕНИЕМ ===" -ForegroundColor Green

# 1. Вход администратора
Write-Host "1. Вход администратора..." -ForegroundColor Yellow
$adminLoginBody = '{"email":"admin@example.com","password":"admin123"}'
$adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
Write-Host "Вход админа: $($adminLoginResponse.StatusCode)" -ForegroundColor Green

if ($adminLoginResponse.StatusCode -eq 201) {
    $adminLoginData = $adminLoginResponse.Content | ConvertFrom-Json
    $adminToken = $adminLoginData.accessToken
    Write-Host "Получен токен админа" -ForegroundColor Green
    
    # 2. Создание товара с изображением
    Write-Host "2. Создание товара с изображением..." -ForegroundColor Yellow
    $productBody = '{
        "name": "iPhone 15 Pro",
        "description": "Новейший смартфон Apple с камерой 48 МП",
        "price": 99999.99,
        "categoryId": "00000000-0000-0000-0000-000000000001",
        "stock": 10,
        "imageUrl": "https://via.placeholder.com/400x400/007AFF/FFFFFF?text=iPhone+15+Pro"
    }'
    
    $productResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $productBody
    Write-Host "Создание товара с изображением: $($productResponse.StatusCode)" -ForegroundColor Green
    
    if ($productResponse.StatusCode -eq 201) {
        $productData = $productResponse.Content | ConvertFrom-Json
        Write-Host "✅ Товар с изображением создан успешно!" -ForegroundColor Green
        Write-Host "   ID: $($productData.id)" -ForegroundColor Cyan
        Write-Host "   Название: $($productData.name)" -ForegroundColor Cyan
        Write-Host "   Цена: $($productData.price)" -ForegroundColor Cyan
        Write-Host "   Изображение: $($productData.imageUrl)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка создания товара: $($productResponse.StatusCode)" -ForegroundColor Red
        Write-Host "   Ответ: $($productResponse.Content)" -ForegroundColor Red
    }
    
    # 3. Создание товара без изображения
    Write-Host "3. Создание товара без изображения..." -ForegroundColor Yellow
    $productBody2 = '{
        "name": "MacBook Air M2",
        "description": "Ультратонкий ноутбук с процессором Apple M2",
        "price": 129999.99,
        "categoryId": "00000000-0000-0000-0000-000000000001",
        "stock": 5
    }'
    
    $productResponse2 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $productBody2
    Write-Host "Создание товара без изображения: $($productResponse2.StatusCode)" -ForegroundColor Green
    
    if ($productResponse2.StatusCode -eq 201) {
        $productData2 = $productResponse2.Content | ConvertFrom-Json
        Write-Host "✅ Товар без изображения создан успешно!" -ForegroundColor Green
        Write-Host "   ID: $($productData2.id)" -ForegroundColor Cyan
        Write-Host "   Название: $($productData2.name)" -ForegroundColor Cyan
        Write-Host "   Цена: $($productData2.price)" -ForegroundColor Cyan
        Write-Host "   Изображение: $($productData2.imageUrl)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка создания товара: $($productResponse2.StatusCode)" -ForegroundColor Red
        Write-Host "   Ответ: $($productResponse2.Content)" -ForegroundColor Red
    }
    
    # 4. Получение списка товаров
    Write-Host "4. Получение списка товаров..." -ForegroundColor Yellow
    $productsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET
    Write-Host "Получение товаров: $($productsResponse.StatusCode)" -ForegroundColor Green
    
    if ($productsResponse.StatusCode -eq 200) {
        $products = $productsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Получено товаров: $($products.Count)" -ForegroundColor Green
        foreach ($product in $products) {
            Write-Host "   - $($product.name) (ID: $($product.id))" -ForegroundColor Cyan
            if ($product.imageUrl) {
                Write-Host "     Изображение: $($product.imageUrl)" -ForegroundColor Yellow
            } else {
                Write-Host "     Изображение: отсутствует" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ Ошибка получения товаров: $($productsResponse.StatusCode)" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Ошибка входа администратора: $($adminLoginResponse.StatusCode)" -ForegroundColor Red
    Write-Host "   Ответ: $($adminLoginResponse.Content)" -ForegroundColor Red
}

Write-Host "`n=== ТЕСТ ЗАВЕРШЕН ===" -ForegroundColor Green
