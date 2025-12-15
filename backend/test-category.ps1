# Test category creation
Write-Host "=== Test Category Creation ===" -ForegroundColor Green

# Wait for server to start
Start-Sleep -Seconds 5

# 1. Login
Write-Host "1. Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    
    # 2. Create category
    Write-Host "2. Creating category..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "Test Category"
        description = "Test category description"
        isActive = $true
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = $loginResponse.accessToken
        "Content-Type" = "application/json"
    }

    $categoryResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method POST -Body $categoryBody -Headers $headers
    Write-Host "Category created successfully!" -ForegroundColor Green
    Write-Host "Category ID: $($categoryResponse.id)" -ForegroundColor Cyan
    
    # 3. Get categories list
    Write-Host "3. Getting categories list..." -ForegroundColor Yellow
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method GET
    Write-Host "Found categories: $($categoriesResponse.Count)" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Test completed ===" -ForegroundColor Green 