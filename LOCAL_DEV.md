# Локальный запуск для разработки

## Быстрый старт (только Frontend)

Для быстрого запуска frontend в режиме разработки:

```bash
# Перейти в директорию frontend
cd frontend

# Установить зависимости (если еще не установлены)
npm install

# Запустить dev сервер
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:5173` (или другой порт, который укажет Vite)

## Полный запуск (Frontend + Backend)

### 1. Запуск базы данных (PostgreSQL)

#### Вариант A: Docker (если установлен)

```bash
# Запустить только PostgreSQL
docker run -d \
  --name postgres_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=postgres_db \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Вариант B: Локальная установка PostgreSQL

Установите PostgreSQL локально и создайте базу данных:

```sql
CREATE DATABASE postgres_db;
CREATE USER postgres WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE postgres_db TO postgres;
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=postgres_db
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:123456@localhost:5432/postgres_db

# Backend
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Frontend
VITE_API_TARGET=http://localhost:3001
```

### 3. Запуск Backend

```bash
# Перейти в директорию backend
cd backend

# Установить зависимости (если еще не установлены)
npm install

# Запустить Prisma миграции
npx prisma generate
npx prisma migrate dev

# Запустить backend в режиме разработки
npm run start:dev
```

Backend будет доступен по адресу: `http://localhost:3001`

### 4. Запуск Frontend

```bash
# В новом терминале, перейти в директорию frontend
cd frontend

# Установить зависимости (если еще не установлены)
npm install

# Запустить dev сервер
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:5173`

## Структура портов

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend API**: `http://localhost:3001`
- **PostgreSQL**: `localhost:5432`

## Полезные команды

### Backend

```bash
# Запуск в режиме разработки с hot reload
npm run start:dev

# Запуск в production режиме
npm run start:prod

# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev

# Просмотр базы данных (Prisma Studio)
npx prisma studio
```

### Frontend

```bash
# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Просмотр production сборки
npm run preview
```

## Решение проблем

### Проблема: Порт уже занят

Если порт 3001 или 5173 занят, измените порт:

**Backend**: Измените `PORT` в `.env` или в `backend/src/main.ts`

**Frontend**: Vite автоматически предложит другой порт, или укажите в `vite.config.ts`:

```typescript
server: {
  port: 5174, // другой порт
  // ...
}
```

### Проблема: База данных не подключена

1. Проверьте, что PostgreSQL запущен
2. Проверьте переменные окружения в `.env`
3. Проверьте подключение: `psql -h localhost -U postgres -d postgres_db`

### Проблема: CORS ошибки

Убедитесь, что в `backend/src/main.ts` настроен CORS для `http://localhost:5173`

## Альтернатива: Docker Compose (если Docker установлен)

Если у вас установлен Docker, можно использовать docker-compose:

```bash
# Запустить все сервисы
docker-compose up -d

# Остановить все сервисы
docker-compose down
```

Приложение будет доступно по адресу: `http://localhost:80`

