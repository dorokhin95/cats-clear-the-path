# Публикация на GitHub Pages

Проект «Котики: путь свободен!» настроен для автоматической сборки и публикации в сервис **GitHub Pages** при помощи GitHub Actions.

---

## 1. Конфигурация сборки (`vite.config.ts`)

Сборщик настроен с относительным базовым путем:
```ts
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
```
Относительный путь `base: './'` позволяет загружать JS/CSS бандлы и ассеты независимо от того, размещено ли приложение в корне домена (`https://username.github.io/`) или в подпапке репозитория (`https://username.github.io/cats-clear-the-path/`).

---

## 2. CI/CD Workflow (`.github/workflows/deploy-pages.yml`)

Пайплайн запускается автоматически при пуше в ветку `main` либо вручную через `workflow_dispatch`.

### Этапы пайплайна:
1. **Checkout** исходного кода репозитория.
2. **Setup Node.js 20** с кэшированием npm.
3. **`npm ci`** — детерминированная установка зависимостей.
4. **`npm test`** — прогон полного набора автоматических тестов (Vitest, 60+ тестов).
5. **`npm run build`** — строгая компиляция TypeScript (`tsc`) и сборка бандла (`vite build`).
6. **Upload artifact** — архивация содержимого директории `dist`.
7. **Deploy to GitHub Pages** — публикация на официальные серверы GitHub Pages.

---

## 3. Настройка репозитория на GitHub

Для активации автодеплоя:
1. Откройте репозиторий на GitHub.
2. Перейдите в **Settings** → **Pages**.
3. В разделе **Build and deployment** выберите **Source: GitHub Actions**.
4. После первого успешного коммита в ветку `main` игра будет доступна по URL:
   `https://<username>.github.io/<repository-name>/`

---

## 4. Особенности веб-версии
- Полная автономность: отсутствие внешних SDK и рекламы.
- Прогресс и рекорды сохраняются в `localStorage` (схема сохранения V2 с безопасной миграцией).
- Тот же HTTPS URL готов для использования в качестве веб-приложения Telegram Mini App.
