# ⚡ Быстрое исправление SSL сертификатов

## Проблема
Файлы в `/etc/nginx/ssl` на сервере, но не работают в Docker.

## Быстрое решение

```bash
cd /opt/mr_freazer

# 1. Скопируйте файлы в проект
sudo mkdir -p ssl
sudo cp /etc/nginx/ssl/certificate.crt ./ssl/
sudo cp /etc/nginx/ssl/private.key ./ssl/

# 2. Установите права
sudo chmod 600 ./ssl/private.key
sudo chmod 644 ./ssl/certificate.crt
sudo chown $USER:$USER ./ssl/*

# 3. Перезапустите nginx
docker-compose restart nginx

# 4. Проверьте
docker-compose logs nginx | tail -20
curl -k https://localhost/health
```

## Альтернатива: изменить docker-compose.yml

Отредактируйте `docker-compose.yml`, измените строку:

```yaml
volumes:
  - /etc/nginx/ssl:/etc/nginx/ssl:ro  # Вместо ./ssl
```

Затем:

```bash
docker-compose down nginx
docker-compose up -d nginx
```

## Диагностика

```bash
# Запустите скрипт диагностики
chmod +x check-ssl-certificates.sh
./check-ssl-certificates.sh
```

## Если не помогло

См. подробную инструкцию: `FIX_SSL_CERTIFICATES.md`

