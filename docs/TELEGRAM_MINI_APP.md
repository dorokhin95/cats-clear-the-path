# Запуск и интеграция Telegram Mini App

Проект «Котики: путь свободен!» полностью готов к работе в качестве **Telegram Mini App** поверх единой статической веб-сборки.

---

## 1. Подключение и инициализация

В `index.html` подключен официальный скрипт:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```
В обычном браузере данный скрипт пассивен и безопасен. Внутри клиента Telegram он предоставляет глобальный объект `window.Telegram.WebApp`.

При старте адаптер `TelegramPlatformService`:
1. Вызывает `Telegram.WebApp.ready()`, сообщая клиенту о готовности интерфейса.
2. Вызывает `Telegram.WebApp.expand()`, разворачивая веб-приложение на полный экран смартфона.
3. Подключает нативную кнопку «Назад» (`BackButton`) и события `activated`/`deactivated` для умной паузы.

---

## 2. Нативная кнопка «Назад» (`BackButton`)

В зависимости от текущего экрана игра управляет нативной кнопкой клиента:
- **Главное меню (`main-menu`), Сплэш (`splash`)**: кнопка «Назад» скрыта (`BackButton.hide()`).
- **Выбор уровня (`level-select`), Домик (`cat-house`), Коллекция (`collection`)**: кнопка «Назад» активна и бесшовно возвращает в Главное меню.
- **Игровое поле (`gameplay-hud`)**: нажатие кнопки ставит игру на паузу и открывает меню паузы `PauseMenu`.

---

## 3. Адаптивный вьюпорт и безопасные зоны

В `styles/main.css` настроена поддержка CSS-переменных Telegram Mini App:
```css
.game-viewport {
  height: var(--tg-viewport-stable-height, 100dvh);
  padding-top: max(env(safe-area-inset-top, 0px), var(--tg-content-safe-area-inset-top, 0px));
  padding-bottom: max(env(safe-area-inset-bottom, 0px), var(--tg-content-safe-area-inset-bottom, 0px));
  padding-left: max(env(safe-area-inset-left, 0px), var(--tg-content-safe-area-inset-left, 0px));
  padding-right: max(env(safe-area-inset-right, 0px), var(--tg-content-safe-area-inset-right, 0px));
}
```
Это исключает дергание высоты экрана при скрытии/появлении клавиатуры или элементов навигации мессенджера.

---

## 4. Тактильный отклик (`HapticFeedback`)

При включённой в настройках вибрации игра использует Telegram Haptics API:
- Тап по котику: `impactOccurred('light')`
- Успешный ход / побег: `notificationOccurred('success')`
- Ошибка / блокировка: `notificationOccurred('error')`
- Подсказка: `impactOccurred('medium')`

---

## 5. Настройка бота через @BotFather

Для запуска игры в Telegram:
1. Создайте или откройте бота в `@BotFather`.
2. Выполните команду `/newapp` (или выберите бота в `/mybots` → **Bot Settings** → **Menu Button** / **Mini Apps**).
3. Укажите публичный HTTPS URL из GitHub Pages (например, `https://<username>.github.io/<repo>/`).
4. Игра готова к запуску как в личной переписке, так и через меню-кнопку или инлайн-кнопки каналов.
