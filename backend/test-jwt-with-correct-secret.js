require('dotenv').config();
const jwt = require('jsonwebtoken');

// Test JWT with the correct secret from .env
const JWT_SECRET = process.env.JWT_SECRET;

function testJWT() {
  try {
    console.log('Testing JWT with secret:', JWT_SECRET);
    
    // Create a test payload
    const payload = {
      id: 'ad8392bd-bb9a-4425-bb25-6b7fbd41a710',
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
    const apiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkODM5MmJkLWJiOWEtNDQyNS1iYjI1LTZiN2ZiZDQxYTcxMCIsImVtYWlsIjoibmV3dXNlckFkbWluQHRlc3QuY29tIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNzU0MDg3NTc0LCJleHAiOjE3NTQwODc4NzR9.zen5P7TgY0GIfU1KMAphZ0YKBTgMqrsuzs_nol4f0n4";
    
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