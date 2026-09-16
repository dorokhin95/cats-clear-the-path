import { ScreenManager } from './ScreenManager';

export interface PauseMenuCallbacks {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export class PauseMenu {
  public readonly modalId = 'modal-pause';
  private screenManager: ScreenManager;
  private callbacks: PauseMenuCallbacks;

  constructor(screenManager: ScreenManager, callbacks: PauseMenuCallbacks) {
    this.screenManager = screenManager;
    this.callbacks = callbacks;
  }

  public mount(container: HTMLElement): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = this.modalId;

    modal.innerHTML = `
      <div class="modal-content">
        <h2 class="title-large">ПАУЗА</h2>

        <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 6px;">
          <button id="btnPauseResume" class="btn btn-primary" style="width: 100%;">
            ПРОДОЛЖИТЬ
          </button>
          <button id="btnPauseRestart" class="btn btn-secondary" style="width: 100%;">
            ЗАНОВО
          </button>
          <button id="btnPauseSettings" class="btn btn-accent" style="width: 100%;">
            НАСТРОЙКИ
          </button>
          <button id="btnPauseMainMenu" class="btn" style="width: 100%; background: #E5D7C0; color: var(--color-text-dark); box-shadow: 0 4px 0 #C4B59D;">
            ГЛАВНОЕ МЕНЮ
          </button>
        </div>
      </div>
    `;

    container.appendChild(modal);

    modal.querySelector('#btnPauseResume')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onResume();
    });

    modal.querySelector('#btnPauseRestart')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onRestart();
    });

    modal.querySelector('#btnPauseSettings')?.addEventListener('click', () => {
      this.callbacks.onSettings();
    });

    modal.querySelector('#btnPauseMainMenu')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onMainMenu();
    });
  }

  public open(): void {
    this.screenManager.openModal(this.modalId);
  }

  public close(): void {
    this.screenManager.closeModal(this.modalId);
  }

  public isOpen(): boolean {
    const el = document.getElementById(this.modalId);
    return el ? el.classList.contains('active') : false;
  }
}
