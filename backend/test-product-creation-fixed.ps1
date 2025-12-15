# Script to test product creation with proper Bearer token handling
Write-Host "=== Testing product creation with proper Bearer token ===" -ForegroundColor Green

# 1. Login as admin
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin@test.com"
    password = "123asx"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    Write-Host "Login response:" -ForegroundColor Cyan
    $loginResponse | ConvertTo-Json -Depth 3
    
    # Extract access token (it already includes "Bearer" prefix)
    $accessToken = $loginResponse.accessToken
    Write-Host "Access token: $accessToken" -ForegroundColor Cyan
    
    # 2. Get categories
    Write-Host "`n2. Getting categories..." -ForegroundColor Yellow
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/categories" -Method GET
    
    Write-Host "Categories:" -ForegroundColor Cyan
    $categoriesResponse | ConvertTo-Json -Depth 3
    
    # Use the first category ID
    $categoryId = $categoriesResponse[0].id
    Write-Host "Using category with ID: $categoryId" -ForegroundColor Cyan
    
    # 3. Test product creation with image fields
    Write-Host "`n3. Testing product creation with image fields..." -ForegroundColor Yellow
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
    
    # Use the token as is (it already includes "Bearer")
    $headers = @{
        "Authorization" = $accessToken
        "Content-Type" = "application/json"
    }
    
    Write-Host "Sending product creation request..." -ForegroundColor Cyan
    Write-Host "Headers: $($headers | ConvertTo-Json)" -ForegroundColor Cyan
    Write-Host "Body: $productBody" -ForegroundColor Cyan
    
    $productResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method POST -Body $productBody -Headers $headers
    
    Write-Host "Product creation response:" -ForegroundColor Cyan
    $productResponse | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Product with image fields successfully created ===" -ForegroundColor Green
    
    # 4. Get all products to verify
    Write-Host "`n4. Getting all products..." -ForegroundColor Yellow
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
