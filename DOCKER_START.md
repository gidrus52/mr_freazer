# Запуск приложения в Docker

## Быстрый старт

### 1. Подготовка

Убедитесь, что на сервере установлены Docker и Docker Compose:

```bash
docker --version
docker-compose --version
```

### 2. Клонирование репозитория

```bash
cd /opt
git clone https://github.com/gidrus52/mr_freazer.git
cd mr_freazer
```

### 3. Создание файла .env (опционально)

Создайте файл `.env` в корне проекта для настройки переменных окружения:

```bash
nano .env
```

Минимальная конфигурация:

```env
# База данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ваш_надежный_пароль
POSTGRES_DB=mr_freazer_db

# Backend
JWT_SECRET=ваш_секретный_ключ_для_jwt_минимум_32_символа
REFRESH_SECRET=ваш_секретный_ключ_для_refresh_минимум_32_символа

# Порты
FRONTEND_PORT=80
DB_PORT=5432
```

**Генерация секретных ключей:**

```bash
openssl rand -base64 32  # для JWT_SECRET
openssl rand -base64 32  # для REFRESH_SECRET
openssl rand -base64 24  # для POSTGRES_PASSWORD
```

### 4. Запуск всех сервисов

```bash
# Запуск всех контейнеров
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps
```

### 5. Проверка работы

```bash
# Проверка API
curl http://localhost/api

# Проверка frontend
curl http://localhost

# Проверка базы данных
docker-compose exec postgres pg_isready -U postgres
```

Приложение будет доступно по адресу: `http://ваш_сервер_ip`

## Структура сервисов

Приложение состоит из следующих Docker контейнеров:

1. **postgres** - База данных PostgreSQL
   - Порт: 5432 (внутренний)
   - Данные сохраняются в volume `postgres_data`

2. **backend** - NestJS API сервер
   - Порт: 3001 (внутренний, доступен через nginx)
   - Автоматически выполняет миграции БД при запуске

3. **nginx** - Веб-сервер
   - Порт: 80 (внешний)
   - Раздает статические файлы frontend
   - Проксирует запросы `/api` к backend

4. **pgadmin** (опционально) - Веб-интерфейс для управления БД
   - Порт: 5050
   - Запускается только с профилем `tools`

## Управление контейнерами

### Запуск

```bash
# Запуск всех сервисов
docker-compose up -d

# Запуск с пересборкой
docker-compose up -d --build

# Запуск с PgAdmin
docker-compose --profile tools up -d
```

### Остановка

```bash
# Остановка всех контейнеров
docker-compose stop

# Остановка и удаление контейнеров
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
docker-compose restart postgres
```

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f nginx

# Последние 100 строк
docker-compose logs --tail=100 backend
```

### Проверка статуса

```bash
# Статус всех контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Детальная информация о контейнере
docker-compose ps backend
```

## Обновление приложения

### Способ 1: Через git pull

```bash
cd /opt/mr_freazer
git pull origin main
docker-compose up -d --build
```

### Способ 2: Полная пересборка

```bash
cd /opt/mr_freazer
docker-compose down
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

## Устранение проблем

### Контейнеры не запускаются

```bash
# Проверка логов
docker-compose logs

# Проверка конфигурации
docker-compose config

# Пересоздание контейнеров
docker-compose down
docker-compose up -d
```

### Порт 80 занят

```bash
# Проверка, что занимает порт
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Остановка системного nginx (если используется)
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### Backend не подключается к БД

```bash
# Проверка логов backend
docker-compose logs backend

# Проверка переменных окружения
docker-compose exec backend env | grep DATABASE_URL

# Проверка доступности postgres
docker-compose exec postgres pg_isready -U postgres
```

### Ошибки миграций

```bash
# Проверка статуса миграций
docker-compose exec backend npx prisma migrate status

# Принудительное выполнение миграций
docker-compose exec backend npx prisma migrate deploy

# Сброс БД (ОСТОРОЖНО: удалит все данные!)
docker-compose down -v
docker-compose up -d
```

### Frontend не собирается

```bash
# Проверка логов nginx
docker-compose logs nginx

# Пересборка frontend
docker-compose build --no-cache nginx
docker-compose up -d nginx
```

## Полезные команды

```bash
# Вход в контейнер
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres
docker-compose exec nginx sh

# Выполнение команд в контейнере
docker-compose exec backend npm run lint
docker-compose exec postgres psql -U postgres -d mr_freazer_db

# Просмотр переменных окружения
docker-compose config

# Очистка неиспользуемых ресурсов
docker system prune -f
docker volume prune -f

# Просмотр использования диска
docker system df
```

## Резервное копирование

### Создание бэкапа БД

```bash
# Создание бэкапа
docker-compose exec postgres pg_dump -U postgres mr_freazer_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
docker-compose exec -T postgres psql -U postgres mr_freazer_db < backup_20240101_120000.sql
```

## Мониторинг

### Проверка здоровья сервисов

```bash
# Health check всех сервисов
docker-compose ps

# Проверка через API
curl http://localhost/api
curl http://localhost/health
```

### Настройка автоматического перезапуска

Контейнеры уже настроены на автоматический перезапуск (`restart: unless-stopped`). При перезагрузке сервера все контейнеры запустятся автоматически.

## Безопасность

⚠️ **Важно для production:**

1. ✅ Измените все пароли по умолчанию в `.env`
2. ✅ Используйте сильные секретные ключи для JWT
3. ✅ Настройте firewall (откройте только порт 80)
4. ✅ Используйте HTTPS (настройте SSL сертификат)
5. ✅ Регулярно обновляйте Docker образы
6. ✅ Настройте резервное копирование БД

## Дополнительная информация

- Полная документация по деплою: `docs/DEPLOYMENT_GUIDE.md`
- Инструкция по проверке сервера: `docs/CHECK_SERVER.md`
- Настройка CI/CD: `README-CI-CD.md`

