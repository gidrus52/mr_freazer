# 🔧 Исправление проблем с SSL сертификатами

## Проблема
Файлы сертификатов находятся по пути `/etc/nginx/ssl` на сервере, но не работают в Docker контейнере.

## Причина
В `docker-compose.yml` настроено монтирование из локальной папки `./ssl` в контейнер, но файлы находятся в `/etc/nginx/ssl` на хосте.

## Решения

### Решение 1: Скопировать файлы в проект (рекомендуется)

```bash
# На сервере
cd /opt/mr_freazer

# Создайте папку ssl, если её нет
mkdir -p ssl

# Скопируйте файлы из /etc/nginx/ssl
sudo cp /etc/nginx/ssl/certificate.crt ./ssl/
sudo cp /etc/nginx/ssl/private.key ./ssl/

# Установите правильные права доступа
sudo chmod 600 ./ssl/private.key
sudo chmod 644 ./ssl/certificate.crt
sudo chown $USER:$USER ./ssl/*

# Проверьте файлы
ls -lh ./ssl/

# Перезапустите nginx
docker-compose restart nginx

# Проверьте логи
docker-compose logs nginx
```

### Решение 2: Изменить docker-compose.yml для монтирования из /etc/nginx/ssl

Отредактируйте `docker-compose.yml`:

```yaml
nginx:
  build:
    context: .
    dockerfile: nginx/Dockerfile
  container_name: nginx_proxy
  ports:
    - "${FRONTEND_PORT:-80}:80"
    - "${HTTPS_PORT:-443}:443"
  volumes:
    # Измените эту строку:
    - /etc/nginx/ssl:/etc/nginx/ssl:ro
  networks:
    - app-network
  depends_on:
    - backend
  restart: unless-stopped
```

Затем перезапустите:

```bash
docker-compose down nginx
docker-compose up -d nginx
```

### Решение 3: Использовать символическую ссылку

```bash
cd /opt/mr_freazer
mkdir -p ssl
sudo ln -s /etc/nginx/ssl/certificate.crt ./ssl/certificate.crt
sudo ln -s /etc/nginx/ssl/private.key ./ssl/private.key
```

## Диагностика

### Запустите скрипт диагностики:

```bash
chmod +x check-ssl-certificates.sh
./check-ssl-certificates.sh
```

### Проверка вручную:

```bash
# 1. Проверьте файлы на хосте
ls -lh /etc/nginx/ssl/

# 2. Проверьте файлы в проекте
ls -lh ./ssl/

# 3. Проверьте файлы внутри контейнера
docker-compose exec nginx ls -lh /etc/nginx/ssl/

# 4. Проверьте логи nginx
docker-compose logs nginx | grep -i ssl

# 5. Проверьте конфигурацию nginx
docker-compose exec nginx nginx -t

# 6. Проверьте формат сертификата
openssl x509 -in ./ssl/certificate.crt -text -noout

# 7. Проверьте формат ключа
openssl rsa -in ./ssl/private.key -check -noout

# 8. Проверьте соответствие ключа и сертификата
openssl x509 -noout -modulus -in ./ssl/certificate.crt | openssl md5
openssl rsa -noout -modulus -in ./ssl/private.key | openssl md5
# MD5 хеши должны совпадать!
```

## Частые проблемы и решения

### Проблема 1: "SSL certificate not found"

**Причина:** Файлы не монтируются в контейнер

**Решение:**
```bash
# Проверьте, что файлы есть в ./ssl/
ls -lh ./ssl/

# Проверьте docker-compose.yml
grep -A 2 "volumes:" docker-compose.yml

# Пересоздайте контейнер
docker-compose down nginx
docker-compose up -d nginx
```

### Проблема 2: "SSL certificate key does not match"

**Причина:** Ключ не соответствует сертификату

**Решение:**
```bash
# Проверьте соответствие
openssl x509 -noout -modulus -in ./ssl/certificate.crt | openssl md5
openssl rsa -noout -modulus -in ./ssl/private.key | openssl md5

# Если хеши не совпадают, используйте правильную пару файлов
```

### Проблема 3: "Permission denied"

**Причина:** Неправильные права доступа

**Решение:**
```bash
sudo chmod 600 ./ssl/private.key
sudo chmod 644 ./ssl/certificate.crt
docker-compose restart nginx
```

### Проблема 4: "OCSP stapling verify failed"

**Причина:** OCSP Stapling включен, но resolver не настроен

**Решение:** Временно отключите OCSP Stapling в `nginx.conf`:

```nginx
# OCSP Stapling
ssl_stapling off;  # Измените on на off
ssl_stapling_verify off;
```

Или настройте resolver:

```nginx
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

### Проблема 5: Сертификат не доверяется браузером

**Причина:** 
- Сертификат выдан для другого домена
- Отсутствует цепочка сертификатов (intermediate certificates)

**Решение:**

1. Проверьте, для какого домена выдан сертификат:
```bash
openssl x509 -in ./ssl/certificate.crt -text -noout | grep "Subject:"
```

2. Если есть промежуточные сертификаты, создайте полную цепочку:
```bash
# Объедините сертификаты
cat ./ssl/certificate.crt ./ssl/intermediate.crt > ./ssl/fullchain.crt
```

3. Обновите nginx.conf:
```nginx
ssl_certificate /etc/nginx/ssl/fullchain.crt;
ssl_certificate_key /etc/nginx/ssl/private.key;
```

## Проверка после исправления

```bash
# 1. Проверьте статус контейнера
docker-compose ps nginx

# 2. Проверьте логи
docker-compose logs nginx

# 3. Проверьте HTTPS
curl -k https://localhost
curl -k https://localhost/health

# 4. Проверьте сертификат
openssl s_client -connect localhost:443 -servername yourdomain.com
```

## Важные замечания

1. **Безопасность:** Приватный ключ должен иметь права 600
2. **Формат:** Сертификаты могут быть в формате `.crt`, `.pem` или `.cer`
3. **Имена файлов:** В nginx.conf указаны имена `certificate.crt` и `private.key` - используйте именно эти имена
4. **Git:** Не коммитьте приватные ключи в git! Убедитесь, что `.gitignore` содержит `ssl/*.key`

## Дополнительная информация

- Настройка SSL: `SSL_SETUP.md`
- Docker команды: `DOCKER_START.md`

