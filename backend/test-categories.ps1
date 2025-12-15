# Тестирование API категорий и подкатегорий

$baseUrl = "http://localhost:3001/api"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Тестирование API категорий ===" -ForegroundColor Green

# 1. Создание корневой категории "Электроника"
Write-Host "1. Создание корневой категории 'Электроника'..." -ForegroundColor Yellow
$electronicsData = @{
    name = "Электроника"
    description = "Электронные товары и устройства"
} | ConvertTo-Json

try {
    $electronicsResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Body $electronicsData -Headers $headers
    $electronicsId = $electronicsResponse.id
    Write-Host "✅ Создана категория 'Электроника' с ID: $electronicsId" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка создания категории: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Создание подкатегории "Смартфоны"
Write-Host "2. Создание подкатегории 'Смартфоны'..." -ForegroundColor Yellow
$smartphonesData = @{
    name = "Смартфоны"
    description = "Мобильные телефоны и смартфоны"
    parentId = $electronicsId
} | ConvertTo-Json

try {
    $smartphonesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Body $smartphonesData -Headers $headers
    $smartphonesId = $smartphonesResponse.id
    Write-Host "✅ Создана подкатегория 'Смартфоны' с ID: $smartphonesId" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка создания подкатегории: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Создание подкатегории "Ноутбуки"
Write-Host "3. Создание подкатегории 'Ноутбуки'..." -ForegroundColor Yellow
$laptopsData = @{
    name = "Ноутбуки"
    description = "Портативные компьютеры"
    parentId = $electronicsId
} | ConvertTo-Json

try {
    $laptopsResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Body $laptopsData -Headers $headers
    $laptopsId = $laptopsResponse.id
    Write-Host "✅ Создана подкатегория 'Ноутбуки' с ID: $laptopsId" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка создания подкатегории: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Получение всех категорий
Write-Host "4. Получение всех категорий..." -ForegroundColor Yellow
try {
    $allCategories = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET
    Write-Host "✅ Получено категорий: $($allCategories.Count)" -ForegroundColor Green
    $allCategories | ForEach-Object {
        $indent = if ($_.parentId) { "  └─ " } else { "📁 " }
        Write-Host "$indent$($_.name) (ID: $($_.id))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Ошибка получения категорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Получение корневых категорий
Write-Host "5. Получение корневых категорий..." -ForegroundColor Yellow
try {
    $rootCategories = Invoke-RestMethod -Uri "$baseUrl/categories/root" -Method GET
    Write-Host "✅ Получено корневых категорий: $($rootCategories.Count)" -ForegroundColor Green
    $rootCategories | ForEach-Object {
        Write-Host "📁 $($_.name) (ID: $($_.id))" -ForegroundColor Cyan
        if ($_.children) {
            $_.children | ForEach-Object {
                Write-Host "  └─ $($_.name) (ID: $($_.id))" -ForegroundColor White
            }
        }
    }
} catch {
    Write-Host "❌ Ошибка получения корневых категорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Получение подкатегорий для "Электроника"
Write-Host "6. Получение подкатегорий для 'Электроника'..." -ForegroundColor Yellow
try {
    $subcategories = Invoke-RestMethod -Uri "$baseUrl/categories/$electronicsId/subcategories" -Method GET
    Write-Host "✅ Получено подкатегорий: $($subcategories.Count)" -ForegroundColor Green
    $subcategories | ForEach-Object {
        Write-Host "  └─ $($_.name) (ID: $($_.id))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Ошибка получения подкатегорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Получение дерева категорий
Write-Host "7. Получение дерева категорий..." -ForegroundColor Yellow
try {
    $tree = Invoke-RestMethod -Uri "$baseUrl/categories/tree" -Method GET
    Write-Host "✅ Получено дерево категорий" -ForegroundColor Green
    function PrintTree($categories, $level = 0) {
        foreach ($category in $categories) {
            $indent = "  " * $level
            Write-Host "$indent📁 $($category.name)" -ForegroundColor Cyan
            if ($category.children -and $category.children.Count -gt 0) {
                PrintTree $category.children ($level + 1)
            }
        }
    }
    PrintTree $tree
} catch {
    Write-Host "❌ Ошибка получения дерева: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Получение статистики
Write-Host "8. Получение статистики категорий..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/categories/stats" -Method GET
    Write-Host "✅ Статистика категорий:" -ForegroundColor Green
    Write-Host "  📊 Всего категорий: $($stats.totalCategories)" -ForegroundColor White
    Write-Host "  📁 Корневых категорий: $($stats.rootCategories)" -ForegroundColor White
    Write-Host "  🍃 Листовых категорий: $($stats.leafCategories)" -ForegroundColor White
    Write-Host "  📏 Максимальная глубина: $($stats.maxDepth)" -ForegroundColor White
} catch {
    Write-Host "❌ Ошибка получения статистики: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Тестирование завершено ===" -ForegroundColor Green
