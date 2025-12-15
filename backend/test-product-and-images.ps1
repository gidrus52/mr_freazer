# Script to create a product and test images API
Write-Host "=== Creating Product and Testing Images API ===" -ForegroundColor Green

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
    
    # Extract access token
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
    
    # 3. Create a new product
    Write-Host "`n3. Creating a new product..." -ForegroundColor Yellow
    $productBody = @{
        name = "Test Product for Images"
        description = "Test product description for image testing"
        categoryId = $categoryId
        price = 150.75
        stock = 25
        isActive = $true
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = $accessToken
        "Content-Type" = "application/json"
    }
    
    $productResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method POST -Body $productBody -Headers $headers
    
    Write-Host "Product creation response:" -ForegroundColor Cyan
    $productResponse | ConvertTo-Json -Depth 10
    
    $productId = $productResponse.id
    Write-Host "Created product with ID: $productId" -ForegroundColor Cyan
    
    # 4. Create an image for the product
    Write-Host "`n4. Creating an image for the product..." -ForegroundColor Yellow
    $imageBody = @{
        productId = $productId
        url = "https://example.com/test-image-1.jpg"
        data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        type = "png"
        alt = "Test product image 1"
        isPrimary = $true
        order = 1
    } | ConvertTo-Json
    
    $imageResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/images" -Method POST -Body $imageBody -Headers $headers
    
    Write-Host "Image creation response:" -ForegroundColor Cyan
    $imageResponse | ConvertTo-Json -Depth 10
    
    # 5. Create another image for the same product
    Write-Host "`n5. Creating another image for the product..." -ForegroundColor Yellow
    $imageBody2 = @{
        productId = $productId
        url = "https://example.com/test-image-2.jpg"
        data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        type = "png"
        alt = "Test product image 2"
        isPrimary = $false
        order = 2
    } | ConvertTo-Json
    
    $imageResponse2 = Invoke-RestMethod -Uri "http://localhost:3001/api/images" -Method POST -Body $imageBody2 -Headers $headers
    
    Write-Host "Second image creation response:" -ForegroundColor Cyan
    $imageResponse2 | ConvertTo-Json -Depth 10
    
    # 6. Get all images for the product
    Write-Host "`n6. Getting all images for the product..." -ForegroundColor Yellow
    $productImagesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/images/product/$productId" -Method GET
    
    Write-Host "Product images:" -ForegroundColor Cyan
    $productImagesResponse | ConvertTo-Json -Depth 10
    
    # 7. Get the product with images
    Write-Host "`n7. Getting the product with images..." -ForegroundColor Yellow
    $productWithImagesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/products/$productId" -Method GET
    
    Write-Host "Product with images:" -ForegroundColor Cyan
    $productWithImagesResponse | ConvertTo-Json -Depth 10
    
    # 8. Set the second image as primary
    Write-Host "`n8. Setting the second image as primary..." -ForegroundColor Yellow
    $setPrimaryResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/images/$($imageResponse2.id)/primary" -Method PATCH -Headers $headers
    
    Write-Host "Set primary response:" -ForegroundColor Cyan
    $setPrimaryResponse | ConvertTo-Json -Depth 10
    
    # 9. Get all images again to see the change
    Write-Host "`n9. Getting all images again..." -ForegroundColor Yellow
    $productImagesResponse2 = Invoke-RestMethod -Uri "http://localhost:3001/api/images/product/$productId" -Method GET
    
    Write-Host "Product images after setting primary:" -ForegroundColor Cyan
    $productImagesResponse2 | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Product and Images API test completed successfully ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
