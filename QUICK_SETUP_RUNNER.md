# Быстрая установка GitHub Actions Runner на сервере

## 🚀 Быстрый старт (3 команды)

```bash
# 1. Скачайте скрипт на сервер
curl -o setup-runner.sh https://raw.githubusercontent.com/gidrus52/mr_freazer/main/scripts/setup-runner-server.sh
chmod +x setup-runner.sh

# 2. Запустите установку
sudo ./setup-runner.sh

# 3. Следуйте инструкциям на экране
```

## 📋 Пошаговая установка

### 1. Подготовка

```bash
# Создайте пользователя
sudo useradd -m -s /bin/bash runner

# Создайте директорию
sudo mkdir -p /opt/actions-runner
sudo chown runner:runner /opt/actions-runner
```

### 2. Скачивание runner

```bash
cd /opt/actions-runner
sudo -u runner bash

# Скачайте последнюю версию (проверьте на https://github.com/actions/runner/releases)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Распакуйте
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
rm actions-runner-linux-x64-2.311.0.tar.gz
```

### 3. Получение токена

1. Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
2. Нажмите **"New self-hosted runner"**
3. Выберите **Linux**
4. Скопируйте токен (начинается с `A`, ~40 символов)
5. **ВАЖНО:** Используйте токен сразу (действителен 1 час!)

### 4. Конфигурация

```bash
cd /opt/actions-runner

./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token ВАШ_ТОКЕН \
  --name production-server \
  --labels self-hosted,linux,production \
  --work _work \
  --replace
```

### 5. Установка как сервиса

```bash
# Установите как systemd сервис
sudo ./svc.sh install

# Запустите
sudo ./svc.sh start

# Проверьте статус
sudo ./svc.sh status
```

## ✅ Проверка

```bash
# Статус сервиса
sudo systemctl status actions.runner.*.service

# Логи
sudo journalctl -u actions.runner.* -f

# В GitHub
# Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
# Runner должен быть в статусе "Idle" (зеленый)
```

## 🔧 Управление

```bash
cd /opt/actions-runner

# Статус
sudo ./svc.sh status

# Остановка
sudo ./svc.sh stop

# Запуск
sudo ./svc.sh start

# Перезапуск
sudo ./svc.sh restart
```

## 📚 Подробная документация

- **[docs/SERVER_SETUP_RUNNER.md](docs/SERVER_SETUP_RUNNER.md)** - Полная инструкция
- **[docs/GITHUB_RUNNER_SETUP.md](docs/GITHUB_RUNNER_SETUP.md)** - Общее руководство
- **[docs/EDIT_RUNNER.md](docs/EDIT_RUNNER.md)** - Редактирование настроек

## ⚠️ Важные моменты

- Токен регистрации действителен **только 1 час**
- URL репозитория **без `.git`** в конце
- Используйте **отдельного пользователя** для runner'а
- Убедитесь, что **Actions включены** в репозитории

