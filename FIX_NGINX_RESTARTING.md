# 🔧 Исправление проблемы с перезапускающимся nginx контейнером

## Проблема
Контейнер `nginx_proxy` постоянно перезапускается (Restarting), что означает, что nginx не может запуститься.

## Причины
1. **Отсутствуют SSL сертификаты** в папке `./ssl` на сервере
2. **Неправильные пути к SSL сертификатам** в конфигурации
3. **Ошибка в конфигурации nginx**

## Диагностика на сервере

### 1. Проверьте логи nginx контейнера

```bash
docker logs nginx_proxy --tail 50
```

Ищите ошибки типа:
- `SSL_CTX_use_certificate_file() failed`
- `cannot load certificate`
- `open() "/etc/nginx/ssl/certificate.crt" failed`

### 2. Проверьте наличие SSL сертификатов

```bash
# На сервере, в директории проекта
cd /opt/mr_freazer  # или путь к вашему проекту

# Проверьте папку ssl
ls -la ssl/

# Должны быть файлы:
# - certificate.crt
# - private.key
```

### 3. Проверьте права доступа

```bash
ls -lh ssl/
# certificate.crt должен быть: -rw-r--r--
# private.key должен быть: -rw-------
```

## Решения

### Решение 1: Скопировать SSL сертификаты в проект (если они есть в /etc/nginx/ssl)

```bash
# На сервере
cd /opt/mr_freazer  # или путь к вашему проекту

# Создайте папку ssl, если её нет
mkdir -p ssl

# Скопируйте файлы из /etc/nginx/ssl (если они там есть)
sudo cp /etc/nginx/ssl/certificate.crt ./ssl/ 2>/dev/null || echo "Файл не найден в /etc/nginx/ssl"
sudo cp /etc/nginx/ssl/private.key ./ssl/ 2>/dev/null || echo "Файл не найден в /etc/nginx/ssl"

# Установите правильные права доступа
sudo chmod 600 ./ssl/private.key
sudo chmod 644 ./ssl/certificate.crt
sudo chown $USER:$USER ./ssl/*

# Проверьте файлы
ls -lh ./ssl/
```

### Решение 2: Временно отключить SSL для диагностики

Если SSL сертификаты отсутствуют, можно временно отключить SSL:

```bash
# На сервере
cd /opt/mr_freazer

# Создайте резервную копию текущей конфигурации
cp nginx.conf nginx.conf.backup

# Используйте конфигурацию без SSL
cp nginx.conf.no-ssl nginx.conf

# Пересоберите и перезапустите nginx
docker-compose build nginx
docker-compose up -d nginx

# Проверьте логи
docker-compose logs nginx --tail 20
```

**Важно:** После добавления SSL сертификатов восстановите конфигурацию:
```bash
cp nginx.conf.backup nginx.conf
docker-compose build nginx
docker-compose up -d nginx
```

### Решение 3: Изменить docker-compose.yml для монтирования из другого пути

Если сертификаты находятся в `/etc/nginx/ssl` на хосте:

Отредактируйте `docker-compose.yml`:

```yaml
nginx:
  volumes:
    - /etc/nginx/ssl:/etc/nginx/ssl:ro  # Вместо ./ssl:/etc/nginx/ssl:ro
```

Затем:

```bash
docker-compose down nginx
docker-compose up -d nginx
```

### Решение 4: Создать самоподписанные сертификаты для тестирования

```bash
# На сервере
cd /opt/mr_freazer
mkdir -p ssl

# Создайте самоподписанный сертификат (только для тестирования!)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key \
  -out ssl/certificate.crt \
  -subj "/C=RU/ST=State/L=City/O=Organization/CN=steelshift.tech"

# Установите права
chmod 600 ssl/private.key
chmod 644 ssl/certificate.crt

# Перезапустите nginx
docker-compose restart nginx
```

## После исправления

### Проверьте статус контейнеров

```bash
docker ps -a | grep nginx
```

Должно быть `Up` вместо `Restarting`.

### Проверьте логи

```bash
docker logs nginx_proxy --tail 20
```

Не должно быть ошибок.

### Проверьте доступность

```bash
# HTTP
curl http://localhost/health

# HTTPS (если SSL настроен)
curl -k https://localhost/health
```

## Если проблема не решена

1. Проверьте синтаксис nginx конфигурации:

```bash
docker exec nginx_proxy nginx -t
```

2. Проверьте, что все файлы на месте:

```bash
docker exec nginx_proxy ls -la /etc/nginx/ssl/
docker exec nginx_proxy ls -la /usr/share/nginx/html/
```

3. Проверьте сеть Docker:

```bash
docker network inspect mr_freazer_app-network
```

## Восстановление после диагностики

Если вы временно отключили SSL, восстановите конфигурацию:

```bash
# На сервере
cd /opt/mr_freazer
cp nginx.conf.backup nginx.conf
docker-compose build nginx
docker-compose up -d nginx
```
