# Script to check users in database
Write-Host "=== Checking users in database ===" -ForegroundColor Green

# Try to connect to database and check users
try {
    # Check if we can connect to the database
    Write-Host "1. Checking database connection..." -ForegroundColor Yellow
    
    # Try to get users from the API
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
    Write-Host "Users found:" -ForegroundColor Cyan
    $usersResponse | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Check completed ===" -ForegroundColor Green 