// Детальная диагностика заголовков
console.log('=== ДЕТАЛЬНАЯ ДИАГНОСТИКА ЗАГОЛОВКОВ ===');

// 1. Проверяем localStorage
const token = localStorage.getItem('authToken');
const isAdmin = localStorage.getItem('isAdmin');
const adminUser = localStorage.getItem('adminUser');

console.log('1. Состояние localStorage:');
console.log('- authToken:', token ? `найден (${token.substring(0, 20)}...)` : 'не найден');
console.log('- isAdmin:', isAdmin);
console.log('- adminUser:', adminUser);

// 2. Создаем заголовки как в apiRequest
console.log('\n2. Создание заголовков:');
const headers = {
    'Content-Type': 'application/json'
};

if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization добавлен:', `Bearer ${token.substring(0, 20)}...`);
} else {
    console.log('❌ Authorization НЕ добавлен (нет токена)');
}

console.log('Все заголовки:', headers);

// 3. Тестируем запрос с перехватом
async function testRequestWithIntercept() {
    console.log('\n3. Тестирование запроса с перехватом:');
    
    // Создаем объект для отслеживания заголовков
    const requestInfo = {
        url: '/api/categories',
        method: 'GET',
        headers: headers
    };
    
    console.log('Отправляемые данные:', requestInfo);
    
    try {
        const response = await fetch(requestInfo.url, {
            method: requestInfo.method,
            headers: requestInfo.headers
        });
        
        console.log('Статус ответа:', response.status);
        console.log('Заголовки ответа:', response.headers);
        
        const responseText = await response.text();
        console.log('Текст ответа:', responseText);
        
        if (response.status === 401) {
            console.log('❌ ОШИБКА 401: Неавторизованный доступ');
            console.log('Возможные причины:');
            console.log('1. Токен невалидный или истек');
            console.log('2. Сервер не принимает токен');
            console.log('3. Дублирование заголовка Authorization');
        } else if (response.ok) {
            console.log('✅ Запрос успешен');
        } else {
            console.log(`❌ Ошибка API: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
    }
}

// 4. Тестируем создание категории
async function testCreateCategory() {
    console.log('\n4. Тестирование создания категории:');
    
    const categoryData = {
        name: 'Тестовая категория ' + Date.now(),
        description: 'Описание тестовой категории'
    };
    
    console.log('Данные категории:', categoryData);
    
    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(categoryData)
        });
        
        console.log('Статус создания:', response.status);
        console.log('Заголовки ответа:', response.headers);
        
        const responseText = await response.text();
        console.log('Ответ сервера:', responseText);
        
        if (response.status === 401) {
            console.log('❌ ОШИБКА 401 при создании категории');
        } else if (response.ok) {
            console.log('✅ Категория создана успешно');
        } else {
            console.log(`❌ Ошибка создания: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Ошибка при создании категории:', error);
    }
}

// 5. Проверяем, нет ли дублирования в других местах
function checkForDuplicateHeaders() {
    console.log('\n5. Проверка на дублирование заголовков:');
    
    // Проверяем, не добавляется ли Authorization где-то еще
    const allHeaders = { ...headers };
    
    // Симулируем возможное дублирование
    if (allHeaders['Authorization']) {
        console.log('⚠️ ВНИМАНИЕ: Заголовок Authorization уже существует');
        console.log('Текущее значение:', allHeaders['Authorization']);
        
        // Проверяем, не содержит ли он уже "Bearer Bearer"
        if (allHeaders['Authorization'].includes('Bearer Bearer')) {
            console.log('❌ ОБНАРУЖЕНО ДУБЛИРОВАНИЕ: Bearer Bearer');
        }
    }
    
    console.log('Финальные заголовки:', allHeaders);
}

// Запускаем все тесты
checkForDuplicateHeaders();
testRequestWithIntercept();
setTimeout(testCreateCategory, 1000); 