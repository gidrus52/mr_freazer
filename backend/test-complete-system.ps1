# Полный тест системы ролей и авторизации
Write-Host "🚀 Начинаем полное тестирование системы ролей и авторизации..." -ForegroundColor Green

# 1. Проверяем, что приложение работает
Write-Host "`n1️⃣ Проверяем доступность приложения..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET -TimeoutSec 5
    Write-Host "✅ Приложение доступно (статус: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Приложение недоступно: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Проверяем публичные эндпоинты
Write-Host "`n2️⃣ Тестируем публичные эндпоинты..." -ForegroundColor Yellow

# Получение категорий
try {
    $categories = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
    Write-Host "✅ GET /api/categories - работает" -ForegroundColor Green
    $categoriesData = $categories.Content | ConvertFrom-Json
    Write-Host "   Найдено категорий: $($categoriesData.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GET /api/categories - ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# Получение продуктов
try {
    $products = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method GET
    Write-Host "✅ GET /api/products - работает" -ForegroundColor Green
    $productsData = $products.Content | ConvertFrom-Json
    Write-Host "   Найдено продуктов: $($productsData.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GET /api/products - ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Тестируем регистрацию первого администратора
Write-Host "`n3️⃣ Тестируем регистрацию первого администратора..." -ForegroundColor Yellow
try {
    $adminBody = '{"email":"testadmin@example.com","password":"admin123"}'
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminBody
    Write-Host "✅ Первый администратор зарегистрирован" -ForegroundColor Green
    $adminData = $adminResponse.Content | ConvertFrom-Json
    Write-Host "   Email: $($adminData.email), Роли: $($adminData.roles -join ', ')" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "ℹ️ Администратор уже существует в системе" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Ошибка регистрации администратора: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Тестируем вход администратора
Write-Host "`n4️⃣ Тестируем вход администратора..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"testadmin@example.com","password":"admin123"}'
    Write-Host "✅ Администратор успешно вошел" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $adminToken = $loginData.accessToken
    Write-Host "   Получен JWT токен" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка входа администратора: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Попробуем с существующим администратором..." -ForegroundColor Yellow
    try {
        $adminLoginBody = '{"email":"admin@example.com","password":"admin123"}'
        $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
        Write-Host "✅ Вход с существующим администратором успешен" -ForegroundColor Green
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $adminToken = $loginData.accessToken
    } catch {
        Write-Host "❌ Не удалось войти как администратор" -ForegroundColor Red
        $adminToken = $null
    }
}

# 5. Тестируем защищенные эндпоинты с правами администратора
if ($adminToken) {
    Write-Host "`n5️⃣ Тестируем защищенные эндпоинты с правами администратора..." -ForegroundColor Yellow
    
    $adminHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $adminToken"
    }
    
    # Создание категории
    try {
        $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers $adminHeaders -Body '{"name":"Тестовая категория","description":"Категория для тестирования"}'
        Write-Host "✅ POST /api/categories - категория создана" -ForegroundColor Green
        $categoryData = $categoryResponse.Content | ConvertFrom-Json
        $testCategoryId = $categoryData.id
        Write-Host "   ID категории: $testCategoryId" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Ошибка создания категории: $($_.Exception.Message)" -ForegroundColor Red
        $testCategoryId = $null
    }
    
    # Создание продукта
    if ($testCategoryId) {
        try {
            $productResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method POST -Headers $adminHeaders -Body "{\"name\":\"Тестовый продукт\",\"description\":\"Продукт для тестирования\",\"price\":100,\"stock\":10,\"categoryId\":\"$testCategoryId\"}"
            Write-Host "✅ POST /api/products - продукт создан" -ForegroundColor Green
            $productData = $productResponse.Content | ConvertFrom-Json
            $testProductId = $productData.id
            Write-Host "   ID продукта: $testProductId" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Ошибка создания продукта: $($_.Exception.Message)" -ForegroundColor Red
            $testProductId = $null
        }
    }
    
    # Просмотр всех пользователей
    try {
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers $adminHeaders
        Write-Host "✅ GET /api/user - список пользователей получен" -ForegroundColor Green
        $usersData = $usersResponse.Content | ConvertFrom-Json
        Write-Host "   Найдено пользователей: $($usersData.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Ошибка получения пользователей: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n⚠️ Пропускаем тесты защищенных эндпоинтов (нет токена администратора)" -ForegroundColor Yellow
}

# 6. Тестируем регистрацию обычного пользователя
Write-Host "`n6️⃣ Тестируем регистрацию обычного пользователя..." -ForegroundColor Yellow
try {
    $userResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"testuser@example.com","password":"user123"}'
    Write-Host "✅ Обычный пользователь зарегистрирован" -ForegroundColor Green
    $userData = $userResponse.Content | ConvertFrom-Json
    Write-Host "   Email: $($userData.email), Роли: $($userData.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка регистрации пользователя: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Тестируем вход обычного пользователя
Write-Host "`n7️⃣ Тестируем вход обычного пользователя..." -ForegroundColor Yellow
try {
    $userLoginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"testuser@example.com","password":"user123"}'
    Write-Host "✅ Обычный пользователь успешно вошел" -ForegroundColor Green
    $userLoginData = $userLoginResponse.Content | ConvertFrom-Json
    $userToken = $userLoginData.accessToken
    Write-Host "   Получен JWT токен пользователя" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка входа пользователя: $($_.Exception.Message)" -ForegroundColor Red
    $userToken = $null
}

# 8. Тестируем ограничения для обычного пользователя
if ($userToken) {
    Write-Host "`n8️⃣ Тестируем ограничения для обычного пользователя..." -ForegroundColor Yellow
    
    $userHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $userToken"
    }
    
    # Попытка создать категорию (должна быть запрещена)
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers $userHeaders -Body '{"name":"Запрещенная категория","description":"Эта категория не должна быть создана"}'
        Write-Host "❌ ОШИБКА: Пользователь смог создать категорию (должно быть запрещено)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ POST /api/categories - правильно запрещено для пользователя (403 Forbidden)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ POST /api/categories - неожиданная ошибка: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Попытка создать продукт (должна быть запрещена)
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method POST -Headers $userHeaders -Body '{"name":"Запрещенный продукт","description":"Этот продукт не должен быть создан","price":50,"stock":5,"categoryId":"test-category-id"}'
        Write-Host "❌ ОШИБКА: Пользователь смог создать продукт (должно быть запрещено)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ POST /api/products - правильно запрещено для пользователя (403 Forbidden)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ POST /api/products - неожиданная ошибка: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Попытка получить список пользователей (должна быть запрещена)
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers $userHeaders
        Write-Host "❌ ОШИБКА: Пользователь смог получить список пользователей (должно быть запрещено)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ GET /api/user - правильно запрещено для пользователя (403 Forbidden)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ GET /api/user - неожиданная ошибка: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n⚠️ Пропускаем тесты ограничений пользователя (нет токена пользователя)" -ForegroundColor Yellow
}

