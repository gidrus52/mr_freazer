Write-Host "=== TOKEN FIX TEST ===" -ForegroundColor Yellow

# 1. Login to get token
Write-Host "1. Login to get token..." -ForegroundColor Cyan
$loginBody = @{
    email = "testuser@example.com"
    password = "testuser123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "Login status: $($loginResponse.StatusCode)" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.accessToken
    Write-Host "Token received: $($token.Substring(0, 50))..." -ForegroundColor Green
    
    # Check if token already has "Bearer " prefix
    if ($token.StartsWith("Bearer ")) {
        Write-Host "Token already has 'Bearer ' prefix" -ForegroundColor Yellow
    } else {
        Write-Host "Token does NOT have 'Bearer ' prefix" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Test with token as-is (without adding "Bearer ")
Write-Host "`n2. Testing with token as-is..." -ForegroundColor Cyan
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = $token
    }
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers
    Write-Host "✅ Success with token as-is: $($protectedResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($protectedResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed with token as-is: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Error status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 3. Test with explicit "Bearer " prefix
Write-Host "`n3. Testing with explicit 'Bearer ' prefix..." -ForegroundColor Cyan
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers
    Write-Host "✅ Success with explicit 'Bearer ' prefix: $($protectedResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($protectedResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed with explicit 'Bearer ' prefix: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Error status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Yellow 