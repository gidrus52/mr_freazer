# SSL Сертификаты AlphaSSL

## Размещение сертификатов

Поместите файлы сертификата AlphaSSL в эту директорию:

### Обязательные файлы:

1. **certificate.crt** - основной сертификат (или certificate.pem)
2. **private.key** - приватный ключ

### Опциональные файлы:

3. **ca-bundle.crt** - промежуточные сертификаты (intermediate certificate chain)
   - Если у вас есть файл с цепочкой сертификатов, переименуйте его в `ca-bundle.crt`
   - После этого раскомментируйте строку `ssl_trusted_certificate` в `nginx.conf`

## Формат файлов

- Сертификаты могут быть в формате `.crt`, `.pem` или `.cer`
- Приватный ключ должен быть в формате `.key` или `.pem`
- Убедитесь, что файлы имеют правильные права доступа (600 для ключа)

## Проверка сертификата

После размещения файлов проверьте их:

```bash
# Проверка сертификата
openssl x509 -in certificate.crt -text -noout

# Проверка приватного ключа
openssl rsa -in private.key -check

# Проверка соответствия ключа и сертификата
openssl x509 -noout -modulus -in certificate.crt | openssl md5
openssl rsa -noout -modulus -in private.key | openssl md5
# MD5 хеши должны совпадать
```

## Структура директории

```
ssl/
├── certificate.crt    (или certificate.pem)
├── private.key
└── ca-bundle.crt      (опционально)
```

## Важно

- **НЕ коммитьте** приватный ключ в git репозиторий
- Убедитесь, что файл `.gitignore` содержит `ssl/*.key` и `ssl/*.pem`
- После размещения файлов перезапустите контейнер nginx:
  ```bash
  docker-compose restart nginx
  ```

