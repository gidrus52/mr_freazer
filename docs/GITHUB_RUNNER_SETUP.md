# Установка GitHub Actions Self-Hosted Runner

Это руководство поможет вам установить и настроить GitHub Actions runner на вашем сервере.

## Преимущества Self-Hosted Runner

- Полный контроль над окружением
- Нет ограничений по времени выполнения
- Бесплатно (в отличие от GitHub-hosted runners для приватных репозиториев)
- Доступ к локальным ресурсам и сервисам
- Возможность использования Docker и других инструментов

## Требования

- Сервер с Linux, Windows или macOS
- Минимум 2 CPU и 7 GB RAM (рекомендуется)
- Доступ к интернету для связи с GitHub
- Права администратора на сервере

## Установка на Linux

### 1. Создание токена и скачивание runner

**ВАЖНО:** Токен регистрации действителен только в течение 1 часа!

1. Перейдите в ваш репозиторий на GitHub
2. Откройте **Settings** → **Actions** → **Runners** (или **Runners and groups**)
3. Нажмите **New self-hosted runner** (или **Add runner**)
4. Выберите операционную систему (Linux)
5. **Скопируйте токен регистрации** - он будет показан в формате:
   ```
   AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
6. **Скопируйте URL репозитория** - он должен быть в формате:
   ```
   https://github.com/USERNAME/REPO_NAME
   ```
   НЕ используйте `.git` в конце URL!

**Если вы видите ошибку 404:**
- Убедитесь, что токен не истек (действителен 1 час)
- Проверьте правильность URL репозитория (без `.git`)
- Убедитесь, что у вас есть права на добавление runners в репозиторий
- Попробуйте получить новый токен

### 2. Выполнение команд на сервере

```bash
# Создайте директорию для runner
mkdir actions-runner && cd actions-runner

# Скачайте последнюю версию runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Распакуйте архив
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Настройте runner (используйте токен из GitHub)
# ВАЖНО: Замените YOUR_USERNAME, YOUR_REPO и YOUR_TOKEN на реальные значения
# Токен должен быть получен СЕЙЧАС (действителен 1 час)
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# Пример правильного URL:
# ./config.sh --url https://github.com/gidrus52/mr_freazer --token A1234567890ABCDEF...

# Если получаете ошибку 404:
# 1. Получите НОВЫЙ токен (старый мог истечь)
# 2. Проверьте URL - должен быть БЕЗ .git в конце
# 3. Убедитесь, что репозиторий существует и у вас есть доступ
```

Во время настройки вам будет предложено:
- **Runner group**: оставьте пустым (Enter)
- **Runner name**: введите имя (например, `production-server`)
- **Labels**: добавьте метки для идентификации (например, `self-hosted`, `linux`, `production`)
- **Work folder**: оставьте по умолчанию или укажите свой путь

### 3. Установка как сервиса (systemd)

```bash
# Установите runner как сервис
sudo ./svc.sh install

# Запустите сервис
sudo ./svc.sh start

# Проверьте статус
sudo ./svc.sh status

# Просмотр логов
sudo journalctl -u actions.runner.* -f
```

### 4. Ручной запуск (для тестирования)

```bash
# Запустите runner вручную
./run.sh
```

## Установка на Windows

### 1. Скачивание и настройка

```powershell
# Создайте директорию
mkdir C:\actions-runner
cd C:\actions-runner

# Скачайте runner (замените версию на актуальную)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-win-x64-2.311.0.zip -OutFile actions-runner-win-x64-2.311.0.zip

# Распакуйте архив
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64-2.311.0.zip", "$PWD")

# Настройте runner
.\config.cmd --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN
```

### 2. Установка как службы Windows

```powershell
# Установите как службу
.\install.cmd

# Запустите службу
net start "GitHub Actions Runner (YOUR_REPO)"
```

## Установка на macOS

```bash
# Создайте директорию
mkdir actions-runner && cd actions-runner

# Скачайте runner
curl -o actions-runner-osx-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-osx-x64-2.311.0.tar.gz

# Распакуйте
tar xzf ./actions-runner-osx-x64-2.311.0.tar.gz

# Настройте
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# Установите как службу
./svc.sh install
./svc.sh start
```

## Использование в пайплайне

После установки runner'а обновите ваш `.github/workflows/ci-cd.yml`:

```yaml
jobs:
  backend-test:
    name: Backend Tests
    runs-on: self-hosted  # Используйте self-hosted вместо ubuntu-latest
    # или с метками:
    # runs-on: [self-hosted, linux, production]
```

### Пример с несколькими runner'ами

```yaml
jobs:
  test:
    runs-on: self-hosted  # Любой self-hosted runner
    
  deploy-staging:
    runs-on: [self-hosted, staging]  # Только runner с меткой staging
    
  deploy-production:
    runs-on: [self-hosted, production]  # Только runner с меткой production
```

## Управление runner'ом

### Linux (systemd)

```bash
# Остановить
sudo ./svc.sh stop

