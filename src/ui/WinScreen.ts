import { ScreenManager } from './ScreenManager';
import { LevelResult } from '../game/GameRules';
import { renderCoinIcon } from './CoinBadge';

export interface WinScreenCallbacks {
  onNextLevel: () => void;
  onMainMenu: () => void;
  onStarPop?: (starIndex: number) => void;
  onDoubleReward?: (onSuccess: () => void) => void;
}

function formatTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

export class WinScreen {
  public readonly modalId = 'modal-win';
  private screenManager: ScreenManager;
  private callbacks: WinScreenCallbacks;
  private modalElement: HTMLElement | null = null;
  private currentCoins = 0;
  private isDoubled = false;

  constructor(screenManager: ScreenManager, callbacks: WinScreenCallbacks) {
    this.screenManager = screenManager;
    this.callbacks = callbacks;
  }

  public mount(container: HTMLElement): void {
    const modal = document.createElement('div');
    modal.className = 'ui-modal';
    modal.id = this.modalId;

    modal.innerHTML = `
      <div class="ui-modal__content" style="max-width: 320px; width: 90%; text-align: center; gap: 14px; padding: 24px;">
        <h2 class="title-large" style="color: var(--color-primary-green); margin: 0; font-size: 28px;">
          УРОВЕНЬ ПРОЙДЕН!
        </h2>

        <!-- Звезды -->
        <div id="winStarsContainer" style="display: flex; justify-content: center; gap: 8px; font-size: 32px;">
          <span id="winStar1" class="win-star" style="opacity: 0.2; transform: scale(0.8); transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);">⭐</span>
          <span id="winStar2" class="win-star" style="opacity: 0.2; transform: scale(0.8); transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);">⭐</span>
          <span id="winStar3" class="win-star" style="opacity: 0.2; transform: scale(0.8); transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);">⭐</span>
        </div>

        <!-- Подробная статистика прохождения (п. 5 и п. 17 ТЗ) -->
        <div id="winStatsDetails" style="width: 100%; display: flex; flex-direction: column; gap: 6px; background: white; padding: 12px 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-size: 14px; font-weight: 600; text-align: left; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--color-text-muted);">⏱ Время:</span>
            <span id="winStatTime" style="color: var(--color-text-dark); font-variant-numeric: tabular-nums;">00:00.0</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--color-text-muted);">🔥 Лучшее комбо:</span>
            <span id="winStatCombo" style="color: var(--color-text-dark);">×1</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--color-text-muted);">❌ Ошибки:</span>
            <span id="winStatErrors" style="color: var(--color-text-dark);">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #EADDCB; padding-top: 6px; font-weight: 800; color: var(--color-primary-green); font-size: 15px;">
            <span>🏆 Результат:</span>
            <span id="winStatScore">100/100</span>
          </div>
        </div>

        <!-- Награда в монетах -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #FFF4DE; padding: 8px 20px; border-radius: 20px; font-weight: 800; font-size: 22px; color: var(--color-accent-orange); box-shadow: 0 2px 8px rgba(255, 184, 77, 0.2);">
          <span>+</span>
          <span id="winCoinsAmount">20</span>
          ${renderCoinIcon(24)}
        </div>

        <!-- Кнопка удвоения за рекламу (скрывается если реклама недоступна) -->
        <button id="btnWinDoubleReward" class="btn btn-accent" style="width: 100%; font-size: 16px; padding: 10px; display: none;">
          🎬 УДВОИТЬ НАГРАДУ (x2 ${renderCoinIcon(18)})
        </button>

        <!-- Кнопки действий -->
        <div style="width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
          <button id="btnWinNextLevel" class="btn btn-primary" style="width: 100%; font-size: 20px; padding: 12px;">
            СЛЕДУЮЩИЙ
          </button>
          <button id="btnWinMainMenu" class="btn" style="width: 100%; background: #EFE6D5; color: var(--color-text-dark); box-shadow: 0 3px 0 #D6C9B2;">
            🏠 В МЕНЮ
          </button>
        </div>
      </div>
    `;

    container.appendChild(modal);
    this.modalElement = modal;

    const doubleBtn = modal.querySelector('#btnWinDoubleReward') as HTMLButtonElement;
    doubleBtn?.addEventListener('click', () => {
      if (this.isDoubled) return;
      this.callbacks.onDoubleReward?.(() => {
        this.isDoubled = true;
        this.currentCoins *= 2;
        const coinsEl = modal.querySelector('#winCoinsAmount');
        if (coinsEl) coinsEl.textContent = `${this.currentCoins}`;
        doubleBtn.textContent = 'УДВОЕНО! ✨';
        doubleBtn.disabled = true;
        doubleBtn.style.opacity = '0.7';
      });
    });

    modal.querySelector('#btnWinNextLevel')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onNextLevel();
    });

    modal.querySelector('#btnWinMainMenu')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onMainMenu();
    });
  }

  public show(
    result: LevelResult,
    bestTimeMs?: number,
    bestCombo?: number,
    hasRewardedAds: boolean = false
  ): void {
    if (!this.modalElement) return;

    this.currentCoins = result.coins;
    this.isDoubled = false;

    // Управление кнопкой рекламы
    const doubleBtn = this.modalElement.querySelector('#btnWinDoubleReward') as HTMLButtonElement;
    if (doubleBtn) {
      if (hasRewardedAds) {
        doubleBtn.style.display = 'block';
        doubleBtn.innerHTML = `🎬 УДВОИТЬ НАГРАДУ (x2 <span style="display:inline-flex; vertical-align:middle; margin-left:2px;">${renderCoinIcon(18)}</span>)`;
        doubleBtn.disabled = false;
        doubleBtn.style.opacity = '1';
      } else {
        doubleBtn.style.display = 'none';
      }
    }

    // Обновляем монеты
    const coinsEl = this.modalElement.querySelector('#winCoinsAmount');
    if (coinsEl) coinsEl.textContent = `${result.coins}`;

    // Обновляем статистику
    const timeEl = this.modalElement.querySelector('#winStatTime');
    if (timeEl) {
      const currentFormatted = formatTime(result.completionTimeMs);
      if (bestTimeMs && bestTimeMs > 0 && bestTimeMs < result.completionTimeMs) {
        timeEl.textContent = `${currentFormatted} (лучший: ${formatTime(bestTimeMs)})`;
      } else {
        timeEl.textContent = currentFormatted;
      }
    }

    const comboEl = this.modalElement.querySelector('#winStatCombo');
    if (comboEl) {
      if (bestCombo && bestCombo > result.maxCombo) {
        comboEl.textContent = `×${result.maxCombo} (лучший: ×${bestCombo})`;
      } else {
        comboEl.textContent = `×${result.maxCombo}`;
      }
    }

    const errorsEl = this.modalElement.querySelector('#winStatErrors');
    if (errorsEl) {
      errorsEl.textContent = `${result.errors}`;
    }

    const scoreEl = this.modalElement.querySelector('#winStatScore');
    if (scoreEl) {
      scoreEl.textContent = `${result.performanceScore}/100`;
    }

    // Сброс анимации звезд
    const s1 = this.modalElement.querySelector('#winStar1') as HTMLElement;
    const s2 = this.modalElement.querySelector('#winStar2') as HTMLElement;
    const s3 = this.modalElement.querySelector('#winStar3') as HTMLElement;

    if (s1 && s2 && s3) {
      s1.style.transform = 'scale(0)';
      s2.style.transform = 'scale(0)';
      s3.style.transform = 'scale(0)';
      s1.textContent = result.stars >= 1 ? '⭐' : '🖤';
      s2.textContent = result.stars >= 2 ? '⭐' : '🖤';
      s3.textContent = result.stars >= 3 ? '⭐' : '🖤';
    }

    this.screenManager.openModal(this.modalId);

    // Поочередное выпадение звезд
    setTimeout(() => {
      if (s1) {
        s1.style.transform = 'scale(1)';
        this.callbacks.onStarPop?.(0);
      }
    }, 200);

    setTimeout(() => {
      if (s2) {
        s2.style.transform = 'scale(1)';
        if (result.stars >= 2) this.callbacks.onStarPop?.(1);
      }
    }, 450);

    setTimeout(() => {
      if (s3) {
        s3.style.transform = 'scale(1)';
        if (result.stars >= 3) this.callbacks.onStarPop?.(2);
      }
    }, 700);
  }

  public close(): void {
    this.screenManager.closeModal(this.modalId);
  }
}
