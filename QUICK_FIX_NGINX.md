# ⚡ Быстрое исправление nginx (контейнер перезапускается)

## Проблема
```
nginx: [emerg] cannot load certificate "/etc/nginx/ssl/certificate.crt": BIO_new_file() failed
```

## Быстрое решение (выберите один вариант)

### Вариант 1: Добавить SSL сертификаты (если они есть на сервере)

```bash
cd /opt/mr_freazer  # или путь к вашему проекту

# Создайте папку и скопируйте сертификаты
sudo mkdir -p ssl
sudo cp /etc/nginx/ssl/certificate.crt ./ssl/ 2>/dev/null || echo "Не найдено"
sudo cp /etc/nginx/ssl/private.key ./ssl/ 2>/dev/null || echo "Не найдено"

# Установите права
sudo chmod 600 ./ssl/private.key
sudo chmod 644 ./ssl/certificate.crt
sudo chown $USER:$USER ./ssl/*

# Перезапустите
docker-compose restart nginx
docker-compose logs nginx --tail 20
```

### Вариант 2: Временно отключить SSL (если сертификатов нет)

```bash
cd /opt/mr_freazer

# Создайте резервную копию
cp nginx.conf nginx.conf.backup

# Используйте конфигурацию без SSL
cp nginx.conf.no-ssl nginx.conf

# Пересоберите и перезапустите
docker-compose build nginx
docker-compose up -d nginx

# Проверьте
docker-compose logs nginx --tail 20
docker ps | grep nginx
```

### Вариант 3: Создать самоподписанный сертификат (для тестирования)

```bash
cd /opt/mr_freazer
mkdir -p ssl

# Создайте самоподписанный сертификат
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key \
  -out ssl/certificate.crt \
  -subj "/C=RU/ST=State/L=City/O=Organization/CN=steelshift.tech"

# Установите права
chmod 600 ssl/private.key
chmod 644 ssl/certificate.crt

# Перезапустите
docker-compose restart nginx
```

## Проверка

```bash
# Проверьте статус
docker ps | grep nginx
# Должно быть "Up", а не "Restarting"

# Проверьте логи
docker-compose logs nginx --tail 10
# Не должно быть ошибок

# Проверьте доступность
curl http://localhost/health
# Должно вернуть "healthy"
```

## Восстановление SSL (после добавления сертификатов)

```bash
cd /opt/mr_freazer
cp nginx.conf.backup nginx.conf
docker-compose build nginx
docker-compose up -d nginx
```
