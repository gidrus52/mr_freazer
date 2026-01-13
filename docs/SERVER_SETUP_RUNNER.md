# Настройка GitHub Actions Runner на сервере

Полное руководство по установке и настройке GitHub Actions self-hosted runner на Linux сервере.

## Предварительные требования

- Сервер с Linux (Ubuntu/Debian/CentOS)
- Права root или sudo
- Минимум 2 CPU и 7 GB RAM
- Доступ к интернету
- Установленный curl и tar

## Шаг 1: Подготовка сервера

### Создание пользователя для runner

```bash
# Создайте отдельного пользователя для runner (рекомендуется)
sudo useradd -m -s /bin/bash runner

# Или используйте существующего пользователя
```

### Установка необходимых пакетов

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y curl tar jq
```

**CentOS/RHEL:**
```bash
sudo yum install -y curl tar jq
```

## Шаг 2: Скачивание и установка runner

### Выбор директории

```bash
# Рекомендуемая директория
RUNNER_DIR="/opt/actions-runner"

# Создайте директорию
sudo mkdir -p $RUNNER_DIR
sudo chown runner:runner $RUNNER_DIR
```

### Скачивание runner

```bash
# Переключитесь на пользователя runner
sudo -u runner bash

# Перейдите в директорию
cd /opt/actions-runner

# Определите версию (проверьте последнюю версию на https://github.com/actions/runner/releases)
RUNNER_VERSION="2.311.0"

# Скачайте runner для Linux x64
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Распакуйте архив
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Удалите архив
rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
```

## Шаг 3: Получение токена регистрации

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Actions** → **Runners**
3. Нажмите **"New self-hosted runner"**
4. Выберите **Linux**
5. **Скопируйте токен регистрации** (начинается с `A`, ~40 символов)
6. **ВАЖНО:** Токен действителен только 1 час!

## Шаг 4: Конфигурация runner

### Базовая конфигурация

```bash
# Оставайтесь в директории runner
cd /opt/actions-runner

# Выполните конфигурацию
./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token ВАШ_ТОКЕН_РЕГИСТРАЦИИ \
  --name production-server \
  --labels self-hosted,linux,production \
  --work _work \
  --replace
```

**Параметры конфигурации:**
- `--url` - URL репозитория (без `.git`)
- `--token` - токен регистрации из GitHub
- `--name` - имя runner'а (уникальное в репозитории)
- `--labels` - метки через запятую (для фильтрации в пайплайнах)
- `--work` - рабочая директория для выполнения задач
- `--replace` - заменить существующую конфигурацию

### Интерактивная конфигурация

Если запустить `./config.sh` без параметров, будет интерактивный режим:

```bash
./config.sh
```

Вам будет предложено ввести:
- URL репозитория: `https://github.com/gidrus52/mr_freazer`
- Токен регистрации: `A1234567890...`
- Имя runner'а: `production-server`
- Метки: `self-hosted,linux,production`
- Рабочую директорию: `_work` (по умолчанию)

## Шаг 5: Установка как системного сервиса

### Установка сервиса

```bash
cd /opt/actions-runner

# Установите runner как systemd сервис
sudo ./svc.sh install

# Запустите сервис
sudo ./svc.sh start

# Проверьте статус
sudo ./svc.sh status
```

### Настройка автозапуска

```bash
# Включите автозапуск при загрузке системы
sudo systemctl enable actions.runner.*.service

# Проверьте статус
sudo systemctl status actions.runner.*.service
```

## Шаг 6: Проверка работы

### Проверка через веб-интерфейс

1. Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
2. Убедитесь, что runner появился в списке
3. Статус должен быть **"Idle"** (зеленый)

### Проверка через командную строку

```bash
# Проверьте статус сервиса
sudo systemctl status actions.runner.*.service

# Просмотр логов
sudo journalctl -u actions.runner.* -f

# Или просмотр логов напрямую
tail -f /opt/actions-runner/_diag/Runner_*.log
```

## Шаг 7: Дополнительная настройка

### Настройка Docker (если нужно)

```bash
# Добавьте пользователя runner в группу docker
sudo usermod -aG docker runner

# Перезапустите runner
sudo ./svc.sh restart
```

### Настройка переменных окружения

Создайте файл `.env` в директории runner:

```bash
cd /opt/actions-runner
sudo -u runner nano .env
```

Добавьте переменные:
```bash
NODE_ENV=production
DOCKER_HOST=unix:///var/run/docker.sock
```

### Настройка прав доступа

```bash
# Убедитесь, что runner имеет права на рабочую директорию
sudo chown -R runner:runner /opt/actions-runner
sudo chmod -R 755 /opt/actions-runner
```

## Быстрая установка через скрипт

Используйте готовый скрипт из репозитория:

```bash
# Скачайте скрипт на сервер
curl -o setup-runner-server.sh https://raw.githubusercontent.com/gidrus52/mr_freazer/main/scripts/setup-runner-server.sh

# Или скопируйте из репозитория
chmod +x scripts/setup-runner-server.sh
sudo ./scripts/setup-runner-server.sh
```

