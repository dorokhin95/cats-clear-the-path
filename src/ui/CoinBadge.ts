/**
 * Единый компонент и хелперы для отображения золотой монетки с кошачьей лапкой во всей игре.
 * Гарантирует абсолютную идентичность и четкость на любых ОС (iOS, Android, Windows, Mac).
 */

export interface CoinBadgeOptions {
  id?: string;
  size?: number; // Размер иконки в px (по умолчанию 20)
  fontSize?: number; // Размер шрифта текста (по умолчанию 16)
  showPlus?: boolean;
  className?: string;
}

/**
 * Генерирует векторную SVG-иконку золотой монетки с кошачьей лапкой
 */
export function renderCoinIcon(size: number = 20): string {
  return `<svg class="coin-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; flex-shrink: 0;"><defs><radialGradient id="coinGrad_${size}" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="#FFF9C4" /><stop offset="35%" stop-color="#FFD54F" /><stop offset="85%" stop-color="#FFA000" /><stop offset="100%" stop-color="#FF8F00" /></radialGradient><linearGradient id="coinRim_${size}" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFF8E1" /><stop offset="100%" stop-color="#E65100" /></linearGradient></defs><circle cx="12" cy="12" r="11" fill="url(#coinRim_${size})" /><circle cx="12" cy="12" r="9.5" fill="url(#coinGrad_${size})" /><circle cx="12" cy="12" r="8" stroke="#FFE082" stroke-width="0.8" stroke-dasharray="1.5 1" fill="none" opacity="0.8" /><g fill="#795548" opacity="0.85"><ellipse cx="12" cy="14.2" rx="3.6" ry="2.6" /><circle cx="8.8" cy="10.2" r="1.3" /><circle cx="12" cy="8.6" r="1.4" /><circle cx="15.2" cy="10.2" r="1.3" /></g><path d="M 6.5 7.5 A 8 8 0 0 1 17.5 7.5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.75" /></svg>`;
}

/**
 * Создает HTML-разметку бейджа монетки
 */
export function renderCoinBadge(amount: number | string, options: CoinBadgeOptions = {}): string {
  const size = options.size ?? 20;
  const fontSize = options.fontSize ?? 16;
  const idAttr = options.id ? `id="${options.id}"` : '';
  const prefix = options.showPlus ? '+' : '';
  const cls = options.className ? `coin-badge ${options.className}` : 'coin-badge';

  return `<div class="${cls}" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: ${fontSize}px; line-height: 1;">${renderCoinIcon(size)}<span ${idAttr} class="coin-value" style="font-variant-numeric: tabular-nums;">${prefix}${amount}</span></div>`;
}
