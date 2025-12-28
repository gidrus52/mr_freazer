# Экстренная очистка диска на сервере

## ⚠️ КРИТИЧЕСКАЯ СИТУАЦИЯ: Диск заполнен на 100%

Если диск заполнен на 100%, нужно срочно освободить место.

## Быстрая очистка (выполните на сервере)

### 1. Очистка Docker (самое важное!)

```bash
# Остановите все контейнеры
docker-compose down

# Очистите ВСЁ в Docker
docker system prune -a --volumes -f

# Или поэтапно:
docker container prune -f
docker image prune -a -f
docker volume prune -f
docker builder prune -a -f
```

### 2. Очистка системных логов

```bash
# Очистите журналы systemd (оставит только последние 7 дней)
sudo journalctl --vacuum-time=7d

# Или ограничьте размер (100MB)
sudo journalctl --vacuum-size=100M
```

### 3. Очистка пакетов

**Ubuntu/Debian:**
```bash
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove -y
```

**CentOS/RHEL:**
```bash
sudo yum clean all
sudo yum autoremove -y
```

### 4. Очистка временных файлов

```bash
# Очистите /tmp
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Удалите старые файлы (>7 дней)
sudo find /tmp -type f -atime +7 -delete
sudo find /var/tmp -type f -atime +7 -delete
```

### 5. Очистка старых логов

```bash
# Удалите старые логи (>30 дней)
sudo find /var/log -type f -name "*.log" -mtime +30 -delete
sudo find /var/log -type f -name "*.gz" -delete
sudo find /var/log -type f -name "*.old" -delete
```

## Автоматическая очистка

Используйте готовый скрипт:

```bash
# На сервере
cd /opt/mr_freazer
chmod +x scripts/cleanup-disk.sh
sudo ./scripts/cleanup-disk.sh
```

## Поиск больших файлов

Если очистка не помогла, найдите большие файлы:

```bash
# Топ-10 самых больших файлов
sudo find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | head -10

# Топ-10 самых больших директорий
sudo du -h --max-depth=1 / 2>/dev/null | sort -rh | head -11
```

## Проверка использования места

```bash
# Общее использование
df -h

# Использование по директориям
du -sh /* 2>/dev/null | sort -rh
```

## Что обычно занимает место

1. **Docker** - образы, контейнеры, volumes (часто 10-50GB)
2. **Логи** - /var/log (может быть несколько GB)
3. **Кэш пакетов** - /var/cache (apt/yum)
4. **Временные файлы** - /tmp, /var/tmp
5. **Старые бэкапы** - если есть

## После очистки

```bash
# Проверьте освобожденное место
df -h

# Пересоберите Docker образы
cd /opt/mr_freazer
docker-compose build --no-cache
docker-compose up -d
```

## Предотвращение проблемы в будущем

1. **Регулярная очистка Docker:**
   ```bash
   # Добавьте в crontab (еженедельно)
   0 2 * * 0 docker system prune -f
   ```

2. **Ограничение размера логов:**
   ```bash
   # В /etc/systemd/journald.conf
   SystemMaxUse=100M
   ```

3. **Мониторинг диска:**
   ```bash
   # Проверяйте регулярно
   df -h
   ```

## Если места все еще не хватает

1. **Удалите неиспользуемые Docker образы вручную:**
   ```bash
   docker images
   docker rmi <image_id>
   ```

2. **Проверьте большие файлы проекта:**
   ```bash
   find /opt/mr_freazer -type f -size +100M
   ```

3. **Рассмотрите расширение диска** или добавление нового диска

4. **Перенесите Docker data на другой диск** (если возможно)

## Критические команды (одна строка)

```bash
# Полная очистка (выполните на сервере)
docker-compose down && docker system prune -a --volumes -f && sudo journalctl --vacuum-time=7d && sudo apt-get clean && sudo apt-get autoremove -y && df -h
```

