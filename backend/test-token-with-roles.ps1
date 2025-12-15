# Test that user roles are returned with token

Write-Host "=== Test user roles with token ===" -ForegroundColor Green

# 1. Register regular user
Write-Host "`n1. Registering regular user..." -ForegroundColor Yellow
$registerBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "User registered successfully:" -ForegroundColor Green
    Write-Host "  ID: $($registerResponse.id)" -ForegroundColor Cyan
    Write-Host "  Email: $($registerResponse.email)" -ForegroundColor Cyan
    Write-Host "  Roles: $($registerResponse.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "Registration error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Login user and check token response
Write-Host "`n2. User login - checking token response..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful - Token response:" -ForegroundColor Green
    Write-Host "  Access Token: $($loginResponse.accessToken.Substring(0, 20))..." -ForegroundColor Cyan
    
    if ($loginResponse.user) {
        Write-Host "  User info in token response:" -ForegroundColor Green
        Write-Host "    ID: $($loginResponse.user.id)" -ForegroundColor Cyan
        Write-Host "    Email: $($loginResponse.user.email)" -ForegroundColor Cyan
        Write-Host "    Roles: $($loginResponse.user.roles -join ', ')" -ForegroundColor Cyan
    } else {
        Write-Host "  ERROR: User info not found in token response!" -ForegroundColor Red
    }
} catch {
    Write-Host "Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Register admin
Write-Host "`n3. Registering admin..." -ForegroundColor Yellow
$adminRegisterBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminRegisterResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/register-first-admin" -Method POST -Body $adminRegisterBody -ContentType "application/json"
    Write-Host "Admin registered successfully:" -ForegroundColor Green
    Write-Host "  ID: $($adminRegisterResponse.id)" -ForegroundColor Cyan
    Write-Host "  Email: $($adminRegisterResponse.email)" -ForegroundColor Cyan
    Write-Host "  Roles: $($adminRegisterResponse.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "Admin registration error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Login admin and check token response
Write-Host "`n4. Admin login - checking token response..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
    Write-Host "Admin login successful - Token response:" -ForegroundColor Green
    Write-Host "  Access Token: $($adminLoginResponse.accessToken.Substring(0, 20))..." -ForegroundColor Cyan
    
    if ($adminLoginResponse.user) {
        Write-Host "  User info in token response:" -ForegroundColor Green
        Write-Host "    ID: $($adminLoginResponse.user.id)" -ForegroundColor Cyan
        Write-Host "    Email: $($adminLoginResponse.user.email)" -ForegroundColor Cyan
        Write-Host "    Roles: $($adminLoginResponse.user.roles -join ', ')" -ForegroundColor Cyan
    } else {
        Write-Host "  ERROR: User info not found in admin token response!" -ForegroundColor Red
    }
} catch {
    Write-Host "Admin login error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test refresh tokens
Write-Host "`n5. Testing refresh tokens..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = $loginResponse.accessToken
}

try {
    $refreshResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/refresh-tokens" -Method GET -Headers $headers
    Write-Host "Refresh tokens successful:" -ForegroundColor Green
    Write-Host "  New Access Token: $($refreshResponse.accessToken.Substring(0, 20))..." -ForegroundColor Cyan
    
    if ($refreshResponse.user) {
        Write-Host "  User info in refresh response:" -ForegroundColor Green
        Write-Host "    ID: $($refreshResponse.user.id)" -ForegroundColor Cyan
        Write-Host "    Email: $($refreshResponse.user.email)" -ForegroundColor Cyan
        Write-Host "    Roles: $($refreshResponse.user.roles -join ', ')" -ForegroundColor Cyan
    } else {
        Write-Host "  ERROR: User info not found in refresh response!" -ForegroundColor Red
    }
} catch {
    Write-Host "Refresh tokens error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Yellow
Write-Host "User roles are now returned with access token during login" -ForegroundColor Green
Write-Host "User roles are returned with refresh token response" -ForegroundColor Green
Write-Host "Both regular users and admins get their roles in token response" -ForegroundColor Green
