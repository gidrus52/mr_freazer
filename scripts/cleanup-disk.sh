#!/bin/bash
set -e

# Скрипт для очистки места на диске Linux сервера
# Использование: sudo ./scripts/cleanup-disk.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           Очистка места на диске${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Ошибка: Этот скрипт должен быть запущен с правами root${NC}"
    echo "Используйте: sudo ./scripts/cleanup-disk.sh"
    exit 1
fi

# Показываем текущее использование диска
echo -e "${BLUE}📊 Текущее использование диска:${NC}"
df -h / | tail -1
echo ""

# Функция для показа освобожденного места
show_freed_space() {
    echo -e "${GREEN}✅ Освобождено места${NC}"
    df -h / | tail -1
    echo ""
}

# 1. Очистка Docker (если установлен)
if command -v docker &> /dev/null; then
    echo -e "${BLUE}🐳 Очистка Docker...${NC}"
    
    # Остановка всех контейнеров
    docker ps -aq | xargs -r docker stop 2>/dev/null || true
    
    # Удаление остановленных контейнеров
    docker container prune -f
    
    # Удаление неиспользуемых образов
    docker image prune -a -f
    
    # Удаление неиспользуемых volumes
    docker volume prune -f
    
    # Удаление неиспользуемых сетей
    docker network prune -f
    
    # Очистка build cache
    docker builder prune -a -f
    
    # Полная очистка системы Docker
    docker system prune -a --volumes -f
    
    show_freed_space
fi

# 2. Очистка пакетов apt (Debian/Ubuntu)
if command -v apt-get &> /dev/null; then
    echo -e "${BLUE}📦 Очистка кэша пакетов apt...${NC}"
    apt-get clean
    apt-get autoclean
    apt-get autoremove -y
    show_freed_space
fi

# 3. Очистка пакетов yum (CentOS/RHEL)
if command -v yum &> /dev/null; then
    echo -e "${BLUE}📦 Очистка кэша пакетов yum...${NC}"
    yum clean all
    yum autoremove -y
    show_freed_space
fi

# 4. Очистка журналов systemd
echo -e "${BLUE}📋 Очистка старых журналов systemd...${NC}"
journalctl --vacuum-time=7d 2>/dev/null || true
journalctl --vacuum-size=100M 2>/dev/null || true
show_freed_space

# 5. Очистка временных файлов
echo -e "${BLUE}🗑️  Очистка временных файлов...${NC}"
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true
find /tmp -type f -atime +7 -delete 2>/dev/null || true
find /var/tmp -type f -atime +7 -delete 2>/dev/null || true
show_freed_space

# 6. Очистка старых логов
echo -e "${BLUE}📝 Очистка старых логов...${NC}"
find /var/log -type f -name "*.log" -mtime +30 -delete 2>/dev/null || true
find /var/log -type f -name "*.gz" -delete 2>/dev/null || true
find /var/log -type f -name "*.old" -delete 2>/dev/null || true
show_freed_space

# 7. Поиск больших файлов
echo -e "${BLUE}🔍 Поиск больших файлов (>100MB)...${NC}"
echo "Топ-10 самых больших файлов:"
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | head -10 | awk '{print $5, $9}' || true
echo ""

# 8. Поиск больших директорий
echo -e "${BLUE}📁 Топ-10 самых больших директорий:${NC}"
du -h --max-depth=1 / 2>/dev/null | sort -rh | head -11 | tail -10 || true
echo ""

# Итоговое использование диска
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           Итоговое использование диска${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
df -h /
echo ""

# Предупреждение если все еще мало места
AVAILABLE=$(df / | tail -1 | awk '{print $4}')
if [ "$AVAILABLE" = "0" ] || [ -z "$AVAILABLE" ]; then
    echo -e "${RED}⚠️  ВНИМАНИЕ: Все еще недостаточно места!${NC}"
    echo ""
    echo "Рекомендации:"
    echo "1. Удалите неиспользуемые Docker образы вручную"
    echo "2. Проверьте большие файлы: find / -type f -size +500M"
    echo "3. Очистите старые бэкапы"
    echo "4. Рассмотрите возможность расширения диска"
else
    echo -e "${GREEN}✅ Очистка завершена успешно!${NC}"
fi

