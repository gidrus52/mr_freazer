const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database data...\n');
    
    // Check categories
    const categories = await prisma.category.findMany();
    console.log('📂 Categories:', categories.length);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id})`);
    });
    
    // Check products
    const products = await prisma.product.findMany();
    console.log('\n🛍️ Products:', products.length);
    products.forEach(prod => {
      console.log(`  - ${prod.name} (${prod.id})`);
    });
    
    // Check images
    const images = await prisma.image.findMany();
    console.log('\n🖼️ Images:', images.length);
    images.forEach(img => {
      console.log(`  - Image ${img.id} for product ${img.productId}`);
    });
    
    // Check users
    const users = await prisma.user.findMany();
    console.log('\n👤 Users:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
