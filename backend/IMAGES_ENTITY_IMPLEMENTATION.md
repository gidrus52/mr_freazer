# Реализация отдельной сущности Image для товаров

## Обзор изменений

Мы создали отдельную сущность `Image` для изображений товаров, что позволяет:
- Товару иметь несколько изображений
- Управлять порядком отображения изображений
- Устанавливать основное изображение товара
- Гибко управлять изображениями через отдельный API

## Изменения в схеме Prisma

### Удалены поля из модели Product:
```prisma
// Удалены поля:
imageUrl    String?  @map("image_url")
imageData   String?  @map("image_data")
imageType   String?  @map("image_type")
```

### Добавлена новая модель Image:
```prisma
model Image {
  id          String   @id @default(uuid())
  productId   String   @map("product_id")
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url         String?  // URL изображения
  data        String?  // Base64 данные изображения
  type        String?  // Тип изображения (jpeg, png, gif, etc.)
  alt         String?  // Альтернативный текст для изображения
  isPrimary   Boolean  @default(false) @map("is_primary") // Основное изображение товара
  order       Int      @default(0) // Порядок отображения
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("images")
}
```

### Обновлена модель Product:
```prisma
model Product {
  // ... существующие поля ...
  
  // Связь с изображениями
  images      Image[]
}
```

## Структура файлов

### Новые файлы:
```
src/image/
├── dto/
│   ├── create-image.dto.ts
│   ├── update-image.dto.ts
│   └── index.ts
├── image.controller.ts
├── image.service.ts
└── image.module.ts
```

## API Endpoints для изображений

### Создание изображения
```
POST /api/images
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "url": "https://example.com/image.jpg",
  "data": "base64data",
  "type": "png",
  "alt": "Описание изображения",
  "isPrimary": true,
  "order": 1
}
```

### Получение всех изображений
```
GET /api/images
```

### Получение изображений товара
```
GET /api/images/product/:productId
```

### Получение конкретного изображения
```
GET /api/images/:id
```

### Обновление изображения
```
PATCH /api/images/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/new-image.jpg",
  "alt": "Новое описание",
  "isPrimary": false,
  "order": 2
}
```

### Установка основного изображения
```
PATCH /api/images/:id/primary
Authorization: Bearer <token>
```

### Удаление изображения
```
DELETE /api/images/:id
Authorization: Bearer <token>
```

### Мягкое удаление изображения
```
DELETE /api/images/:id/soft
Authorization: Bearer <token>
```

## DTO для изображений

### CreateImageDto
```typescript
export class CreateImageDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  data?: string; // Base64 данные

  @IsOptional()
  @IsString()
  @MaxLength(10)
  type?: string; // jpeg, png, gif, etc.

  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
```

## Функциональность сервиса

### Основные методы:
- `create()` - создание изображения
- `findAll()` - получение всех изображений
- `findByProductId()` - получение изображений товара
- `findOne()` - получение конкретного изображения
- `update()` - обновление изображения
- `remove()` - удаление изображения
- `softDelete()` - мягкое удаление
- `setPrimary()` - установка основного изображения

### Особенности:
- Автоматическая проверка существования товара
- Управление основным изображением (только одно основное на товар)
- Сортировка по приоритету (основное, порядок, дата создания)
- Каскадное удаление при удалении товара

## Обновления в Product Service

Все методы Product Service теперь включают изображения в ответ:
```typescript
include: {
  category: true,
  images: {
    where: { isActive: true },
    orderBy: [
      { isPrimary: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  },
}
```

## Миграция данных

Создана миграция для:
- Удаления полей изображений из таблицы products
- Создания новой таблицы images
- Установки связей между таблицами

## Тестирование

Создан тестовый скрипт `test-images-api.ps1` для проверки:
- Создания изображений
- Получения изображений товара
- Установки основного изображения
- Обновления изображений

## Преимущества новой архитектуры

1. **Гибкость**: Товар может иметь любое количество изображений
2. **Управление**: Возможность устанавливать порядок и основное изображение
3. **Масштабируемость**: Легко добавлять новые поля для изображений
4. **Производительность**: Оптимизированные запросы с правильной сортировкой
5. **Безопасность**: Отдельные права доступа для управления изображениями

## Следующие шаги

1. Обновить фронтенд для работы с новой структурой изображений
2. Добавить валидацию размеров изображений
3. Реализовать загрузку изображений через файлы
4. Добавить кэширование изображений
5. Создать API для массовой загрузки изображений
