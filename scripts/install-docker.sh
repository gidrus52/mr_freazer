#!/bin/bash
set -e

# Скрипт автоматической установки Docker и Docker Compose
# Использование: sudo ./scripts/install-docker.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           Установка Docker и Docker Compose${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Ошибка: Этот скрипт должен быть запущен с правами root${NC}"
    echo "Используйте: sudo ./scripts/install-docker.sh"
    exit 1
fi

# Определение ОС
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo -e "${RED}❌ Не удалось определить операционную систему${NC}"
    exit 1
fi

echo -e "${BLUE}Обнаружена ОС: $OS $VER${NC}"
echo ""

# Проверка, установлен ли уже Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${YELLOW}⚠️  Docker уже установлен: $DOCKER_VERSION${NC}"
    read -p "Продолжить установку/обновление? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Установка для Ubuntu/Debian
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    echo -e "${BLUE}📦 Обновление списка пакетов...${NC}"
    apt-get update -y
    
    echo -e "${BLUE}📦 Установка необходимых пакетов...${NC}"
    apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    echo -e "${BLUE}🔑 Добавление GPG ключа Docker...${NC}"
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo -e "${BLUE}📝 Настройка репозитория Docker...${NC}"
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    echo -e "${BLUE}📦 Установка Docker Engine...${NC}"
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Установка для CentOS/RHEL
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    echo -e "${BLUE}📦 Установка необходимых пакетов...${NC}"
    yum install -y yum-utils
    
    echo -e "${BLUE}📝 Добавление репозитория Docker...${NC}"
    yum-config-manager \
        --add-repo \
        https://download.docker.com/linux/centos/docker-ce.repo
    
    echo -e "${BLUE}📦 Установка Docker Engine...${NC}"
    yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

else
    echo -e "${YELLOW}⚠️  Автоматическая установка для $OS не поддерживается${NC}"
    echo "Используйте официальный скрипт:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    exit 1
fi

# Запуск и включение Docker
echo -e "${BLUE}🚀 Запуск Docker...${NC}"
systemctl enable docker
systemctl start docker

# Проверка установки
echo ""
echo -e "${BLUE}✅ Проверка установки...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker установлен: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}❌ Ошибка установки Docker${NC}"
    exit 1
fi

if docker compose version &> /dev/null || docker-compose --version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version 2>/dev/null || docker-compose --version)
    echo -e "${GREEN}✅ Docker Compose установлен: $COMPOSE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose не найден${NC}"
fi

# Тестовый запуск
echo ""
echo -e "${BLUE}🧪 Тестовый запуск контейнера...${NC}"
if docker run --rm hello-world &> /dev/null; then
    echo -e "${GREEN}✅ Docker работает корректно!${NC}"
else
    echo -e "${YELLOW}⚠️  Не удалось запустить тестовый контейнер${NC}"
fi

# Добавление текущего пользователя в группу docker
if [ -n "$SUDO_USER" ]; then
    echo ""
    echo -e "${BLUE}👤 Добавление пользователя $SUDO_USER в группу docker...${NC}"
    usermod -aG docker $SUDO_USER
    echo -e "${GREEN}✅ Пользователь $SUDO_USER добавлен в группу docker${NC}"
    echo -e "${YELLOW}⚠️  Выйдите и войдите заново, чтобы использовать Docker без sudo${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           Docker успешно установлен!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Следующие шаги:"
echo "  1. Выйдите и войдите заново (если нужно использовать Docker без sudo)"
echo "  2. Проверьте установку: docker --version"
echo "  3. Запустите тестовый контейнер: docker run hello-world"
echo "  4. Перейдите к установке приложения: см. DOCKER_START.md"
echo ""


