import { IScreen } from './ScreenManager';

export interface MainMenuCallbacks {
  onPlay: () => void;
  onLevelSelect: () => void;
  onCatHouse: () => void;
  onCollection: () => void;
  onSettings: () => void;
}

export class MainMenu implements IScreen {
  public readonly id = 'main-menu';
  private element: HTMLElement | null = null;
  private callbacks: MainMenuCallbacks;

  constructor(callbacks: MainMenuCallbacks) {
    this.callbacks = callbacks;
  }

  public mount(container: HTMLElement): void {
    const screen = document.createElement('div');
    screen.className = 'ui-screen ui-screen--opaque';
    screen.id = 'screen-main-menu';
    screen.style.padding = '24px 20px';
    screen.style.justifyContent = 'space-between';
    screen.style.alignItems = 'center';

    screen.innerHTML = `
      <!-- Верхний бар с балансом -->
      <div style="width: 100%; display: flex; justify-content: flex-end; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-weight: 700; font-size: 18px;">
          <span>💰</span>
          <span id="menuCoinBalance">125</span>
        </div>
      </div>

      <!-- Центральный блок с заголовком и котиком -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <h1 class="title-large" style="line-height: 1.15;">
          КОТИКИ<br/>
          <span style="color: var(--color-accent-orange);">ПУТЬ СВОБОДЕН!</span>
        </h1>
        <div style="font-size: 72px; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.1));">🐱</div>
      </div>

      <!-- Блок кнопок управления -->
      <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 14px;">
        <button id="btnContinueGame" class="btn btn-primary" style="width: 100%; max-width: 320px; font-size: 24px; padding: 16px 20px;">
          ПРОДОЛЖИТЬ
        </button>

        <button id="btnLevelSelect" class="btn btn-secondary" style="width: 100%; max-width: 320px; font-size: 20px; padding: 14px 20px;">
          ВЫБОР УРОВНЯ
        </button>

        <!-- Нижний ряд иконок -->
        <div style="display: flex; gap: 20px; margin-top: 10px;">
          <button id="btnCatHouse" class="btn btn-icon" title="Домик котиков">🏠</button>
          <button id="btnCollection" class="btn btn-icon" title="Коллекция котиков">🐾</button>
          <button id="btnSettings" class="btn btn-icon" title="Настройки">⚙</button>
        </div>
      </div>
    `;

    container.appendChild(screen);
    this.element = screen;

    // Привязка обработчиков
    this.element.querySelector('#btnContinueGame')?.addEventListener('click', () => this.callbacks.onPlay());
    this.element.querySelector('#btnLevelSelect')?.addEventListener('click', () => this.callbacks.onLevelSelect());
    this.element.querySelector('#btnCatHouse')?.addEventListener('click', () => this.callbacks.onCatHouse());
    this.element.querySelector('#btnCollection')?.addEventListener('click', () => this.callbacks.onCollection());
    this.element.querySelector('#btnSettings')?.addEventListener('click', () => this.callbacks.onSettings());
  }

  public show(): void {
    if (this.element) {
      this.element.classList.add('active');
    }
  }

  public hide(): void {
    if (this.element) {
      this.element.classList.remove('active');
    }
  }
}
