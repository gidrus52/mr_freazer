#!/bin/bash
set -e

# Скрипт для проверки состояния сервера и приложения
# Использование: ./scripts/check-server.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           Проверка состояния сервера и приложения${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Определение директории
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

# ============================================
# 1. Проверка системных требований
# ============================================
echo -e "${BLUE}1. Проверка системных требований${NC}"
echo "─────────────────────────────────────────"

# Проверка Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker установлен: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}❌ Docker не установлен${NC}"
fi

# Проверка Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✅ Docker Compose установлен: $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}❌ Docker Compose не установлен${NC}"
fi

# Проверка Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git установлен: $GIT_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Git не установлен${NC}"
fi

# Проверка свободного места
echo ""
echo "💾 Использование диска:"
df -h / | tail -1 | awk '{print "   Использовано: " $3 " из " $2 " (" $5 ")"}'

# Проверка памяти
echo ""
echo "🧠 Использование памяти:"
free -h | grep Mem | awk '{print "   Использовано: " $3 " из " $2}'

echo ""

# ============================================
# 2. Проверка директории приложения
# ============================================
echo -e "${BLUE}2. Проверка директории приложения${NC}"
echo "─────────────────────────────────────────"

if [ -d "$APP_DIR" ]; then
    echo -e "${GREEN}✅ Директория приложения существует: $APP_DIR${NC}"
    cd "$APP_DIR"
    
    # Проверка git репозитория
    if [ -d ".git" ]; then
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "не git репозиторий")
        LAST_COMMIT=$(git log -1 --format="%h - %s (%ar)" 2>/dev/null || echo "нет коммитов")
        echo -e "${GREEN}✅ Git репозиторий: ветка '$CURRENT_BRANCH'${NC}"
        echo "   Последний коммит: $LAST_COMMIT"
    else
        echo -e "${YELLOW}⚠️  Это не git репозиторий${NC}"
    fi
    
    # Проверка docker-compose.yml
    if [ -f "docker-compose.yml" ]; then
        echo -e "${GREEN}✅ Файл docker-compose.yml найден${NC}"
    else
        echo -e "${RED}❌ Файл docker-compose.yml не найден${NC}"
    fi
    
    # Проверка .env файла
    if [ -f ".env" ]; then
        echo -e "${GREEN}✅ Файл .env найден${NC}"
        # Проверка критических переменных
        if grep -q "POSTGRES_PASSWORD" .env && ! grep -q "POSTGRES_PASSWORD=123456" .env; then
            echo -e "${GREEN}✅ POSTGRES_PASSWORD настроен${NC}"
        else
            echo -e "${YELLOW}⚠️  POSTGRES_PASSWORD использует значение по умолчанию${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Файл .env не найден (будут использованы значения по умолчанию)${NC}"
    fi
else
    echo -e "${RED}❌ Директория приложения не найдена: $APP_DIR${NC}"
    echo "   Создайте директорию и клонируйте репозиторий:"
    echo "   mkdir -p $APP_DIR && cd $APP_DIR"
    echo "   git clone https://github.com/gidrus52/mr_freazer.git ."
fi

echo ""

# ============================================
# 3. Проверка Docker контейнеров
# ============================================
echo -e "${BLUE}3. Проверка Docker контейнеров${NC}"
echo "─────────────────────────────────────────"

if [ -f "$APP_DIR/docker-compose.yml" ]; then
    cd "$APP_DIR"
    
    # Проверка запущенных контейнеров
    echo "📦 Статус контейнеров:"
    docker-compose ps 2>/dev/null || echo -e "${YELLOW}⚠️  Не удалось получить статус контейнеров${NC}"
    
    echo ""
    
    # Проверка каждого сервиса
    SERVICES=("postgres" "backend" "nginx")
    for service in "${SERVICES[@]}"; do
        if docker-compose ps | grep -q "$service"; then
            STATUS=$(docker-compose ps | grep "$service" | awk '{print $4, $5, $6, $7}')
            if echo "$STATUS" | grep -q "Up\|healthy"; then
                echo -e "${GREEN}✅ $service: $STATUS${NC}"
            else
                echo -e "${RED}❌ $service: $STATUS${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  $service: контейнер не найден${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  docker-compose.yml не найден, пропускаем проверку контейнеров${NC}"
fi

echo ""

# ============================================
# 4. Проверка портов
# ============================================
echo -e "${BLUE}4. Проверка портов${NC}"
echo "─────────────────────────────────────────"

PORTS=(80 443 5432 3001 5050)
for port in "${PORTS[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        PROCESS=$(lsof -i :$port 2>/dev/null | tail -1 | awk '{print $1}' || echo "неизвестно")
        echo -e "${GREEN}✅ Порт $port: занят ($PROCESS)${NC}"
    else
        echo -e "${YELLOW}⚠️  Порт $port: свободен${NC}"
    fi
done

echo ""

# ============================================
# 5. Проверка сетевых подключений
# ============================================
echo -e "${BLUE}5. Проверка сетевых подключений${NC}"
echo "─────────────────────────────────────────"

# Внешний IP
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "не удалось определить")
echo "🌐 Внешний IP: $EXTERNAL_IP"

# Локальный IP
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "не удалось определить")
echo "🏠 Локальный IP: $LOCAL_IP"

