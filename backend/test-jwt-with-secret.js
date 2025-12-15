const jwt = require('jsonwebtoken');

// Test JWT with the same secret that should be used in the app
const JWT_SECRET = "your-super-secret-jwt-key-here";

function testJWT() {
  try {
    console.log('Testing JWT with secret:', JWT_SECRET);
    
    // Create a test payload
    const payload = {
      id: 'cf349a61-1da1-4df9-9ddf-dc00a4ff7727',
      email: 'newuserAdmin@test.com',
      roles: ['ADMIN'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300 // 5 minutes
    };
    
    console.log('Payload:', payload);
    
    // Sign the token
    const token = jwt.sign(payload, JWT_SECRET);
    console.log('Generated token:', token);
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Test with a token from the API
    const apiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNmMzQ5YTYxLTFkYTEtNGRmOS05ZGRmLWRjMDBhNGZmNzcyNyIsImVtYWlsIjoibmV3dXNlckFkbWluQHRlc3QuY29tIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNzU0MDg2ODU1LCJleHAiOjE3NTQwODcxNTV9.BTPiHgDYioNgmicLWm6Ilq5trqHpKsJpLseUUA03qDk";
    
    try {
      const apiDecoded = jwt.verify(apiToken, JWT_SECRET);
      console.log('API token decoded:', apiDecoded);
    } catch (error) {
      console.log('API token verification failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testJWT(); 