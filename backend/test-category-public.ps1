# Test public access to categories
Write-Host "=== Test Public Access to Categories ===" -ForegroundColor Green

# 1. Test getting categories (should be public)
Write-Host "1. Testing public access to categories..." -ForegroundColor Yellow

try {
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method GET
    Write-Host "Public access to categories successful!" -ForegroundColor Green
    Write-Host "Categories found: $($categoriesResponse.Count)" -ForegroundColor Cyan
    Write-Host "Categories: $($categoriesResponse | ConvertTo-Json)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green 