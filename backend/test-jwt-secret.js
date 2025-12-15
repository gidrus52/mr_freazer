require('dotenv').config();

console.log('Testing JWT_SECRET loading...');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('REFRESH_SECRET:', process.env.REFRESH_SECRET);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const jwt = require('jsonwebtoken');

const payload = {
    id: 'ad8392bd-bb9a-4425-bb25-6b7fbd41a710',
    email: 'newuserAdmin@test.com',
    roles: ['ADMIN'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300
};

console.log('Payload:', payload);

try {
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    console.log('Generated token:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    console.log('JWT_SECRET is working correctly!');
} catch (error) {
    console.error('Error with JWT_SECRET:', error);
} 