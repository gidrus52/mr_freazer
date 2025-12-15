// Check environment variables
console.log('Checking environment variables...');

// Check if JWT_SECRET is set
const jwtSecret = process.env.JWT_SECRET;
console.log('JWT_SECRET:', jwtSecret ? 'SET' : 'NOT SET');

// Check if REFRESH_SECRET is set
const refreshSecret = process.env.REFRESH_SECRET;
console.log('REFRESH_SECRET:', refreshSecret ? 'SET' : 'NOT SET');

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL:', databaseUrl ? 'SET' : 'NOT SET');

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV;
console.log('NODE_ENV:', nodeEnv || 'NOT SET');

// List all environment variables
console.log('\nAll environment variables:');
Object.keys(process.env).forEach(key => {
    if (key.includes('JWT') || key.includes('SECRET') || key.includes('DATABASE')) {
        console.log(`${key}: ${process.env[key]}`);
    }
}); 