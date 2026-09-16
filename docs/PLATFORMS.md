# Платформенная архитектура проекта «Котики: путь свободен!»

В проекте реализована модульная архитектура кросс-платформенной изоляции, позволяющая запускать одну и ту же кодовую базу в различных средах без модификации ядра игры.

---

## 1. Приоритет и стратегия публикации

1. **Web / GitHub Pages (Текущий основной релизный таргет)**
   - Автономная статическая сборка HTML5/Canvas/TS.
   - Независимость от сторонних SDK.
   - Локальные сохранения (`localStorage` схемы V2 с рекордами).

2. **Telegram Mini App (Текущий сопутствующий таргет)**
   - Запуск той же статической сборки внутри Telegram WebApp.
   - Использование нативной кнопки «Назад» (`BackButton`), тактильного отклика (`HapticFeedback`), адаптивного viewport (`--tg-viewport-stable-height`) и безопасных зон (`--tg-content-safe-area-inset-*`).
   - Рекламные блоки отключены до выработки специальной модели монетизации для Telegram.

3. **Яндекс Игры (Поддерживаемый будущий таргет)**
   - Изолированный адаптер над `YandexGamesService`.
   - Облачные сохранения, полноэкранная и rewarded-реклама.
   - SDK подключается только при запуске на платформе Яндекса.

---

## 2. Матрица возможностей платформ (`PlatformCapabilities`)

| Возможность | Web (GitHub Pages) | Telegram Mini App | Яндекс Игры |
| :--- | :---: | :---: | :---: |
| **Облачные сохранения** (`cloudSave`) | ❌ (только localStorage) | ❌ (localStorage) | ✅ (Yandex Cloud Data) |
| **Видео за награду** (`rewardedAds`) | ❌ | ❌ | ✅ (Yandex Rewarded) |
| **Межстраничная реклама** (`interstitialAds`) | ❌ | ❌ | ✅ (с кулдауном 60с) |
| **Тактильный отклик** (`haptics`) | ✅ (navigator.vibrate) | ✅ (Telegram Haptics) | ❌ |
| **Нативная кнопка «Назад»** (`nativeBackButton`) | ❌ | ✅ (tg.BackButton) | ❌ |

---

## 3. Архитектура модулей платформы (`src/platform/`)

```
src/platform/
├── PlatformService.ts       # Интерфейсы PlatformService и PlatformCapabilities
├── PlatformManager.ts       # Автоопределение окружения и выбор провайдера
├── WebPlatformService.ts    # Реализация для чистого Web / GitHub Pages
├── TelegramPlatformService.ts # Адаптер для Telegram WebApp SDK
└── YandexPlatformService.ts # Адаптер над YandexGamesService
```

### Принцип Capability-based UI
Интерфейс игры не проверяет имя текущей платформы напрямую (`isTelegram` / `isYandex`). Вместо этого проверяются capabilities:
- Если `platform.getCapabilities().rewardedAds === false`, кнопки удвоения монет и просмотра рекламы за подсказку **не отображаются**, не оставляя пустых мест в разметке.
- Если `platform.getCapabilities().nativeBackButton === true`, регистрируются обработчики навигации в главное меню и модальные окна.

---

## 4. Переопределение платформы при разработке

Для удобства отладки платформу можно принудительно задать в строке адреса:
- `http://localhost:3000/?platform=web` — режим чистого Web;
- `http://localhost:3000/?platform=telegram` — режим Telegram Mini App;
- `http://localhost:3000/?platform=yandex` — режим Яндекс Игр.
