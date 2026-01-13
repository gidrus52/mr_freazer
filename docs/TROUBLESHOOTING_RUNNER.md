# Устранение проблем с GitHub Actions Runner

## Ошибка 404 при регистрации

### Симптомы
```
Http response code: NotFound from 'POST https://api.github.com/actions/runner-registration'
Response status code does not indicate success: 404 (Not Found)
```

### Пошаговое решение

#### Шаг 1: Получите новый токен регистрации

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Actions** → **Runners**
3. Нажмите **New self-hosted runner** (или **Add runner**)
4. Выберите вашу операционную систему
5. **Скопируйте токен** - он будет показан в поле, например:
   ```
   A1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456
   ```
6. **ВАЖНО:** Токен действителен только 1 час! Используйте его сразу.

#### Шаг 2: Проверьте URL репозитория

```bash
# ❌ НЕПРАВИЛЬНО (с .git):
https://github.com/username/repo.git

# ✅ ПРАВИЛЬНО (без .git):
https://github.com/username/repo
```

#### Шаг 3: Выполните регистрацию

```bash
# Linux/macOS
cd actions-runner
./config.sh --url https://github.com/USERNAME/REPO --token YOUR_TOKEN

# Windows
cd actions-runner
.\config.cmd --url https://github.com/USERNAME/REPO --token YOUR_TOKEN
```

**Пример для репозитория mr_freazer:**
```bash
./config.sh --url https://github.com/gidrus52/mr_freazer --token A1234567890...
```

#### Шаг 4: Проверьте результат

Если регистрация успешна, вы увидите:
```
√ Connected to GitHub

√ Runner has been added

√ Runner connection is good

√ Successfully replaced the runner config
```

### Частые ошибки

#### Ошибка: "Invalid token"
- Токен истек (действителен 1 час)
- Токен скопирован не полностью
- **Решение:** Получите новый токен

#### Ошибка: "Repository not found"
- Неправильный URL репозитория
- Нет доступа к репозиторию
- **Решение:** Проверьте URL и права доступа

#### Ошибка: "Network error"
- Проблемы с интернет-соединением
- Блокировка GitHub API
- **Решение:** Проверьте сеть и firewall

### Альтернативный метод: Регистрация через API

Если стандартный метод не работает, можно использовать GitHub API:

```bash
# 1. Создайте Personal Access Token с правами repo и admin:repo_hook
# Settings → Developer settings → Personal access tokens → Tokens (classic)

# 2. Получите токен регистрации через API
REPO="USERNAME/REPO"
GITHUB_TOKEN="your_personal_access_token"

REGISTRATION_TOKEN=$(curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$REPO/actions/runners/registration-token \
  | jq -r .token)

# 3. Используйте токен для регистрации
./config.sh --url https://github.com/$REPO --token $REGISTRATION_TOKEN
```

### Проверка подключения

После успешной регистрации:

```bash
# Проверьте статус runner'а
./run.sh  # Запустите вручную для проверки

# Или если установлен как сервис:
sudo ./svc.sh status  # Linux
Get-Service | Where-Object { $_.Name -like "*GitHub Actions*" }  # Windows
```

### Получение помощи

Если проблема не решена:

1. Проверьте логи:
   ```bash
   cat ~/actions-runner/_diag/Runner_*.log
   ```

2. Проверьте официальную документацию:
   - https://docs.github.com/en/actions/hosting-your-own-runners

3. Создайте issue в репозитории:
   - https://github.com/actions/runner/issues

