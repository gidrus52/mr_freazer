# Script to register admin with correct password
Write-Host "=== Registering admin with correct password ===" -ForegroundColor Green

# Register admin
Write-Host "1. Registering admin..." -ForegroundColor Yellow
$registerBody = @{
    email = "admin@example.com"
    password = "123asx"
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