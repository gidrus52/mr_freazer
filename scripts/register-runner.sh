#!/bin/bash
# Скрипт для диагностики и регистрации GitHub Actions Runner

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Диагностика и регистрация GitHub Actions Runner ===${NC}\n"

# Параметры
REPO="${1:-gidrus52/mr_freazer}"
RUNNER_DIR="${2:-./actions-runner}"

echo -e "${YELLOW}Репозиторий:${NC} $REPO"
echo -e "${YELLOW}Директория runner:${NC} $RUNNER_DIR\n"

# Проверка 1: Интернет
echo -e "${YELLOW}[1/6] Проверка интернет-соединения...${NC}"
if curl -s -I https://api.github.com > /dev/null; then
    echo -e "${GREEN}✓ Интернет работает${NC}"
else
    echo -e "${RED}✗ Нет доступа к GitHub API${NC}"
    exit 1
fi

# Проверка 2: Репозиторий существует
echo -e "${YELLOW}[2/6] Проверка репозитория...${NC}"
if curl -s -I "https://github.com/$REPO" > /dev/null; then
    echo -e "${GREEN}✓ Репозиторий доступен${NC}"
else
    echo -e "${RED}✗ Репозиторий не найден: $REPO${NC}"
    echo -e "${YELLOW}Проверьте правильность имени репозитория${NC}"
    exit 1
fi

# Проверка 3: Директория runner
echo -e "${YELLOW}[3/6] Проверка директории runner...${NC}"
if [ -d "$RUNNER_DIR" ] && [ -f "$RUNNER_DIR/config.sh" ]; then
    echo -e "${GREEN}✓ Runner установлен в $RUNNER_DIR${NC}"
else
    echo -e "${RED}✗ Runner не найден в $RUNNER_DIR${NC}"
    echo -e "${YELLOW}Сначала установите runner:${NC}"
    echo "  mkdir actions-runner && cd actions-runner"
    echo "  curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz"
    echo "  tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz"
    exit 1
fi

# Проверка 4: Токен
echo -e "${YELLOW}[4/6] Получение токена регистрации...${NC}"
echo -e "${YELLOW}Введите токен регистрации (получите на https://github.com/$REPO/settings/actions/runners):${NC}"
read -p "Токен: " TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Токен не введен${NC}"
    exit 1
fi

# Проверка формата токена
if [[ ! "$TOKEN" =~ ^A[0-9A-Za-z]{38,40}$ ]]; then
    echo -e "${YELLOW}⚠ Предупреждение: Токен не соответствует ожидаемому формату${NC}"
    echo -e "${YELLOW}Токен должен начинаться с 'A' и быть длиной ~40 символов${NC}"
    read -p "Продолжить? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Проверка 5: URL
echo -e "${YELLOW}[5/6] Проверка URL...${NC}"
REPO_URL="https://github.com/$REPO"
if [[ "$REPO_URL" == *.git ]]; then
    echo -e "${RED}✗ URL содержит .git (неправильно)${NC}"
    REPO_URL="${REPO_URL%.git}"
    echo -e "${YELLOW}Исправленный URL: $REPO_URL${NC}"
fi
echo -e "${GREEN}✓ URL: $REPO_URL${NC}"

# Регистрация
echo -e "${YELLOW}[6/6] Регистрация runner...${NC}"
cd "$RUNNER_DIR"

# Удаляем старую конфигурацию если есть
if [ -f ".runner" ]; then
    echo -e "${YELLOW}Удаление старой конфигурации...${NC}"
    ./config.sh remove --token "$TOKEN" 2>/dev/null || true
fi

# Регистрация
echo -e "${GREEN}Выполняется регистрация...${NC}"
if ./config.sh --url "$REPO_URL" --token "$TOKEN" --name "$(hostname)" --labels "self-hosted,linux" --work _work --replace; then
    echo -e "\n${GREEN}✅ Runner успешно зарегистрирован!${NC}\n"
    echo -e "${YELLOW}Запуск runner:${NC}"
    echo "  cd $RUNNER_DIR"
    echo "  ./run.sh"
    echo ""
    echo -e "${YELLOW}Или установите как сервис:${NC}"
    echo "  cd $RUNNER_DIR"
    echo "  sudo ./svc.sh install"
    echo "  sudo ./svc.sh start"
else
    echo -e "\n${RED}✗ Ошибка регистрации${NC}"
    echo -e "${YELLOW}Возможные причины:${NC}"
    echo "  1. Токен истек (действителен 1 час)"
    echo "  2. Неправильный URL репозитория"
    echo "  3. Нет прав доступа к репозиторию"
    echo ""
    echo -e "${YELLOW}Попробуйте:${NC}"
    echo "  1. Получите новый токен: https://github.com/$REPO/settings/actions/runners"
    echo "  2. Проверьте URL: $REPO_URL"
    echo "  3. Убедитесь, что Actions включены в репозитории"
    exit 1
fi

