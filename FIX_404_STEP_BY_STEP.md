# Пошаговое решение ошибки 404 - Детальная диагностика

## ⚠️ Ошибка
```
Http response code: NotFound from 'POST https://api.github.com/actions/runner-registration'
Response status code does not indicate success: 404 (Not Found)
```

## 🔍 Диагностика (выполните все шаги)

### Шаг 1: Проверьте, что Actions включены

1. Откройте: https://github.com/gidrus52/mr_freazer/settings/actions
2. Убедитесь, что **"Allow all actions and reusable workflows"** включено
3. Если репозиторий приватный, убедитесь, что Actions разрешены

### Шаг 2: Проверьте URL репозитория

**Правильный формат:**
```
https://github.com/gidrus52/mr_freazer
```

**НЕПРАВИЛЬНО:**
- ❌ `https://github.com/gidrus52/mr_freazer.git`
- ❌ `git@github.com:gidrus52/mr_freazer.git`
- ❌ `github.com/gidrus52/mr_freazer` (без https://)

### Шаг 3: Получите токен ПРАВИЛЬНО

**Важно:** Токен действителен **ТОЛЬКО 1 ЧАС**!

1. Откройте: https://github.com/gidrus52/mr_freazer/settings/actions/runners
2. Нажмите **"New self-hosted runner"** (зеленая кнопка)
3. Выберите вашу ОС
4. Вы увидите блок с командами, в нем будет строка:
   ```
   --token AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
5. **Скопируйте ТОЛЬКО токен** (часть после `--token`, без пробелов)
6. Токен должен начинаться с `A` и быть длиной ~40 символов

**Пример правильного токена:**
```
A1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456
```

### Шаг 4: Проверьте токен перед использованием

```bash
# Проверьте длину токена (должно быть ~40 символов)
echo "A1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456" | wc -c
# Должно быть 41 (40 символов + новая строка)

# Убедитесь, что нет пробелов
echo "ВАШ_ТОКЕН" | grep -q " " && echo "ОШИБКА: есть пробелы!" || echo "OK"
```

### Шаг 5: Выполните регистрацию

**На Linux:**
```bash
cd actions-runner

# Убедитесь, что вы в правильной директории
ls -la config.sh

# Выполните регистрацию (замените TOKEN на ваш токен)
./config.sh --url https://github.com/gidrus52/mr_freazer --token TOKEN
```

**На Windows:**
```powershell
cd actions-runner

# Убедитесь, что вы в правильной директории
dir config.cmd

# Выполните регистрацию
.\config.cmd --url https://github.com/gidrus52/mr_freazer --token TOKEN
```

## 🔄 Альтернативный метод: Регистрация через GitHub API

Если стандартный метод не работает, используйте API:

### Метод 1: Через Personal Access Token

1. **Создайте Personal Access Token:**
   - Откройте: https://github.com/settings/tokens
   - Нажмите **"Generate new token"** → **"Generate new token (classic)"**
   - Название: `Runner Registration`
   - Выберите права: `repo` (полный доступ)
   - Нажмите **"Generate token"**
   - **Скопируйте токен** (показывается только один раз!)

2. **Получите токен регистрации через API:**

**На Linux:**
```bash
# Установите jq если нет: sudo apt-get install jq

REPO="gidrus52/mr_freazer"
GITHUB_TOKEN="ваш_personal_access_token"

# Получите токен регистрации
REGISTRATION_TOKEN=$(curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$REPO/actions/runners/registration-token \
  | jq -r .token)

echo "Registration token: $REGISTRATION_TOKEN"

# Используйте токен для регистрации
cd actions-runner
./config.sh --url https://github.com/$REPO --token $REGISTRATION_TOKEN
```

**На Windows (PowerShell):**
```powershell
$REPO = "gidrus52/mr_freazer"
$GITHUB_TOKEN = "ваш_personal_access_token"

# Получите токен регистрации
$response = Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/actions/runners/registration-token" `
    -Method POST `
    -Headers @{
        "Accept" = "application/vnd.github.v3+json"
        "Authorization" = "token $GITHUB_TOKEN"
    }

$REGISTRATION_TOKEN = $response.token
Write-Host "Registration token: $REGISTRATION_TOKEN"

# Используйте токен для регистрации
cd actions-runner
.\config.cmd --url "https://github.com/$REPO" --token $REGISTRATION_TOKEN
```

### Метод 2: Проверка через curl напрямую

```bash
# Проверьте доступность API
curl -I https://api.github.com

# Проверьте доступ к репозиторию (замените TOKEN)
curl -H "Authorization: token YOUR_PERSONAL_TOKEN" \
     https://api.github.com/repos/gidrus52/mr_freazer

# Если получаете 404, значит репозиторий недоступен или неправильное имя
```

## ✅ Проверка успешной регистрации

После регистрации вы должны увидеть:
```
√ Connected to GitHub

√ Runner has been added

√ Runner connection is good

√ Successfully replaced the runner config
```

Затем запустите runner:
```bash
# Linux
./run.sh

# Или как сервис
sudo ./svc.sh install
sudo ./svc.sh start
```

## 🚨 Если все еще не работает

1. **Проверьте логи:**
   ```bash
   cat ~/actions-runner/_diag/Runner_*.log
   ```

2. **Проверьте права доступа к репозиторию:**
   - Убедитесь, что вы администратор репозитория
   - Или имеете права на управление runners

3. **Проверьте, что репозиторий существует:**
   - Откройте: https://github.com/gidrus52/mr_freazer
   - Убедитесь, что репозиторий доступен

4. **Попробуйте другой способ получения токена:**
   - Используйте GitHub CLI: `gh runner create-token`
   - Или через веб-интерфейс: Settings → Actions → Runners → New runner

5. **Проверьте версию runner:**
   ```bash
   cd actions-runner
   ./run.sh --version
   ```
   Убедитесь, что используется последняя версия.

## 📝 Чек-лист перед регистрацией

- [ ] Actions включены в репозитории
- [ ] URL правильный (без .git)
- [ ] Токен получен СЕЙЧАС (не старше 1 часа)
- [ ] Токен скопирован полностью (40 символов)
- [ ] Нет пробелов в токене
- [ ] Есть права администратора на репозиторий
- [ ] Интернет работает (проверено: `curl -I https://api.github.com`)

