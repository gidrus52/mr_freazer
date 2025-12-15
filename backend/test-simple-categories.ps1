# Simple category hierarchy test
$baseUrl = "http://localhost:3000"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== Simple Category Test ===" -ForegroundColor Green

# Test 1: Get all categories
Write-Host "`n1. Getting all categories..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -Headers $headers
    Write-Host "✓ Found $($response.Count) categories" -ForegroundColor Green
    foreach ($cat in $response) {
        $parent = if ($cat.parent) { " (parent: $($cat.parent.name))" } else { " (root)" }
        Write-Host "  - $($cat.name)$parent" -ForegroundColor White
    }
}
catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get root categories
Write-Host "`n2. Getting root categories..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/categories/root" -Method GET -Headers $headers
    Write-Host "✓ Found $($response.Count) root categories" -ForegroundColor Green
    foreach ($cat in $response) {
        Write-Host "  - $($cat.name)" -ForegroundColor White
        if ($cat.children) {
            foreach ($child in $cat.children) {
                Write-Host "    └─ $($child.name)" -ForegroundColor Gray
            }
        }
    }
}
catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create a test category
Write-Host "`n3. Creating test category..." -ForegroundColor Yellow
try {
    $testCategory = @{
        name = "Test Category $(Get-Date -Format 'HHmmss')"
        description = "Test category for hierarchy"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($testCategory | ConvertTo-Json)
    Write-Host "✓ Created test category: $($response.name)" -ForegroundColor Green
    
    # Test 4: Create subcategory
    Write-Host "`n4. Creating subcategory..." -ForegroundColor Yellow
    $testSubcategory = @{
        name = "Test Subcategory $(Get-Date -Format 'HHmmss')"
        description = "Test subcategory"
        parentId = $response.id
    }
    $subResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Headers $headers -Body ($testSubcategory | ConvertTo-Json)
    Write-Host "✓ Created subcategory: $($subResponse.name)" -ForegroundColor Green
    
    # Test 5: Get subcategories
    Write-Host "`n5. Getting subcategories..." -ForegroundColor Yellow
    $subcatsResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$($response.id)/subcategories" -Method GET -Headers $headers
    Write-Host "✓ Found $($subcatsResponse.Count) subcategories" -ForegroundColor Green
    foreach ($subcat in $subcatsResponse) {
        Write-Host "  - $($subcat.name)" -ForegroundColor White
    }
    
    # Cleanup
    Write-Host "`n6. Cleaning up..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$baseUrl/categories/$($subResponse.id)" -Method DELETE -Headers $headers
        Invoke-RestMethod -Uri "$baseUrl/categories/$($response.id)" -Method DELETE -Headers $headers
        Write-Host "✓ Test categories deleted" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠ Could not delete test categories" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green

