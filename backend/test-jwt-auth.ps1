Write-Host "=== JWT AUTH TEST ==="

# 1. Login to get token
Write-Host "1. Login to get token..."
$loginBody = @{
    email = "testuser@example.com"
    password = "testuser123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "Login status: $($loginResponse.StatusCode)"
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.accessToken
    Write-Host "Token received: $($token.Substring(0, 50))..."
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    exit
}

# 2. Test public endpoint (should work without token)
Write-Host "`n2. Testing public endpoint..."
try {
    $publicResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
    Write-Host "Public endpoint status: $($publicResponse.StatusCode)"
} catch {
    Write-Host "Public endpoint error: $($_.Exception.Message)"
}

# 3. Test protected endpoint with token (should work)
Write-Host "`n3. Testing protected endpoint with token..."
try {
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers @{"Authorization"=$token}
    Write-Host "Protected endpoint status: $($protectedResponse.StatusCode)"
    Write-Host "Protected endpoint response: $($protectedResponse.Content)"
} catch {
    Write-Host "Protected endpoint error: $($_.Exception.Message)"
}

# 4. Test admin-only endpoint with user token (should fail)
Write-Host "`n4. Testing admin-only endpoint with user token..."
try {
    $adminBody = @{name="Test Category"; description="Test Description"} | ConvertTo-Json
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$token} -Body $adminBody
    Write-Host "Admin endpoint status: $($adminResponse.StatusCode)"
    Write-Host "Admin endpoint response: $($adminResponse.Content)"
} catch {
    Write-Host "Admin endpoint error: $($_.Exception.Message)"
}

Write-Host "`n=== END ===" 