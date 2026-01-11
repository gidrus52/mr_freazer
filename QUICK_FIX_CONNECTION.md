# Быстрое исправление ERR_CONNECTION_REFUSED

## Что нужно сделать на сервере

### 1. Подключитесь к серверу
```bash
ssh user@your-server-ip
```

### 2. Перейдите в директорию проекта
```bash
cd /opt/mr_freazer  # или путь к вашему проекту
```

### 3. Обновите nginx.conf (если еще не обновлен)
Файл `nginx.conf` уже обновлен в репозитории. Если на сервере старая версия:

```bash
# Обновите из репозитория
git pull

# Или вручную замените localhost на steelshift.tech
sed -i 's/server_name localhost;/server_name steelshift.tech www.steelshift.tech;/g' nginx.conf
```

### 4. Проверьте статус контейнеров
```bash
docker-compose ps
```

### 5. Если контейнеры не запущены - запустите их
```bash
docker-compose up -d
```

### 6. Если контейнеры запущены - пересоберите nginx
```bash
docker-compose down
docker-compose build nginx
docker-compose up -d
```

### 7. Проверьте логи
```bash
docker-compose logs nginx
docker-compose logs backend
```

### 8. Проверьте порты
```bash
sudo netstat -tulpn | grep -E ':(80|443)'
```

### 9. Проверьте файрвол
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 10. Проверьте работу
```bash
curl -I http://localhost
curl -I https://localhost
```

## Если не помогло

Смотрите подробную инструкцию в файле `FIX_CONNECTION_REFUSED.md`
