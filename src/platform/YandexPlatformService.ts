import { PlatformService, PlatformCapabilities } from './PlatformService';
import { YandexGamesService } from '../services/YandexGamesService';
import { PlayerData } from '../progression/PlayerProgress';

export class YandexPlatformService implements PlatformService {
  public readonly id = 'yandex' as const;
  private yandexService: YandexGamesService;

  private capabilities: PlatformCapabilities = {
    cloudSave: true,
    rewardedAds: true,
    interstitialAds: true,
    haptics: false,
    nativeBackButton: false
  };

  constructor() {
    this.yandexService = YandexGamesService.getInstance();
  }

  public async init(): Promise<void> {
    if (
      typeof window !== 'undefined' &&
      !(window as any).YaGames &&
      !document.querySelector('script[src*="yandex.ru/games/sdk"]')
    ) {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://yandex.ru/games/sdk/v2';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          console.warn('[YandexPlatformService] Не удалось загрузить Yandex SDK скрипт');
          resolve();
        };
        document.head.appendChild(script);
      });
    }
    await this.yandexService.init();
  }

  public ready(): void {
    this.yandexService.gameReady();
  }

  public getCapabilities(): PlatformCapabilities {
    return { ...this.capabilities };
  }

  public async saveCloud(data: PlayerData): Promise<boolean> {
    return this.yandexService.saveToCloud(data);
  }

  public async loadCloud(): Promise<Partial<PlayerData> | null> {
    return this.yandexService.loadFromCloud();
  }

  public showRewarded(options: { onReward: () => void; onError?: () => void }): void {
    this.yandexService.showRewardedVideo({
      onReward: options.onReward,
      onError: options.onError
    });
  }

  public showInterstitial(levelNumber: number, onClosed?: () => void): void {
    this.yandexService.showInterstitial(levelNumber, (_wasShown: boolean) => {
      onClosed?.();
    });
  }
}
