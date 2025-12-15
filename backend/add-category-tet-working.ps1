# Script to login as admin and add category "тет" using working approach
Write-Host "=== Login as admin and add category 'тет' ===" -ForegroundColor Green

# 1. Login as admin
Write-Host "1. Login as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin@test.com"
    password = "123asx"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Access token received" -ForegroundColor Cyan
    
    # 2. Create category "тет"
    Write-Host "`n2. Creating category 'тет'..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "тет"
        description = "Category tet"
        isActive = $true
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = $loginResponse.accessToken
        "Content-Type" = "application/json"
    }

    $categoryResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method POST -Body $categoryBody -Headers $headers
    Write-Host "Category created successfully!" -ForegroundColor Green
    Write-Host "Category ID: $($categoryResponse.id)" -ForegroundColor Cyan
    
    # 3. Get list of categories for verification
    Write-Host "`n3. Getting list of categories..." -ForegroundColor Yellow
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method GET
    Write-Host "Found categories: $($categoriesResponse.Count)" -ForegroundColor Green
    
    Write-Host "`n=== Category 'тет' successfully added ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Operation completed ===" -ForegroundColor Green 