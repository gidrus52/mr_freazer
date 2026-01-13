#!/bin/bash
set -e

# Скрипт для удаленной проверки сервера
# Использование: ./scripts/remote-check.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Конфигурация
SSH_HOST="${SSH_HOST:-}"
SSH_USER="${SSH_USER:-}"
APP_DIR="${APP_DIR:-/opt/mr_freazer}"

# Проверка переменных окружения
if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ]; then
    echo -e "${RED}❌ Ошибка: Не указаны SSH_HOST и SSH_USER${NC}"
    echo ""
    echo "Использование:"
    echo "  export SSH_HOST=your-server-ip"
    echo "  export SSH_USER=your-username"
    echo "  ./scripts/remote-check.sh"
    echo ""
    echo "Или:"
    echo "  SSH_HOST=your-server-ip SSH_USER=your-username ./scripts/remote-check.sh"
    exit 1
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}      Удаленная проверка сервера $SSH_USER@$SSH_HOST${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Проверка SSH подключения
echo -e "${BLUE}🔌 Проверка SSH подключения...${NC}"
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "echo 'SSH connection OK'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH подключение успешно${NC}"
else
    echo -e "${RED}❌ Не удалось подключиться к серверу${NC}"
    echo "   Проверьте:"
    echo "   - Правильность IP адреса и пользователя"
    echo "   - Доступность сервера (ping $SSH_HOST)"
    echo "   - Настройки SSH ключей"
    exit 1
fi

echo ""

# Загрузка и выполнение скрипта проверки на сервере
echo -e "${BLUE}📤 Загрузка скрипта проверки на сервер...${NC}"

# Создание временного скрипта
TEMP_SCRIPT=$(mktemp)
cat > "$TEMP_SCRIPT" << 'EOFSCRIPT'
#!/bin/bash
set -e

APP_DIR="${1:-/opt/mr_freazer}"

echo "═══════════════════════════════════════════════════════════"
echo "           Проверка состояния сервера и приложения"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. Системная информация
echo "1. Системная информация"
echo "─────────────────────────────────────────"
echo "ОС: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2 2>/dev/null || uname -a)"
echo "Uptime: $(uptime -p 2>/dev/null || uptime)"
echo ""

# 2. Docker
echo "2. Docker"
echo "─────────────────────────────────────────"
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
    echo "   Контейнеров: $(docker ps -q | wc -l) запущено, $(docker ps -a -q | wc -l) всего"
else
    echo "❌ Docker не установлен"
fi
echo ""

# 3. Приложение
echo "3. Приложение"
echo "─────────────────────────────────────────"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    echo "✅ Директория: $APP_DIR"
    
    if [ -f "docker-compose.yml" ]; then
        echo "✅ docker-compose.yml найден"
        echo ""
        echo "Статус контейнеров:"
        docker-compose ps 2>/dev/null || echo "⚠️  Не удалось получить статус"
    else
        echo "❌ docker-compose.yml не найден"
    fi
    
    if [ -f ".env" ]; then
        echo "✅ .env файл найден"
    else
        echo "⚠️  .env файл не найден"
    fi
else
    echo "❌ Директория не найдена: $APP_DIR"
fi
echo ""

# 4. Ресурсы
echo "4. Использование ресурсов"
echo "─────────────────────────────────────────"
echo "Диск:"
df -h / | tail -1
echo ""
echo "Память:"
free -h | grep Mem
echo ""

# 5. Порты
echo "5. Порты"
echo "─────────────────────────────────────────"
if command -v ss &> /dev/null; then
    ss -tuln | grep -E ':(80|443|5432|3001|5050)' || echo "Нет активных подключений на проверяемых портах"
else
    netstat -tuln 2>/dev/null | grep -E ':(80|443|5432|3001|5050)' || echo "Нет активных подключений на проверяемых портах"
fi
echo ""

# 6. Проверка работы приложения
echo "6. Проверка работы приложения"
echo "─────────────────────────────────────────"
if [ -f "$APP_DIR/docker-compose.yml" ]; then
    cd "$APP_DIR"
    
    # Backend
    if docker-compose ps 2>/dev/null | grep -q "backend.*Up"; then
        API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api 2>/dev/null || echo "000")
        if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "404" ]; then
            echo "✅ Backend API: работает (HTTP $API_CODE)"
        else
            echo "❌ Backend API: не отвечает (HTTP $API_CODE)"
        fi
    else
        echo "⚠️  Backend: контейнер не запущен"
    fi
    
    # Nginx
    if docker-compose ps 2>/dev/null | grep -q "nginx.*Up"; then
        NGINX_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
        if [ "$NGINX_CODE" = "200" ] || [ "$NGINX_CODE" = "301" ] || [ "$NGINX_CODE" = "302" ]; then
            echo "✅ Nginx: работает (HTTP $NGINX_CODE)"
        else
            echo "⚠️  Nginx: вернул код $NGINX_CODE"
        fi
    else
        echo "⚠️  Nginx: контейнер не запущен"
    fi
    
    # PostgreSQL
    if docker-compose ps 2>/dev/null | grep -q "postgres.*Up"; then
        if docker-compose exec -T postgres pg_isready -U postgres 2>/dev/null | grep -q "accepting connections"; then
            echo "✅ PostgreSQL: доступен"
        else
            echo "❌ PostgreSQL: недоступен"
        fi
    else
        echo "⚠️  PostgreSQL: контейнер не запущен"
    fi
fi
echo ""

# 7. Последние логи
echo "7. Последние логи (последние 5 строк каждого сервиса)"
echo "─────────────────────────────────────────"
if [ -f "$APP_DIR/docker-compose.yml" ]; then
    cd "$APP_DIR"
    for service in backend postgres nginx; do
        if docker-compose ps 2>/dev/null | grep -q "$service.*Up"; then
            echo "📋 $service:"
            docker-compose logs --tail=5 $service 2>/dev/null | sed 's/^/   /' || echo "   Нет логов"
            echo ""
        fi
    done
fi

echo "═══════════════════════════════════════════════════════════"
EOFSCRIPT

# Копирование скрипта на сервер и выполнение
scp -o StrictHostKeyChecking=no "$TEMP_SCRIPT" $SSH_USER@$SSH_HOST:/tmp/check-server.sh 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Не удалось скопировать скрипт, выполнение через SSH...${NC}"
    ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "bash -s" < "$TEMP_SCRIPT" "$APP_DIR"
    rm -f "$TEMP_SCRIPT"
    exit 0
}

# Выполнение скрипта на сервере
ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "chmod +x /tmp/check-server.sh && /tmp/check-server.sh $APP_DIR && rm -f /tmp/check-server.sh"

# Удаление временного файла
rm -f "$TEMP_SCRIPT"

echo ""
echo -e "${GREEN}✅ Проверка завершена${NC}"
echo ""

