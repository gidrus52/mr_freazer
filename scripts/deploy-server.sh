#!/bin/bash
set -e

# Скрипт для запуска на сервере
# Использование: ./deploy-server.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Определение директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 Деплой приложения mr_freazer${NC}"
echo "Директория: $APP_DIR"
echo ""

cd "$APP_DIR"

# Проверка наличия docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Ошибка: docker-compose не установлен${NC}"
    exit 1
fi

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Файл .env не найден. Используются значения по умолчанию.${NC}"
    echo ""
fi

# Получение изменений из репозитория
echo -e "${BLUE}📥 Получение последних изменений из репозитория...${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
    git fetch origin
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "Текущая ветка: $CURRENT_BRANCH"
    git pull origin "$CURRENT_BRANCH" || {
        echo -e "${YELLOW}⚠️  Предупреждение: Не удалось выполнить git pull${NC}"
    }
else
    echo -e "${YELLOW}⚠️  Это не git репозиторий, пропускаем git pull${NC}"
fi

# Обновление Docker образов
echo ""
echo -e "${BLUE}🐳 Обновление Docker образов...${NC}"
docker-compose pull || {
    echo -e "${YELLOW}⚠️  Предупреждение: Не удалось выполнить docker-compose pull${NC}"
}

# Пересборка и запуск
echo ""
echo -e "${BLUE}🔨 Пересборка и запуск контейнеров...${NC}"
docker-compose up -d --build

# Ожидание запуска
echo ""
echo -e "${BLUE}⏳ Ожидание запуска сервисов (10 секунд)...${NC}"
sleep 10

# Проверка статуса
echo ""
echo -e "${BLUE}✅ Проверка статуса контейнеров...${NC}"
docker-compose ps

# Проверка здоровья сервисов
echo ""
echo -e "${BLUE}🏥 Проверка здоровья сервисов...${NC}"
HEALTHY_COUNT=$(docker-compose ps | grep -c "healthy\|Up" || true)
TOTAL_COUNT=$(docker-compose ps | grep -c "backend\|postgres\|nginx" || true)

if [ "$HEALTHY_COUNT" -ge "$TOTAL_COUNT" ]; then
    echo -e "${GREEN}✅ Все сервисы работают${NC}"
else
    echo -e "${YELLOW}⚠️  Некоторые сервисы могут быть не готовы${NC}"
    echo "Проверьте логи: docker-compose logs -f"
fi

# Очистка неиспользуемых ресурсов
echo ""
echo -e "${BLUE}🧹 Очистка неиспользуемых Docker ресурсов...${NC}"
docker system prune -f

# Показ последних логов
echo ""
echo -e "${BLUE}📋 Последние логи backend (последние 20 строк):${NC}"
docker-compose logs --tail=20 backend

echo ""
echo -e "${GREEN}🎉 Деплой завершен!${NC}"
echo ""
echo "Приложение доступно по адресу:"
echo "  http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Полезные команды:"
echo "  docker-compose logs -f          # Просмотр всех логов"
echo "  docker-compose ps               # Статус контейнеров"
echo "  docker-compose restart          # Перезапуск всех сервисов"
echo "  docker-compose down             # Остановка всех сервисов"
echo ""

