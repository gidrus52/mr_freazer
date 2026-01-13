# CI/CD Pipeline Documentation

Этот проект использует автоматизированные пайплайны для тестирования, сборки и развертывания приложения.

## Доступные пайплайны

Проект поддерживает три системы CI/CD:
- **GitHub Actions** (`.github/workflows/ci-cd.yml`)
- **GitLab CI** (`.gitlab-ci.yml`)
- **Jenkins** (`Jenkinsfile`)

### GitHub Actions

Пайплайн находится в `.github/workflows/ci-cd.yml` и включает:

1. **Тестирование Backend** (`backend-test`)
   - Установка зависимостей
   - Генерация Prisma Client
   - Запуск миграций БД
   - Линтинг кода
   - Запуск тестов

2. **Тестирование Frontend** (`frontend-test`)
   - Установка зависимостей
   - Проверка типов TypeScript
   - Сборка проекта

3. **Сборка Docker образов** (`build-images`)
   - Сборка образов для backend и frontend
   - Публикация в GitHub Container Registry
   - Кэширование слоев Docker

4. **Деплой** (`deploy`)
   - Автоматический деплой на production при пуше в `main`
   - Требует настройки секретов и инфраструктуры

### GitLab CI

Пайплайн находится в `.gitlab-ci.yml` и включает:

1. **Тестирование** (`test` stage)
   - `backend:test` - тесты backend с PostgreSQL
   - `frontend:test` - проверка frontend

2. **Сборка** (`build` stage)
   - `backend:build` - сборка Docker образа backend
   - `frontend:build` - сборка Docker образа frontend
   - Публикация в GitLab Container Registry

3. **Деплой** (`deploy` stage)
   - `deploy:production` - деплой на production (только main, manual)
   - `deploy:staging` - деплой на staging (только develop, manual)

### Jenkins

Пайплайн находится в `Jenkinsfile` и включает:

1. **Тестирование** (`test` stages)
   - `Backend Tests` - тесты backend с линтингом
   - `Frontend Tests` - проверка frontend

2. **Сборка** (`build` stages)
   - `Build Backend Image` - сборка Docker образа backend
   - `Build Frontend Image` - сборка Docker образа frontend
   - Публикация в Docker Registry

3. **Деплой** (`deploy` stages)
   - `Deploy to Staging` - автоматический деплой на staging (develop)
   - `Deploy to Production` - деплой на production с подтверждением (main)

## Настройка

### GitHub Actions

1. **Секреты не требуются** для базовой работы (используется `GITHUB_TOKEN`)
2. Для деплоя настройте секреты:
   - `SSH_HOST` - адрес сервера - https://github.com/
   - `SSH_USER` - пользователь SSH - gidrus52
   - `SSH_KEY` - приватный ключ SSH ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCXIPn25CJ656SJrCnt04TQb6+ACu3cGeZ9rCApWyoES3qYBiwQA3xaRAZk9F4BWgeqnI8Wq5Ay8bNCuqueiWDSeUYNjFh8DHJNcL6lEoHjvmrjnTvT77P7cs3U8lh2lbsm1GNkKKpNp8xmX55zIcgkjtngzKOa2BVlVuemfZlPD9fvGxfRsT6bP1orpJP9Ov4lcQubC6nRYX3Er8uuqwfnsysLsvGIy+Tiz2HRZzmWHuC4XJcrBoZj0SPYpnNc0zg6iuGYhaLYAATsZSJbgL1C6CWhTZO+UnV0VIFxDcsXmN+U7tSerbBMYwYEDssklnPc8S3WE1Bke72UmBOdhI4YHz3oBZJeRkHDzCsQ/iIfr/oM8Y1hD13nopsf/jrlfXhF4jld4FUwIzcHNlKmGQKPG5DoNoubO0YBJcxD3Jszy8gmKscd4H7PEK4GXOHN6OjpMp69WB2c6y1UEYmREl56YGLd3X/rLZwtqsoJ9umuqBDECoaLdYQc2+gewgrXZlU= forsalenn@gmail.com

### GitLab CI

Настройте следующие переменные в GitLab CI/CD Settings:

