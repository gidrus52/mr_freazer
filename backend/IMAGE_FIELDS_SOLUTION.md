# Решение проблемы с полями изображения в Product

## Проблема
Получена ошибка при создании продукта с полями изображения:
```
Unknown arg `image` in data.image for type ProductUncheckedCreateInput. Did you mean `name`? Available args:
type ProductUncheckedCreateInput {
  id?: String
  name: String
  description?: String | Null
  categoryId: String
  price: Decimal
  stock?: Int
  isActive?: Boolean
  createdAt?: DateTime
  updatedAt?: DateTime
}
```

## Анализ проблемы
1. **Схема Prisma**: Поля изображения (`imageUrl`, `imageData`, `imageType`) были корректно определены в схеме Prisma
2. **Миграции**: Миграции для добавления полей изображения были выполнены
3. **DTO**: CreateProductDto корректно включает поля изображения
4. **Проблема**: Prisma Client не был обновлен после изменений схемы

## Решение

### 1. Обновление Prisma Client
```bash
npx prisma generate
```

### 2. Обновление версий Prisma
```bash
npm install prisma@4.16.2 @prisma/client@4.16.2
npx prisma generate
```

### 3. Исправление порта приложения
Приложение запускается на порту 3001, а не 3000.

### 4. Корректная обработка токенов авторизации
Токен уже содержит префикс "Bearer", поэтому не нужно добавлять его повторно.

## Тестирование

### Успешное создание продукта с полями изображения:
```json
{
    "id": "8bc91325-c0ba-486f-b311-0deb86798fb8",
    "name": "Test Product with Image",
    "description": "Test product description with image fields",
    "categoryId": "96afe3ae-8047-4a6d-b5a4-73c7eab13761",
    "price": "100.5",
    "stock": 10,
    "imageUrl": "https://example.com/test-image.jpg",
    "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "imageType": "png",
    "isActive": true,
    "createdAt": "2025-08-18T22:20:40.707Z",
    "updatedAt": "2025-08-18T22:20:40.707Z"
}
```

## Обновления фронтенда

### 1. Изменение порта API
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

### 2. Корректная обработка токенов
```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
}
```

## Структура полей изображения

### В схеме Prisma:
```prisma
model Product {
  // ... другие поля
  imageUrl    String?  @map("image_url")
  imageData   String?  @map("image_data")  // Base64 данные
  imageType   String?  @map("image_type")  // Тип изображения (jpeg, png, etc.)
  // ... другие поля
}
```

### В DTO:
```typescript
export class CreateProductDto {
  // ... другие поля
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageData?: string;  // Base64 данные

  @IsOptional()
  @IsString()
  @MaxLength(10)
  imageType?: string;  // jpeg, png, gif, etc.
}
```

## Заключение
Проблема была успешно решена путем:
1. Обновления Prisma Client после изменений схемы
2. Исправления порта приложения
3. Корректной обработки токенов авторизации
4. Обновления фронтенда для работы с правильным API

Все поля изображения теперь корректно сохраняются и извлекаются из базы данных.