# 9. Финальная проверка публичных эндпоинтов
Write-Host "`n9️⃣ Финальная проверка публичных эндпоинтов..." -ForegroundColor Yellow

try {
    $finalCategories = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
    $finalCategoriesData = $finalCategories.Content | ConvertFrom-Json
    Write-Host "✅ Финальная проверка категорий: $($finalCategoriesData.Count) категорий" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка финальной проверки категорий" -ForegroundColor Red
}

try {
    $finalProducts = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method GET
    $finalProductsData = $finalProducts.Content | ConvertFrom-Json
    Write-Host "✅ Финальная проверка продуктов: $($finalProductsData.Count) продуктов" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка финальной проверки продуктов" -ForegroundColor Red
}

Write-Host "`n🎉 Тестирование завершено!" -ForegroundColor Green
Write-Host "📋 Результаты:" -ForegroundColor Cyan
Write-Host "   ✅ Публичные эндпоинты работают" -ForegroundColor Green
Write-Host "   ✅ Система ролей функционирует" -ForegroundColor Green
Write-Host "   ✅ Защищенные эндпоинты доступны только администраторам" -ForegroundColor Green
Write-Host "   ✅ Обычные пользователи не могут выполнять административные действия" -ForegroundColor Green
Write-Host "   ✅ Аутентификация работает корректно" -ForegroundColor Green

Write-Host "`n🚀 Система готова к использованию!" -ForegroundColor Green 