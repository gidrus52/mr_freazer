# Полный тест системы авторизации и ролей
Write-Host "=== ТЕСТ ПОЛНОЙ СИСТЕМЫ ===" -ForegroundColor Green

# 1. Регистрация нового пользователя
Write-Host "1. Регистрация пользователя..." -ForegroundColor Yellow
$registerBody = '{"email":"testuser@example.com","password":"123456"}'
$registerResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $registerBody
Write-Host "Регистрация: $($registerResponse.StatusCode)" -ForegroundColor Green

# 2. Вход пользователя
Write-Host "2. Вход пользователя..." -ForegroundColor Yellow
$loginBody = '{"email":"testuser@example.com","password":"123456"}'
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
Write-Host "Вход: $($loginResponse.StatusCode)" -ForegroundColor Green

if ($loginResponse.StatusCode -eq 201) {
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginData.accessToken
    Write-Host "Получен токен: $($accessToken.Substring(0, 50))..." -ForegroundColor Green
    
    # 3. Попытка создать категорию как обычный пользователь (должно быть 403)
    Write-Host "3. Попытка создать категорию как пользователь (ожидается 403)..." -ForegroundColor Yellow
    try {
        $categoryBody = '{"name":"Test Category","description":"Test Description"}'
        $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$accessToken} -Body $categoryBody
        Write-Host "Создание категории: $($categoryResponse.StatusCode)" -ForegroundColor Red
    } catch {
        Write-Host "Создание категории заблокировано: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    }
    
    # 4. Попытка получить список пользователей как обычный пользователь (должно быть 403)
    Write-Host "4. Попытка получить пользователей как пользователь (ожидается 403)..." -ForegroundColor Yellow
    try {
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers @{"Authorization"=$accessToken}
        Write-Host "Получение пользователей: $($usersResponse.StatusCode)" -ForegroundColor Red
    } catch {
        Write-Host "Получение пользователей заблокировано: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    }
}

# 5. Регистрация первого администратора
Write-Host "5. Регистрация первого администратора..." -ForegroundColor Yellow
$adminBody = '{"email":"admin@example.com","password":"admin123"}'
$adminResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminBody
Write-Host "Регистрация админа: $($adminResponse.StatusCode)" -ForegroundColor Green

# 6. Вход администратора
Write-Host "6. Вход администратора..." -ForegroundColor Yellow
$adminLoginBody = '{"email":"admin@example.com","password":"admin123"}'
$adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
Write-Host "Вход админа: $($adminLoginResponse.StatusCode)" -ForegroundColor Green

if ($adminLoginResponse.StatusCode -eq 201) {
    $adminLoginData = $adminLoginResponse.Content | ConvertFrom-Json
    $adminToken = $adminLoginData.accessToken
    Write-Host "Получен токен админа: $($adminToken.Substring(0, 50))..." -ForegroundColor Green
    
    # 7. Создание категории как администратор
    Write-Host "7. Создание категории как администратор..." -ForegroundColor Yellow
    $categoryBody = '{"name":"Admin Category","description":"Admin Description"}'
    $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $categoryBody
    Write-Host "Создание категории админом: $($categoryResponse.StatusCode)" -ForegroundColor Green
    
    # 8. Получение списка пользователей как администратор
    Write-Host "8. Получение пользователей как администратор..." -ForegroundColor Yellow
    $usersResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers @{"Authorization"=$adminToken}
    Write-Host "Получение пользователей админом: $($usersResponse.StatusCode)" -ForegroundColor Green
    
    # 9. Создание продукта как администратор
    Write-Host "9. Создание продукта как администратор..." -ForegroundColor Yellow
    $productBody = '{"name":"Admin Product","description":"Admin Product Description","price":99.99,"stock":10,"categoryId":"65fa161f-ed21-42c3-804d-c7acbc541b66"}'
    $productResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $productBody
    Write-Host "Создание продукта админом: $($productResponse.StatusCode)" -ForegroundColor Green
}

# 10. Тест публичных эндпоинтов
Write-Host "10. Тест публичных эндпоинтов..." -ForegroundColor Yellow
$categoriesResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
Write-Host "Получение категорий (публично): $($categoriesResponse.StatusCode)" -ForegroundColor Green

$productsResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method GET
Write-Host "Получение продуктов (публично): $($productsResponse.StatusCode)" -ForegroundColor Green

Write-Host "=== ТЕСТ ЗАВЕРШЕН ===" -ForegroundColor Green 