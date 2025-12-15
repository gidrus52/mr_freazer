# Test auth with correct token
Write-Host "=== Test Auth with Correct Token ===" -ForegroundColor Green

# 1. Login and get token
Write-Host "1. Login and get token..." -ForegroundColor Yellow
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
    
    # 2. Test protected endpoint with token
    Write-Host "`n2. Testing protected endpoint..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $tokenWithoutBearer"
        "Content-Type" = "application/json"
    }
    
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers
    Write-Host "Protected endpoint status: $($testResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Response: $($testResponse.Content)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green 