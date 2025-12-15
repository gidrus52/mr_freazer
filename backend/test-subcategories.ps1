# Тестирование подкатегорий
# Создание иерархии категорий и подкатегорий

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Тестирование подкатегорий ===" -ForegroundColor Green

# 1. Создание корневых категорий
Write-Host "`n1. Создание корневых категорий..." -ForegroundColor Yellow

$rootCategories = @(
    @{
        name = "Электроника"
        description = "Электронные устройства и гаджеты"
    },
    @{
        name = "Одежда"
        description = "Мужская и женская одежда"
    },
    @{
        name = "Дом и сад"
        description = "Товары для дома и сада"
    }
)

$categoryIds = @{}

foreach ($category in $rootCategories) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($category | ConvertTo-Json)
        $categoryIds[$category.name] = $response.id
        Write-Host "✓ Создана корневая категория: $($category.name) (ID: $($response.id))" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Ошибка создания категории $($category.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. Создание подкатегорий первого уровня
Write-Host "`n2. Создание подкатегорий первого уровня..." -ForegroundColor Yellow

$subcategories = @(
    @{
        name = "Смартфоны"
        description = "Мобильные телефоны"
        parentId = $categoryIds["Электроника"]
    },
    @{
        name = "Ноутбуки"
        description = "Портативные компьютеры"
        parentId = $categoryIds["Электроника"]
    },
    @{
        name = "Мужская одежда"
        description = "Одежда для мужчин"
        parentId = $categoryIds["Одежда"]
    },
    @{
        name = "Женская одежда"
        description = "Одежда для женщин"
        parentId = $categoryIds["Одежда"]
    },
    @{
        name = "Мебель"
        description = "Мебель для дома"
        parentId = $categoryIds["Дом и сад"]
    },
    @{
        name = "Инструменты"
        description = "Инструменты для дома и сада"
        parentId = $categoryIds["Дом и сад"]
    }
)

$subcategoryIds = @{}

foreach ($subcategory in $subcategories) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($subcategory | ConvertTo-Json)
        $subcategoryIds[$subcategory.name] = $response.id
        Write-Host "✓ Создана подкатегория: $($subcategory.name) (ID: $($response.id))" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Ошибка создания подкатегории $($subcategory.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Создание подкатегорий второго уровня
Write-Host "`n3. Создание подкатегорий второго уровня..." -ForegroundColor Yellow

$subSubcategories = @(
    @{
        name = "iPhone"
        description = "Смартфоны Apple"
        parentId = $subcategoryIds["Смартфоны"]
    },
    @{
        name = "Android"
        description = "Смартфоны на Android"
        parentId = $subcategoryIds["Смартфоны"]
    },
    @{
        name = "MacBook"
        description = "Ноутбуки Apple"
        parentId = $subcategoryIds["Ноутбуки"]
    },
    @{
        name = "Windows ноутбуки"
        description = "Ноутбуки на Windows"
        parentId = $subcategoryIds["Ноутбуки"]
    },
    @{
        name = "Рубашки"
        description = "Мужские рубашки"
        parentId = $subcategoryIds["Мужская одежда"]
    },
    @{
        name = "Брюки"
        description = "Мужские брюки"
        parentId = $subcategoryIds["Мужская одежда"]
    },
    @{
        name = "Платья"
        description = "Женские платья"
        parentId = $subcategoryIds["Женская одежда"]
    },
    @{
        name = "Юбки"
        description = "Женские юбки"
        parentId = $subcategoryIds["Женская одежда"]
    }
)

foreach ($subSubcategory in $subSubcategories) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($subSubcategory | ConvertTo-Json)
        Write-Host "✓ Создана подкатегория 2-го уровня: $($subSubcategory.name) (ID: $($response.id))" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Ошибка создания подкатегории $($subSubcategory.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Получение всех корневых категорий с подкатегориями
Write-Host "`n4. Получение корневых категорий с подкатегориями..." -ForegroundColor Yellow

try {
    $rootCategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories/root" -Method GET -Headers $headers
    
    Write-Host "`nКорневые категории:" -ForegroundColor Cyan
    foreach ($category in $rootCategoriesResponse) {
        Write-Host "  📁 $($category.name)" -ForegroundColor White
        if ($category.children) {
            foreach ($child in $category.children) {
                Write-Host "    📂 $($child.name)" -ForegroundColor Gray
                if ($child.children) {
                    foreach ($grandchild in $child.children) {
                        Write-Host "      📄 $($grandchild.name)" -ForegroundColor DarkGray
                    }
                }
            }
        }
    }
}
catch {
    Write-Host "✗ Ошибка получения корневых категорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Получение подкатегорий для конкретной категории
Write-Host "`n5. Получение подкатегорий для категории 'Электроника'..." -ForegroundColor Yellow

try {
    $electronicsId = $categoryIds["Электроника"]
    $subcategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$electronicsId/subcategories" -Method GET -Headers $headers
    
    Write-Host "`nПодкатегории 'Электроника':" -ForegroundColor Cyan
    foreach ($subcategory in $subcategoriesResponse) {
        Write-Host "  📂 $($subcategory.name)" -ForegroundColor White
        if ($subcategory.children) {
            foreach ($child in $subcategory.children) {
                Write-Host "    📄 $($child.name)" -ForegroundColor Gray
            }
        }
    }
}
catch {
    Write-Host "✗ Ошибка получения подкатегорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Получение всех категорий
Write-Host "`n6. Получение всех категорий..." -ForegroundColor Yellow

try {
    $allCategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -Headers $headers
    
    Write-Host "`nВсего категорий: $($allCategoriesResponse.Count)" -ForegroundColor Cyan
    
    # Подсчет уровней иерархии
    $rootCount = ($allCategoriesResponse | Where-Object { $_.parentId -eq $null }).Count
    $firstLevelCount = ($allCategoriesResponse | Where-Object { $_.parent -ne $null -and $_.parent.parentId -eq $null }).Count
    $secondLevelCount = ($allCategoriesResponse | Where-Object { $_.parent -ne $null -and $_.parent.parentId -ne $null }).Count
    
    Write-Host "  - Корневых категорий: $rootCount" -ForegroundColor White
    Write-Host "  - Подкатегорий 1-го уровня: $firstLevelCount" -ForegroundColor White
    Write-Host "  - Подкатегорий 2-го уровня: $secondLevelCount" -ForegroundColor White
}
catch {
    Write-Host "✗ Ошибка получения всех категорий: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тестирование подкатегорий завершено ===" -ForegroundColor Green

