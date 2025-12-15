const fetch = require('node-fetch');

async function testImagesAPI() {
    console.log('🔄 Тестируем API изображений...');
    
    try {
        // Тестируем подключение
        console.log('1. Тестируем подключение к серверу...');
        const healthResponse = await fetch('http://localhost:3000/api/health');
        const healthData = await healthResponse.json();
        console.log('✅ Подключение:', healthData);
        
        // Тестируем получение товаров
        console.log('\n2. Получаем товары...');
        const productsResponse = await fetch('http://localhost:3000/api/products');
        const productsData = await productsResponse.json();
        console.log('📦 Товары:', productsData.success ? `${productsData.data.length} шт.` : 'Ошибка');
        if (productsData.success && productsData.data.length > 0) {
            console.log('   Первый товар:', productsData.data[0]);
        }
        
        // Тестируем получение всех изображений
        console.log('\n3. Получаем все изображения...');
        const imagesResponse = await fetch('http://localhost:3000/api/images');
        const imagesData = await imagesResponse.json();
        console.log('🖼️ Изображения:', imagesData.success ? `${imagesData.data.length} шт.` : 'Ошибка');
        console.log('📊 Ответ API:', JSON.stringify(imagesData, null, 2));
        
        if (imagesData.success && imagesData.data.length > 0) {
            console.log('\n4. Анализируем изображения...');
            const firstImage = imagesData.data[0];
            console.log('   Первое изображение:', {
                id: firstImage.id,
                productId: firstImage.productId,
                hasData: !!firstImage.data,
                hasUrl: !!firstImage.url,
                type: firstImage.type,
                alt: firstImage.alt
            });
            
            // Группируем по товарам
            const imagesByProduct = new Map();
            imagesData.data.forEach(image => {
                const productId = image.productId.toString();
                if (!imagesByProduct.has(productId)) {
                    imagesByProduct.set(productId, []);
                }
                imagesByProduct.get(productId).push(image);
            });
            
            console.log(`\n5. Группировка: ${imagesByProduct.size} товаров с изображениями`);
            imagesByProduct.forEach((images, productId) => {
                console.log(`   Товар ${productId}: ${images.length} изображений`);
            });
        }
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

testImagesAPI();
