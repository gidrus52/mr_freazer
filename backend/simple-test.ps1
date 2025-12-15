# Простой тест системы
Write-Host "Testing system..." -ForegroundColor Green

# 1. Test public endpoints
Write-Host "`n1. Testing public endpoints..." -ForegroundColor Yellow

try {
    $categories = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method GET
    Write-Host "Categories endpoint works" -ForegroundColor Green
    $categoriesData = $categories.Content | ConvertFrom-Json
    Write-Host "Found $($categoriesData.Count) categories" -ForegroundColor Cyan
} catch {
    Write-Host "Categories endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $products = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method GET
    Write-Host "Products endpoint works" -ForegroundColor Green
    $productsData = $products.Content | ConvertFrom-Json
    Write-Host "Found $($productsData.Count) products" -ForegroundColor Cyan
} catch {
    Write-Host "Products endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test admin registration
Write-Host "`n2. Testing admin registration..." -ForegroundColor Yellow

$adminBody = '{"email":"newadmin@test.com","password":"admin123"}'
try {
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminBody
    Write-Host "Admin registered successfully" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "Admin already exists" -ForegroundColor Yellow
    } else {
        Write-Host "Admin registration error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Test admin login
Write-Host "`n3. Testing admin login..." -ForegroundColor Yellow

$loginBody = '{"email":"newadmin@test.com","password":"admin123"}'
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "Admin login successful" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $adminToken = $loginData.accessToken
    Write-Host "Got admin token" -ForegroundColor Cyan
} catch {
    Write-Host "Admin login error: $($_.Exception.Message)" -ForegroundColor Red
    $adminToken = $null
}

# 4. Test admin protected endpoints
if ($adminToken) {
    Write-Host "`n4. Testing admin protected endpoints..." -ForegroundColor Yellow
    
    $adminHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $adminToken"
    }
    
    # Create category
    $categoryBody = '{"name":"Test Category","description":"Test category description"}'
    try {
        $categoryResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers $adminHeaders -Body $categoryBody
        Write-Host "Category created successfully" -ForegroundColor Green
        $categoryData = $categoryResponse.Content | ConvertFrom-Json
        $testCategoryId = $categoryData.id
        Write-Host "Category ID: $testCategoryId" -ForegroundColor Cyan
    } catch {
        Write-Host "Category creation error: $($_.Exception.Message)" -ForegroundColor Red
        $testCategoryId = $null
    }
    
    # Create product
    if ($testCategoryId) {
        $productBody = '{"name":"Test Product","description":"Test product description","price":100,"stock":10,"categoryId":"' + $testCategoryId + '"}'
        try {
            $productResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -Method POST -Headers $adminHeaders -Body $productBody
            Write-Host "Product created successfully" -ForegroundColor Green
            $productData = $productResponse.Content | ConvertFrom-Json
            Write-Host "Product ID: $($productData.id)" -ForegroundColor Cyan
        } catch {
            Write-Host "Product creation error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Get users list
    try {
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers $adminHeaders
        Write-Host "Users list retrieved successfully" -ForegroundColor Green
        $usersData = $usersResponse.Content | ConvertFrom-Json
        Write-Host "Found $($usersData.Count) users" -ForegroundColor Cyan
    } catch {
        Write-Host "Users list error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Test user registration
Write-Host "`n5. Testing user registration..." -ForegroundColor Yellow

$userBody = '{"email":"testuser@test.com","password":"user123"}'
try {
    $userResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $userBody
    Write-Host "User registered successfully" -ForegroundColor Green
} catch {
    Write-Host "User registration error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Test user login
Write-Host "`n6. Testing user login..." -ForegroundColor Yellow

$userLoginBody = '{"email":"testuser@test.com","password":"user123"}'
try {
    $userLoginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $userLoginBody
    Write-Host "User login successful" -ForegroundColor Green
    $userLoginData = $userLoginResponse.Content | ConvertFrom-Json
    $userToken = $userLoginData.accessToken
    Write-Host "Got user token" -ForegroundColor Cyan
} catch {
    Write-Host "User login error: $($_.Exception.Message)" -ForegroundColor Red
    $userToken = $null
}

# 7. Test user restrictions
if ($userToken) {
    Write-Host "`n7. Testing user restrictions..." -ForegroundColor Yellow
    
    $userHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $userToken"
    }
    
    # Try to create category (should be forbidden)
    $forbiddenCategoryBody = '{"name":"Forbidden Category","description":"This should not be created"}'
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -Method POST -Headers $userHeaders -Body $forbiddenCategoryBody
        Write-Host "ERROR: User was able to create category (should be forbidden)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "Category creation correctly forbidden for user (403)" -ForegroundColor Green
        } else {
            Write-Host "Unexpected error for category creation: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Try to get users list (should be forbidden)
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/api/user" -Method GET -Headers $userHeaders
        Write-Host "ERROR: User was able to get users list (should be forbidden)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "Users list correctly forbidden for user (403)" -ForegroundColor Green
        } else {
            Write-Host "Unexpected error for users list: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green 