#!/bin/bash
# Скрипт для диагностики проблем с SSL сертификатами

echo "🔍 Диагностика SSL сертификатов..."
echo ""

# Проверка 1: Существуют ли файлы на хосте
echo "1️⃣ Проверка файлов на хосте:"
if [ -f "/etc/nginx/ssl/certificate.crt" ] && [ -f "/etc/nginx/ssl/private.key" ]; then
    echo "   ✅ Файлы найдены в /etc/nginx/ssl/"
    ls -lh /etc/nginx/ssl/
else
    echo "   ❌ Файлы НЕ найдены в /etc/nginx/ssl/"
    echo "   Ищем в других местах..."
    find /etc -name "certificate.crt" -o -name "*.crt" 2>/dev/null | head -5
    find /etc -name "private.key" -o -name "*.key" 2>/dev/null | head -5
fi

echo ""

# Проверка 2: Файлы в проекте
echo "2️⃣ Проверка файлов в проекте (ssl/):"
if [ -f "./ssl/certificate.crt" ] && [ -f "./ssl/private.key" ]; then
    echo "   ✅ Файлы найдены в ./ssl/"
    ls -lh ./ssl/
else
    echo "   ❌ Файлы НЕ найдены в ./ssl/"
    echo "   Создайте папку ssl/ и скопируйте туда сертификаты"
fi

echo ""

# Проверка 3: Файлы внутри контейнера
echo "3️⃣ Проверка файлов внутри nginx контейнера:"
if docker-compose ps nginx | grep -q "Up"; then
    echo "   Контейнер запущен, проверяем файлы..."
    docker-compose exec nginx ls -lh /etc/nginx/ssl/ 2>/dev/null || echo "   ❌ Не удалось проверить файлы в контейнере"
    
    echo ""
    echo "   Проверка существования файлов:"
    docker-compose exec nginx test -f /etc/nginx/ssl/certificate.crt && echo "   ✅ certificate.crt существует" || echo "   ❌ certificate.crt НЕ существует"
    docker-compose exec nginx test -f /etc/nginx/ssl/private.key && echo "   ✅ private.key существует" || echo "   ❌ private.key НЕ существует"
else
    echo "   ⚠️  Контейнер nginx не запущен"
fi

echo ""

# Проверка 4: Права доступа
echo "4️⃣ Проверка прав доступа:"
if [ -f "./ssl/private.key" ]; then
    PERMS=$(stat -c "%a" ./ssl/private.key 2>/dev/null || stat -f "%A" ./ssl/private.key 2>/dev/null)
    echo "   Права на private.key: $PERMS"
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
        echo "   ⚠️  Рекомендуется установить права 600: chmod 600 ./ssl/private.key"
    fi
fi

echo ""

# Проверка 5: Формат и валидность сертификата
echo "5️⃣ Проверка формата сертификата:"
if [ -f "./ssl/certificate.crt" ]; then
    if openssl x509 -in ./ssl/certificate.crt -text -noout >/dev/null 2>&1; then
        echo "   ✅ Сертификат валиден"
        echo "   Информация о сертификате:"
        openssl x509 -in ./ssl/certificate.crt -noout -subject -issuer -dates 2>/dev/null | sed 's/^/      /'
    else
        echo "   ❌ Сертификат невалиден или поврежден"
    fi
fi

echo ""

# Проверка 6: Формат приватного ключа
echo "6️⃣ Проверка формата приватного ключа:"
if [ -f "./ssl/private.key" ]; then
    if openssl rsa -in ./ssl/private.key -check -noout >/dev/null 2>&1; then
        echo "   ✅ Приватный ключ валиден"
    else
        echo "   ❌ Приватный ключ невалиден или поврежден"
    fi
fi

echo ""

# Проверка 7: Соответствие ключа и сертификата
echo "7️⃣ Проверка соответствия ключа и сертификата:"
if [ -f "./ssl/certificate.crt" ] && [ -f "./ssl/private.key" ]; then
    CERT_MOD=$(openssl x509 -noout -modulus -in ./ssl/certificate.crt 2>/dev/null | openssl md5 2>/dev/null)
    KEY_MOD=$(openssl rsa -noout -modulus -in ./ssl/private.key 2>/dev/null | openssl md5 2>/dev/null)
    
    if [ "$CERT_MOD" = "$KEY_MOD" ] && [ -n "$CERT_MOD" ]; then
        echo "   ✅ Ключ соответствует сертификату"
    else
        echo "   ❌ Ключ НЕ соответствует сертификату!"
        echo "   Это означает, что сертификат и ключ не совпадают"
    fi
fi

echo ""

# Проверка 8: Логи nginx
echo "8️⃣ Последние ошибки в логах nginx:"
if docker-compose ps nginx | grep -q "Up"; then
    docker-compose logs nginx 2>&1 | grep -i "ssl\|certificate\|error" | tail -10 | sed 's/^/   /'
    if [ $? -ne 0 ]; then
        echo "   (ошибок не найдено в последних логах)"
    fi
else
    echo "   ⚠️  Контейнер не запущен, логи недоступны"
fi

echo ""

# Проверка 9: Конфигурация docker-compose
echo "9️⃣ Проверка конфигурации docker-compose.yml:"
if grep -q "./ssl:/etc/nginx/ssl" docker-compose.yml; then
    echo "   ✅ Volume монтируется из ./ssl в /etc/nginx/ssl"
else
    echo "   ❌ Volume не настроен правильно в docker-compose.yml"
fi

echo ""

# Рекомендации
echo "📋 Рекомендации:"
echo ""
echo "Если файлы находятся в /etc/nginx/ssl на хосте, но не работают:"
echo ""
echo "1. Скопируйте файлы в папку проекта:"
echo "   sudo cp /etc/nginx/ssl/certificate.crt ./ssl/"
echo "   sudo cp /etc/nginx/ssl/private.key ./ssl/"
echo "   sudo chmod 600 ./ssl/private.key"
echo "   sudo chmod 644 ./ssl/certificate.crt"
echo ""
echo "2. Или измените docker-compose.yml для монтирования из /etc/nginx/ssl:"
echo "   volumes:"
echo "     - /etc/nginx/ssl:/etc/nginx/ssl:ro"
echo ""
echo "3. Перезапустите nginx:"
echo "   docker-compose restart nginx"
echo ""
echo "4. Проверьте логи:"
echo "   docker-compose logs nginx"

