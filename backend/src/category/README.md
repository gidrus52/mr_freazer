# Category API

Этот модуль предоставляет полный CRUD функционал для управления категориями продуктов.

## Модель Category

```typescript
{
  id: string;           // UUID
  name: string;         // Название категории (уникальное, макс. 100 символов)
  description?: string; // Описание категории (макс. 500 символов)
  isActive: boolean;    // Активна ли категория
  createdAt: Date;      // Дата создания
  updatedAt: Date;      // Дата последнего обновления
}
```

## API Endpoints

### Создание категории
```
POST /api/categories
```

**Тело запроса:**
```json
{
  "name": "Смартфоны",
  "description": "Мобильные телефоны и смартфоны",
  "isActive": true
}
```

### Получение всех активных категорий
```
GET /api/categories
```

### Получение категории по ID
```
GET /api/categories/:id
```

### Обновление категории
```
PATCH /api/categories/:id
```

**Тело запроса (все поля опциональны):**
```json
{
  "name": "Премиум смартфоны",
  "description": "Дорогие смартфоны премиум класса"
}
```

### Удаление категории (жесткое удаление)
```
DELETE /api/categories/:id
```

### Мягкое удаление категории (деактивация)
```
DELETE /api/categories/:id/soft
```

## Примеры использования

### Создание категории
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Смартфоны",
    "description": "Мобильные телефоны и смартфоны",
    "isActive": true
  }'
```

### Получение всех категорий
```bash
curl http://localhost:3001/api/categories
```

### Обновление категории
```bash
curl -X PATCH http://localhost:3001/api/categories/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Премиум смартфоны",
    "description": "Дорогие смартфоны премиум класса"
  }'
```

### Удаление категории
```bash
curl -X DELETE http://localhost:3001/api/categories/{id}
```

## Валидация

- `name`: обязательное поле, максимум 100 символов, должно быть уникальным
- `description`: опциональное поле, максимум 500 символов
- `isActive`: опциональное поле, булево значение

## Обработка ошибок

- `404 Not Found`: категория не найдена
- `409 Conflict`: категория с таким именем уже существует
- `400 Bad Request`: неверные данные в запросе
- `500 Internal Server Error`: внутренняя ошибка сервера

## Связь с продуктами

Категории связаны с продуктами через поле `categoryId`. При создании продукта необходимо указать существующий ID категории. 