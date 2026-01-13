# Быстрое решение ошибки 404 при регистрации GitHub Runner

## Проблема
```
Http response code: NotFound from 'POST https://api.github.com/actions/runner-registration'
Response status code does not indicate success: 404 (Not Found)
```

## Решение за 3 шага

### Шаг 1: Получите НОВЫЙ токен (важно!)

1. Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
2. Нажмите **"New self-hosted runner"** (или **"Add runner"**)
3. Выберите вашу ОС (Linux/Windows/macOS)
4. **Скопируйте токен** - он начинается с буквы `A` и длиной ~40 символов
5. **ВАЖНО:** Используйте токен СРАЗУ (действителен только 1 час!)

### Шаг 2: Проверьте URL

Убедитесь, что URL правильный:
```bash
# ✅ ПРАВИЛЬНО:
https://github.com/gidrus52/mr_freazer

# ❌ НЕПРАВИЛЬНО (не используйте .git):
https://github.com/gidrus52/mr_freazer.git
```

### Шаг 3: Выполните регистрацию

**На Linux:**
```bash
cd actions-runner
./config.sh --url https://github.com/gidrus52/mr_freazer --token ВАШ_НОВЫЙ_ТОКЕН
```

**На Windows:**
```powershell
cd actions-runner
.\config.cmd --url https://github.com/gidrus52/mr_freazer --token ВАШ_НОВЫЙ_ТОКЕН
```

## Если не помогло

### Быстрая проверка:

1. **Токен точно новый?** Получите еще раз (старый мог истечь за 1 час)
2. **URL без .git?** Проверьте: `https://github.com/gidrus52/mr_freazer` (БЕЗ .git!)
3. **Actions включены?** Проверьте: https://github.com/gidrus52/mr_freazer/settings/actions
4. **Есть доступ к репозиторию?** Убедитесь, что у вас есть права администратора
5. **Проверьте интернет:** `curl -I https://api.github.com`

### Альтернативный метод через API:

Если стандартный метод не работает, используйте GitHub API:

```bash
# 1. Создайте Personal Access Token на https://github.com/settings/tokens
#    Права: repo (полный доступ)

# 2. Получите токен регистрации через API
GITHUB_TOKEN="ваш_personal_access_token"
REGISTRATION_TOKEN=$(curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/gidrus52/mr_freazer/actions/runners/registration-token \
  | jq -r .token)

# 3. Используйте токен
cd actions-runner
./config.sh --url https://github.com/gidrus52/mr_freazer --token $REGISTRATION_TOKEN
```

## Подробные инструкции

- [FIX_404_STEP_BY_STEP.md](FIX_404_STEP_BY_STEP.md) - Пошаговая диагностика
- [docs/TROUBLESHOOTING_RUNNER.md](docs/TROUBLESHOOTING_RUNNER.md) - Детальное решение

