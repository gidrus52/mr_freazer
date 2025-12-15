# Script to add category "тет"
Write-Host "=== Adding category 'тет' ===" -ForegroundColor Green

# 1. Login as admin
Write-Host "1. Login as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"

Write-Host "Login response:" -ForegroundColor Cyan
$loginResponse | ConvertTo-Json -Depth 3

# Extract access token
$accessToken = $loginResponse.accessToken
Write-Host "Access token: $accessToken" -ForegroundColor Cyan

# 2. Create category "тет"
Write-Host "`n2. Creating category 'тет'..." -ForegroundColor Yellow
$categoryBody = @{
    name = "тет"
    description = "Category tet"
    isActive = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

$categoryResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method POST -Body $categoryBody -Headers $headers

Write-Host "Category creation response:" -ForegroundColor Cyan
$categoryResponse | ConvertTo-Json -Depth 3

# 3. Get list of categories for verification
Write-Host "`n3. Getting list of categories..." -ForegroundColor Yellow
$categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method GET

Write-Host "Categories list:" -ForegroundColor Cyan
$categoriesResponse | ConvertTo-Json -Depth 3

Write-Host "`n=== Category 'тет' successfully added ===" -ForegroundColor Green 