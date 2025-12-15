# Script to create admin newuserAdmin@test.com with password 123asx
Write-Host "=== Creating admin newuserAdmin@test.com ===" -ForegroundColor Green

# Create admin
Write-Host "1. Creating admin..." -ForegroundColor Yellow
$registerBody = @{
    email = "newuserAdmin@test.com"
    password = "123asx"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register-first-admin" -Method POST -Body $registerBody -Headers @{"Content-Type"="application/json"}
    
    Write-Host "Register status: $($registerResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Register response:" -ForegroundColor Cyan
    $registerResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== Admin created successfully ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Operation completed ===" -ForegroundColor Green 