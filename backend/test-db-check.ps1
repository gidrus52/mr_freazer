Write-Host "=== DATABASE CHECK ==="

# 1. Test public endpoint to see if server is running
Write-Host "1. Testing server connection..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
    Write-Host "Server is running, status: $($response.StatusCode)"
} catch {
    Write-Host "Server is not running or not accessible"
    exit
}

# 2. Try to register a new admin user
Write-Host "`n2. Trying to register a new admin user..."
$registerBody = @{
    email = "testadmin@example.com"
    password = "testadmin123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $registerBody
    Write-Host "Register status: $($registerResponse.StatusCode)"
    Write-Host "Register response: $($registerResponse.Content)"
} catch {
    Write-Host "Register failed: $($_.Exception.Message)"
}

# 3. Try to login with the new user
Write-Host "`n3. Trying to login with new user..."
$loginBody = @{
    email = "testadmin@example.com"
    password = "testadmin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "Login status: $($loginResponse.StatusCode)"
    Write-Host "Login response: $($loginResponse.Content)"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
}

Write-Host "`n=== END ===" 