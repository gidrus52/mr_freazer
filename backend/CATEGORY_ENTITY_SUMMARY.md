# Category Entity - Итоговая документация

## Что было реализовано

Я успешно создал отдельную сущность `Category` с полным CRUD функционалом и интегрировал её с существующим API продуктов.

### 1. Модель данных (Prisma Schema)

Добавлена модель `Category` и обновлена модель `Product`:

```prisma
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  products    Product[]

  @@map("categories")
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  categoryId  String   @map("category_id")
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("products")
}
```

### 2. Category API

#### DTO для категорий:
- **`CreateCategoryDto`** - создание категории
- **`UpdateCategoryDto`** - обновление категории

#### Сервис (`CategoryService`):
```typescript
@Injectable()
export class CategoryService {
  // Создание категории (с проверкой уникальности имени)
  async create(createCategoryDto: CreateCategoryDto): Promise<Category>
  
  // Получение всех активных категорий
  async findAll(): Promise<Category[]>
  
  // Получение категории по ID
  async findOne(id: string): Promise<Category>
  
  // Поиск категории по имени
  async findByName(name: string): Promise<Category | null>
  
  // Обновление категории (с проверкой уникальности)
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>
  
  // Жесткое удаление категории
  async remove(id: string): Promise<{ id: string }>
  
  // Мягкое удаление категории
  async softDelete(id: string): Promise<Category>
}
```

#### Контроллер (`CategoryController`):
```
POST   /api/categories          - Создание категории
GET    /api/categories          - Получение всех активных категорий
GET    /api/categories/:id      - Получение категории по ID
PATCH  /api/categories/:id      - Обновление категории
DELETE /api/categories/:id      - Жесткое удаление категории
DELETE /api/categories/:id/soft - Мягкое удаление категории
```

### 3. Обновленный Product API

#### Изменения в DTO:
- Поле `category` заменено на `categoryId` (обязательное)
- Удалена логика с дефолтным значением "noName"

#### Обновленный сервис:
- Добавлена зависимость от `CategoryService`
- При создании продукта проверяется существование категории
- В ответе включается объект категории

### 4. Интеграция

- Создан `CategoryModule` и добавлен в `AppModule`
- `ProductModule` теперь импортирует `CategoryModule`
- Настроены связи между модулями

## API Endpoints

### Category API

#### Создание категории
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Смартфоны",
  "description": "Мобильные телефоны и смартфоны",
  "isActive": true
}
```

#### Получение всех категорий
```http
GET /api/categories
```

#### Обновление категории
```http
PATCH /api/categories/:id
Content-Type: application/json

{
  "name": "Премиум смартфоны",
  "description": "Дорогие смартфоны премиум класса"
}
```

### Product API (обновленный)

#### Создание продукта
```http
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15",
  "description": "Смартфон Apple iPhone 15",
  "categoryId": "uuid-категории",
  "price": 999.99,
  "stock": 50,
  "isActive": true
}
```

#### Ответ с категорией
```json
{
  "id": "product-uuid",
  "name": "iPhone 15",
  "description": "Смартфон Apple iPhone 15",
  "categoryId": "category-uuid",
  "category": {
    "id": "category-uuid",
    "name": "Смартфоны",
    "description": "Мобильные телефоны и смартфоны"
  },
  "price": 999.99,
  "stock": 50,
  "isActive": true,
  "createdAt": "2025-07-26T17:00:00.000Z",
  "updatedAt": "2025-07-26T17:00:00.000Z"
}
```

## Особенности реализации

1. **Уникальность категорий**: Имя категории должно быть уникальным
2. **Связи между сущностями**: Продукты связаны с категориями через foreign key
3. **Проверка существования**: При создании продукта проверяется существование категории
4. **Мягкое удаление**: Поддерживается для обеих сущностей
5. **Валидация**: Полная валидация данных для обеих сущностей

## Файлы проекта

```
src/category/
├── dto/
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   └── index.ts
├── category.controller.ts
├── category.service.ts
├── category.module.ts
├── index.ts
└── README.md

src/product/
├── dto/
│   ├── create-product.dto.ts (обновлен)
│   ├── update-product.dto.ts
│   └── index.ts
├── product.controller.ts
├── product.service.ts (обновлен)
├── product.module.ts (обновлен)
├── index.ts
└── README.md (обновлен)

prisma/
└── schema.prisma (обновлен)

src/
└── app.module.ts (обновлен)

test-category-api.ps1 (новый тестовый скрипт)
test-product-api.ps1 (обновлен)
```

## Тестирование

Созданы два тестовых скрипта:
- `test-category-api.ps1` - тестирование API категорий
- `test-product-api.ps1` - обновленное тестирование API продуктов

## Следующие шаги

1. **Миграция базы данных**: Выполните `npx prisma migrate dev` для применения изменений схемы
2. **Тестирование**: Запустите тестовые скрипты для проверки функциональности
3. **Дополнительные функции**: Добавьте фильтрацию продуктов по категориям, поиск категорий
4. **Валидация**: Добавьте проверку на удаление категорий, которые используются в продуктах

API категорий и обновленный API продуктов готовы к использованию! 🚀 