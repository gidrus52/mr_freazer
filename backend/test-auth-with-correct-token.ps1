# Test auth with correctly generated token
Write-Host "=== Test Auth with Correctly Generated Token ===" -ForegroundColor Green

# Use the correctly generated token from our test
$correctToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkODM5MmJkLWJiOWEtNDQyNS1iYjI1LTZiN2ZiZDQxYTcxMCIsImVtYWlsIjoibmV3dXNlckFkbWluQHRlc3QuY29tIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNzU0MDg3NTkyLCJleHAiOjE3NTQwODc4OTJ9.F5TbKWaiwgW0YSPgcFrXjyc4AEeV5dJ7efXK8DQ7jCo"

Write-Host "Using correctly generated token: $correctToken" -ForegroundColor Cyan

try {
    # Test protected endpoint with correct token
    Write-Host "`n1. Testing protected endpoint..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = $correctToken
        "Content-Type" = "application/json"
    }
    
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers
    Write-Host "Protected endpoint status: $($testResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Response: $($testResponse.Content)" -ForegroundColor Cyan
    
    # 2. Create category with correct token
    Write-Host "`n2. Creating category with correct token..." -ForegroundColor Yellow
    $categoryBody = @{
        name = "тет"
        description = "Category tet with correct token"
        isActive = $true
    } | ConvertTo-Json
    
    $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Body $categoryBody -Headers $headers
    Write-Host "Category creation status: $($categoryResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Category creation response: $($categoryResponse.Content)" -ForegroundColor Cyan
    
    Write-Host "`n=== Auth with correct token successful ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green 