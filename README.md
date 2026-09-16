# «Котики: путь свободен!» (Cats: Clear the Path!)

Уютная казуальная 2D-головоломка в формате one-tap puzzle для браузера и Яндекс Игр.

---

## 📖 О проекте

Игровое поле заполнено милыми котиками, смотрящими в разные стороны. Задача игрока — найти правильную последовательность ходов, чтобы каждый котик смог беспрепятственно выбежать за пределы поля.

> **Главный приоритет:** сначала сделать простую, отзывчивую и приятную основную механику. Базовый игровой цикл «нажал → получил понятную реакцию → очистил поле → получил награду → следующий уровень» должен ощущаться великолепно.

---

## 🛠 Технологический стек

- **Язык:** TypeScript
- **Сборка:** Vite
- **Отрисовка поля:** HTML5 Canvas 2D
- **Интерфейс:** Семантический HTML5 + CSS3 (адаптивный mobile-first с центрированием на десктопе)
- **Звук:** WebAudio API (процедурный синтезатор звуков без внешних тяжелых файлов)
- **Платформы:**
  - 🌐 **Web / GitHub Pages** (автономная браузерная версия)
  - 📱 **Telegram Mini App** (нативная интеграция WebApp: BackButton, Haptics, Safe-area)
  - 🎮 **Яндекс Игры** (SDK изолирован в платформенном адаптере с оффлайн fallback на `localStorage`)

---

## 📚 Документация (Documentation First)

Все разделы проекта подробно описаны и поддерживаются в 100% актуальном состоянии:

- [Техническое задание (ТЗ)](docs/TZ.md)
- [Карта проекта (Project Map)](docs/PROJECT_MAP.md)
- [Геймдизайн (Game Design Document)](docs/GAME_DESIGN.md)
- [Архитектура (Architecture Document)](docs/ARCHITECTURE.md)
- [Платформенная архитектура (Platforms)](docs/PLATFORMS.md)
- [Деплой на GitHub Pages (GitHub Pages)](docs/GITHUB_PAGES.md)
- [Интеграция с Telegram Mini App (Telegram Mini App)](docs/TELEGRAM_MINI_APP.md)
- [Интерфейс и UX (UI & UX Document)](docs/UI_UX.md)
- [Визуальный стиль (Art Style Document)](docs/ART_STYLE.md)
- [Звуковая концепция (Audio Document)](docs/AUDIO.md)
- [Дизайн уровней (Level Design Document)](docs/LEVEL_DESIGN.md)
- [Солвер и генератор уровней (Level Generator)](docs/LEVEL_GENERATOR.md)
- [Интеграция с Яндекс Играми (Yandex Games)](docs/YANDEX_GAMES.md)
- [Журнал архитектурных решений (Decisions / ADR)](docs/DECISIONS.md)
- [Стратегия тестирования и QA (Testing)](docs/TESTING.md)
- [История изменений (Changelog)](docs/CHANGELOG.md)

---

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск локального сервера разработки
```bash
npm run dev
```

### Прогон тестов
```bash
npm test
```

### Сборка продакшн-бандла
```bash
npm run build
```
