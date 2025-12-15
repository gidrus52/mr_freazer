# 🔧 ИСПРАВЛЕНИЕ: Проблема с двойным "Bearer " префиксом

## ❌ Проблема
В логах видно, что токен приходит с двойным "Bearer " префиксом:
```
"authorization": "Bearer Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## ✅ Решение

### 1. **Правильное получение токена**
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

**Ответ:**
```json
{
    "accessToken": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. **Правильное использование токена**

#### ✅ ПРАВИЛЬНО:
```
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### ❌ НЕПРАВИЛЬНО:
```
Headers:
  Authorization: Bearer Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. **Пошаговая инструкция для Postman**

#### Шаг 1: Получение токена
1. Создайте POST запрос на `http://localhost:3000/api/auth/login`
2. В Headers добавьте: `Content-Type: application/json`
3. В Body отправьте:
```json
{
    "email": "newuserAdmin@test.com",
    "password": "123asx"
}
```

#### Шаг 2: Копирование токена
1. Выполните запрос
2. В ответе найдите `accessToken`
3. **Скопируйте ТОЛЬКО часть после "Bearer "**
   - Из: `"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
   - Скопируйте: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Шаг 3: Использование токена
1. Создайте новый запрос
2. В Headers добавьте:
   - **Key**: `Authorization`
   - **Value**: `Bearer <скопированная-часть-токена>`

### 4. **Примеры**

#### Создание категории:
```
POST http://localhost:3000/api/categories
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body:
{
    "name": "Электроника",
    "description": "Электронные устройства"
}
```

#### Просмотр пользователей:
```
GET http://localhost:3000/api/user
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. **Автоматизация в Postman**

#### Настройка автоматического извлечения токена:
1. В запросе login перейдите в "Tests"
2. Добавьте скрипт:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    // Извлекаем только часть токена без "Bearer "
    const token = response.accessToken.replace('Bearer ', '');
    pm.collectionVariables.set("token", token);
}
```

#### Использование переменной:
```
Headers:
  Authorization: Bearer {{token}}
```

### 6. **Проверка токена**

#### В логах сервера должно быть:
```
"authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### НЕ должно быть:
```
"authorization": "Bearer Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🎯 Результат

После правильной настройки токены должны работать корректно без ошибки `Cannot read properties of undefined (reading 'length')`. 