# Simple test for protected endpoint
Write-Host "=== Simple Protected Endpoint Test ===" -ForegroundColor Green

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
    
    # 2. Test protected endpoint
    Write-Host "`n2. Testing protected endpoint..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers
    Write-Host "Protected endpoint status: $($testResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Protected endpoint response: $($testResponse.Content)" -ForegroundColor Cyan
    
    Write-Host "`n=== Protected endpoint test successful ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green 