# Тестирование расширенных функций иерархии категорий
# Проверка новых эндпоинтов для работы с подкатегориями

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Тестирование расширенных функций иерархии категорий ===" -ForegroundColor Green

# 1. Получение дерева категорий
Write-Host "`n1. Получение дерева категорий..." -ForegroundColor Yellow

try {
    $treeResponse = Invoke-RestMethod -Uri "$baseUrl/categories/tree" -Method GET -Headers $headers
    
    Write-Host "`nДерево категорий:" -ForegroundColor Cyan
    function DisplayCategoryTree($categories, $indent = 0) {
        foreach ($category in $categories) {
            $spaces = "  " * $indent
            Write-Host "$spaces📁 $($category.name)" -ForegroundColor White
            
            if ($category.children -and $category.children.Count -gt 0) {
                DisplayCategoryTree $category.children ($indent + 1)
            }
        }
    }
    
    DisplayCategoryTree $treeResponse
}
catch {
    Write-Host "✗ Ошибка получения дерева категорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Получение статистики категорий
Write-Host "`n2. Получение статистики категорий..." -ForegroundColor Yellow

try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/categories/stats" -Method GET -Headers $headers
    
    Write-Host "`nСтатистика категорий:" -ForegroundColor Cyan
    Write-Host "  📊 Всего категорий: $($statsResponse.totalCategories)" -ForegroundColor White
    Write-Host "  🌳 Корневых категорий: $($statsResponse.rootCategories)" -ForegroundColor White
    Write-Host "  🍃 Листовых категорий: $($statsResponse.leafCategories)" -ForegroundColor White
    Write-Host "  📏 Максимальная глубина: $($statsResponse.maxDepth)" -ForegroundColor White
    
    Write-Host "`n  Категории по уровням:" -ForegroundColor Gray
    foreach ($level in $statsResponse.categoriesByLevel.PSObject.Properties) {
        Write-Host "    Уровень $($level.Name): $($level.Value) категорий" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✗ Ошибка получения статистики: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Получение всех категорий для анализа
Write-Host "`n3. Анализ структуры категорий..." -ForegroundColor Yellow

try {
    $allCategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -Headers $headers
    
    # Найдем несколько категорий для тестирования
    $testCategories = @()
    
    # Найдем корневую категорию
    $rootCategory = $allCategoriesResponse | Where-Object { $_.parentId -eq $null } | Select-Object -First 1
    if ($rootCategory) {
        $testCategories += @{
            id = $rootCategory.id
            name = $rootCategory.name
            type = "корневая"
        }
    }
    
    # Найдем подкатегорию
    $subCategory = $allCategoriesResponse | Where-Object { $_.parentId -ne $null } | Select-Object -First 1
    if ($subCategory) {
        $testCategories += @{
            id = $subCategory.id
            name = $subCategory.name
            type = "подкатегория"
        }
    }
    
    # Тестируем функции для каждой найденной категории
    foreach ($testCategory in $testCategories) {
        Write-Host "`n  Тестирование категории: $($testCategory.name) ($($testCategory.type))" -ForegroundColor Cyan
        
        # Получение пути категории
        try {
            $pathResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$($testCategory.id)/path" -Method GET -Headers $headers
            $pathNames = $pathResponse | ForEach-Object { $_.name }
            $pathString = $pathNames -join " > "
            Write-Host "    📍 Путь: $pathString" -ForegroundColor White
        }
        catch {
            Write-Host "    ✗ Ошибка получения пути: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Получение уровня категории
        try {
            $levelResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$($testCategory.id)/level" -Method GET -Headers $headers
            Write-Host "    📏 Уровень: $levelResponse" -ForegroundColor White
        }
        catch {
            Write-Host "    ✗ Ошибка получения уровня: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Проверка, является ли категория листовой
        try {
            $isLeafResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$($testCategory.id)/is-leaf" -Method GET -Headers $headers
            $leafStatus = if ($isLeafResponse) { "Да" } else { "Нет" }
            Write-Host "    🍃 Листовая категория: $leafStatus" -ForegroundColor White
        }
        catch {
            Write-Host "    ✗ Ошибка проверки листовой категории: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Получение всех потомков
        try {
            $descendantsResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$($testCategory.id)/descendants" -Method GET -Headers $headers
            Write-Host "    👥 Потомков: $($descendantsResponse.Count)" -ForegroundColor White
            
            if ($descendantsResponse.Count -gt 0) {
                Write-Host "      Потомки:" -ForegroundColor Gray
                foreach ($descendant in $descendantsResponse) {
                    Write-Host "        - $($descendant.name)" -ForegroundColor Gray
                }
            }
        }
        catch {
            Write-Host "    ✗ Ошибка получения потомков: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "✗ Ошибка анализа структуры категорий: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Тестирование создания подкатегории с проверкой иерархии
Write-Host "`n4. Тестирование создания подкатегории..." -ForegroundColor Yellow

try {
    # Найдем корневую категорию для создания подкатегории
    $allCategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -Headers $headers
    $rootCategory = $allCategoriesResponse | Where-Object { $_.parentId -eq $null } | Select-Object -First 1
    
    if ($rootCategory) {
        $newSubcategory = @{
            name = "Тестовая подкатегория $(Get-Date -Format 'HHmmss')"
            description = "Подкатегория для тестирования иерархии"
            parentId = $rootCategory.id
        }
        
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($newSubcategory | ConvertTo-Json)
        Write-Host "✓ Создана тестовая подкатегория: $($createResponse.name)" -ForegroundColor Green
        
        # Проверим путь новой подкатегории
        $pathResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$($createResponse.id)/path" -Method GET -Headers $headers
        $pathNames = $pathResponse | ForEach-Object { $_.name }
        $pathString = $pathNames -join " > "
        Write-Host "  📍 Путь новой подкатегории: $pathString" -ForegroundColor White
        
        # Проверим уровень
        $levelResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$($createResponse.id)/level" -Method GET -Headers $headers
        Write-Host "  📏 Уровень новой подкатегории: $levelResponse" -ForegroundColor White
        
        # Удалим тестовую подкатегорию
        try {
            Invoke-RestMethod -Uri "$baseUrl/categories/$($createResponse.id)" -Method DELETE -Headers $headers
            Write-Host "✓ Тестовая подкатегория удалена" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠ Не удалось удалить тестовую подкатегорию: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⚠ Не найдена корневая категория для тестирования" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Ошибка тестирования создания подкатегории: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Тестирование расширенных функций иерархии завершено ===" -ForegroundColor Green