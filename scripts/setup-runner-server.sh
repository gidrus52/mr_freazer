#!/bin/bash
# Полный скрипт установки GitHub Actions Runner на сервере

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Установка GitHub Actions Runner на сервере          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Ошибка: Запустите скрипт с правами root (sudo)${NC}"
    exit 1
fi

# Параметры по умолчанию
REPO_URL="${1:-https://github.com/gidrus52/mr_freazer}"
RUNNER_NAME="${2:-$(hostname)}"
RUNNER_LABELS="${3:-self-hosted,linux,production}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
RUNNER_USER="${RUNNER_USER:-runner}"
RUNNER_VERSION="${RUNNER_VERSION:-2.311.0}"

echo -e "${BLUE}📋 Параметры установки:${NC}"
echo -e "  Репозиторий: ${YELLOW}$REPO_URL${NC}"
echo -e "  Имя runner'а: ${YELLOW}$RUNNER_NAME${NC}"
echo -e "  Метки: ${YELLOW}$RUNNER_LABELS${NC}"
echo -e "  Директория: ${YELLOW}$RUNNER_DIR${NC}"
echo -e "  Пользователь: ${YELLOW}$RUNNER_USER${NC}"
echo -e "  Версия runner: ${YELLOW}$RUNNER_VERSION${NC}\n"

read -p "Изменить параметры? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "URL репозитория [$REPO_URL]: " input
    REPO_URL="${input:-$REPO_URL}"
    
    read -p "Имя runner'а [$RUNNER_NAME]: " input
    RUNNER_NAME="${input:-$RUNNER_NAME}"
    
    read -p "Метки [$RUNNER_LABELS]: " input
    RUNNER_LABELS="${input:-$RUNNER_LABELS}"
fi

# Шаг 1: Создание пользователя
echo -e "\n${BLUE}[1/6]${NC} ${GREEN}Создание пользователя...${NC}"
if ! id "$RUNNER_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$RUNNER_USER"
    echo -e "  ${GREEN}✓${NC} Пользователь $RUNNER_USER создан"
else
    echo -e "  ${YELLOW}⚠${NC} Пользователь $RUNNER_USER уже существует"
fi

# Шаг 2: Установка зависимостей
echo -e "\n${BLUE}[2/6]${NC} ${GREEN}Установка зависимостей...${NC}"
if command -v apt-get &> /dev/null; then
    apt-get update -qq
    apt-get install -y -qq curl tar jq > /dev/null 2>&1
elif command -v yum &> /dev/null; then
    yum install -y -q curl tar jq > /dev/null 2>&1
fi
echo -e "  ${GREEN}✓${NC} Зависимости установлены"

# Шаг 3: Создание директории
echo -e "\n${BLUE}[3/6]${NC} ${GREEN}Создание директории...${NC}"
mkdir -p "$RUNNER_DIR"
chown "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"
echo -e "  ${GREEN}✓${NC} Директория $RUNNER_DIR создана"

# Шаг 4: Скачивание runner
echo -e "\n${BLUE}[4/6]${NC} ${GREEN}Скачивание runner версии $RUNNER_VERSION...${NC}"
sudo -u "$RUNNER_USER" bash << EOF
cd "$RUNNER_DIR"
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
    https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
rm -f ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
EOF
echo -e "  ${GREEN}✓${NC} Runner скачан и распакован"

# Шаг 5: Получение токена
echo -e "\n${BLUE}[5/6]${NC} ${GREEN}Получение токена регистрации...${NC}"
echo -e "${YELLOW}  Откройте в браузере:${NC}"
echo -e "  ${BLUE}$REPO_URL/settings/actions/runners${NC}"
echo -e "${YELLOW}  Нажмите 'New self-hosted runner' и скопируйте токен${NC}"
echo -e "${YELLOW}  Токен действителен только 1 час!${NC}\n"
read -sp "Введите токен регистрации: " REGISTRATION_TOKEN
echo ""

if [ -z "$REGISTRATION_TOKEN" ]; then
    echo -e "${RED}❌ Токен не введен${NC}"
    exit 1
fi

# Шаг 6: Конфигурация
echo -e "\n${BLUE}[6/6]${NC} ${GREEN}Конфигурация runner...${NC}"
sudo -u "$RUNNER_USER" bash << EOF
cd "$RUNNER_DIR"
./config.sh --url "$REPO_URL" \
    --token "$REGISTRATION_TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$RUNNER_LABELS" \
    --work _work \
    --replace
EOF

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Runner сконфигурирован"
else
    echo -e "  ${RED}❌ Ошибка конфигурации${NC}"
    exit 1
fi

# Установка как сервиса
echo -e "\n${BLUE}[+]${NC} ${GREEN}Установка как системного сервиса...${NC}"
cd "$RUNNER_DIR"
./svc.sh install
echo -e "  ${GREEN}✓${NC} Сервис установлен"

# Запуск сервиса
echo -e "\n${BLUE}[+]${NC} ${GREEN}Запуск сервиса...${NC}"
./svc.sh start
sleep 2

# Проверка статуса
echo -e "\n${BLUE}[+]${NC} ${GREEN}Проверка статуса...${NC}"
if ./svc.sh status | grep -q "active"; then
    echo -e "  ${GREEN}✓${NC} Runner запущен и работает"
else
    echo -e "  ${YELLOW}⚠${NC} Проверьте статус вручную"
fi

# Итоговая информация
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Runner успешно установлен и запущен!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📊 Информация:${NC}"
echo -e "  Имя: ${YELLOW}$RUNNER_NAME${NC}"
echo -e "  Метки: ${YELLOW}$RUNNER_LABELS${NC}"
echo -e "  Директория: ${YELLOW}$RUNNER_DIR${NC}"
echo -e "  Пользователь: ${YELLOW}$RUNNER_USER${NC}"

echo -e "\n${BLUE}🔧 Полезные команды:${NC}"
echo -e "  ${YELLOW}Статус:${NC}     sudo systemctl status actions.runner.*.service"
echo -e "  ${YELLOW}Логи:${NC}       sudo journalctl -u actions.runner.* -f"
echo -e "  ${YELLOW}Перезапуск:${NC} sudo $RUNNER_DIR/svc.sh restart"
echo -e "  ${YELLOW}Остановка:${NC}  sudo $RUNNER_DIR/svc.sh stop"

echo -e "\n${BLUE}🌐 Проверка в GitHub:${NC}"
echo -e "  ${BLUE}$REPO_URL/settings/actions/runners${NC}\n"

