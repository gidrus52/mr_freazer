Write-Host "=== TOKEN DEBUG TEST ===" -ForegroundColor Yellow

# 1. Login to get token
Write-Host "1. Login to get token..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "Login status: $($loginResponse.StatusCode)" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.accessToken
    Write-Host "Token received: $($token.Substring(0, 50))..." -ForegroundColor Green
    
    # Decode JWT token (header and payload)
    $tokenParts = $token.Replace("Bearer ", "").Split(".")
    $header = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[0] + "=="))
    $payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
    
    Write-Host "Token header: $header" -ForegroundColor Gray
    Write-Host "Token payload: $payload" -ForegroundColor Gray
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Test different ways to send token
Write-Host "`n2. Testing different token formats..." -ForegroundColor Cyan

# Test 1: With "Bearer " prefix
Write-Host "Test 1: With 'Bearer ' prefix" -ForegroundColor Yellow
try {
    $headers1 = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    $response1 = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers1
    Write-Host "✅ Success with 'Bearer ' prefix: $($response1.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed with 'Bearer ' prefix: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Without "Bearer " prefix (just token)
Write-Host "Test 2: Without 'Bearer ' prefix" -ForegroundColor Yellow
try {
    $headers2 = @{
        "Content-Type" = "application/json"
        "Authorization" = $token
    }
    $response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers2
    Write-Host "✅ Success without 'Bearer ' prefix: $($response2.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed without 'Bearer ' prefix: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: With lowercase "authorization" header
Write-Host "Test 3: With lowercase 'authorization' header" -ForegroundColor Yellow
try {
    $headers3 = @{
        "Content-Type" = "application/json"
        "authorization" = "Bearer $token"
    }
    $response3 = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers3
    Write-Host "✅ Success with lowercase header: $($response3.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed with lowercase header: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test public endpoint (should work without token)
Write-Host "`nTest 4: Public endpoint (should work without token)" -ForegroundColor Yellow
try {
    $response4 = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method GET
    Write-Host "✅ Public endpoint works: $($response4.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Public endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== DEBUG COMPLETED ===" -ForegroundColor Yellow 