**Использование:**
```bash
# С параметрами по умолчанию
sudo ./scripts/setup-runner-server.sh

# С указанием параметров
sudo ./scripts/setup-runner-server.sh \
  https://github.com/gidrus52/mr_freazer \
  production-server \
  self-hosted,linux,production
```

## Полный скрипт установки (ручной)

Если хотите создать свой скрипт, используйте этот шаблон:

```bash
#!/bin/bash
set -e

# Параметры
REPO_URL="https://github.com/gidrus52/mr_freazer"
RUNNER_NAME="production-server"
RUNNER_LABELS="self-hosted,linux,production"
RUNNER_DIR="/opt/actions-runner"
RUNNER_USER="runner"
RUNNER_VERSION="2.311.0"

echo "=== Установка GitHub Actions Runner ==="

# 1. Создание пользователя
if ! id "$RUNNER_USER" &>/dev/null; then
    echo "Создание пользователя $RUNNER_USER..."
    sudo useradd -m -s /bin/bash $RUNNER_USER
fi

# 2. Создание директории
echo "Создание директории $RUNNER_DIR..."
sudo mkdir -p $RUNNER_DIR
sudo chown $RUNNER_USER:$RUNNER_USER $RUNNER_DIR

# 3. Скачивание runner
echo "Скачивание runner версии $RUNNER_VERSION..."
sudo -u $RUNNER_USER bash << EOF
cd $RUNNER_DIR
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
EOF

# 4. Получение токена
echo ""
echo "=== Получение токена регистрации ==="
echo "Откройте: $REPO_URL/settings/actions/runners"
echo "Нажмите 'New self-hosted runner' и скопируйте токен"
read -p "Введите токен регистрации: " REGISTRATION_TOKEN

# 5. Конфигурация
echo "Конфигурация runner..."
sudo -u $RUNNER_USER bash << EOF
cd $RUNNER_DIR
./config.sh --url $REPO_URL \
  --token $REGISTRATION_TOKEN \
  --name $RUNNER_NAME \
  --labels $RUNNER_LABELS \
  --work _work \
  --replace
EOF

# 6. Установка как сервиса
echo "Установка как системного сервиса..."
cd $RUNNER_DIR
sudo ./svc.sh install
sudo ./svc.sh start

echo ""
echo "✅ Runner успешно установлен и запущен!"
echo ""
echo "Проверьте статус:"
echo "  sudo systemctl status actions.runner.*.service"
echo ""
echo "Просмотр логов:"
echo "  sudo journalctl -u actions.runner.* -f"
```

Сделайте скрипт исполняемым и запустите:

```bash
chmod +x setup-runner.sh
sudo ./setup-runner.sh
```

**Или используйте готовый скрипт:**
```bash
sudo bash scripts/setup-runner-server.sh
```

## Управление runner'ом

### Основные команды

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

# Удаление сервиса
sudo ./svc.sh uninstall
```

### Просмотр логов

```bash
# Логи systemd
sudo journalctl -u actions.runner.* -f

# Логи runner'а
tail -f /opt/actions-runner/_diag/Runner_*.log

# Все логи
cat /opt/actions-runner/_diag/Runner_*.log
```

## Использование в пайплайне

После установки обновите `.github/workflows/ci-cd.yml`:

```yaml
jobs:
  backend-test:
    runs-on: [self-hosted, linux, production]  # Используйте метки runner'а
    steps:
      - uses: actions/checkout@v4
      # ...
```

## Безопасность

### Рекомендации

1. **Используйте отдельного пользователя** для runner'а
2. **Ограничьте права доступа** к директории runner'а
3. **Используйте метки** для изоляции окружений
4. **Регулярно обновляйте** runner
5. **Мониторьте логи** на подозрительную активность

### Настройка firewall

```bash
# Разрешите только исходящие соединения к GitHub
# Runner не требует входящих соединений
```

## Обновление runner'а

```bash
cd /opt/actions-runner

# Остановите runner
sudo ./svc.sh stop

# Скачайте новую версию
RUNNER_VERSION="2.312.0"  # Новая версия
sudo -u runner curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Распакуйте (заменит старые файлы)
sudo -u runner tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
sudo -u runner rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Запустите runner
sudo ./svc.sh start
```

## Устранение проблем

### Runner не запускается

```bash
# Проверьте логи
sudo journalctl -u actions.runner.* -n 50

# Проверьте права доступа
ls -la /opt/actions-runner

# Проверьте конфигурацию
cat /opt/actions-runner/.runner
```

### Runner не подключается к GitHub

```bash
# Проверьте интернет-соединение
curl -I https://api.github.com

# Проверьте DNS
nslookup api.github.com

# Проверьте firewall
sudo iptables -L
```

### Проблемы с правами

```bash
# Исправьте права доступа
sudo chown -R runner:runner /opt/actions-runner
sudo chmod -R 755 /opt/actions-runner
```

## Полезные ссылки

- [Официальная документация](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Список релизов](https://github.com/actions/runner/releases)
- [Безопасность runners](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

