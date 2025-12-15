const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testJWTStrategy() {
  try {
    console.log('Testing JWT strategy...');
    
    // Find admin user
    const user = await prisma.user.findFirst({
      where: {
        email: 'newuserAdmin@test.com'
      }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      roles: user.roles
    });
    
    // Create a test JWT token
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles
    };
    
    // You would need to get the actual JWT_SECRET from your environment
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    const token = jwt.sign(payload, secret, { expiresIn: '5m' });
    console.log('Generated token:', token);
    
    // Decode the token
    const decoded = jwt.verify(token, secret);
    console.log('Decoded token:', decoded);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testJWTStrategy(); 