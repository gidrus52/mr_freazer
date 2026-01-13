# Инструкция по запуску приложения на сервере

## Предварительные требования

На сервере должны быть установлены:
- **Docker** (версия 20.10 или выше)
- **Docker Compose** (версия 2.0 или выше)
- **Git** (для клонирования репозитория)

## Быстрый запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/gidrus52/mr_freazer.git
cd mr_freazer
```

### 2. Настройка переменных окружения (опционально)

Создайте файл `.env` в корне проекта (если нужно изменить настройки по умолчанию):

```bash
# База данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ваш_надежный_пароль
POSTGRES_DB=postgres_db
DB_PORT=5432

# Backend
BACKEND_PORT=3001
JWT_SECRET=ваш_секретный_ключ_jwt
REFRESH_SECRET=ваш_секретный_ключ_refresh

# Frontend
FRONTEND_PORT=80

# PgAdmin (опционально)
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=ваш_пароль_pgadmin
PGADMIN_PORT=5050
```

**Важно:** Если не создадите `.env`, будут использованы значения по умолчанию из `docker-compose.yml`.

### 3. Запуск приложения

```bash
# Запуск всех сервисов (PostgreSQL, Backend, Nginx)
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Проверка статуса контейнеров
docker-compose ps
```

### 4. Проверка работы

После запуска приложение будет доступно:
- **Frontend и API:** http://ваш_сервер_ip (порт 80)
- **PgAdmin** (если включен): http://ваш_сервер_ip:5050

## Управление приложением

### Остановка

```bash
# Остановка всех контейнеров
docker-compose down

# Остановка с удалением volumes (удалит данные БД!)
docker-compose down -v
```

### Перезапуск

```bash
# Перезапуск всех сервисов
docker-compose restart

# Перезапуск конкретного сервиса
docker-compose restart backend
docker-compose restart nginx
```

### Обновление приложения

```bash
# Остановка текущей версии
docker-compose down

# Получение последних изменений
git pull

# Пересборка и запуск
docker-compose up -d --build
```

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f nginx
```

## Структура сервисов

Приложение состоит из следующих контейнеров:

1. **postgres** - База данных PostgreSQL
   - Порт: 5432 (внутренний)
   - Данные сохраняются в volume `postgres_data`

2. **backend** - NestJS API сервер
   - Порт: 3001 (внутренний, доступен только через nginx)
   - Автоматически выполняет миграции БД при запуске

3. **nginx** - Веб-сервер и прокси
   - Порт: 80 (внешний)
   - Раздает статические файлы frontend
   - Проксирует запросы к backend API

4. **pgadmin** (опционально) - Веб-интерфейс для управления БД
   - Порт: 5050
   - Запускается только с профилем `tools`

## Запуск с PgAdmin

Если нужен PgAdmin для управления базой данных:

```bash
docker-compose --profile tools up -d
```

## Проблемы и решения

### Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs

# Проверьте, не заняты ли порты
sudo netstat -tulpn | grep -E ':(80|5432|5050)'

# Проверьте доступное место на диске
df -h
```

### Проблема: База данных не подключается

```bash
# Проверьте статус контейнера postgres
docker-compose ps postgres

# Проверьте логи postgres
docker-compose logs postgres

# Проверьте переменные окружения
docker-compose config
```

### Проблема: Backend не запускается

```bash
# Проверьте логи backend
docker-compose logs backend

# Проверьте, что миграции выполнены
docker-compose exec backend npx prisma migrate status

# Выполните миграции вручную
docker-compose exec backend npx prisma migrate deploy
```

### Проблема: Nginx возвращает 502 Bad Gateway

```bash
# Проверьте, что backend запущен
docker-compose ps backend

# Проверьте логи nginx
docker-compose logs nginx

# Проверьте конфигурацию nginx
docker-compose exec nginx nginx -t
```

## Ручной запуск без Docker (для разработки)

Если нужно запустить без Docker:

### Backend

```bash
cd backend

# Установка зависимостей
npm install

# Настройка .env файла
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# JWT_SECRET=your-secret
# REFRESH_SECRET=your-refresh-secret

# Генерация Prisma Client
npx prisma generate

# Выполнение миграций
npx prisma migrate deploy

# Запуск
npm run start:dev
```

### Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Или сборка для production
npm run build
```

## Безопасность

⚠️ **Важно для production:**

1. Измените все пароли по умолчанию в `.env`
2. Используйте сильные секретные ключи для JWT
3. Настройте firewall (откройте только порт 80)
4. Используйте HTTPS (настройте SSL сертификат в nginx)
5. Регулярно обновляйте Docker образы
6. Не используйте профиль `tools` (PgAdmin) в production

## Мониторинг

### Проверка здоровья сервисов

```bash
# Health check всех сервисов
docker-compose ps

# Проверка через API
curl http://localhost/api
```

### Использование ресурсов

```bash
# Статистика использования ресурсов
docker stats
```

## Дополнительная информация

- [CI/CD документация](README-CI-CD.md)
- [Настройка GitHub Runner](docs/SERVER_SETUP_RUNNER.md)

