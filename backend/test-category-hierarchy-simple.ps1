# Simple Category Hierarchy Test
Write-Host "=== CATEGORY HIERARCHY TEST ===" -ForegroundColor Green

# 1. Admin login
Write-Host "1. Admin login..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
Write-Host "Admin login: $($adminLoginResponse.StatusCode)" -ForegroundColor Green

if ($adminLoginResponse.StatusCode -eq 201) {
    $adminLoginData = $adminLoginResponse.Content | ConvertFrom-Json
    $adminToken = $adminLoginData.accessToken
    Write-Host "Admin token received" -ForegroundColor Green
    
    # 2. Create root category "Electronics"
    Write-Host "2. Creating root category 'Electronics'..." -ForegroundColor Yellow
    $electronicsBody = @{
        name = "Electronics"
        description = "Electronic devices and gadgets"
    } | ConvertTo-Json
    
    $electronicsResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $electronicsBody
    Write-Host "Creating 'Electronics': $($electronicsResponse.StatusCode)" -ForegroundColor Green
    
    if ($electronicsResponse.StatusCode -eq 201) {
        $electronicsData = $electronicsResponse.Content | ConvertFrom-Json
        $electronicsId = $electronicsData.id
        Write-Host "Electronics ID: $electronicsId" -ForegroundColor Green
        
        # 3. Create subcategory "Smartphones"
        Write-Host "3. Creating subcategory 'Smartphones'..." -ForegroundColor Yellow
        $smartphonesBody = @{
            name = "Smartphones"
            description = "Mobile phones"
            parentId = $electronicsId
        } | ConvertTo-Json
        
        $smartphonesResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $smartphonesBody
        Write-Host "Creating 'Smartphones': $($smartphonesResponse.StatusCode)" -ForegroundColor Green
        
        if ($smartphonesResponse.StatusCode -eq 201) {
            $smartphonesData = $smartphonesResponse.Content | ConvertFrom-Json
            $smartphonesId = $smartphonesData.id
            Write-Host "Smartphones ID: $smartphonesId" -ForegroundColor Green
            
            # 4. Create subcategory "iPhone"
            Write-Host "4. Creating subcategory 'iPhone'..." -ForegroundColor Yellow
            $iphoneBody = @{
                name = "iPhone"
                description = "Apple smartphones"
                parentId = $smartphonesId
            } | ConvertTo-Json
            
            $iphoneResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $iphoneBody
            Write-Host "Creating 'iPhone': $($iphoneResponse.StatusCode)" -ForegroundColor Green
            
            # 5. Create root category "Clothing"
            Write-Host "5. Creating root category 'Clothing'..." -ForegroundColor Yellow
            $clothingBody = @{
                name = "Clothing"
                description = "Men's and women's clothing"
            } | ConvertTo-Json
            
            $clothingResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$adminToken} -Body $clothingBody
            Write-Host "Creating 'Clothing': $($clothingResponse.StatusCode)" -ForegroundColor Green
            
            # 6. Get root categories
            Write-Host "6. Getting root categories..." -ForegroundColor Yellow
            $rootResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories/root" -Method GET
            Write-Host "Root categories: $($rootResponse.StatusCode)" -ForegroundColor Green
            $rootData = $rootResponse.Content | ConvertFrom-Json
            Write-Host "Root categories count: $($rootData.Count)" -ForegroundColor Green
            
            # 7. Get Electronics subcategories
            Write-Host "7. Getting Electronics subcategories..." -ForegroundColor Yellow
            $subResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories/$electronicsId/subcategories" -Method GET
            Write-Host "Subcategories: $($subResponse.StatusCode)" -ForegroundColor Green
            $subData = $subResponse.Content | ConvertFrom-Json
            Write-Host "Subcategories count: $($subData.Count)" -ForegroundColor Green
            
            # 8. Get all categories with hierarchy
            Write-Host "8. Getting all categories with hierarchy..." -ForegroundColor Yellow
            $allResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
            Write-Host "All categories: $($allResponse.StatusCode)" -ForegroundColor Green
            $allData = $allResponse.Content | ConvertFrom-Json
            Write-Host "Total categories count: $($allData.Count)" -ForegroundColor Green
            
            # 9. Get specific category with hierarchy
            Write-Host "9. Getting Electronics category with hierarchy..." -ForegroundColor Yellow
            $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories/$electronicsId" -Method GET
            Write-Host "Category: $($categoryResponse.StatusCode)" -ForegroundColor Green
            $categoryData = $categoryResponse.Content | ConvertFrom-Json
            Write-Host "Category name: $($categoryData.name)" -ForegroundColor Green
            Write-Host "Children count: $($categoryData.children.Count)" -ForegroundColor Green
        }
    }
}

Write-Host "=== TEST COMPLETED ===" -ForegroundColor Green 