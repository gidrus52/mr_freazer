# Test with new JWT token
Write-Host "=== Test with New JWT Token ===" -ForegroundColor Green

# Use the new token provided by user
$newToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkODM5MmJkLWJiOWEtNDQyNS1iYjI1LTZiN2ZiZDQxYTcxMCIsImVtYWlsIjoibmV3dXNlckFkbWluQHRlc3QuY29tIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNzU0MDg5NTI2LCJleHAiOjE3NTQwODk4MjZ9.DZog2kVw8ZkWbdk4XF5gBsRF8XSSsTRENaIuvsmBmtY"

Write-Host "Using new token: $newToken" -ForegroundColor Cyan

try {
    # 1. Test protected endpoint with new token
    Write-Host "`n1. Testing protected endpoint..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = $newToken
        "Content-Type" = "application/json"
    }
    
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers
    Write-Host "Protected endpoint status: $($testResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Response: $($testResponse.Content)" -ForegroundColor Cyan
    
    # 2. Create category with new token
    Write-Host "`n2. Creating category with new token..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "тет"
        description = "Category tet with new token"
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
    
    Write-Host "`n=== Auth with new token successful ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green 