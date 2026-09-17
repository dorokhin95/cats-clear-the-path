/**
 * Единый векторный компонент для отрисовки объемных золотых звезд награды и пустых слотов.
 * Обеспечивает единый праздничный 3D-стиль, сочные цвета и сияние на любых устройствах и ОС.
 */

let starIdCounter = 0;

/**
 * Генерирует яркую объемную 3D-звезду из золота с сияющим бликом и теплым свечением
 */
export function renderGoldenStar(size: number = 48): string {
  const uid = `gstar_${size}_${++starIdCounter}`;

  return `
    <svg class="win-star-svg win-star-svg--gold" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; filter: drop-shadow(0 4px 10px rgba(255, 160, 0, 0.45)) drop-shadow(0 2px 4px rgba(230, 81, 0, 0.35)); flex-shrink: 0; display: inline-block; vertical-align: middle;">
      <defs>
        <!-- Насыщенный золотой градиент тела звезды -->
        <linearGradient id="${uid}_body" x1="32" y1="4" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFF59D" />
          <stop offset="25%" stop-color="#FFD54F" />
          <stop offset="65%" stop-color="#FFA000" />
          <stop offset="100%" stop-color="#FF8F00" />
        </linearGradient>

        <!-- Верхний глянцевый блик -->
        <linearGradient id="${uid}_highlight" x1="32" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- Основной золотой силуэт звезды с контуром цвета корицы -->
      <path d="M 32,4 L 39.7,21.5 L 58.6,23.4 L 44.3,36.2 L 48.4,54.8 L 32,45.2 L 15.6,54.8 L 19.7,36.2 L 5.4,23.4 L 24.3,21.5 Z"
        fill="url(#${uid}_body)" stroke="#E65100" stroke-width="2.6" stroke-linejoin="round" />

      <!-- Верхний 3D-фасет с эффектом объема -->
      <path d="M 32,7.5 L 38.5,21.8 L 54.5,23.4 L 42.5,34 L 32,29 L 21.5,34 L 9.5,23.4 L 25.5,21.8 Z"
        fill="url(#${uid}_highlight)" opacity="0.75" />

      <!-- Сияющая четырехконечная искорка-блик в верхнем левом луче -->
      <polygon points="23,12 24.5,16 28,17 24.5,18 23,22 21.5,18 18,17 21.5,16" fill="#FFFFFF" />
      <circle cx="23" cy="17" r="1.5" fill="#FFFDE7" />
    </svg>
  `.trim();
}

/**
 * Генерирует аккуратный мягкий слот для неполученной звезды (вместо черного сердца)
 */
export function renderEmptyStar(size: number = 48): string {
  return `
    <svg class="win-star-svg win-star-svg--empty" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; opacity: 0.65; flex-shrink: 0; display: inline-block; vertical-align: middle;">
      <!-- Мягкий бежево-кремовый слот -->
      <path d="M 32,4 L 39.7,21.5 L 58.6,23.4 L 44.3,36.2 L 48.4,54.8 L 32,45.2 L 15.6,54.8 L 19.7,36.2 L 5.4,23.4 L 24.3,21.5 Z"
        fill="#ECE5D8" stroke="#D1C4B2" stroke-width="2.4" stroke-linejoin="round" />
      <path d="M 32,8 L 38.5,21.8 L 53,23.4 L 42,34 L 32,29 L 22,34 L 11,23.4 L 25.5,21.8 Z"
        fill="#F8F3EC" opacity="0.6" />
    </svg>
  `.trim();
}
