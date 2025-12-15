// Скрипт для диагностики проблем с аутентификацией
console.log('=== ДИАГНОСТИКА ПРОБЛЕМ С АУТЕНТИФИКАЦИЕЙ ===');

// 1. Проверяем localStorage
console.log('1. Проверка localStorage:');
const authToken = localStorage.getItem('authToken');
const isAdmin = localStorage.getItem('isAdmin');
const adminUser = localStorage.getItem('adminUser');

console.log('- authToken:', authToken ? `найден (${authToken.substring(0, 20)}...)` : 'не найден');
console.log('- isAdmin:', isAdmin);
console.log('- adminUser:', adminUser);

// 2. Проверяем валидность токена
function isValidToken(token) {
    if (!token) return false;
    if (token.length < 10) return false;
    if (token.includes('test_token') || token.includes('fake')) return false;
    return true;
}

console.log('2. Валидность токена:', isValidToken(authToken));

// 3. Тестируем запрос к API
async function testAPI() {
    console.log('3. Тестирование API запроса...');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (authToken && isValidToken(authToken)) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('- Добавлен заголовок Authorization');
    } else {
        console.log('- Заголовок Authorization НЕ добавлен');
    }

    try {
        const response = await fetch('/api/categories', {
            method: 'GET',
            headers
        });

        console.log('- Статус ответа:', response.status);
        console.log('- Заголовки ответа:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('- Текст ответа:', responseText);

        if (response.status === 401) {
            console.log('❌ ОШИБКА 401: Неавторизованный доступ');
            console.log('Рекомендации:');
            console.log('1. Проверьте, что сервер запущен на localhost:3000');
            console.log('2. Попробуйте войти заново');
            console.log('3. Проверьте, что токен не истек');
        } else if (response.ok) {
            console.log('✅ API запрос успешен');
        } else {
            console.log(`❌ Ошибка API: ${response.status}`);
        }

    } catch (error) {
        console.error('❌ Ошибка сети:', error);
    }
}

// 4. Тестируем вход в систему
async function testLogin() {
    console.log('4. Тестирование входа в систему...');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'newuserAdmin@test.com',
                password: '123asx'
            })
        });

        console.log('- Статус входа:', response.status);

        const responseText = await response.text();
        console.log('- Ответ сервера:', responseText);

        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('- Распарсенные данные:', data);

                // Ищем токен в ответе
                const token = data.token || data.access_token || data.jwt || data;
                if (token && typeof token === 'string') {
                    console.log('- Найден токен:', token.substring(0, 50) + '...');

                    // Сохраняем токен
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('isAdmin', 'true');
                    localStorage.setItem('adminUser', JSON.stringify({
                        email: 'newuserAdmin@test.com',
                        name: 'Администратор',
                        role: 'admin'
                    }));

                    console.log('✅ Токен сохранен в localStorage');

                    // Тестируем API с новым токеном
                    setTimeout(testAPI, 1000);
                } else {
                    console.log('❌ Токен не найден в ответе');
                }
            } catch (e) {
                console.error('❌ Ошибка парсинга JSON:', e);
            }
        } else {
            console.log('❌ Ошибка входа:', response.status);
        }

    } catch (error) {
        console.error('❌ Ошибка при входе:', error);
    }
}

// Запускаем диагностику
testLogin(); 