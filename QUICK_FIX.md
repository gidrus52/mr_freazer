# Быстрое решение проблемы выполнения скриптов

## Если политика заблокирована групповой политикой

Если вы видите ошибку о том, что политика управляется групповой политикой, используйте один из следующих методов:

### Метод 1: Запуск с параметром -ExecutionPolicy Bypass

Для запуска любого скрипта используйте:
```powershell
powershell -ExecutionPolicy Bypass -File .\backend\test-login.ps1
```

### Метод 2: Использование обертки run-script.ps1

```powershell
.\run-script.ps1 -ScriptPath ".\backend\test-login.ps1"
```

### Метод 3: Установка Bypass для текущей сессии

В PowerShell выполните:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Затем запускайте скрипты как обычно:
```powershell
.\backend\test-login.ps1
```

**Примечание:** Это работает только для текущей сессии PowerShell. После закрытия окна настройка сбросится.

### Метод 4: Создание ярлыка с обходом политики

Создайте ярлык для PowerShell со следующими параметрами:
```
powershell.exe -ExecutionPolicy Bypass -NoExit
```

Это откроет PowerShell с обходом политики выполнения.

## Проверка доступных скриптов

В проекте есть множество тестовых скриптов в папке `backend\`:
- `test-login.ps1`
- `test-auth.ps1`
- `test-orders-api.ps1`
- И многие другие...

## Примеры запуска

```powershell
# Запуск теста логина
powershell -ExecutionPolicy Bypass -File .\backend\test-login.ps1

# Запуск теста API заказов
powershell -ExecutionPolicy Bypass -File .\backend\test-orders-api.ps1

# Запуск регистрации админа
powershell -ExecutionPolicy Bypass -File .\backend\register-admin.ps1
```