# Запустить
sudo ./svc.sh start

# Перезапустить
sudo ./svc.sh restart

# Удалить сервис
sudo ./svc.sh uninstall

# Удалить runner из GitHub
./config.sh remove --token YOUR_TOKEN
```

### Редактирование настроек runner'а

Для изменения имени, меток или других настроек runner'а см. [docs/EDIT_RUNNER.md](docs/EDIT_RUNNER.md)

**Быстрое изменение:**
```bash
# Остановите runner
sudo ./svc.sh stop

# Получите новый токен на GitHub и переконфигурируйте
./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token НОВЫЙ_ТОКЕН \
  --name новое-имя \
  --labels self-hosted,linux,production \
  --replace

# Запустите runner
sudo ./svc.sh start
```

### Windows

```powershell
# Остановить службу
net stop "GitHub Actions Runner (YOUR_REPO)"

# Запустить службу
net start "GitHub Actions Runner (YOUR_REPO)"

# Удалить службу
.\config.cmd remove --token YOUR_TOKEN
```

## Обновление runner'а

```bash
# Linux/macOS
cd actions-runner
./bin/Runner.Listener run --check

# Или вручную скачайте новую версию и замените файлы
```

## Безопасность

### Рекомендации:

1. **Ограньте доступ к runner'у**
   - Используйте отдельного пользователя для runner'а
   - Ограничьте сетевой доступ

2. **Используйте метки для изоляции**
   ```yaml
   runs-on: [self-hosted, production]  # Только production runner
   ```

3. **Ограничьте доступ к секретам**
   - Используйте environment protection rules в GitHub
   - Настройте required reviewers для production

4. **Регулярно обновляйте runner**
   - GitHub автоматически уведомляет о новых версиях

5. **Используйте Docker для изоляции**
   ```yaml
   runs-on: self-hosted
   container:
     image: node:20
   ```

## Устранение проблем

### Ошибка 404 при регистрации runner

**Ошибка:**
```
Http response code: NotFound from 'POST https://api.github.com/actions/runner-registration'
Response status code does not indicate success: 404 (Not Found)
```

**Решения:**

1. **Токен истек (самая частая причина)**
   - Токен регистрации действителен только **1 час**
   - Получите новый токен в GitHub: Settings → Actions → Runners → New self-hosted runner
   - Используйте токен сразу после получения

2. **Неправильный URL репозитория**
   ```bash
   # ❌ НЕПРАВИЛЬНО:
   ./config.sh --url https://github.com/user/repo.git --token TOKEN
   
   # ✅ ПРАВИЛЬНО:
   ./config.sh --url https://github.com/user/repo --token TOKEN
   ```
   Убедитесь, что в URL **нет** `.git` в конце!

3. **Неправильный формат токена**
   - Токен должен начинаться с буквы (обычно `A`)
   - Длина около 40 символов
   - Скопируйте токен полностью, без пробелов

4. **Проблемы с правами доступа**
   - Убедитесь, что у вас есть права на добавление runners в репозиторий
   - Для организации: нужны права администратора или права на управление runners

5. **Проблемы с сетью**
   ```bash
   # Проверьте доступность GitHub API
   curl -I https://api.github.com
   
   # Проверьте DNS
   nslookup api.github.com
   ```

6. **Попробуйте альтернативный метод регистрации**
   ```bash
   # Используйте полный URL с токеном в одной команде
   ./config.sh --url https://github.com/USERNAME/REPO --token $(cat token.txt)
   ```

### Runner не подключается

```bash
# Проверьте логи
sudo journalctl -u actions.runner.* -f  # Linux
# или
cat ~/actions-runner/_diag/Runner_*.log  # Все ОС
```

### Проблемы с правами доступа

```bash
# Убедитесь, что runner имеет нужные права
sudo chown -R runner:runner /path/to/actions-runner
```

### Проблемы с Docker

```bash
# Добавьте пользователя runner в группу docker
sudo usermod -aG docker runner

# Перезапустите runner
sudo ./svc.sh restart
```

## Пример полной настройки для production

```bash
#!/bin/bash
# setup-runner.sh

# Создайте пользователя для runner
sudo useradd -m -s /bin/bash runner

# Создайте директорию
sudo mkdir -p /opt/actions-runner
sudo chown runner:runner /opt/actions-runner

# Переключитесь на пользователя runner
sudo -u runner bash << 'EOF'
cd /opt/actions-runner

# Скачайте и установите runner (используйте актуальную версию)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Настройте (токен нужно будет ввести вручную)
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN --name production-runner --labels production,linux,self-hosted

# Установите как сервис
sudo ./svc.sh install
sudo ./svc.sh start
EOF

echo "Runner установлен и запущен!"
```

## Полезные ссылки

- [Официальная документация GitHub Actions Runner](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Список релизов runner'а](https://github.com/actions/runner/releases)
- [Безопасность self-hosted runners](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#hardening-for-self-hosted-runners)

