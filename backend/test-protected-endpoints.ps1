# Тест защищенных эндпоинтов
Write-Host "=== ТЕСТ ЗАЩИЩЕННЫХ ЭНДПОИНТОВ ===" -ForegroundColor Green

# 1. Вход пользователя
Write-Host "1. Вход пользователя..." -ForegroundColor Yellow
$loginBody = '{"email":"newuser@test.com","password":"123456"}'
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
Write-Host "Вход: $($loginResponse.StatusCode)" -ForegroundColor Green

if ($loginResponse.StatusCode -eq 201) {
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginData.accessToken
    Write-Host "Получен токен: $($accessToken.Substring(0, 50))..." -ForegroundColor Green
    
    # 2. Попытка создать категорию как обычный пользователь (должно быть 403)
    Write-Host "2. Попытка создать категорию как пользователь (ожидается 403)..." -ForegroundColor Yellow
    try {
        $categoryBody = '{"name":"Test Category","description":"Test Description"}'
        $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$accessToken} -Body $categoryBody
        Write-Host "Создание категории: $($categoryResponse.StatusCode)" -ForegroundColor Red
    } catch {
        Write-Host "Создание категории заблокировано: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    }
    
    # 3. Попытка получить список пользователей как обычный пользователь (должно быть 403)
    Write-Host "3. Попытка получить пользователей как пользователь (ожидается 403)..." -ForegroundColor Yellow
    try {
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers @{"Authorization"=$accessToken}
        Write-Host "Получение пользователей: $($usersResponse.StatusCode)" -ForegroundColor Red
    } catch {
        Write-Host "Получение пользователей заблокировано: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    }
}

# 4. Вход администратора
Write-Host "4. Вход администратора..." -ForegroundColor Yellow
$adminLoginBody = '{"email":"admin@example.com","password":"admin123"}'
$adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
Write-Host "Вход админа: $($adminLoginResponse.StatusCode)" -ForegroundColor Green

if ($adminLoginResponse.StatusCode -eq 201) {
    $adminLoginData = $adminLoginResponse.Content | ConvertFrom-Json
    $adminToken = $adminLoginData.accessToken
    Write-Host "Получен токен админа: $($adminToken.Substring(0, 50))..." -ForegroundColor Green
    
    # 5. Создание категории как администратор
    Write-Host "5. Создание категории как администратор..." -ForegroundColor Yellow
    try {
        $categoryBody = '{"name":"Admin Category","description":"Admin Description"}'
        $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $categoryBody
        Write-Host "Создание категории админом: $($categoryResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "Ошибка создания категории админом: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 6. Получение списка пользователей как администратор
    Write-Host "6. Получение пользователей как администратор..." -ForegroundColor Yellow
    try {
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers @{"Authorization"=$adminToken}
        Write-Host "Получение пользователей админом: $($usersResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "Ошибка получения пользователей админом: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "=== ТЕСТ ЗАВЕРШЕН ===" -ForegroundColor Green 