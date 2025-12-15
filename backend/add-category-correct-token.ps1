# Script to login as admin and add category "тет" with correct token handling
Write-Host "=== Login as admin and add category 'тет' ===" -ForegroundColor Green

# 1. Login as admin
Write-Host "1. Login as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin@test.com"
    password = "123asx"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -Headers @{"Content-Type"="application/json"}
    
    Write-Host "Login response status: $($loginResponse.StatusCode)" -ForegroundColor Cyan
    $responseData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Login response:" -ForegroundColor Cyan
    $responseData | ConvertTo-Json -Depth 3
    
    # Extract access token (ensure it's a valid JWT)
    $accessToken = $responseData.accessToken
    Write-Host "Raw access token: $accessToken" -ForegroundColor Cyan
    
    # Check if token is valid JWT format
    if ($accessToken -like "Bearer *") {
        $tokenWithoutBearer = $accessToken.Substring(7)
        Write-Host "Token without Bearer: $tokenWithoutBearer" -ForegroundColor Cyan
    } else {
        $tokenWithoutBearer = $accessToken
        Write-Host "Token already without Bearer: $tokenWithoutBearer" -ForegroundColor Cyan
    }
    
    # 2. Create category "тет"
    Write-Host "`n2. Creating category 'тет'..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "тет"
        description = "Category tet"
        isActive = $true
    } | ConvertTo-Json
    
    $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Body $categoryBody -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $tokenWithoutBearer"
    }
    
    Write-Host "Category creation status: $($categoryResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Category creation response:" -ForegroundColor Cyan
    $categoryResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    
    # 3. Get list of categories for verification
    Write-Host "`n3. Getting list of categories..." -ForegroundColor Yellow
    $categoriesResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method GET
    
    Write-Host "Categories list status: $($categoriesResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Categories list:" -ForegroundColor Cyan
    $categoriesResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== Category 'тет' successfully added ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Operation completed ===" -ForegroundColor Green 