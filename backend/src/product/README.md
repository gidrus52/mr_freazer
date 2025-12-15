# Product API

Этот модуль предоставляет полный CRUD функционал для управления продуктами.

## Модель Product

```typescript
{
  id: string;           // UUID
  name: string;         // Название продукта (макс. 255 символов)
  description?: string; // Описание продукта (макс. 1000 символов)
  categoryId: string;   // ID категории продукта
  category?: {          // Объект категории (включается в ответ)
    id: string;
    name: string;
    description?: string;
  };
  price: number;        // Цена (десятичное число с 2 знаками после запятой)
  stock: number;        // Количество на складе
  isActive: boolean;    // Активен ли продукт
  createdAt: Date;      // Дата создания
  updatedAt: Date;      // Дата последнего обновления
}
```

## API Endpoints

### Создание продукта
```
POST /products
```

**Тело запроса:**
```json
{
  "name": "Название продукта",
  "description": "Описание продукта",
  "categoryId": "uuid-категории",
  "price": 99.99,
  "stock": 10,
  "isActive": true
}
```

### Получение всех активных продуктов
```
GET /products
```

### Получение продукта по ID
```
GET /products/:id
```

### Обновление продукта
```
PATCH /products/:id
```

**Тело запроса (все поля опциональны):**
```json
{
  "name": "Новое название",
  "categoryId": "новый-uuid-категории",
  "price": 149.99,
  "stock": 5
}
```

### Удаление продукта (жесткое удаление)
```
DELETE /products/:id
```

### Мягкое удаление продукта (деактивация)
```
DELETE /products/:id/soft
```

## Примеры использования

### Создание продукта
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Смартфон Apple iPhone 15",
    "categoryId": "1",
    "price": 999.99,
    "stock": 50,
    "isActive": true
  }'
```

### Получение всех продуктов
```bash
curl http://localhost:3000/products
```

### Обновление продукта
```bash
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "новый-id",
    "price": 899.99,
    "stock": 45
  }'
```

### Удаление продукта
```bash
curl -X DELETE http://localhost:3000/products/{id}
```

## Валидация

- `name`: обязательное поле, максимум 255 символов
- `description`: опциональное поле, максимум 1000 символов
- `categoryId`: обязательное поле, ID существующей категории
- `price`: обязательное поле, число >= 0
- `stock`: обязательное поле, целое число >= 0
- `isActive`: опциональное поле, булево значение

## Обработка ошибок

- `404 Not Found`: продукт не найден
- `400 Bad Request`: неверные данные в запросе
- `500 Internal Server Error`: внутренняя ошибка сервера 