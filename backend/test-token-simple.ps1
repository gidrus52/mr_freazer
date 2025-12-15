Write-Host "=== SIMPLE TOKEN TEST ===" -ForegroundColor Yellow

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
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Test protected endpoint with token
Write-Host "`n2. Testing protected endpoint with token..." -ForegroundColor Cyan
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = $token
    }
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user" -Method GET -Headers $headers
    Write-Host "✅ Protected endpoint success: $($protectedResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($protectedResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Protected endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Error status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 3. Test public endpoint (should work without token)
Write-Host "`n3. Testing public endpoint..." -ForegroundColor Cyan
try {
    $publicResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method GET
    Write-Host "✅ Public endpoint success: $($publicResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Public endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Yellow 