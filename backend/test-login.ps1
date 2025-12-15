# Test login
Write-Host "Testing login..." -ForegroundColor Green

$loginBody = @{
    email = "newuserAdmin"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} 