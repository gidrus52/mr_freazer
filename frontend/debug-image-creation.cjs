// Отладочный скрипт для тестирования создания изображений
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
let authToken = null;
let productId = null;

async function login() {
    console.log('🔐 Выполняю вход...');
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'newuserAdmin@test.com',
                password: '123asx'
            })
        });
        
        const data = await response.json();
        if (data.success) {
            authToken = data.data.token;
            console.log('✅ Вход выполнен, токен:', authToken.substring(0, 20) + '...');
            return true;
        } else {
            console.error('❌ Ошибка входа:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка сети при входе:', error.message);
        return false;
    }
}

async function createProduct() {
    console.log('🛍️ Создаю товар...');
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: 'Тестовый товар для изображения',
                description: 'Описание тестового товара',
                price: 1000,
                categoryId: 'cat_1'
            })
        });
        
        const data = await response.json();
        if (data.success) {
            productId = data.data.id;
            console.log('✅ Товар создан, ID:', productId);
            return true;
        } else {
            console.error('❌ Ошибка создания товара:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка сети при создании товара:', error.message);
        return false;
    }
}

async function uploadImage() {
    console.log('📸 Загружаю изображение...');
    
    // Простое тестовое изображение (1x1 пиксель PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    try {
        const response = await fetch(`${API_BASE}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                productId: productId,
                data: testImageData,
                type: 'image/png',
                alt: 'Тестовое изображение',
                isPrimary: true,
                order: 0
            })
        });
        
        const data = await response.json();
        console.log('📸 Ответ сервера:', data);
        
        if (data.success) {
            console.log('✅ Изображение создано, ID:', data.data.id);
            return data.data;
        } else {
            console.error('❌ Ошибка создания изображения:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Ошибка сети при создании изображения:', error.message);
        return null;
    }
}

async function getImages() {
    console.log('📋 Получаю список изображений...');
    try {
        const response = await fetch(`${API_BASE}/images/product/${productId}`);
        
        const data = await response.json();
        if (data.success) {
            console.log('✅ Изображения получены:', data.data.length, 'шт.');
            console.log('📋 Список изображений:', data.data.map(img => ({
                id: img.id,
                alt: img.alt,
                isPrimary: img.isPrimary,
                order: img.order
            })));
            return data.data;
        } else {
            console.error('❌ Ошибка получения изображений:', data.message);
            return [];
        }
    } catch (error) {
        console.error('❌ Ошибка сети при получении изображений:', error.message);
        return [];
    }
}

async function runTest() {
    console.log('🚀 Начинаю тестирование создания изображений...\n');
    
    // Шаг 1: Вход
    const loginSuccess = await login();
    if (!loginSuccess) return;
    
    console.log('');
    
    // Шаг 2: Создание товара
    const productSuccess = await createProduct();
    if (!productSuccess) return;
    
    console.log('');
    
    // Шаг 3: Создание изображения
    const image = await uploadImage();
    if (!image) return;
    
    console.log('');
    
    // Шаг 4: Проверка списка изображений
    const images = await getImages();
    
    console.log('\n🎉 Тестирование завершено!');
    console.log('📊 Результат:', images.length > 0 ? 'УСПЕХ' : 'НЕУДАЧА');
}

runTest().catch(console.error);
