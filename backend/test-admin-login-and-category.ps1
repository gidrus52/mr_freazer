# Test admin login and category creation
Write-Host "=== Test Admin Login and Category Creation ===" -ForegroundColor Green

# 1. Login as admin
Write-Host "1. Login as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin@test.com"
    password = "123asx"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -Headers @{"Content-Type"="application/json"}
    
    Write-Host "Login status: $($loginResponse.StatusCode)" -ForegroundColor Cyan
    $responseData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Access token: $($responseData.accessToken)" -ForegroundColor Cyan
    
    # Extract token without Bearer prefix
    $accessToken = $responseData.accessToken
    if ($accessToken -like "Bearer *") {
        $tokenWithoutBearer = $accessToken.Substring(7)
    } else {
        $tokenWithoutBearer = $accessToken
    }
    
    Write-Host "Token without Bearer: $tokenWithoutBearer" -ForegroundColor Cyan
    
    # 2. Create category "тет" via API
    Write-Host "`n2. Creating category 'тет' via API..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "тет"
        description = "Category tet via API"
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
    
    Write-Host "`n=== Admin login and category creation successful ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green 