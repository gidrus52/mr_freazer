# Запуск Docker на локальной машине (Windows)

## ⚠️ Важно

Docker не установлен на вашей Windows машине. Для запуска проекта в Docker нужно:

## Вариант 1: Установить Docker Desktop для Windows

### Шаги установки:

1. **Скачайте Docker Desktop:**
   - Перейдите на https://www.docker.com/products/docker-desktop
   - Скачайте Docker Desktop для Windows

2. **Установите Docker Desktop:**
   - Запустите установщик
   - Следуйте инструкциям установщика
   - Перезагрузите компьютер при необходимости

3. **Запустите Docker Desktop:**
   - После установки запустите Docker Desktop из меню Пуск
   - Дождитесь, пока Docker запустится (иконка в трее станет зеленой)

4. **Проверьте установку:**
   ```powershell
   docker --version
   docker-compose --version
   ```

5. **Запустите проект:**
   ```powershell
   docker-compose up -d
   ```

## Вариант 2: Запуск на сервере (рекомендуется для production)

Если у вас есть Linux сервер, запустите там:

```bash
# На сервере
cd /opt/mr_freazer
docker-compose up -d
```

Подробная инструкция: `DOCKER_START.md`

## Требования для Docker Desktop

- Windows 10 64-bit: Pro, Enterprise, or Education (Build 15063 or later)
- Windows 11 64-bit: Home or Pro version 21H2 or higher
- WSL 2 feature enabled
- Virtualization enabled in BIOS

## После установки Docker Desktop

1. Откройте терминал в директории проекта
2. Запустите:
   ```powershell
   docker-compose up -d
   ```
3. Проверьте статус:
   ```powershell
   docker-compose ps
   ```

## Проблемы?

Если Docker Desktop не запускается:
- Убедитесь, что включена виртуализация в BIOS
- Убедитесь, что WSL 2 установлен и включен
- Проверьте системные требования

