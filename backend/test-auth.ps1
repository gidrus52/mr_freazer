# Тест авторизации
Write-Host "=== ТЕСТИРОВАНИЕ АВТОРИЗАЦИИ ===" -ForegroundColor Green

# 1. Проверяем публичные эндпоинты
Write-Host "`n1. Проверяем публичные эндпоинты..." -ForegroundColor Yellow
try {
    $categories = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
    Write-Host "✅ Категории доступны" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка получения категорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Регистрируем нового пользователя
Write-Host "`n2. Регистрируем нового пользователя..." -ForegroundColor Yellow
$userBody = '{"email":"testuser2@test.com","password":"user123"}'
try {
    $userResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $userBody
    Write-Host "✅ Пользователь зарегистрирован" -ForegroundColor Green
    $userData = $userResponse.Content | ConvertFrom-Json
    Write-Host "   Email: $($userData.email)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка регистрации: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Входим как пользователь
Write-Host "`n3. Входим как пользователь..." -ForegroundColor Yellow
$loginBody = '{"email":"testuser2@test.com","password":"user123"}'
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "✅ Вход успешен!" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $userToken = $loginData.accessToken
    Write-Host "   Получен токен доступа" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка входа: $($_.Exception.Message)" -ForegroundColor Red
    $userToken = $null
}

# 4. Тестируем защищенные эндпоинты с токеном пользователя
if ($userToken) {
    Write-Host "`n4. Тестируем защищенные эндпоинты с правами пользователя..." -ForegroundColor Yellow
    
    $userHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = $userToken
    }
    
    # Попытка создать категорию (должна быть запрещена)
    $categoryBody = '{"name":"Test Category","description":"Test description"}'
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers $userHeaders -Body $categoryBody
        Write-Host "❌ ОШИБКА: Пользователь смог создать категорию" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ Создание категории правильно запрещено (403)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Неожиданная ошибка: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Попытка получить список пользователей (должна быть запрещена)
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers $userHeaders
        Write-Host "❌ ОШИБКА: Пользователь смог получить список пользователей" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ Список пользователей правильно запрещен (403)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Неожиданная ошибка: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
}

# 5. Регистрируем администратора
Write-Host "`n5. Регистрируем администратора..." -ForegroundColor Yellow
$adminBody = '{"email":"testadmin2@test.com","password":"admin123"}'
try {
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminBody
    Write-Host "✅ Администратор зарегистрирован" -ForegroundColor Green
    $adminData = $adminResponse.Content | ConvertFrom-Json
    Write-Host "   Email: $($adminData.email), Роли: $($adminData.roles -join ', ')" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "ℹ️ Администратор уже существует" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Ошибка регистрации администратора: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Входим как администратор
Write-Host "`n6. Входим как администратор..." -ForegroundColor Yellow
$adminLoginBody = '{"email":"testadmin2@test.com","password":"admin123"}'
try {
    $adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
    Write-Host "✅ Вход администратора успешен!" -ForegroundColor Green
    $adminLoginData = $adminLoginResponse.Content | ConvertFrom-Json
    $adminToken = $adminLoginData.accessToken
    Write-Host "   Получен токен администратора" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка входа администратора: $($_.Exception.Message)" -ForegroundColor Red
    $adminToken = $null
}

# 7. Тестируем защищенные эндпоинты с правами администратора
if ($adminToken) {
    Write-Host "`n7. Тестируем защищенные эндпоинты с правами администратора..." -ForegroundColor Yellow
    
    $adminHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = $adminToken
    }
    
    # Создание категории
    $categoryBody = '{"name":"Admin Category","description":"Category created by admin"}'
    try {
        $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers $adminHeaders -Body $categoryBody
        Write-Host "✅ Администратор создал категорию" -ForegroundColor Green
        $categoryData = $categoryResponse.Content | ConvertFrom-Json
        Write-Host "   ID категории: $($categoryData.id)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Ошибка создания категории: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Получение списка пользователей
    try {
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers $adminHeaders
        Write-Host "✅ Администратор получил список пользователей" -ForegroundColor Green
        $usersData = $usersResponse.Content | ConvertFrom-Json
        Write-Host "   Найдено пользователей: $($usersData.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Ошибка получения пользователей: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===" -ForegroundColor Green 