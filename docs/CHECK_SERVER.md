# Инструкция по проверке сервера

## Быстрая проверка

Я не могу напрямую подключиться к вашему серверу, но создал скрипты для проверки, которые вы можете запустить.

## Вариант 1: Проверка с вашего компьютера (удаленно)

### Настройка

```bash
# Установите переменные окружения
export SSH_HOST=82.148.6.221  # IP вашего сервера
export SSH_USER=root # Ваш пользователь на сервере
```

### Запуск проверки

```bash
# Сделайте скрипт исполняемым (Linux/Mac)
chmod +x scripts/remote-check.sh

# Запустите проверку
./scripts/remote-check.sh
```

Или в одну строку:

```bash
SSH_HOST=82.148.6.221 SSH_USER=your-username ./scripts/remote-check.sh
```

## Вариант 2: Проверка на самом сервере

### Подключитесь к серверу

```bash
ssh user@82.148.6.221
```

### Запустите скрипт проверки

```bash
# Перейдите в директорию приложения
cd /opt/mr_freazer

# Сделайте скрипт исполняемым
chmod +x scripts/check-server.sh

# Запустите проверку
./scripts/check-server.sh
```

Или если скрипт еще не на сервере:

```bash
# Клонируйте репозиторий (если еще не клонирован)
cd /opt
git clone https://github.com/gidrus52/mr_freazer.git
cd mr_freazer
chmod +x scripts/check-server.sh
./scripts/check-server.sh
```

## Что проверяют скрипты

✅ **Системные требования:**
- Установлен ли Docker и Docker Compose
- Версии установленного ПО
- Использование диска и памяти

✅ **Директория приложения:**
- Существует ли директория
- Настроен ли git репозиторий
- Присутствуют ли необходимые файлы (docker-compose.yml, .env)

✅ **Docker контейнеры:**
- Статус всех контейнеров (postgres, backend, nginx)
- Работают ли они корректно

✅ **Порты:**
- Заняты ли необходимые порты (80, 443, 5432, 3001)

✅ **Работа приложения:**
- Отвечает ли Backend API
- Отвечает ли Nginx
- Доступна ли база данных PostgreSQL

✅ **Логи:**
- Есть ли ошибки в логах
- Последние записи в логах

## Ручная проверка (если скрипты недоступны)

### 1. Проверка Docker

```bash
docker --version
docker-compose --version
docker ps
```

### 2. Проверка приложения

```bash
cd /opt/mr_freazer
docker-compose ps
docker-compose logs -f
```

### 3. Проверка работы API

```bash
# Проверка Backend
curl http://localhost:3001/api

# Проверка через Nginx
curl http://localhost

# Проверка базы данных
docker-compose exec postgres pg_isready -U postgres
```

### 4. Проверка портов

```bash
# Linux
sudo netstat -tulpn | grep -E ':(80|443|5432|3001)'

# Или
sudo ss -tulpn | grep -E ':(80|443|5432|3001)'
```

## Что делать после проверки

### Если все работает ✅

Отлично! Приложение готово к использованию.

### Если есть проблемы ❌

1. **Контейнеры не запущены:**
   ```bash
   cd /opt/mr_freazer
   docker-compose up -d
   ```

2. **Ошибки в логах:**
   ```bash
   docker-compose logs backend
   docker-compose logs postgres
   docker-compose logs nginx
   ```

3. **Порты заняты:**
   ```bash
   # Найдите процесс, занимающий порт
   sudo lsof -i :80
   # Остановите конфликтующий сервис
   sudo systemctl stop nginx  # если используется системный nginx
   ```

4. **База данных не работает:**
   ```bash
   docker-compose restart postgres
   docker-compose logs postgres
   ```

5. **Backend не запускается:**
   ```bash
   docker-compose logs backend
   # Проверьте переменные окружения в .env
   cat .env
   ```

## Полезные команды для диагностики

```bash
# Статус всех контейнеров
docker-compose ps

# Логи всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f nginx

# Использование ресурсов
docker stats

# Вход в контейнер
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres

# Перезапуск сервисов
docker-compose restart
docker-compose restart backend

# Пересоздание контейнеров
docker-compose down
docker-compose up -d --build
```

## Следующие шаги

После успешной проверки:

1. ✅ Убедитесь, что приложение доступно по внешнему IP
2. ✅ Настройте автоматический деплой (см. `docs/DEPLOYMENT_GUIDE.md`)
3. ✅ Настройте резервное копирование базы данных
4. ✅ Настройте мониторинг (опционально)

## Нужна помощь?

Если что-то не работает:
1. Запустите скрипт проверки и сохраните вывод
2. Проверьте логи: `docker-compose logs -f`
3. Проверьте документацию: `docs/DEPLOYMENT_GUIDE.md`

