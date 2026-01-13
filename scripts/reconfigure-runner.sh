#!/bin/bash
# Скрипт для переконфигурации GitHub Actions Runner

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Переконфигурация GitHub Actions Runner ===${NC}\n"

# Параметры
REPO="${1:-gidrus52/mr_freazer}"
RUNNER_DIR="${2:-./actions-runner}"

echo -e "${YELLOW}Репозиторий:${NC} $REPO"
echo -e "${YELLOW}Директория runner:${NC} $RUNNER_DIR\n"

# Проверка директории
if [ ! -d "$RUNNER_DIR" ] || [ ! -f "$RUNNER_DIR/config.sh" ]; then
    echo -e "${RED}✗ Runner не найден в $RUNNER_DIR${NC}"
    exit 1
fi

cd "$RUNNER_DIR"

# Остановка runner'а
echo -e "${YELLOW}[1/5] Остановка runner'а...${NC}"
if [ -f "./svc.sh" ]; then
    sudo ./svc.sh stop 2>/dev/null || echo -e "${YELLOW}Runner не запущен как сервис${NC}"
else
    echo -e "${YELLOW}Runner не установлен как сервис${NC}"
fi

# Получение токена
echo -e "${YELLOW}[2/5] Получение токена регистрации...${NC}"
echo -e "${YELLOW}Получите новый токен на: https://github.com/$REPO/settings/actions/runners${NC}"
echo -e "${YELLOW}Нажмите 'New self-hosted runner' и скопируйте токен${NC}"
read -p "Введите токен регистрации: " TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Токен не введен${NC}"
    exit 1
fi

# Получение нового имени
echo -e "${YELLOW}[3/5] Настройка имени runner'а...${NC}"
read -p "Введите новое имя runner'а (или Enter для текущего): " RUNNER_NAME
RUNNER_NAME="${RUNNER_NAME:-$(hostname)}"

# Получение меток
echo -e "${YELLOW}[4/5] Настройка меток...${NC}"
read -p "Введите метки через запятую (или Enter для default): " LABELS
LABELS="${LABELS:-self-hosted,linux}"

# Переконфигурация
echo -e "${YELLOW}[5/5] Переконфигурация runner'а...${NC}"
REPO_URL="https://github.com/$REPO"

if ./config.sh --url "$REPO_URL" \
    --token "$TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$LABELS" \
    --work _work \
    --replace; then
    
    echo -e "\n${GREEN}✅ Runner успешно переконфигурирован!${NC}\n"
    echo -e "${YELLOW}Новые настройки:${NC}"
    echo "  Имя: $RUNNER_NAME"
    echo "  Метки: $LABELS"
    echo "  URL: $REPO_URL"
    echo ""
    echo -e "${YELLOW}Запуск runner:${NC}"
    echo "  sudo ./svc.sh start"
    echo ""
    echo -e "${YELLOW}Или вручную:${NC}"
    echo "  ./run.sh"
else
    echo -e "\n${RED}✗ Ошибка переконфигурации${NC}"
    echo -e "${YELLOW}Возможные причины:${NC}"
    echo "  1. Токен истек (действителен 1 час)"
    echo "  2. Неправильный URL репозитория"
    echo "  3. Нет прав доступа к репозиторию"
    exit 1
fi

