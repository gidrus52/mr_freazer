# Тест создания категории через API
Write-Host "=== Тест создания категории ===" -ForegroundColor Green

# 1. Логин как админ
Write-Host "1. Логин как админ..." -ForegroundColor Yellow
$loginBody = @{
    email = "newuserAdmin"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"

Write-Host "Login response:" -ForegroundColor Cyan
$loginResponse | ConvertTo-Json -Depth 3

# Извлекаем access token
$accessToken = $loginResponse.accessToken
Write-Host "Access token: $accessToken" -ForegroundColor Cyan

# 2. Создание корневой категории
Write-Host "`n2. Создание корневой категории..." -ForegroundColor Yellow
$categoryBody = @{
    name = "Электроника"
    description = "Все виды электронных устройств"
    isActive = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = $accessToken
    "Content-Type" = "application/json"
}

$categoryResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method POST -Body $categoryBody -Headers $headers

Write-Host "Category creation response:" -ForegroundColor Cyan
$categoryResponse | ConvertTo-Json -Depth 3

# 3. Получение списка категорий
Write-Host "`n3. Получение списка категорий..." -ForegroundColor Yellow
$categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method GET

Write-Host "Categories list:" -ForegroundColor Cyan
$categoriesResponse | ConvertTo-Json -Depth 3

Write-Host "`n=== Тест завершен ===" -ForegroundColor Green 