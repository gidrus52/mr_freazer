const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCategory() {
    try {
        console.log('Adding category "тет" directly via Prisma...');
        
        const category = await prisma.category.create({
            data: {
                name: 'тет',
                description: 'Category tet added directly via Prisma',
                isActive: true,
            }
        });
        
        console.log('Category created successfully:', category);
        
        // Get all categories to verify
        const categories = await prisma.category.findMany();
        console.log('All categories:', categories);
        
    } catch (error) {
        console.error('Error creating category:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addCategory(); 