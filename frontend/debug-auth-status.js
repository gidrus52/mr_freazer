// Отладочный скрипт для проверки состояния аутентификации
console.log('=== ДИАГНОСТИКА АУТЕНТИФИКАЦИИ ===')

// Проверяем localStorage
const authToken = localStorage.getItem('authToken')
const isAdmin = localStorage.getItem('isAdmin')
const adminUser = localStorage.getItem('adminUser')

console.log('📋 Данные в localStorage:')
console.log('- authToken:', authToken ? `найден (${authToken.substring(0, 20)}...)` : 'не найден')
console.log('- isAdmin:', isAdmin)
console.log('- adminUser:', adminUser)

// Проверяем валидность токена
const isValidToken = (token) => {
    if (!token) return false
    if (token.length < 10) return false
    if (token.includes('test_token') || token.includes('fake')) return false
    return true
}

const tokenValid = isValidToken(authToken)
console.log('- Токен валидный:', tokenValid)

// Проверяем общую аутентификацию
const isAuthenticated = !!authToken && !!isAdmin && tokenValid
console.log('- Общая аутентификация:', isAuthenticated)

// Проверяем заголовки запросов
console.log('\n🔍 Проверка заголовков запросов:')
const testHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

if (tokenValid) {
    testHeaders['Authorization'] = `Bearer ${authToken}`
    console.log('✅ Заголовок Authorization добавлен')
} else {
    console.log('❌ Заголовок Authorization НЕ добавлен (токен невалидный)')
}

console.log('Заголовки для запроса:', testHeaders)

// Тестируем API запрос
console.log('\n🧪 Тестирование API запроса...')
fetch('/api/categories', {
    method: 'GET',
    headers: testHeaders
})
.then(response => {
    console.log('Статус ответа:', response.status)
    return response.json()
})
.then(data => {
    console.log('Данные ответа:', data)
})
.catch(error => {
    console.error('Ошибка запроса:', error)
})

console.log('\n=== КОНЕЦ ДИАГНОСТИКИ ===') 