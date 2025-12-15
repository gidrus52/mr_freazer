# 🔧 ИСПРАВЛЕНИЕ: Проблема с токенами во фронтенде

## ❌ Проблема

Ваш фронтенд отправляет **неправильный токен** - тестовый токен из jwt.io:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Вместо правильного токена из вашей системы авторизации.

## ✅ Решение

### 1. **Получите правильный токен**

#### Через PowerShell:
```powershell
$loginData = @{
    email = "newuserAdmin@test.com"
    password = "123asx"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginData

Write-Host "Правильный токен: $($response.accessToken)"
```

#### Через Postman:
```
POST http://localhost:3000/api/auth/login
Headers:
  Content-Type: application/json
Body:
{
    "email": "newuserAdmin@test.com",
    "password": "123asx"
}
```

### 2. **Исправьте фронтенд**

#### Вариант A: JavaScript/TypeScript
```javascript
// Получение токена
async function login(email, password) {
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    // Сохраняем токен
    localStorage.setItem('token', data.accessToken);
    
    return data;
}

// Использование токена
async function createCategory(categoryData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token // Токен уже содержит "Bearer "
        },
        body: JSON.stringify(categoryData)
    });
    
    return response.json();
}
```

#### Вариант B: Axios
```javascript
import axios from 'axios';

// Настройка axios
const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

// Функция входа
async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.accessToken);
    return response.data;
}

// Функция создания категории
async function createCategory(categoryData) {
    return await api.post('/categories', categoryData);
}
```

### 3. **Проверка токена**

#### Декодирование JWT токена:
```javascript
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Ошибка декодирования токена:', error);
        return null;
    }
}

// Проверка токена
const token = localStorage.getItem('token');
if (token) {
    const decoded = decodeToken(token);
    console.log('Декодированный токен:', decoded);
    
    // Проверка срока действия
    if (decoded.exp * 1000 < Date.now()) {
        console.log('Токен истек!');
        localStorage.removeItem('token');
    }
}
```

### 4. **Правильный токен должен содержать:**

```json
{
  "id": "cf349a61-1da1-4df9-9ddf-dc00a4ff7727",
  "email": "newuserAdmin@test.com",
  "roles": ["ADMIN"],
  "iat": 1753836943,
  "exp": 1753837243
}
```

### 5. **Неправильный токен (тестовый):**

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```

## 🎯 Результат

После исправления фронтенд должен:
1. ✅ Получать правильный токен через `/api/auth/login`
2. ✅ Сохранять токен в localStorage
3. ✅ Отправлять правильный токен в заголовке Authorization
4. ✅ Успешно создавать категории и другие защищенные операции

## 🔍 Отладка

### Проверьте в браузере:
1. Откройте DevTools (F12)
2. Перейдите в Application/Storage → Local Storage
3. Проверьте, что токен содержит правильные данные
4. Проверьте Network tab для просмотра запросов 