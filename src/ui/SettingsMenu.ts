import { ScreenManager } from './ScreenManager';

export interface SettingsData {
  musicVolume: number;
  sfxVolume: number;
  vibration: boolean;
  reducedMotion: boolean;
  language: 'ru' | 'en';
}

export class SettingsMenu {
  public readonly modalId = 'modal-settings';
  private screenManager: ScreenManager;
  private onSettingsChanged?: (settings: SettingsData) => void;
  private modalElement: HTMLElement | null = null;
  private settings: SettingsData = {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    vibration: true,
    reducedMotion: false,
    language: 'ru'
  };

  constructor(
    screenManager: ScreenManager,
    initialSettings?: Partial<SettingsData>,
    onSettingsChanged?: (settings: SettingsData) => void
  ) {
    this.screenManager = screenManager;
    this.onSettingsChanged = onSettingsChanged;
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  public mount(container: HTMLElement): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = this.modalId;

    modal.innerHTML = `
      <div class="modal-content">
        <h2 class="title-medium">НАСТРОЙКИ</h2>

        <div style="width: 100%; display: flex; flex-direction: column; gap: 14px; font-size: 16px; font-weight: 500;">
          <!-- Музыка -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Музыка 🎵</span>
            <input type="range" id="settingMusic" min="0" max="1" step="0.05" value="${this.settings.musicVolume}" style="accent-color: var(--color-primary-green); width: 110px;" aria-label="Громкость музыки"/>
          </div>

          <!-- Звуки -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Звуки 🔊</span>
            <input type="range" id="settingSfx" min="0" max="1" step="0.05" value="${this.settings.sfxVolume}" style="accent-color: var(--color-primary-green); width: 110px;" aria-label="Громкость звуков"/>
          </div>

          <!-- Вибрация -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Вибрация 📳</span>
            <input type="checkbox" id="settingVibration" ${this.settings.vibration ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-primary-green); cursor: pointer;" aria-label="Вибрация"/>
          </div>

          <!-- Уменьшить анимации (Reduced Motion) -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Уменьшить анимации ✨</span>
            <input type="checkbox" id="settingReducedMotion" ${this.settings.reducedMotion ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-primary-green); cursor: pointer;" aria-label="Уменьшить анимации"/>
          </div>
        </div>

        <button id="btnSettingsClose" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
          НАЗАД
        </button>
      </div>
    `;

    container.appendChild(modal);
    this.modalElement = modal;

    modal.querySelector('#btnSettingsClose')?.addEventListener('click', () => {
      this.close();
    });

    const notify = () => {
      this.onSettingsChanged?.(this.getSettings());
    };

    modal.querySelector('#settingMusic')?.addEventListener('input', (e) => {
      this.settings.musicVolume = parseFloat((e.target as HTMLInputElement).value);
      notify();
    });

    modal.querySelector('#settingSfx')?.addEventListener('input', (e) => {
      this.settings.sfxVolume = parseFloat((e.target as HTMLInputElement).value);
      notify();
    });

    modal.querySelector('#settingVibration')?.addEventListener('change', (e) => {
      this.settings.vibration = (e.target as HTMLInputElement).checked;
      notify();
    });

    modal.querySelector('#settingReducedMotion')?.addEventListener('change', (e) => {
      this.settings.reducedMotion = (e.target as HTMLInputElement).checked;
      notify();
    });
  }

  public open(): void {
    this.syncUI();
    this.screenManager.openModal(this.modalId);
  }

  public close(): void {
    this.screenManager.closeModal(this.modalId);
  }

  public getSettings(): SettingsData {
    return { ...this.settings };
  }

  public updateSettings(settings: SettingsData): void {
    this.settings = { ...settings };
    this.syncUI();
  }

  private syncUI(): void {
    if (!this.modalElement) return;

    const musicInput = this.modalElement.querySelector('#settingMusic') as HTMLInputElement;
    if (musicInput) musicInput.value = `${this.settings.musicVolume}`;

    const sfxInput = this.modalElement.querySelector('#settingSfx') as HTMLInputElement;
    if (sfxInput) sfxInput.value = `${this.settings.sfxVolume}`;

    const vibrationInput = this.modalElement.querySelector('#settingVibration') as HTMLInputElement;
    if (vibrationInput) vibrationInput.checked = this.settings.vibration;

    const motionInput = this.modalElement.querySelector('#settingReducedMotion') as HTMLInputElement;
    if (motionInput) motionInput.checked = this.settings.reducedMotion;
  }
}
