import { PlatformService, PlatformCapabilities, HapticType } from './PlatformService';

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;
  isVerticalSwipesEnabled?: boolean;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  initData?: string;
  initDataUnsafe?: any;
  version?: string;
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  onEvent?(eventType: string, eventHandler: () => void): void;
  offEvent?(eventType: string, eventHandler: () => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export class TelegramPlatformService implements PlatformService {
  public readonly id = 'telegram' as const;

  private capabilities: PlatformCapabilities = {
    cloudSave: false,
    rewardedAds: false,
    interstitialAds: false,
    haptics: true,
    nativeBackButton: true
  };

  private tg: TelegramWebApp | null = null;
  private backButtonHandler: (() => boolean) | null = null;
  private onBackButtonBound: () => void;

  constructor() {
    this.onBackButtonBound = () => {
      if (this.backButtonHandler) {
        const handled = this.backButtonHandler();
        if (!handled) {
          // Если не обработано приложением, скрываем кнопку
          this.tg?.BackButton.hide();
        }
      }
    };
  }

  public async init(): Promise<void> {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.tg = window.Telegram.WebApp;
      try {
        this.tg.ready();
        this.tg.expand();
        if (typeof this.tg.disableVerticalSwipes === 'function') {
          this.tg.disableVerticalSwipes();
          console.log('[TelegramPlatformService] Вертикальные свайпы успешно отключены.');
        }
        this.tg.BackButton.onClick(this.onBackButtonBound);
        console.log('[TelegramPlatformService] Telegram Mini App успешно инициализирован.');
      } catch (e) {
        console.warn('[TelegramPlatformService] Ошибка вызова методов Telegram WebApp:', e);
      }
    } else {
      console.warn('[TelegramPlatformService] Telegram WebApp SDK не обнаружен, fallback режим.');
    }
  }

  public ready(): void {
    try {
      this.tg?.ready();
    } catch {
      // Игнорируем ошибки отсутствия SDK
    }
  }

  public getCapabilities(): PlatformCapabilities {
    return { ...this.capabilities };
  }

  public haptic(type: HapticType): void {
    if (!this.tg?.HapticFeedback) return;

    try {
      switch (type) {
        case 'light':
          this.tg.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          this.tg.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          this.tg.HapticFeedback.impactOccurred('heavy');
          break;
        case 'success':
          this.tg.HapticFeedback.notificationOccurred('success');
          break;
        case 'warning':
          this.tg.HapticFeedback.notificationOccurred('warning');
          break;
        case 'error':
          this.tg.HapticFeedback.notificationOccurred('error');
          break;
      }
    } catch (e) {
      console.warn('[TelegramPlatformService] Ошибка HapticFeedback:', e);
    }
  }

  public setBackButtonHandler(handler: (() => boolean) | null): void {
    this.backButtonHandler = handler;
    if (!this.tg?.BackButton) return;

    if (handler) {
      this.tg.BackButton.show();
    } else {
      this.tg.BackButton.hide();
    }
  }

  public onActivityChanged(handler: (active: boolean) => void): void {
    if (!this.tg?.onEvent) return;

    try {
      this.tg.onEvent('activated', () => handler(true));
      this.tg.onEvent('deactivated', () => handler(false));
    } catch {
      // Некоторые версии клиента не поддерживают activated/deactivated
    }
  }
}
