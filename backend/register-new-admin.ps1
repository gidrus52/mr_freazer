# Script to register new admin
Write-Host "=== Registering new admin ===" -ForegroundColor Green

# Register new admin
Write-Host "1. Registering new admin..." -ForegroundColor Yellow
$registerBody = @{
    email = "newadmin@example.com"
    password = "123asx"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register-first-admin" -Method POST -Body $registerBody -ContentType "application/json"
    
    Write-Host "Register response:" -ForegroundColor Cyan
    $registerResponse | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== New admin registered successfully ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Registration completed ===" -ForegroundColor Green 