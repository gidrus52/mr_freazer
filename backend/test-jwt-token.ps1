Write-Host "=== JWT TOKEN TEST ==="

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
    
    # Decode JWT token (header and payload)
    $tokenParts = $token.Replace("Bearer ", "").Split(".")
    $header = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[0] + "=="))
    $payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
    
    Write-Host "Token header: $header"
    Write-Host "Token payload: $payload"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    exit
}

# 2. Test protected endpoint with token
Write-Host "`n2. Testing protected endpoint with token..."
try {
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers @{"Authorization"=$token}
    Write-Host "Protected endpoint status: $($protectedResponse.StatusCode)"
    Write-Host "Protected endpoint response: $($protectedResponse.Content)"
} catch {
    Write-Host "Protected endpoint error: $($_.Exception.Message)"
    Write-Host "Error details: $($_.Exception.Response.StatusCode)"
}

Write-Host "`n=== END ===" 