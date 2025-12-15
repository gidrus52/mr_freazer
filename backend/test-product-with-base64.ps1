# Тест создания товара с base64 изображением
Write-Host "=== ТЕСТ СОЗДАНИЯ ТОВАРА С BASE64 ИЗОБРАЖЕНИЕМ ===" -ForegroundColor Green

# 1. Вход администратора
Write-Host "1. Вход администратора..." -ForegroundColor Yellow
$adminLoginBody = '{"email":"admin@example.com","password":"admin123"}'
$adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
Write-Host "Вход админа: $($adminLoginResponse.StatusCode)" -ForegroundColor Green

if ($adminLoginResponse.StatusCode -eq 201) {
    $adminLoginData = $adminLoginResponse.Content | ConvertFrom-Json
    $adminToken = $adminLoginData.accessToken
    Write-Host "Получен токен админа" -ForegroundColor Green
    
    # 2. Создание товара с URL изображения
    Write-Host "2. Создание товара с URL изображения..." -ForegroundColor Yellow
    $productBody1 = '{
        "name": "Samsung Galaxy S24",
        "description": "Флагманский смартфон Samsung с AI функциями",
        "price": 89999.99,
        "categoryId": "00000000-0000-0000-0000-000000000001",
        "stock": 15,
        "imageUrl": "https://via.placeholder.com/400x400/28a745/FFFFFF?text=Samsung+Galaxy+S24"
    }'
    
    $productResponse1 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $productBody1
    Write-Host "Создание товара с URL: $($productResponse1.StatusCode)" -ForegroundColor Green
    
    if ($productResponse1.StatusCode -eq 201) {
        $productData1 = $productResponse1.Content | ConvertFrom-Json
        Write-Host "✅ Товар с URL изображения создан успешно!" -ForegroundColor Green
        Write-Host "   ID: $($productData1.id)" -ForegroundColor Cyan
        Write-Host "   Изображение URL: $($productData1.imageUrl)" -ForegroundColor Cyan
    }
    
    # 3. Создание товара с base64 изображением (простой цветной квадрат)
    Write-Host "3. Создание товара с base64 изображением..." -ForegroundColor Yellow
    
    # Простое base64 изображение (красный квадрат 1x1 пиксель)
    $base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    $productBody2 = '{
        "name": "MacBook Pro M3",
        "description": "Мощный ноутбук с процессором Apple M3",
        "price": 199999.99,
        "categoryId": "00000000-0000-0000-0000-000000000001",
        "stock": 8,
        "imageData": "' + $base64Image + '",
        "imageType": "png"
    }'
    
    $productResponse2 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $productBody2
    Write-Host "Создание товара с base64: $($productResponse2.StatusCode)" -ForegroundColor Green
    
    if ($productResponse2.StatusCode -eq 201) {
        $productData2 = $productResponse2.Content | ConvertFrom-Json
        Write-Host "✅ Товар с base64 изображением создан успешно!" -ForegroundColor Green
        Write-Host "   ID: $($productData2.id)" -ForegroundColor Cyan
        Write-Host "   Тип изображения: $($productData2.imageType)" -ForegroundColor Cyan
        Write-Host "   Размер base64 данных: $($productData2.imageData.Length) символов" -ForegroundColor Cyan
    }
    
    # 4. Создание товара без изображения
    Write-Host "4. Создание товара без изображения..." -ForegroundColor Yellow
    $productBody3 = '{
        "name": "AirPods Pro",
        "description": "Беспроводные наушники с шумоподавлением",
        "price": 24999.99,
        "categoryId": "00000000-0000-0000-0000-000000000001",
        "stock": 25
    }'
    
    $productResponse3 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $productBody3
    Write-Host "Создание товара без изображения: $($productResponse3.StatusCode)" -ForegroundColor Green
    
    if ($productResponse3.StatusCode -eq 201) {
        $productData3 = $productResponse3.Content | ConvertFrom-Json
        Write-Host "✅ Товар без изображения создан успешно!" -ForegroundColor Green
        Write-Host "   ID: $($productData3.id)" -ForegroundColor Cyan
        Write-Host "   Изображение: отсутствует" -ForegroundColor Gray
    }
    
    # 5. Получение списка товаров
    Write-Host "5. Получение списка товаров..." -ForegroundColor Yellow
    $productsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET
    Write-Host "Получение товаров: $($productsResponse.StatusCode)" -ForegroundColor Green
    
    if ($productsResponse.StatusCode -eq 200) {
        $products = $productsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Получено товаров: $($products.Count)" -ForegroundColor Green
        foreach ($product in $products) {
            Write-Host "   - $($product.name) (ID: $($product.id))" -ForegroundColor Cyan
            if ($product.imageUrl) {
                Write-Host "     Изображение URL: $($product.imageUrl)" -ForegroundColor Yellow
            } elseif ($product.imageData) {
                Write-Host "     Изображение Base64: $($product.imageType) ($($product.imageData.Length) символов)" -ForegroundColor Magenta
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
