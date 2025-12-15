// Simple JWT decoder
function decodeJWT(token) {
  try {
    // Remove Bearer prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    // Split the token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid JWT format');
      return null;
    }
    
    // Decode header and payload
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('JWT Header:', header);
    console.log('JWT Payload:', payload);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('Token is expired!');
      console.log('Current time:', now);
      console.log('Token expires:', payload.exp);
    } else {
      console.log('Token is valid');
      console.log('Current time:', now);
      console.log('Token expires:', payload.exp);
    }
    
    return { header, payload };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Test with a sample token (you can replace this with actual token)
const sampleToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNmMzQ5YTYxLTFkYTEtNGRmOS05ZGRmLWRjMDBhNGZmNzcyNyIsImVtYWlsIjoibmV3dXNlckFkbWluQHRlc3QuY29tIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNzU0MDg2Nzk2LCJleHAiOjE3NTQwODcwOTZ9.LsuCgg6f7klhrcaX-W0ydYi0KmDNCdI6wfKCT9nDd2Q";

console.log('Decoding JWT token...');
decodeJWT(sampleToken); 