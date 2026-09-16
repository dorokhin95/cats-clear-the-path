import { PlatformService, PlatformCapabilities, HapticType } from './PlatformService';

export class WebPlatformService implements PlatformService {
  public readonly id = 'web' as const;

  private capabilities: PlatformCapabilities = {
    cloudSave: false,
    rewardedAds: false,
    interstitialAds: false,
    haptics: typeof navigator !== 'undefined' && 'vibrate' in navigator,
    nativeBackButton: false
  };

  public async init(): Promise<void> {
    console.log('[WebPlatformService] Инициализация чистой веб-платформы (GitHub Pages / Standalone).');
  }

  public ready(): void {
    // В чистом веб-окружении дополнительных вызовов не требуется
  }

  public getCapabilities(): PlatformCapabilities {
    return { ...this.capabilities };
  }

  public haptic(type: HapticType): void {
    if (!this.capabilities.haptics || typeof navigator === 'undefined' || !navigator.vibrate) return;

    try {
      switch (type) {
        case 'light':
          navigator.vibrate(20);
          break;
        case 'medium':
          navigator.vibrate(35);
          break;
        case 'heavy':
        case 'error':
          navigator.vibrate([40, 30, 40]);
          break;
        case 'success':
          navigator.vibrate([25, 30, 35]);
          break;
        default:
          navigator.vibrate(25);
      }
    } catch {
      // Игнорируем ограничения политик автовоспроизведения вибраций
    }
  }
}
