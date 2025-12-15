# Testing subcategories
# Creating category hierarchy and subcategories

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Testing Subcategories ===" -ForegroundColor Green

# 1. Creating root categories
Write-Host "`n1. Creating root categories..." -ForegroundColor Yellow

$rootCategories = @(
    @{
        name = "Electronics"
        description = "Electronic devices and gadgets"
    },
    @{
        name = "Clothing"
        description = "Men's and women's clothing"
    },
    @{
        name = "Home and Garden"
        description = "Home and garden products"
    }
)

$categoryIds = @{}

foreach ($category in $rootCategories) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($category | ConvertTo-Json)
        $categoryIds[$category.name] = $response.id
        Write-Host "✓ Created root category: $($category.name) (ID: $($response.id))" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error creating category $($category.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. Creating first-level subcategories
Write-Host "`n2. Creating first-level subcategories..." -ForegroundColor Yellow

$subcategories = @(
    @{
        name = "Smartphones"
        description = "Mobile phones"
        parentId = $categoryIds["Electronics"]
    },
    @{
        name = "Laptops"
        description = "Portable computers"
        parentId = $categoryIds["Electronics"]
    },
    @{
        name = "Men's Clothing"
        description = "Clothing for men"
        parentId = $categoryIds["Clothing"]
    },
    @{
        name = "Women's Clothing"
        description = "Clothing for women"
        parentId = $categoryIds["Clothing"]
    },
    @{
        name = "Furniture"
        description = "Home furniture"
        parentId = $categoryIds["Home and Garden"]
    },
    @{
        name = "Tools"
        description = "Home and garden tools"
        parentId = $categoryIds["Home and Garden"]
    }
)

$subcategoryIds = @{}

foreach ($subcategory in $subcategories) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($subcategory | ConvertTo-Json)
        $subcategoryIds[$subcategory.name] = $response.id
        Write-Host "✓ Created subcategory: $($subcategory.name) (ID: $($response.id))" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error creating subcategory $($subcategory.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Creating second-level subcategories
Write-Host "`n3. Creating second-level subcategories..." -ForegroundColor Yellow

$subSubcategories = @(
    @{
        name = "iPhone"
        description = "Apple smartphones"
        parentId = $subcategoryIds["Smartphones"]
    },
    @{
        name = "Android"
        description = "Android smartphones"
        parentId = $subcategoryIds["Smartphones"]
    },
    @{
        name = "MacBook"
        description = "Apple laptops"
        parentId = $subcategoryIds["Laptops"]
    },
    @{
        name = "Windows Laptops"
        description = "Windows laptops"
        parentId = $subcategoryIds["Laptops"]
    },
    @{
        name = "Shirts"
        description = "Men's shirts"
        parentId = $subcategoryIds["Men's Clothing"]
    },
    @{
        name = "Pants"
        description = "Men's pants"
        parentId = $subcategoryIds["Men's Clothing"]
    },
    @{
        name = "Dresses"
        description = "Women's dresses"
        parentId = $subcategoryIds["Women's Clothing"]
    },
    @{
        name = "Skirts"
        description = "Women's skirts"
        parentId = $subcategoryIds["Women's Clothing"]
    }
)

foreach ($subSubcategory in $subSubcategories) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($subSubcategory | ConvertTo-Json)
        Write-Host "✓ Created second-level subcategory: $($subSubcategory.name) (ID: $($response.id))" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error creating subcategory $($subSubcategory.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Getting all root categories with subcategories
Write-Host "`n4. Getting root categories with subcategories..." -ForegroundColor Yellow

try {
    $rootCategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories/root" -Method GET -Headers $headers
    
    Write-Host "`nRoot categories:" -ForegroundColor Cyan
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
    Write-Host "✗ Error getting root categories: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Getting subcategories for specific category
Write-Host "`n5. Getting subcategories for 'Electronics' category..." -ForegroundColor Yellow

try {
    $electronicsId = $categoryIds["Electronics"]
    $subcategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$electronicsId/subcategories" -Method GET -Headers $headers
    
    Write-Host "`nSubcategories of 'Electronics':" -ForegroundColor Cyan
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
    Write-Host "✗ Error getting subcategories: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Getting all categories
Write-Host "`n6. Getting all categories..." -ForegroundColor Yellow

try {
    $allCategoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -Headers $headers
    
    Write-Host "`nTotal categories: $($allCategoriesResponse.Count)" -ForegroundColor Cyan
    
    # Count hierarchy levels
    $rootCount = ($allCategoriesResponse | Where-Object { $_.parentId -eq $null }).Count
    $firstLevelCount = ($allCategoriesResponse | Where-Object { $_.parent -ne $null -and $_.parent.parentId -eq $null }).Count
    $secondLevelCount = ($allCategoriesResponse | Where-Object { $_.parent -ne $null -and $_.parent.parentId -ne $null }).Count
    
    Write-Host "  - Root categories: $rootCount" -ForegroundColor White
    Write-Host "  - First-level subcategories: $firstLevelCount" -ForegroundColor White
    Write-Host "  - Second-level subcategories: $secondLevelCount" -ForegroundColor White
}
catch {
    Write-Host "✗ Error getting all categories: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Subcategories testing completed ===" -ForegroundColor Green
