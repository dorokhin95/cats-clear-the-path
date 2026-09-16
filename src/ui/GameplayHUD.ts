import { IScreen } from './ScreenManager';

export interface GameplayHUDCallbacks {
  onPause: () => void;
  onHint: () => void;
}

export class GameplayHUD implements IScreen {
  public readonly id = 'gameplay-hud';
  private element: HTMLElement | null = null;
  private callbacks: GameplayHUDCallbacks;
  private lives: number = 3;
  private maxLives: number = 3;
  private isUnlimitedLives: boolean = false;
  private levelNumber: number = 1;
  private comboCount: number = 0;
  private hintCount: number = 3;
  private lastDisplayedTenths: number = -1;

  public getLevel(): number { return this.levelNumber; }
  public getCombo(): number { return this.comboCount; }
  public getHintCount(): number { return this.hintCount; }
  public getLives(): number { return this.lives; }

  constructor(callbacks: GameplayHUDCallbacks) {
    this.callbacks = callbacks;
  }

  public mount(container: HTMLElement): void {
    const hud = document.createElement('div');
    hud.className = 'ui-screen';
    hud.id = 'screen-gameplay-hud';
    hud.style.padding = '14px 18px';
    hud.style.justifyContent = 'space-between';
    hud.style.pointerEvents = 'none'; // Позволяет кликать по Canvas

    hud.innerHTML = `
      <!-- Верхняя панель HUD -->
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; pointer-events: auto;">
        <!-- Кнопка паузы -->
        <button id="btnPauseGame" class="btn btn-icon" title="Пауза" aria-label="Пауза">⚙</button>

        <!-- Номер уровня и таймер -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div id="hudLevelTitle" style="font-size: 19px; font-weight: 800; color: var(--color-text-dark); background: white; padding: 4px 14px; border-radius: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); line-height: 1.2;">
            Уровень 1
          </div>
          <div id="hudLevelTimer" style="font-size: 13px; font-weight: 700; color: var(--color-text-muted); background: rgba(255, 255, 255, 0.9); padding: 2px 10px; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); font-variant-numeric: tabular-nums;">
            ⏱ 00:00.0
          </div>
        </div>

        <!-- Жизни -->
        <div id="hudLivesContainer" style="display: flex; gap: 4px; font-size: 20px; background: white; padding: 6px 12px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <span id="life1">❤️</span>
          <span id="life2">❤️</span>
          <span id="life3">❤️</span>
        </div>
      </div>

      <!-- Компактный плавающий индикатор комбо в верхней зоне (не перекрывает игровое поле и котиков) -->
      <div id="hudComboContainer" style="position: absolute; top: 72px; left: 50%; transform: translateX(-50%) scale(0.8); opacity: 0; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 3px; pointer-events: none; z-index: 15;">
        <div id="hudComboBadge" style="background: var(--color-accent-orange); color: white; padding: 4px 16px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 184, 77, 0.45); white-space: nowrap;">
          COMBO ×2
        </div>
        <div id="hudComboBar" style="width: 84px; height: 5px; background: rgba(0,0,0,0.15); border-radius: 3px; overflow: hidden;">
          <div id="hudComboFill" style="width: 100%; height: 100%; background: #FFD166; border-radius: 3px; transition: width 0.08s linear;"></div>
        </div>
      </div>

      <!-- Нижняя строка: счетчик оставшихся котиков и кнопка подсказки -->
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; pointer-events: auto;">
        <div id="hudRemainingCats" style="font-size: 15px; font-weight: 700; color: var(--color-text-dark); background: white; padding: 8px 14px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 6px;">
          🐱 Осталось: <span id="remainingCatsCount" style="color: var(--color-accent-orange); font-weight: 800;">0</span>
        </div>
        <button id="btnHint" class="btn btn-accent" style="font-size: 16px; padding: 10px 18px; border-radius: 20px;" aria-label="Подсказка">
          💡 Подсказка (<span id="hintCounter">3</span>)
        </button>
      </div>
    `;

    container.appendChild(hud);
    this.element = hud;

    hud.querySelector('#btnPauseGame')?.addEventListener('click', () => this.callbacks.onPause());
    hud.querySelector('#btnHint')?.addEventListener('click', () => this.callbacks.onHint());
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

  public setLevel(level: number, unlimitedLives: boolean = false): void {
    this.levelNumber = level;
    this.isUnlimitedLives = unlimitedLives;
    const title = this.element?.querySelector('#hudLevelTitle');
    if (title) title.textContent = `Уровень ${level}`;
    this.updateLivesDisplay();
  }

  public setLives(lives: number): void {
    this.lives = Math.max(0, Math.min(lives, this.maxLives));
    this.updateLivesDisplay();
  }

  private updateLivesDisplay(): void {
    const container = this.element?.querySelector('#hudLivesContainer');
    if (!container) return;

    if (this.isUnlimitedLives) {
      container.innerHTML = '<span style="font-weight: 700; color: var(--color-primary-green); font-size: 22px;">∞</span>';
      return;
    }

    container.innerHTML = '';
    for (let i = 1; i <= this.maxLives; i++) {
      const span = document.createElement('span');
      span.textContent = i <= this.lives ? '❤️' : '🖤';
      container.appendChild(span);
    }
  }

  public setCombo(combo: number): void {
    this.setComboState(combo, combo >= 2 ? 4.5 : 0, 4.5);
  }

  public setComboState(combo: number, remainingSec: number, maxSec: number = 4.5): void {
    this.comboCount = combo;
    const container = this.element?.querySelector('#hudComboContainer') as HTMLElement;
    const badge = this.element?.querySelector('#hudComboBadge') as HTMLElement;
    const fill = this.element?.querySelector('#hudComboFill') as HTMLElement;
    if (!container || !badge || !fill) return;

    if (combo >= 2 && remainingSec > 0) {
      badge.textContent = `COMBO ×${combo}`;
      container.style.opacity = '1';
      container.style.transform = 'translateX(-50%) scale(1)';
      const pct = Math.max(0, Math.min(100, (remainingSec / maxSec) * 100));
      fill.style.width = `${pct}%`;
    } else {
      container.style.opacity = '0';
      container.style.transform = 'translateX(-50%) scale(0.8)';
      fill.style.width = '0%';
    }
  }

  public setElapsedTime(ms: number): void {
    const nowTenths = Math.floor(ms / 100);
    if (nowTenths === this.lastDisplayedTenths) return;
    this.lastDisplayedTenths = nowTenths;

    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const tenths = Math.floor((ms % 1000) / 100);

    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    const timerEl = this.element?.querySelector('#hudLevelTimer');
    if (timerEl) {
      timerEl.textContent = `⏱ ${formatted}`;
    }
  }

  public setHintCount(hints: number): void {
    this.hintCount = hints;
    const counter = this.element?.querySelector('#hintCounter');
    if (counter) counter.textContent = `${hints}`;
  }

  public setRemainingCats(count: number): void {
    const el = this.element?.querySelector('#remainingCatsCount');
    if (el) el.textContent = `${count}`;
  }
}
