#!/bin/bash
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    echo "  ./scripts/deploy.sh"
    echo ""
    echo "Или:"
    echo "  SSH_HOST=your-server-ip SSH_USER=your-username ./scripts/deploy.sh"
    exit 1
fi

echo -e "${GREEN}🚀 Начало деплоя на сервер $SSH_USER@$SSH_HOST...${NC}"
echo ""

# Выполнение команд на сервере
ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST << ENDSSH
  set -e
  
  echo "📂 Переход в директорию приложения..."
  cd $APP_DIR || {
    echo "❌ Директория $APP_DIR не найдена!"
    exit 1
  }
  
  echo "📥 Получение последних изменений из репозитория..."
  git fetch origin
  git pull origin main || {
    echo "⚠️  Предупреждение: Не удалось выполнить git pull"
  }
  
  echo "🐳 Обновление Docker образов..."
  docker-compose pull || {
    echo "⚠️  Предупреждение: Не удалось выполнить docker-compose pull"
  }
  
  echo "🔨 Пересборка и запуск контейнеров..."
  docker-compose up -d --build
  
  echo "⏳ Ожидание запуска сервисов..."
  sleep 5
  
  echo "🧹 Очистка неиспользуемых Docker ресурсов..."
  docker system prune -f
  
  echo "✅ Проверка статуса контейнеров..."
  docker-compose ps
  
  echo ""
  echo -e "${GREEN}🎉 Деплой успешно завершен!${NC}"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Деплой успешно выполнен!${NC}"
    echo ""
    echo "Проверьте приложение:"
    echo "  http://$SSH_HOST"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Ошибка при выполнении деплоя${NC}"
    exit 1
fi

