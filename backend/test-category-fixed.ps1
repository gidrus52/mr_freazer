# Test category creation with fixed code
Write-Host "=== Test Category Creation with Fixed Code ===" -ForegroundColor Green

try {
    # 1. Login as admin
    Write-Host "`n1. Login as admin..." -ForegroundColor Yellow
    
    $loginBody = @{
        email = "newuserAdmin@test.com"
        password = "123asx"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login status: $($loginResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Login response: $($loginResponse.Content)" -ForegroundColor Cyan
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginData.accessToken
    
    Write-Host "Access token: $accessToken" -ForegroundColor Cyan
    
    # Remove "Bearer " prefix if it exists
    if ($accessToken -like "Bearer *") {
        $accessToken = $accessToken.Substring(7)
        Write-Host "Token without Bearer: $accessToken" -ForegroundColor Cyan
    }
    
    # 2. Create category
    Write-Host "`n2. Creating category 'тет'..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    
    $categoryBody = @{
        name = "тет"
        description = "Category tet with fixed code"
        isActive = $true
    } | ConvertTo-Json
    
    $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Body $categoryBody -Headers $headers
    Write-Host "Category creation status: $($categoryResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Category creation response: $($categoryResponse.Content)" -ForegroundColor Cyan
    
    # 3. Get list of categories for verification
    Write-Host "`n3. Getting list of categories..." -ForegroundColor Yellow
    $categoriesResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method GET
    
    Write-Host "Categories list status: $($categoriesResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Categories list:" -ForegroundColor Cyan
    $categoriesResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== Category creation successful ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green 