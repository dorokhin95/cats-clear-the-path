import { IScreen } from './ScreenManager';
import { PlayerProgress } from '../progression/PlayerProgress';
import { CatCollection } from '../progression/CatCollection';
import { CatRenderer } from '../rendering/CatRenderer';

export interface MainMenuCallbacks {
  onPlay: () => void;
  onLevelSelect: () => void;
  onCatHouse: () => void;
  onCollection: () => void;
  onSettings: () => void;
  onPetMascot?: () => void;
}

export class MainMenu implements IScreen {
  public readonly id = 'main-menu';
  private element: HTMLElement | null = null;
  private callbacks: MainMenuCallbacks;
  private progress?: PlayerProgress;

  constructor(progressOrCallbacks: PlayerProgress | MainMenuCallbacks, callbacks?: MainMenuCallbacks) {
    if (callbacks) {
      this.progress = progressOrCallbacks as PlayerProgress;
      this.callbacks = callbacks;
    } else {
      this.callbacks = progressOrCallbacks as MainMenuCallbacks;
    }
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
          <span id="menuCoinBalance">0</span>
        </div>
      </div>

      <!-- Центральный блок с заголовком и живым котиком-маскотом -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <h1 class="title-large" style="line-height: 1.15; text-align: center;">
          КОТИКИ<br/>
          <span style="color: var(--color-accent-orange);">ПУТЬ СВОБОДЕН!</span>
        </h1>
        <div id="mainMenuMascotWrapper" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);" title="Нажмите, чтобы погладить!">
          <canvas id="mainMenuMascotCanvas" width="96" height="96" style="width: 96px; height: 96px; filter: drop-shadow(0 8px 16px rgba(54,54,54,0.18));"></canvas>
          <div id="mainMenuMascotTag" style="font-size: 13px; font-weight: 700; color: #5D4037; background: rgba(255, 255, 255, 0.92); padding: 4px 14px; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #FFE0B2;">
            Рыжик 🐾
          </div>
        </div>
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

    // Интерактив маскота
    const mascotWrapper = this.element.querySelector('#mainMenuMascotWrapper') as HTMLElement;
    mascotWrapper?.addEventListener('click', () => {
      mascotWrapper.style.transform = 'scale(1.2) translateY(-6px)';
      setTimeout(() => {
        mascotWrapper.style.transform = 'scale(1)';
      }, 200);
      this.callbacks.onPetMascot?.();
    });

    this.render();
  }

  public render(): void {
    if (!this.element) return;

    // Баланс монет
    const coinEl = this.element.querySelector('#menuCoinBalance');
    if (coinEl && this.progress) {
      coinEl.textContent = `${this.progress.getCoins()}`;
    }

    // Выбранный котик маскот
    const canvas = this.element.querySelector('#mainMenuMascotCanvas') as HTMLCanvasElement;
    const tag = this.element.querySelector('#mainMenuMascotTag');
    const selectedCatId = this.progress ? this.progress.getSelectedCat() : 'ginger';
    const skinDef = CatCollection.getSkin(selectedCatId);

    if (canvas) {
      CatRenderer.renderPreviewToCanvas(canvas, selectedCatId);
    }
    if (tag) {
      tag.textContent = skinDef ? `${skinDef.name} ${skinDef.icon}` : 'Рыжик 🐾';
    }
  }

  public show(): void {
    this.render();
    if (this.element) {
      this.element.classList.add('active');
    }
  }

  public hide(): void {
    if (this.element) {
      this.element.classList.remove('active');
    }
  }

  public updateProgress(progress: PlayerProgress): void {
    this.progress = progress;
    this.render();
  }
}
