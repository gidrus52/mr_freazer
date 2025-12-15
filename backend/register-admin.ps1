# Script to register first admin
Write-Host "=== Registering first admin ===" -ForegroundColor Green

# Register first admin
Write-Host "1. Registering first admin..." -ForegroundColor Yellow
$registerBody = @{
    email = "admin@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register-first-admin" -Method POST -Body $registerBody -ContentType "application/json"
    
    Write-Host "Register response:" -ForegroundColor Cyan
    $registerResponse | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== Admin registered successfully ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Registration completed ===" -ForegroundColor Green 