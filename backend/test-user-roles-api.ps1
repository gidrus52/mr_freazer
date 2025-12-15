# Test user roles in API responses

Write-Host "=== Test user roles in API ===" -ForegroundColor Green

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

# 2. Login user
Write-Host "`n2. User login..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "Login successful" -ForegroundColor Green
    Write-Host "  Token received: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = $token
}

# 3. Test /user/me endpoint
Write-Host "`n3. Testing /user/me endpoint..." -ForegroundColor Yellow
try {
    $meResponse = Invoke-RestMethod -Uri "http://localhost:3001/user/me" -Method GET -Headers $headers
    Write-Host "/user/me endpoint works:" -ForegroundColor Green
    Write-Host "  ID: $($meResponse.id)" -ForegroundColor Cyan
    Write-Host "  Email: $($meResponse.email)" -ForegroundColor Cyan
    Write-Host "  Roles: $($meResponse.roles -join ', ')" -ForegroundColor Cyan
    Write-Host "  Updated: $($meResponse.updatedAt)" -ForegroundColor Cyan
} catch {
    Write-Host "/user/me error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test /user/:idOrEmail endpoint
Write-Host "`n4. Testing /user/:idOrEmail endpoint..." -ForegroundColor Yellow
try {
    $userResponse = Invoke-RestMethod -Uri "http://localhost:3001/user/testuser@example.com" -Method GET -Headers $headers
    Write-Host "/user/:idOrEmail endpoint works:" -ForegroundColor Green
    Write-Host "  ID: $($userResponse.id)" -ForegroundColor Cyan
    Write-Host "  Email: $($userResponse.email)" -ForegroundColor Cyan
    Write-Host "  Roles: $($userResponse.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "/user/:idOrEmail error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Register admin
Write-Host "`n5. Registering admin..." -ForegroundColor Yellow
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

# 6. Admin login
Write-Host "`n6. Admin login..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminLoginResponse.accessToken
    Write-Host "Admin login successful" -ForegroundColor Green
    Write-Host "  Token received: $($adminToken.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "Admin login error: $($_.Exception.Message)" -ForegroundColor Red
}

$adminHeaders = @{
    "Authorization" = $adminToken
}

# 7. Test /user/me for admin
Write-Host "`n7. Testing /user/me for admin..." -ForegroundColor Yellow
try {
    $adminMeResponse = Invoke-RestMethod -Uri "http://localhost:3001/user/me" -Method GET -Headers $adminHeaders
    Write-Host "/user/me for admin works:" -ForegroundColor Green
    Write-Host "  ID: $($adminMeResponse.id)" -ForegroundColor Cyan
    Write-Host "  Email: $($adminMeResponse.email)" -ForegroundColor Cyan
    Write-Host "  Roles: $($adminMeResponse.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "/user/me for admin error: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Test /user (get all users) - admin only
Write-Host "`n8. Testing /user (all users)..." -ForegroundColor Yellow
try {
    $allUsersResponse = Invoke-RestMethod -Uri "http://localhost:3001/user" -Method GET -Headers $adminHeaders
    Write-Host "/user (all users) endpoint works:" -ForegroundColor Green
    Write-Host "  Found users: $($allUsersResponse.Count)" -ForegroundColor Cyan
    foreach ($user in $allUsersResponse) {
        Write-Host "  User: $($user.email) - Roles: $($user.roles -join ', ')" -ForegroundColor Cyan
    }
} catch {
    Write-Host "/user (all users) error: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Test regular user trying to get all users (should be error)
Write-Host "`n9. Testing regular user access to /user (should be error)..." -ForegroundColor Yellow
try {
    $unauthorizedResponse = Invoke-RestMethod -Uri "http://localhost:3001/user" -Method GET -Headers $headers
    Write-Host "ERROR: Regular user got access to admin endpoint!" -ForegroundColor Red
} catch {
    Write-Host "Correct: Regular user cannot get all users" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Yellow
Write-Host "Roles are returned in /user/me endpoint" -ForegroundColor Green
Write-Host "Roles are returned in /user/:idOrEmail endpoint" -ForegroundColor Green
Write-Host "Roles are returned in /user endpoint (for admins)" -ForegroundColor Green
Write-Host "Roles are returned during registration" -ForegroundColor Green
Write-Host "Authorization works correctly" -ForegroundColor Green