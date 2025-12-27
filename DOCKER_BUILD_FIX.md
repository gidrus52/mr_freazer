# Решение проблем со сборкой Docker

## Проблема: CANCELED при установке npm зависимостей

Если сборка прерывается с ошибкой `CANCELED`, попробуйте следующие решения:

### Решение 1: Пересборка с очисткой кэша

```bash
# Остановите все контейнеры
docker-compose down

# Очистите Docker кэш
docker system prune -a

# Пересоберите без кэша
docker-compose build --no-cache

# Запустите
docker-compose up -d
```

### Решение 2: Увеличение таймаутов Docker

Если проблема в таймаутах, создайте файл `~/.docker/daemon.json` (Linux/Mac) или настройте Docker Desktop (Windows):

```json
{
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 5
}
```

### Решение 3: Поэтапная сборка

Соберите образы по отдельности:

```bash
# Сначала backend
docker-compose build backend

# Затем nginx
docker-compose build nginx

# Или все вместе
docker-compose build
```

### Решение 4: Использование другого npm registry

Если проблемы с npm registry, можно использовать зеркало:

```bash
# В Dockerfile временно добавьте перед npm install:
RUN npm config set registry https://registry.npmjs.org/
```

### Решение 5: Проверка интернет-соединения

```bash
# Проверьте доступность npm registry
curl https://registry.npmjs.org/

# Проверьте скорость загрузки
docker pull node:20-alpine
```

### Решение 6: Установка зависимостей локально перед сборкой

```bash
# Backend
cd backend
npm install --legacy-peer-deps
cd ..

# Frontend
cd frontend
npm install
cd ..

# Затем соберите Docker образы
docker-compose build
```

### Решение 7: Использование BuildKit с прогрессом

```bash
# Включите BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Соберите с выводом прогресса
docker-compose build --progress=plain
```

### Решение 8: Уменьшение параллельных загрузок

Если проблема в скорости сети:

```bash
# В docker-compose.yml добавьте build args
docker-compose build --build-arg NPM_CONFIG_FETCH_RETRIES=10
```

## Частые причины ошибок

1. **Медленный интернет** - используйте `--legacy-peer-deps` и увеличьте таймауты
2. **Недостаточно места на диске** - очистите Docker: `docker system prune -a`
3. **Проблемы с npm registry** - проверьте доступность registry.npmjs.org
4. **Конфликты зависимостей** - используйте `--legacy-peer-deps`
5. **Таймауты** - увеличьте таймауты в npm config

## Оптимизированные команды для сборки

```bash
# Полная пересборка с очисткой
docker-compose down -v
docker system prune -f
docker-compose build --no-cache --pull
docker-compose up -d

# Сборка только измененных сервисов
docker-compose build
docker-compose up -d

# Сборка конкретного сервиса
docker-compose build backend
docker-compose build nginx
```

## Проверка после сборки

```bash
# Проверка образов
docker images

# Проверка контейнеров
docker-compose ps

# Просмотр логов сборки
docker-compose logs --tail=100
```

## Если ничего не помогает

1. Проверьте логи Docker: `docker-compose logs`
2. Проверьте доступное место: `docker system df`
3. Попробуйте собрать образ вручную:
   ```bash
   cd backend
   docker build -t backend-test .
   ```

