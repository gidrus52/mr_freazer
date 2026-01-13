# Исправление ошибки ERR_CONNECTION_REFUSED для steelshift.tech

## Проблема
Сайт `steelshift.tech` не доступен, ошибка `ERR_CONNECTION_REFUSED`.

## Возможные причины

1. **Docker контейнеры не запущены**
2. **Nginx не настроен для домена steelshift.tech**
3. **Порты 80/443 не открыты в файрволе**
4. **DNS не настроен правильно**
5. **SSL сертификаты отсутствуют или неправильно настроены**

## Пошаговое решение

### Шаг 1: Подключитесь к серверу

```bash
ssh user@your-server-ip
# или
ssh root@82.148.6.221  # если это ваш IP
```

### Шаг 2: Проверьте статус Docker контейнеров

```bash
cd /opt/mr_freazer  # или путь к вашему приложению
docker-compose ps
```

**Если контейнеры не запущены:**
```bash
docker-compose up -d
docker-compose logs -f
```

### Шаг 3: Обновите nginx.conf для домена steelshift.tech

В файле `nginx.conf` замените `server_name localhost;` на:

```nginx
server_name steelshift.tech www.steelshift.tech;
```

**Команды для обновления:**

```bash
cd /opt/mr_freazer  # или путь к вашему приложению

# Создайте резервную копию
cp nginx.conf nginx.conf.backup

# Обновите server_name (замените localhost на steelshift.tech)
sed -i 's/server_name localhost;/server_name steelshift.tech www.steelshift.tech;/g' nginx.conf

# Или отредактируйте вручную
nano nginx.conf
# Найдите строки:
#   server_name localhost;
# Замените на:
#   server_name steelshift.tech www.steelshift.tech;
```

### Шаг 4: Проверьте SSL сертификаты

```bash
# Проверьте наличие сертификатов
ls -la ssl/

# Должны быть файлы:
# - certificate.crt (или certificate.pem)
# - private.key
```

**Если сертификаты отсутствуют:**
1. Поместите файлы сертификата в директорию `ssl/`
2. Убедитесь, что файлы называются `certificate.crt` и `private.key`

### Шаг 5: Пересоберите и перезапустите контейнеры

```bash
# Остановите контейнеры
docker-compose down

# Пересоберите nginx контейнер
docker-compose build nginx

# Запустите контейнеры
docker-compose up -d

# Проверьте логи
docker-compose logs nginx
docker-compose logs backend
```

### Шаг 6: Проверьте порты и файрвол

```bash
# Проверьте, слушает ли nginx на портах 80 и 443
sudo netstat -tulpn | grep -E ':(80|443)'
# или
sudo ss -tulpn | grep -E ':(80|443)'

# Проверьте файрвол (Ubuntu/Debian)
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Проверьте файрвол (CentOS/RHEL)
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Шаг 7: Проверьте DNS настройки

Убедитесь, что DNS записи для `steelshift.tech` указывают на IP вашего сервера:

```bash
# Проверьте текущий IP сервера
curl ifconfig.me
# или
hostname -I

# Проверьте DNS записи
nslookup steelshift.tech
dig steelshift.tech
```

**DNS записи должны быть:**
- A запись: `steelshift.tech` → IP вашего сервера
- A запись: `www.steelshift.tech` → IP вашего сервера (опционально)

### Шаг 8: Проверьте работу локально на сервере

```bash
# Проверьте HTTP (должен редиректить на HTTPS)
curl -I http://localhost

# Проверьте HTTPS
curl -I https://localhost

# Проверьте через домен (если DNS настроен)
curl -I http://steelshift.tech
curl -I https://steelshift.tech
```

## Быстрая диагностика

Создайте и запустите скрипт проверки:

```bash
cat > check-connection.sh << 'EOF'
#!/bin/bash
echo "=== Проверка Docker ==="
docker --version
docker-compose --version

echo -e "\n=== Статус контейнеров ==="
docker-compose ps

echo -e "\n=== Проверка портов ==="
sudo netstat -tulpn | grep -E ':(80|443)' || echo "Порты 80/443 не слушаются"

echo -e "\n=== Проверка nginx конфигурации ==="
grep "server_name" nginx.conf

echo -e "\n=== Проверка SSL сертификатов ==="
ls -la ssl/ 2>/dev/null || echo "Директория ssl/ не найдена"

echo -e "\n=== Проверка логов nginx ==="
docker-compose logs --tail=20 nginx

echo -e "\n=== Проверка локального доступа ==="
curl -I http://localhost 2>&1 | head -5
EOF

chmod +x check-connection.sh
./check-connection.sh
```

## Частые проблемы и решения

### Проблема 1: Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs

# Проверьте место на диске
df -h

# Очистите Docker (если нужно)
docker system prune -f
```

### Проблема 2: Nginx не может найти SSL сертификаты

```bash
# Проверьте монтирование volume в docker-compose.yml
# Должна быть строка:
#   volumes:
#     - ./ssl:/etc/nginx/ssl:ro

# Проверьте права доступа
chmod 644 ssl/certificate.crt
chmod 600 ssl/private.key
```

### Проблема 3: Порты заняты другим процессом

```bash
# Найдите процесс, занимающий порт
sudo lsof -i :80
sudo lsof -i :443

# Остановите конфликтующий сервис (например, системный nginx)
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### Проблема 4: Backend не отвечает

```bash
# Проверьте логи backend
docker-compose logs backend

# Проверьте подключение к базе данных
docker-compose exec postgres pg_isready -U postgres

# Перезапустите backend
docker-compose restart backend
```

## Проверка после исправления

1. **Локально на сервере:**
   ```bash
   curl -I http://localhost
   curl -I https://localhost
   ```

2. **Извне (с вашего компьютера):**
   ```bash
   curl -I http://steelshift.tech
   curl -I https://steelshift.tech
   ```

3. **В браузере:**
   - Откройте `https://steelshift.tech`
   - Проверьте, что нет ошибок SSL
   - Проверьте, что сайт загружается

## Если проблема не решена

1. **Соберите информацию:**
   ```bash
   docker-compose ps > status.txt
   docker-compose logs > logs.txt
   ./check-connection.sh > diagnostics.txt
   ```

2. **Проверьте:**
   - Логи всех сервисов
   - Конфигурацию nginx
   - Настройки файрвола
   - DNS записи

3. **Попробуйте полный перезапуск:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Полезные команды

```bash
# Просмотр логов в реальном времени
docker-compose logs -f

# Перезапуск конкретного сервиса
docker-compose restart nginx

# Проверка конфигурации nginx
docker-compose exec nginx nginx -t

# Перезагрузка nginx без перезапуска контейнера
docker-compose exec nginx nginx -s reload

# Проверка использования ресурсов
docker stats
```