**Для деплоя:**
- `SSH_HOST` - адрес production сервера
- `SSH_USER` - пользователь SSH для production
- `SSH_PRIVATE_KEY` - приватный ключ SSH для production
- `SSH_STAGING_HOST` - адрес staging сервера
- `SSH_STAGING_USER` - пользователь SSH для staging

**Для работы с Container Registry:**
- Регистрация происходит автоматически через `CI_REGISTRY_USER` и `CI_REGISTRY_PASSWORD`

### Jenkins

1. **Настройка Jenkins:**
   - Установите плагины: Docker Pipeline, SSH Agent, Cobertura
   - Настройте Docker registry credentials
   - Настройте SSH credentials для staging и production

2. **Переменные окружения:**
   - `DOCKER_REGISTRY` - адрес Docker registry
   - Настройте credentials в Jenkins:
     - `staging-ssh-credentials` - SSH ключ для staging
     - `production-ssh-credentials` - SSH ключ для production

3. **Создайте Pipeline Job:**
   - Выберите "Pipeline script from SCM"
   - Укажите репозиторий и ветку
   - Укажите путь к Jenkinsfile

## Использование

### GitHub Actions

Пайплайн запускается автоматически при:
- Push в ветки `main` или `develop`
- Создании Pull Request в `main` или `develop`

Для ручного запуска используйте GitHub Actions UI.

### GitLab CI

Пайплайн запускается автоматически при:
- Push в ветки `main` или `develop`
- Создании Merge Request

Деплой требует ручного подтверждения (manual job).

### Jenkins

Пайплайн запускается:
- Автоматически при push в `main` или `develop`
- Вручную через Jenkins UI
- По расписанию (если настроено)

Деплой на production требует ручного подтверждения через input step.

## Структура пайплайна

```
┌─────────────┐
│   Push/PR   │
└──────┬──────┘
       │
       ├──► Backend Tests ──┐
       │                     │
       └──► Frontend Tests ──┤
                            │
                            ▼
                    ┌──────────────┐
                    │ Build Images │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Deploy    │
                    └──────────────┘
```

## Кастомизация

### Изменение триггеров

Отредактируйте секцию `on:` в `.github/workflows/ci-cd.yml` или `only:` в `.gitlab-ci.yml`.

### Добавление окружений

В GitHub Actions добавьте новые environment в секцию `deploy`. В GitLab CI добавьте новые job'ы в stage `deploy`.

### Изменение команд деплоя

Отредактируйте секцию `script:` в job'е `deploy` или соответствующих job'ах в GitLab CI.

## Self-Hosted Runner для GitHub Actions

Если вы хотите использовать свой собственный сервер для выполнения пайплайнов:

### Документация

- **[docs/SERVER_SETUP_RUNNER.md](docs/SERVER_SETUP_RUNNER.md)** - Полная инструкция по установке на сервере
- **[docs/GITHUB_RUNNER_SETUP.md](docs/GITHUB_RUNNER_SETUP.md)** - Общее руководство по runner'ам
- **[docs/EDIT_RUNNER.md](docs/EDIT_RUNNER.md)** - Редактирование настроек runner'а

### Быстрая установка

**На Linux сервере:**
```bash
# Используйте готовый скрипт
sudo bash scripts/setup-runner-server.sh

# Или с параметрами
sudo bash scripts/setup-runner-server.sh \
  https://github.com/gidrus52/mr_freazer \
  production-server \
  self-hosted,linux,production
```

**На Windows:**
```powershell
.\scripts\install-github-runner.ps1 -RepoUrl "https://github.com/username/repo" -Token "YOUR_TOKEN" -RunnerName "production-server"
```

## Мониторинг

- **GitHub Actions**: Проверяйте статус в разделе "Actions" репозитория
- **GitLab CI**: Проверяйте статус в разделе "CI/CD > Pipelines"

## Troubleshooting

### Проблемы с тестами

- Убедитесь, что все зависимости установлены
- Проверьте переменные окружения для тестов
- Убедитесь, что база данных доступна

### Проблемы со сборкой Docker

- Проверьте наличие Dockerfile в `backend/` и `frontend/`
- Убедитесь, что контекст сборки правильный
- Проверьте права доступа к Container Registry

### Проблемы с деплоем

- Проверьте SSH подключение к серверу
- Убедитесь, что Docker и docker-compose установлены на сервере
- Проверьте права доступа к директории приложения на сервере