# Проверка доступности GitHub (для деплоя)
if curl -s --connect-timeout 5 https://github.com > /dev/null; then
    echo -e "${GREEN}✅ Подключение к GitHub: доступно${NC}"
else
    echo -e "${RED}❌ Подключение к GitHub: недоступно${NC}"
fi

echo ""

# ============================================
# 6. Проверка работы приложения
# ============================================
echo -e "${BLUE}6. Проверка работы приложения${NC}"
echo "─────────────────────────────────────────"

if [ -f "$APP_DIR/docker-compose.yml" ]; then
    cd "$APP_DIR"
    
    # Проверка API
    if docker-compose ps | grep -q "backend.*Up"; then
        API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api 2>/dev/null || echo "000")
        if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "404" ]; then
            echo -e "${GREEN}✅ Backend API отвечает (HTTP $API_RESPONSE)${NC}"
        else
            echo -e "${RED}❌ Backend API не отвечает (HTTP $API_RESPONSE)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Backend контейнер не запущен${NC}"
    fi
    
    # Проверка Nginx
    if docker-compose ps | grep -q "nginx.*Up"; then
        NGINX_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
        if [ "$NGINX_RESPONSE" = "200" ] || [ "$NGINX_RESPONSE" = "301" ] || [ "$NGINX_RESPONSE" = "302" ]; then
            echo -e "${GREEN}✅ Nginx отвечает (HTTP $NGINX_RESPONSE)${NC}"
        else
            echo -e "${YELLOW}⚠️  Nginx вернул код $NGINX_RESPONSE${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Nginx контейнер не запущен${NC}"
    fi
    
    # Проверка базы данных
    if docker-compose ps | grep -q "postgres.*Up"; then
        DB_CHECK=$(docker-compose exec -T postgres pg_isready -U postgres 2>/dev/null | grep -q "accepting connections" && echo "OK" || echo "FAIL")
        if [ "$DB_CHECK" = "OK" ]; then
            echo -e "${GREEN}✅ PostgreSQL доступен${NC}"
        else
            echo -e "${RED}❌ PostgreSQL недоступен${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  PostgreSQL контейнер не запущен${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose.yml не найден, пропускаем проверку приложения${NC}"
fi

echo ""

# ============================================
# 7. Проверка логов (последние ошибки)
# ============================================
echo -e "${BLUE}7. Проверка последних логов${NC}"
echo "─────────────────────────────────────────"

if [ -f "$APP_DIR/docker-compose.yml" ]; then
    cd "$APP_DIR"
    
    # Проверка ошибок в логах backend
    BACKEND_ERRORS=$(docker-compose logs --tail=50 backend 2>/dev/null | grep -i "error\|fatal\|exception" | tail -3)
    if [ -n "$BACKEND_ERRORS" ]; then
        echo -e "${RED}❌ Найдены ошибки в логах backend:${NC}"
        echo "$BACKEND_ERRORS" | sed 's/^/   /'
    else
        echo -e "${GREEN}✅ Ошибок в логах backend не найдено${NC}"
    fi
    
    # Проверка ошибок в логах postgres
    POSTGRES_ERRORS=$(docker-compose logs --tail=50 postgres 2>/dev/null | grep -i "error\|fatal" | tail -3)
    if [ -n "$POSTGRES_ERRORS" ]; then
        echo -e "${RED}❌ Найдены ошибки в логах postgres:${NC}"
        echo "$POSTGRES_ERRORS" | sed 's/^/   /'
    else
        echo -e "${GREEN}✅ Ошибок в логах postgres не найдено${NC}"
    fi
fi

echo ""

# ============================================
# 8. Рекомендации
# ============================================
echo -e "${BLUE}8. Рекомендации${NC}"
echo "─────────────────────────────────────────"

RECOMMENDATIONS=()

# Проверка использования диска
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    RECOMMENDATIONS+=("⚠️  Использование диска превышает 80% ($DISK_USAGE%)")
fi

# Проверка использования памяти
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEM_USAGE" -gt 85 ]; then
    RECOMMENDATIONS+=("⚠️  Использование памяти превышает 85% ($MEM_USAGE%)")
fi

# Проверка .env файла
if [ ! -f "$APP_DIR/.env" ]; then
    RECOMMENDATIONS+=("📝 Создайте файл .env с настройками production")
fi

# Проверка контейнеров
if [ -f "$APP_DIR/docker-compose.yml" ]; then
    cd "$APP_DIR"
    if ! docker-compose ps | grep -q "Up"; then
        RECOMMENDATIONS+=("🚀 Запустите приложение: docker-compose up -d")
    fi
fi

if [ ${#RECOMMENDATIONS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Все проверки пройдены успешно!${NC}"
else
    for rec in "${RECOMMENDATIONS[@]}"; do
        echo "   $rec"
    done
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                    Проверка завершена${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Полезные команды
echo -e "${BLUE}Полезные команды:${NC}"
echo "   docker-compose logs -f          # Просмотр всех логов"
echo "   docker-compose ps               # Статус контейнеров"
echo "   docker-compose restart          # Перезапуск всех сервисов"
echo "   docker-compose up -d            # Запуск приложения"
echo "   docker-compose down             # Остановка приложения"
echo ""

