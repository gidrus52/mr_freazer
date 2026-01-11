# Решение проблемы с выполнением PowerShell скриптов в Windows

## Проблема
При попытке запустить PowerShell скрипт (.ps1) появляется ошибка:
```
отключено выполнение сценариев в windows
```
или
```
cannot be loaded because running scripts is disabled on this system
```

## Быстрое решение

### Вариант 1: Для текущего пользователя (рекомендуется)
Откройте PowerShell и выполните:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Вариант 2: Использовать скрипт-помощник
Запустите файл `enable-script-execution.ps1`:
```powershell
.\enable-script-execution.ps1
```

### Вариант 3: Временное решение для одной сессии
Если нужно запустить скрипт только один раз:
```powershell
powershell -ExecutionPolicy Bypass -File .\your-script.ps1
```

## Объяснение политик выполнения

- **Restricted** (по умолчанию) - скрипты не выполняются
- **RemoteSigned** (рекомендуется) - локальные скрипты выполняются, загруженные из интернета требуют подписи
- **Unrestricted** - все скрипты выполняются с предупреждением
- **Bypass** - все скрипты выполняются без предупреждений (менее безопасно)

## Области применения политики

- **CurrentUser** - только для текущего пользователя (не требует прав администратора)
- **LocalMachine** - для всех пользователей (требует прав администратора)
- **Process** - только для текущей сессии PowerShell

## Проверка текущей политики

```powershell
Get-ExecutionPolicy -List
```

## Примеры использования

### Запуск скрипта с обходом политики
```powershell
powershell -ExecutionPolicy Bypass -File .\backend\test-login.ps1
```

### Запуск скрипта в текущей сессии с обходом
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\backend\test-login.ps1
```

## Безопасность

Рекомендуется использовать **RemoteSigned** для **CurrentUser**, так как:
- Локальные скрипты будут работать
- Загруженные из интернета скрипты будут требовать подписи
- Не требуются права администратора
- Не влияет на других пользователей системы

