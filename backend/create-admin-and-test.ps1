# Script to create admin user and test product creation with image fields
Write-Host "=== Creating admin user and testing product creation ===" -ForegroundColor Green

# 1. Create admin user
Write-Host "1. Creating admin user..." -ForegroundColor Yellow
$registerBody = @{
    email = "newuserAdmin@test.com"
    password = "123asx"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register-first-admin" -Method POST -Body $registerBody -ContentType "application/json"
    
    Write-Host "Admin creation response:" -ForegroundColor Cyan
    $registerResponse | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== Admin created successfully ===" -ForegroundColor Green
    
    # 2. Login as admin
    Write-Host "`n2. Logging in as admin..." -ForegroundColor Yellow
    $loginBody = @{
        email = "newuserAdmin@test.com"
        password = "123asx"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    Write-Host "Login response:" -ForegroundColor Cyan
    $loginResponse | ConvertTo-Json -Depth 3
    
    # Extract access token
    $accessToken = $loginResponse.accessToken
    Write-Host "Access token: $accessToken" -ForegroundColor Cyan
    
    # 3. Create a test category
    Write-Host "`n3. Creating test category..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "Test Category"
        description = "Test category for product creation"
        isActive = $true
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    
    $categoryResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/categories" -Method POST -Body $categoryBody -Headers $headers
    $categoryId = $categoryResponse.id
    Write-Host "Created category with ID: $categoryId" -ForegroundColor Cyan
    
    # 4. Test product creation with image fields
    Write-Host "`n4. Testing product creation with image fields..." -ForegroundColor Yellow
    $productBody = @{
        name = "Test Product with Image"
        description = "Test product description with image fields"
        categoryId = $categoryId
        price = 100.50
        stock = 10
        imageUrl = "https://example.com/test-image.jpg"
        imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        imageType = "png"
    } | ConvertTo-Json
    
    $productResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method POST -Body $productBody -Headers $headers
    
    Write-Host "Product creation response:" -ForegroundColor Cyan
    $productResponse | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Product with image fields successfully created ===" -ForegroundColor Green
    
    # 5. Get all products to verify
    Write-Host "`n5. Getting all products..." -ForegroundColor Yellow
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method GET
    
    Write-Host "All products:" -ForegroundColor Cyan
    $productsResponse | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
