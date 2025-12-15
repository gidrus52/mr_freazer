# Структура стилей проекта

## Обзор
Все стили проекта организованы в модульную структуру для лучшей поддержки и масштабируемости.

## Структура папок

```
src/assets/style/
├── components/           # Стили компонентов
│   ├── navigation/       # Навигация
│   │   └── navigation.scss
│   ├── production/       # Страница продукции
│   │   ├── production-blocks.scss
│   │   ├── carousel.scss
│   │   └── production-view.scss
│   └── modal/           # Модальные окна
│       └── contact-modal.scss
├── header/              # Заголовок
├── body/                # Основной контент
├── main_style.scss      # Основные стили
└── index.scss           # Главный файл импортов
```

## Файлы стилей

### Navigation (`components/navigation/navigation.scss`)
- `.navigation-container` - контейнер навигации
- `.burger-button` - кнопка-бургер
- `.navigation-menu` - выпадающее меню
- `.navigation-buttons` - контейнер кнопок
- `.navigation-button` - кнопки навигации

### Production Blocks (`components/production/production-blocks.scss`)
- `.production-layout` - основной layout
- `.production-block` - блоки продукции
- `.production-flex` - flex контейнер
- `.production-content` - контент блока
- `.production-text` - текстовый контент
- `.production-title` - заголовки
- `.production-description` - описания
- `.contact-button` - кнопки контактов

### Carousel (`components/production/carousel.scss`)
- `.carousel-container` - контейнер карусели
- `.carousel-arrow` - стрелки навигации
- `.carousel-image` - изображения
- `.carousel-indicators` - индикаторы

### Contact Modal (`components/modal/contact-modal.scss`)
- `.modal-overlay` - оверлей модального окна
- `.modal-content` - содержимое модального окна
- `.modal-header` - заголовок модального окна
- `.modal-form` - форма
- `.form-group` - группа полей
- `.form-input` - поля ввода
- `.modal-buttons` - кнопки модального окна

## Использование

### Импорт стилей
Все стили автоматически импортируются через `index.scss`:

```scss
@import "./components/production/production-view";
```

### Применение классов
В компонентах используйте CSS классы вместо inline стилей:

```tsx
// ❌ Плохо - inline стили
<div style={{backgroundColor: '#000', color: '#fff'}}>

// ✅ Хорошо - CSS классы
<div class="production-block">
```

## Преимущества

1. **Модульность** - каждый компонент имеет свои стили
2. **Переиспользование** - классы можно использовать в разных местах
3. **Поддержка** - легче изменять и отлаживать стили
4. **Производительность** - CSS классы работают быстрее inline стилей
5. **Адаптивность** - легче создавать responsive дизайн

## Адаптивность

Все стили включают медиа-запросы для:
- Планшетов (768px)
- Мобильных устройств (480px)

## Анимации

Используются CSS анимации для:
- Появления модальных окон
- Переходов между блоками
- Hover эффектов
- Загрузки контента
