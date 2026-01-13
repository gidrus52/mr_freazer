#!/bin/bash
# Скрипт для установки GitHub Actions Self-Hosted Runner на Linux

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Установка GitHub Actions Self-Hosted Runner ===${NC}\n"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Ошибка: Запустите скрипт с правами root (sudo)${NC}"
    exit 1
fi

# Параметры
read -p "Введите URL репозитория (например: https://github.com/username/repo): " REPO_URL
read -p "Введите токен регистрации (из GitHub): " REGISTRATION_TOKEN
read -p "Введите имя runner'а (например: production-server): " RUNNER_NAME
read -p "Введите метки через запятую (например: self-hosted,linux,production): " LABELS

# Значения по умолчанию
RUNNER_USER="${RUNNER_USER:-runner}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
RUNNER_VERSION="${RUNNER_VERSION:-2.311.0}"

echo -e "\n${YELLOW}Настройка:${NC}"
echo "  Пользователь: $RUNNER_USER"
echo "  Директория: $RUNNER_DIR"
echo "  Имя runner'а: $RUNNER_NAME"
echo "  Метки: $LABELS"
echo "  Версия runner'а: $RUNNER_VERSION"

read -p "Продолжить? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Создание пользователя
if ! id "$RUNNER_USER" &>/dev/null; then
    echo -e "${GREEN}Создание пользователя $RUNNER_USER...${NC}"
    useradd -m -s /bin/bash "$RUNNER_USER"
else
    echo -e "${YELLOW}Пользователь $RUNNER_USER уже существует${NC}"
fi

# Создание директории
echo -e "${GREEN}Создание директории $RUNNER_DIR...${NC}"
mkdir -p "$RUNNER_DIR"
chown "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"

# Скачивание и установка runner'а
echo -e "${GREEN}Скачивание runner'а версии $RUNNER_VERSION...${NC}"
cd "$RUNNER_DIR"
sudo -u "$RUNNER_USER" bash << EOF
cd "$RUNNER_DIR"

# Скачивание
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
    https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Распаковка
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Настройка
./config.sh --url "$REPO_URL" \
    --token "$REGISTRATION_TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$LABELS" \
    --work _work \
    --replace

# Установка как сервиса
sudo ./svc.sh install
EOF

# Запуск сервиса
echo -e "${GREEN}Запуск сервиса...${NC}"
cd "$RUNNER_DIR"
./svc.sh start

# Проверка статуса
echo -e "\n${GREEN}Проверка статуса сервиса...${NC}"
./svc.sh status

echo -e "\n${GREEN}✅ Runner успешно установлен и запущен!${NC}"
echo -e "\n${YELLOW}Полезные команды:${NC}"
echo "  Просмотр логов: sudo journalctl -u actions.runner.* -f"
echo "  Статус: sudo $RUNNER_DIR/svc.sh status"
echo "  Перезапуск: sudo $RUNNER_DIR/svc.sh restart"
echo "  Остановка: sudo $RUNNER_DIR/svc.sh stop"

