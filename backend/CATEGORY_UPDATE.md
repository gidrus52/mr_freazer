# Обновление поля категории в Product API

## Изменения

Поле `category` теперь является **опциональным** и имеет значение по умолчанию `"noName"`.

## Обновленная модель Product

```typescript
{
  id: string;           // UUID
  name: string;         // Название продукта (макс. 255 символов)
  description?: string; // Описание продукта (макс. 1000 символов)
  category: string;     // Категория продукта (макс. 100 символов, по умолчанию "noName")
  price: number;        // Цена (десятичное число с 2 знаками после запятой)
  stock: number;        // Количество на складе
  isActive: boolean;    // Активен ли продукт
  createdAt: Date;      // Дата создания
  updatedAt: Date;      // Дата последнего обновления
}
```

## Примеры использования

### 1. Создание продукта БЕЗ указания категории

```http
POST /api/products
Content-Type: application/json

{
  "name": "iPad Pro",
  "description": "Планшет Apple iPad Pro",
  "price": 1299.99,
  "stock": 15,
  "isActive": true
}
```

**Результат:** Категория автоматически установится как `"noName"`

### 2. Создание продукта С указанием категории

```http
POST /api/products
Content-Type: application/json

{
  "name": "MacBook Air",
  "description": "Легкий ноутбук Apple MacBook Air",
  "category": "Ноутбуки",
  "price": 1499.99,
  "stock": 20,
  "isActive": true
}
```

**Результат:** Категория будет `"Ноутбуки"`

### 3. Обновление категории продукта

```http
PATCH /api/products/:id
Content-Type: application/json

{
  "category": "Премиум смартфоны",
  "price": 899.99
}
```

## Обновленные файлы

1. **`src/product/dto/create-product.dto.ts`**
   - Поле `category` теперь опциональное (`@IsOptional()`)

2. **`src/product/product.service.ts`**
   - Добавлена логика установки значения по умолчанию: `category: createProductDto.category ?? 'noName'`

3. **`prisma/schema.prisma`**
   - Поле `category` остается обязательным в базе данных (не nullable)

## Валидация

- `category`: опциональное поле, максимум 100 символов
- Если категория не указана, автоматически устанавливается `"noName"`
- При обновлении можно изменить категорию на любое значение

## Тестирование

Запустите обновленный тестовый скрипт `test-product-api.ps1` для проверки:
- Создание продукта без категории (должна установиться "noName")
- Создание продукта с указанной категорией
- Обновление категории существующего продукта 