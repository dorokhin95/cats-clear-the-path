import { IScreen } from './ScreenManager';

export class SplashScreen implements IScreen {
  public readonly id = 'splash';
  private element: HTMLElement | null = null;
  private onReadyCallback?: () => void;

  constructor(onReady?: () => void) {
    this.onReadyCallback = onReady;
  }

  public mount(container: HTMLElement): void {
    const screen = document.createElement('div');
    screen.className = 'ui-screen ui-screen--opaque';
    screen.id = 'screen-splash';
    screen.style.justifyContent = 'center';
    screen.style.alignItems = 'center';
    screen.style.gap = '20px';
    screen.style.backgroundColor = 'var(--bg-primary)';

    screen.innerHTML = `
      <div style="font-size: 64px; animation: popIn 0.5s ease;">🐾</div>
      <h1 class="title-large" style="max-width: 280px; line-height: 1.2;">
        КОТИКИ<br/><span style="color: var(--color-accent-orange);">ПУТЬ СВОБОДЕН!</span>
      </h1>
      <p style="color: var(--color-text-muted); font-size: 16px; margin-top: 10px;">
        Загрузка игры...
      </p>
      <div style="width: 140px; height: 8px; background-color: var(--bg-secondary); border-radius: 4px; overflow: hidden; margin-top: 8px;">
        <div id="splashProgressBar" style="width: 100%; height: 100%; background-color: var(--color-primary-green); transition: width 0.3s ease;"></div>
      </div>
    `;

    container.appendChild(screen);
    this.element = screen;
  }

  public show(): void {
    if (this.element) {
      this.element.classList.add('active');
    }

    // Имитация быстрой загрузки ассетов (150 мс) согласно ТЗ (без искусственной задержки)
    setTimeout(() => {
      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
    }, 150);
  }

  public hide(): void {
    if (this.element) {
      this.element.classList.remove('active');
    }
  }
}
