# Test product creation with image fields
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer test-token'
}

$body = @{
    name = 'Test Product'
    description = 'Test Description'
    categoryId = 'test-category-id'
    price = 100
    stock = 10
    imageUrl = 'https://example.com/image.jpg'
    imageData = 'base64data'
    imageType = 'jpeg'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/products' -Method POST -Headers $headers -Body $body
    Write-Host "Success: $($response | ConvertTo-Json -Depth 10)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}
