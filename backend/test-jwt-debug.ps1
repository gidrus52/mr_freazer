Write-Host "=== JWT DEBUG TEST ==="

# 1. Login
Write-Host "1. Admin login..."
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@example.com","password":"admin123"}'
Write-Host "Login status: $($loginResponse.StatusCode)"
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.accessToken
Write-Host "Token received: $($token.Substring(0, 50))..."

# 2. Test public endpoint (should work without token)
Write-Host "`n2. Testing public endpoint..."
try {
    $publicResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
    Write-Host "Public endpoint status: $($publicResponse.StatusCode)"
} catch {
    Write-Host "Public endpoint error: $($_.Exception.Message)"
}

# 3. Test protected endpoint with token
Write-Host "`n3. Testing protected endpoint with token..."
try {
    $body = @{name="TestCategory"; description="Test category"} | ConvertTo-Json
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"=$token} -Body $body
    Write-Host "Protected endpoint status: $($protectedResponse.StatusCode)"
    Write-Host "Response: $($protectedResponse.Content)"
} catch {
    Write-Host "Protected endpoint error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error body: $errorBody"
    }
}

Write-Host "`n=== TEST COMPLETED ===" 