# Script to register a new admin user on port 3001
Write-Host "=== Registering new admin user ===" -ForegroundColor Green

# Register admin
Write-Host "1. Registering new admin..." -ForegroundColor Yellow
$registerBody = @{
    email = "newadmin@test.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register-first-admin" -Method POST -Body $registerBody -ContentType "application/json"
    
    Write-Host "Register response:" -ForegroundColor Cyan
    $registerResponse | ConvertTo-Json -Depth 3
    
    Write-Host "`n=== New admin registered successfully ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== Registration completed ===" -ForegroundColor Green
