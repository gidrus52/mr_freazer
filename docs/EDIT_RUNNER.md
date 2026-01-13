# Редактирование GitHub Actions Runner

Это руководство покажет, как изменить настройки уже зарегистрированного runner'а.

## Что можно редактировать

- **Имя runner'а** (name)
- **Метки** (labels) - для фильтрации в пайплайнах
- **Рабочая директория** (work folder)
- **Группа runner'ов** (runner group) - для организаций

## Метод 1: Через веб-интерфейс GitHub

### Изменение имени и меток

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Actions** → **Runners**
3. Найдите нужный runner в списке
4. Нажмите на runner, чтобы открыть его страницу
5. Нажмите кнопку **"Edit"** (или иконку карандаша)
6. Измените:
   - **Name** - имя runner'а
   - **Labels** - метки (через запятую)
7. Нажмите **"Save"**

### Удаление runner через веб-интерфейс

1. Откройте страницу runner'а (см. выше)
2. Нажмите кнопку **"Remove runner"** или **"Delete"**
3. Подтвердите удаление

## Метод 2: Через командную строку (переконфигурация)

### Linux/macOS

#### Шаг 1: Остановите runner

```bash
cd actions-runner

# Если runner запущен как сервис
sudo ./svc.sh stop

# Или если запущен вручную, остановите процесс (Ctrl+C)
```

#### Шаг 2: Получите новый токен регистрации

1. Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
2. Нажмите **"New self-hosted runner"**
3. Скопируйте токен (действителен 1 час)

#### Шаг 3: Переконфигурируйте runner

```bash
# Удалите старую конфигурацию (опционально, но рекомендуется)
./config.sh remove --token СТАРЫЙ_ТОКЕН

# Или просто переконфигурируйте с флагом --replace
./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token НОВЫЙ_ТОКЕН \
  --name новое-имя-runner \
  --labels self-hosted,linux,production \
  --work _work \
  --replace
```

**Параметры:**
- `--url` - URL репозитория
- `--token` - токен регистрации
- `--name` - новое имя runner'а
- `--labels` - метки через запятую
- `--work` - рабочая директория
- `--replace` - заменить существующую конфигурацию

#### Шаг 4: Запустите runner

```bash
# Как сервис
sudo ./svc.sh start

# Или вручную
./run.sh
```

### Windows

#### Шаг 1: Остановите runner

```powershell
cd actions-runner

# Остановите службу
net stop "GitHub Actions Runner (mr_freazer)"
```

#### Шаг 2: Получите новый токен

1. Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
2. Нажмите **"New self-hosted runner"**
3. Скопируйте токен

#### Шаг 3: Переконфигурируйте

```powershell
# Удалите старую конфигурацию
.\config.cmd remove --token СТАРЫЙ_ТОКЕН

# Или переконфигурируйте с заменой
.\config.cmd --url https://github.com/gidrus52/mr_freazer `
  --token НОВЫЙ_ТОКЕН `
  --name новое-имя-runner `
  --labels self-hosted,windows,production `
  --work _work `
  --replace
```

#### Шаг 4: Запустите runner

```powershell
# Запустите службу
net start "GitHub Actions Runner (mr_freazer)"
```

## Метод 3: Изменение только меток через GitHub API

Если нужно изменить только метки, можно использовать API:

```bash
# 1. Создайте Personal Access Token с правами repo
# https://github.com/settings/tokens

# 2. Получите ID runner'а
GITHUB_TOKEN="ваш_personal_access_token"
REPO="gidrus52/mr_freazer"

# Получите список runners и их ID
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$REPO/actions/runners | jq '.runners[] | {id, name}'

# 3. Обновите метки (замените RUNNER_ID на реальный ID)
RUNNER_ID="12345678"
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO/actions/runners/$RUNNER_ID/labels \
  -d '{"labels":["self-hosted","linux","production","custom-label"]}'
```

## Примеры использования

### Изменение имени runner'а

```bash
cd actions-runner
sudo ./svc.sh stop

# Получите новый токен на GitHub
./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token НОВЫЙ_ТОКЕН \
  --name production-server-01 \
  --replace

sudo ./svc.sh start
```

### Добавление новых меток

```bash
cd actions-runner
sudo ./svc.sh stop

./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token НОВЫЙ_ТОКЕН \
  --name production-server-01 \
  --labels self-hosted,linux,production,docker,postgres \
  --replace

sudo ./svc.sh start
```

### Изменение рабочей директории

```bash
cd actions-runner
sudo ./svc.sh stop

./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token НОВЫЙ_ТОКЕН \
  --name production-server-01 \
  --work /opt/github-runner-work \
  --replace

sudo ./svc.sh start
```

## Проверка изменений

После переконфигурации проверьте:

1. **В веб-интерфейсе GitHub:**
   - Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
   - Убедитесь, что имя и метки обновились

2. **Через командную строку:**
   ```bash
   # Проверьте конфигурацию
   cat actions-runner/.runner
   
   # Проверьте статус
   sudo ./svc.sh status
   ```

3. **Через API:**
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/gidrus52/mr_freazer/actions/runners | jq
   ```

## Использование обновленных меток в пайплайне

После изменения меток обновите ваш `.github/workflows/ci-cd.yml`:

```yaml
jobs:
  deploy-production:
    runs-on: [self-hosted, production, docker]  # Используйте новые метки
    steps:
      - uses: actions/checkout@v4
      # ...
```

## Устранение проблем

### Ошибка: "Runner already exists"

Если runner уже существует, используйте флаг `--replace`:

```bash
./config.sh --url https://github.com/gidrus52/mr_freazer \
  --token НОВЫЙ_ТОКЕН \
  --name новое-имя \
  --replace
```

### Ошибка: "Invalid token"

Токен регистрации действителен только 1 час. Получите новый токен.

### Runner не обновляется в веб-интерфейсе

1. Подождите несколько секунд (синхронизация может занять время)
2. Обновите страницу в браузере
3. Проверьте, что runner запущен: `sudo ./svc.sh status`

## Полезные команды

```bash
# Просмотр текущей конфигурации
cat actions-runner/.runner

# Просмотр логов
sudo journalctl -u actions.runner.* -f  # Linux
cat actions-runner/_diag/Runner_*.log   # Все ОС

# Проверка статуса
sudo ./svc.sh status  # Linux
Get-Service | Where-Object { $_.Name -like "*GitHub Actions*" }  # Windows
```

## Важные замечания

1. **Токен регистрации** действителен только 1 час - получайте новый перед каждой переконфигурацией
2. **Останавливайте runner** перед переконфигурацией
3. **Флаг `--replace`** заменяет существующую конфигурацию без удаления runner'а из GitHub
4. **Метки** можно изменять как через командную строку, так и через веб-интерфейс
5. **Имя runner'а** должно быть уникальным в рамках репозитория/организации

