import { ScreenManager } from './ScreenManager';

export interface LoseScreenCallbacks {
  onRetry: () => void;
  onMainMenu: () => void;
  onRevive?: () => void;
}

export class LoseScreen {
  public readonly modalId = 'modal-lose';
  private screenManager: ScreenManager;
  private callbacks: LoseScreenCallbacks;

  constructor(screenManager: ScreenManager, callbacks: LoseScreenCallbacks) {
    this.screenManager = screenManager;
    this.callbacks = callbacks;
  }

  public mount(container: HTMLElement): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = this.modalId;

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 360px; text-align: center;">
        <h2 class="title-large" style="color: var(--color-error); font-size: 26px; line-height: 1.2;">
          ОЙ! КОТИКИ ЗАПУТАЛИСЬ
        </h2>

        <div style="font-size: 58px; margin: 6px 0;">😿</div>

        <p style="color: var(--color-text-muted); font-size: 16px; font-weight: 500;">
          Закончились сердечки.<br/>Попробуем пройти уровень ещё раз?
        </p>

        <!-- Кнопки действий -->
        <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          <button id="btnLoseRevive" class="btn btn-accent" style="width: 100%; font-size: 17px; padding: 12px;">
            🎬 +2 ЖИЗНИ И ПРОДОЛЖИТЬ
          </button>
          <button id="btnLoseRetry" class="btn btn-primary" style="width: 100%; font-size: 20px; padding: 12px;">
            ЕЩЁ РАЗ
          </button>
          <button id="btnLoseMainMenu" class="btn" style="width: 100%; background: #EFE6D5; color: var(--color-text-dark); box-shadow: 0 3px 0 #D6C9B2;">
            🏠 В МЕНЮ
          </button>
        </div>
      </div>
    `;

    container.appendChild(modal);

    modal.querySelector('#btnLoseRevive')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onRevive?.();
    });

    modal.querySelector('#btnLoseRetry')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onRetry();
    });

    modal.querySelector('#btnLoseMainMenu')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onMainMenu();
    });
  }

  public show(hasRewardedAds: boolean = false): void {
    const modal = document.getElementById(this.modalId);
    const reviveBtn = modal?.querySelector('#btnLoseRevive') as HTMLElement;
    if (reviveBtn) {
      reviveBtn.style.display = hasRewardedAds ? 'block' : 'none';
    }
    this.screenManager.openModal(this.modalId);
  }

  public close(): void {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.removeProperty('z-index');
    }
    this.screenManager.closeModal(this.modalId);
  }
}
