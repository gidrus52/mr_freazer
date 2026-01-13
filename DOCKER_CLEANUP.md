# Очистка места на диске для Docker

## Ошибка: "no space left on device"

Эта ошибка означает, что на диске закончилось место. Нужно очистить Docker ресурсы.

## Быстрое решение

### 1. Очистка Docker (Windows PowerShell)

```powershell
# Остановите все контейнеры
docker-compose down

# Очистите неиспользуемые контейнеры, сети, образы
docker system prune -a

# Очистите volumes (ОСТОРОЖНО: удалит данные БД!)
docker volume prune

# Полная очистка (удалит ВСЁ неиспользуемое)
docker system prune -a --volumes
```

### 2. Проверка использования места

```powershell
# Проверьте, сколько места использует Docker
docker system df

# Проверьте размер образов
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Проверьте размер контейнеров
docker ps -a --format "table {{.Names}}\t{{.Size}}"
```

### 3. Удаление конкретных ресурсов

```powershell
# Удалите остановленные контейнеры
docker container prune

# Удалите неиспользуемые образы
docker image prune -a

# Удалите неиспользуемые volumes
docker volume prune

# Удалите неиспользуемые сети
docker network prune
```

## Оптимизация для освобождения места

### Удаление больших неиспользуемых образов

```powershell
# Список всех образов с размерами
docker images

# Удалите конкретный образ
docker rmi <image_id>

# Удалите все неиспользуемые образы
docker image prune -a
```

### Очистка build cache

```powershell
# Очистите build cache
docker builder prune -a
```

## Что было исправлено в проекте

1. ✅ Добавлен `.dockerignore` - исключает большие файлы (.rar, .zip) из сборки
2. ✅ Оптимизирован `nginx/Dockerfile` - удаляет архивы перед сборкой
3. ✅ Исключен `img.rar` из Docker образа

## После очистки

```powershell
# Пересоберите образы
docker-compose build --no-cache

# Запустите
docker-compose up -d
```

## Проверка места на диске (Windows)

```powershell
# Проверьте свободное место на диске C:
Get-PSDrive C | Select-Object Used,Free

# Или через проводник Windows
# Правый клик на диске C: → Свойства
```

## Рекомендации

1. **Регулярная очистка:**
   ```powershell
   # Добавьте в планировщик задач Windows
   docker system prune -f
   ```

2. **Использование .dockerignore:**
   - Большие файлы (.rar, .zip) не должны попадать в образ
   - Исходники не нужны в production образе

3. **Многоэтапная сборка:**
   - Используйте multi-stage builds для уменьшения размера образов

4. **Очистка перед сборкой:**
   ```powershell
   docker system prune -f
   docker-compose build
   ```

## Если места все еще не хватает

1. **Увеличьте место на диске** (если возможно)
2. **Используйте внешний диск** для Docker data
3. **Настройте Docker Desktop** для использования другого диска:
   - Docker Desktop → Settings → Resources → Advanced
   - Измените Disk image location

## Проверка после очистки

```powershell
# Проверьте освобожденное место
docker system df

# Должно показать освобожденное место
```


