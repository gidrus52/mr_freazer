# 🔧 Быстрое исправление SSL сертификатов

## Проблема
Файлы находятся в `/etc/nginx/ssl` на сервере, но не работают в Docker контейнере.

## Решение (выберите один вариант)

### Вариант 1: Скопировать файлы в проект (рекомендуется)

```bash
cd /opt/mr_freazer

# Создайте папку и скопируйте файлы
sudo mkdir -p ssl
sudo cp /etc/nginx/ssl/certificate.crt ./ssl/
sudo cp /etc/nginx/ssl/private.key ./ssl/

# Установите права
sudo chmod 600 ./ssl/private.key
sudo chmod 644 ./ssl/certificate.crt
sudo chown $USER:$USER ./ssl/*

# Перезапустите nginx
docker-compose restart nginx

# Проверьте
docker-compose logs nginx | grep -i ssl
```

### Вариант 2: Изменить docker-compose.yml

Отредактируйте `docker-compose.yml`, найдите секцию `nginx` и измените:

```yaml
volumes:
  - /etc/nginx/ssl:/etc/nginx/ssl:ro  # Вместо ./ssl:/etc/nginx/ssl:ro
```

Затем:

```bash
docker-compose down nginx
docker-compose up -d nginx
```

## Диагностика

Запустите скрипт диагностики:

```bash
chmod +x check-ssl-certificates.sh
./check-ssl-certificates.sh
```

## Проверка после исправления

```bash
# Проверьте логи
docker-compose logs nginx

# Проверьте HTTPS
curl -k https://localhost/health

# Проверьте сертификат
openssl s_client -connect localhost:443 -servername yourdomain.com
```

## Дополнительно

Также исправлена проблема с OCSP Stapling в `nginx.conf` - он теперь отключен, так как resolver не был настроен.

Подробная инструкция: `FIX_SSL_CERTIFICATES.md`

