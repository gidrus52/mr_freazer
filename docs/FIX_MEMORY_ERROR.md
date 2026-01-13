# Решение проблемы "JavaScript heap out of memory"

## Проблема

При сборке frontend возникает ошибка:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

## Решение

### 1. Увеличение памяти для Node.js (уже исправлено)

В `nginx/Dockerfile` добавлен параметр `NODE_OPTIONS="--max-old-space-size=4096"` для увеличения лимита памяти до 4GB.

### 2. Если проблема сохраняется

#### Вариант A: Увеличить лимит еще больше

Отредактируйте `nginx/Dockerfile`:

```dockerfile
# Увеличьте до 6GB или 8GB (если на сервере достаточно RAM)
RUN NODE_OPTIONS="--max-old-space-size=6144" npm run build
```

#### Вариант B: Оптимизация сборки

Добавьте в `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['naive-ui']
        }
      }
    }
  }
})
```

#### Вариант C: Сборка на хосте, а не в Docker

Соберите frontend локально и скопируйте dist:

```bash
# На вашем компьютере
cd frontend
npm run build

# Затем в Dockerfile используйте уже собранный dist
COPY frontend/dist /usr/share/nginx/html
```

### 3. Проверка доступной памяти на сервере

```bash
# Проверьте доступную память
free -h

# Если памяти меньше 4GB, уменьшите лимит в Dockerfile:
# NODE_OPTIONS="--max-old-space-size=2048"  # для 2GB
```

### 4. Увеличение swap (если памяти мало)

```bash
# Создайте swap файл (4GB)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Сделайте постоянным
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5. Оптимизация Docker build

Используйте BuildKit с большим лимитом памяти:

```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Увеличьте лимит памяти для Docker build
docker-compose build --memory=4g nginx
```

## После исправления

```bash
# Пересоберите nginx
docker-compose build --no-cache nginx

# Или все вместе
docker-compose build --no-cache
docker-compose up -d
```

## Проверка

После сборки проверьте:

```bash
# Проверьте, что образ создан
docker images | grep nginx

# Проверьте логи
docker-compose logs nginx
```

## Альтернативное решение: Упрощенная сборка

Если проблема сохраняется, можно использовать упрощенный Dockerfile:

```dockerfile
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
# Удалите большие файлы перед сборкой
RUN find . -name "*.rar" -delete 2>/dev/null || true
# Увеличьте память
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

