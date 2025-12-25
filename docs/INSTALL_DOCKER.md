# Установка Docker и Docker Compose

## Предварительные требования

- Сервер с Linux (Ubuntu/Debian/CentOS)
- Права root или sudo
- Минимум 2 GB RAM
- Доступ к интернету

---

## Ubuntu / Debian

### 1. Обновление системы

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Установка необходимых пакетов

```bash
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 3. Добавление официального GPG ключа Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

### 4. Настройка репозитория

**Для Ubuntu:**

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

**Для Debian:**

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 5. Установка Docker Engine

```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 6. Проверка установки

```bash
sudo docker --version
sudo docker compose version
```

### 7. Запуск Docker при загрузке системы

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

### 8. Добавление пользователя в группу docker (опционально)

Чтобы запускать Docker без sudo:

```bash
sudo usermod -aG docker $USER
```

**Важно:** После этого нужно выйти и войти заново, чтобы изменения вступили в силу.

---

## CentOS / RHEL

### 1. Удаление старых версий (если есть)

```bash
sudo yum remove -y docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine
```

### 2. Установка необходимых пакетов

```bash
sudo yum install -y yum-utils
```

### 3. Добавление репозитория Docker

```bash
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
```

### 4. Установка Docker Engine

```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 5. Запуск Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

### 6. Проверка установки

```bash
sudo docker --version
sudo docker compose version
```

---

## Установка через скрипт (быстрый способ)

Docker предоставляет официальный скрипт для автоматической установки:

```bash
# Скачивание и выполнение скрипта установки
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Проверка установки
docker --version
docker compose version
```

**⚠️ Внимание:** Используйте официальный скрипт только если доверяете источнику.

---

## Установка Docker Compose (отдельно, если нужно)

Если Docker Compose не установился вместе с Docker:

### Способ 1: Через pip (Python)

```bash
sudo apt-get install -y python3-pip
sudo pip3 install docker-compose
```

### Способ 2: Скачивание бинарника

```bash
# Определение последней версии
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)

# Скачивание
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Установка прав на выполнение
sudo chmod +x /usr/local/bin/docker-compose

# Проверка
docker-compose --version
```

---

## Проверка установки

После установки выполните:

```bash
# Проверка версии Docker
docker --version
# Должно показать: Docker version 24.x.x или выше

# Проверка версии Docker Compose
docker compose version
# Или
docker-compose --version
# Должно показать: Docker Compose version v2.x.x или выше

# Тестовый запуск контейнера
sudo docker run hello-world
# Должен вывести приветственное сообщение
```

---

## Настройка Docker после установки

### 1. Настройка автозапуска

```bash
sudo systemctl enable docker
sudo systemctl status docker
```

### 2. Настройка логирования (опционально)

Создайте файл `/etc/docker/daemon.json`:

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

Добавьте:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Перезапустите Docker:

```bash
sudo systemctl restart docker
```

### 3. Очистка неиспользуемых ресурсов (опционально)

```bash
# Очистка неиспользуемых контейнеров, сетей, образов
docker system prune -a

# Очистка volumes (ОСТОРОЖНО: удалит данные!)
docker volume prune
```

---

## Устранение проблем

### Проблема: "Cannot connect to the Docker daemon"

```bash
# Проверьте, запущен ли Docker
sudo systemctl status docker

# Запустите Docker
sudo systemctl start docker

# Проверьте права доступа
sudo usermod -aG docker $USER
# Выйдите и войдите заново
```

### Проблема: "Permission denied"

```bash
# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Выйдите и войдите заново в систему
# Или используйте newgrp:
newgrp docker
```

### Проблема: Docker не запускается

```bash
# Проверьте логи
sudo journalctl -u docker

# Перезапустите Docker
sudo systemctl restart docker
```

### Проблема: Недостаточно места на диске

```bash
# Проверьте использование диска
df -h

# Очистите неиспользуемые Docker ресурсы
docker system prune -a --volumes
```

---

## Обновление Docker

### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get upgrade docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### CentOS/RHEL

```bash
sudo yum update docker-ce docker-ce-cli containerd.io
```

---

## Удаление Docker

Если нужно полностью удалить Docker:

### Ubuntu/Debian

```bash
sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

### CentOS/RHEL

```bash
sudo yum remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

---

## Следующие шаги

После установки Docker:

1. ✅ Проверьте установку: `docker --version`
2. ✅ Запустите тестовый контейнер: `docker run hello-world`
3. ✅ Перейдите к установке приложения: см. `DOCKER_START.md`

---

## Полезные ссылки

- [Официальная документация Docker](https://docs.docker.com/)
- [Установка Docker Engine](https://docs.docker.com/engine/install/)
- [Установка Docker Compose](https://docs.docker.com/compose/install/)

---

## Быстрая установка (одной командой)

Для Ubuntu/Debian можно использовать готовый скрипт:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && sudo usermod -aG docker $USER && echo "✅ Docker установлен! Выйдите и войдите заново."
```

После выполнения команды выйдите и войдите в систему заново, чтобы изменения вступили в силу.

