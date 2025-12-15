# Test with correct admin credentials
Write-Host "=== Testing with correct admin credentials ===" -ForegroundColor Green

# Test login endpoint with correct credentials
Write-Host "Testing login endpoint..." -ForegroundColor Yellow
$loginBody = @{
    email = "newadmin@test.com"
    password = "admin123"
} | ConvertTo-Json

try {
    Write-Host "Sending request to: http://localhost:3001/api/auth/login" -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "=== Test completed ===" -ForegroundColor Green
