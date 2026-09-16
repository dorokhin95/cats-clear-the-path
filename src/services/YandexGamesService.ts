import { YandexSDK, YandexPlayer } from '../types/yandex';

export interface YandexServiceOptions {
  interstitialCooldownMs?: number;
  minLevelForAds?: number;
  onAudioMuteRequest?: (mute: boolean) => void;
}

export class YandexGamesService {
  private static instance: YandexGamesService | null = null;
  private ysdk: YandexSDK | null = null;
  private player: YandexPlayer | null = null;
  private isInitialized = false;

  private lastInterstitialTime = 0;
  private interstitialCooldownMs = 60000; // 60 секунд между показами межстраничной рекламы
  private minLevelForAds = 4; // Первые 3 уровня строго без рекламы (п. 2.1 ТЗ)
  private onAudioMuteRequest?: (mute: boolean) => void;

  private constructor() {}

  public static getInstance(): YandexGamesService {
    if (!this.instance) {
      this.instance = new YandexGamesService();
    }
    return this.instance;
  }

  /**
   * Настройка параметров и коллбэков сервиса
   */
  public configure(options: YandexServiceOptions): void {
    if (options.interstitialCooldownMs !== undefined) {
      this.interstitialCooldownMs = options.interstitialCooldownMs;
    }
    if (options.minLevelForAds !== undefined) {
      this.minLevelForAds = options.minLevelForAds;
    }
    if (options.onAudioMuteRequest !== undefined) {
      this.onAudioMuteRequest = options.onAudioMuteRequest;
    }
  }

  /**
   * Инициализация Yandex Games SDK
   */
  public async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (typeof window !== 'undefined' && window.YaGames) {
        this.ysdk = await window.YaGames.init();
        window.ysdk = this.ysdk;
        this.isInitialized = true;
        console.log('[YandexGamesService] SDK успешно инициализирован.');

        // Инициализация игрока для облачных сохранений
        try {
          this.player = await this.ysdk.getPlayer({ scopes: false });
        } catch (playerErr) {
          console.warn('[YandexGamesService] Игрок не авторизован в Яндекс Играх:', playerErr);
        }

        return true;
      } else {
        console.log('[YandexGamesService] YaGames SDK не обнаружен (автономный/локальный режим).');
        return false;
      }
    } catch (err) {
      console.warn('[YandexGamesService] Ошибка при инициализации SDK:', err);
      return false;
    }
  }

  public isAvailable(): boolean {
    return this.isInitialized && this.ysdk !== null;
  }

  /**
   * Оповещение платформы о завершении загрузки ресурсов (LoadingAPI.ready)
   */
  public gameReady(): void {
    if (this.ysdk?.features?.LoadingAPI?.ready) {
      try {
        this.ysdk.features.LoadingAPI.ready();
        console.log('[YandexGamesService] LoadingAPI.ready() успешно вызван.');
      } catch (e) {
        console.warn('[YandexGamesService] Ошибка вызова LoadingAPI.ready:', e);
      }
    }
  }

  /**
   * Показ межстраничной рекламы между уровнями с проверкой таймингов и номера уровня
   */
  public showInterstitial(currentLevelId: number, onClose: (wasShown: boolean) => void): void {
    const now = Date.now();
    const isLevelAllowed = currentLevelId >= this.minLevelForAds;
    const isCooldownElapsed = now - this.lastInterstitialTime >= this.interstitialCooldownMs;

    if (!this.isAvailable() || !isLevelAllowed || !isCooldownElapsed) {
      // Рекламу пока показывать нельзя (или оффлайн режим)
      onClose(false);
      return;
    }

    this.onAudioMuteRequest?.(true);

    try {
      this.ysdk!.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            console.log('[YandexGamesService] Межстраничная реклама открыта.');
          },
          onClose: (wasShown: boolean) => {
            console.log(`[YandexGamesService] Межстраничная реклама закрыта (показана: ${wasShown}).`);
            this.lastInterstitialTime = Date.now();
            this.onAudioMuteRequest?.(false);
            onClose(wasShown);
          },
          onError: (err) => {
            console.warn('[YandexGamesService] Ошибка межстраничной рекламы:', err);
            this.onAudioMuteRequest?.(false);
            onClose(false);
          },
          onOffline: () => {
            console.log('[YandexGamesService] Сеть оффлайн при показе рекламы.');
            this.onAudioMuteRequest?.(false);
            onClose(false);
          }
        }
      });
    } catch (err) {
      console.warn('[YandexGamesService] Ошибка вызова showFullscreenAdv:', err);
      this.onAudioMuteRequest?.(false);
      onClose(false);
    }
  }

  /**
   * Показ рекламы с вознаграждением (Rewarded Video)
   */
  public showRewardedVideo(options: {
    onReward: () => void;
    onClose?: () => void;
    onError?: () => void;
  }): void {
    if (!this.isAvailable()) {
      console.log('[YandexGamesService] Оффлайн/Тестовый режим: имитация выдачи награды за просмотр рекламы.');
      options.onReward();
      options.onClose?.();
      return;
    }

    this.onAudioMuteRequest?.(true);

    try {
      this.ysdk!.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            console.log('[YandexGamesService] Реклама за вознаграждение открыта.');
          },
          onRewarded: () => {
            console.log('[YandexGamesService] Награда получена!');
            options.onReward();
          },
          onClose: () => {
            console.log('[YandexGamesService] Реклама закрыта.');
            this.onAudioMuteRequest?.(false);
            options.onClose?.();
          },
          onError: (err) => {
            console.warn('[YandexGamesService] Ошибка Rewarded видео:', err);
            this.onAudioMuteRequest?.(false);
            options.onError?.();
          }
        }
      });
    } catch (err) {
      console.warn('[YandexGamesService] Исключение при вызове showRewardedVideo:', err);
      this.onAudioMuteRequest?.(false);
      options.onError?.();
    }
  }

  /**
   * Сохранение прогресса в облако Яндекса
   */
  public async saveToCloud(data: Record<string, any>): Promise<boolean> {
    if (!this.player) return false;
    try {
      await this.player.setData(data, true);
      console.log('[YandexGamesService] Прогресс синхронизирован с облаком Яндекса.');
      return true;
    } catch (err) {
      console.warn('[YandexGamesService] Ошибка сохранения в облако:', err);
      return false;
    }
  }

  /**
   * Загрузка прогресса из облака Яндекса
   */
  public async loadFromCloud(): Promise<Record<string, any> | null> {
    if (!this.player) return null;
    try {
      const data = await this.player.getData();
      return data && Object.keys(data).length > 0 ? data : null;
    } catch (err) {
      console.warn('[YandexGamesService] Ошибка загрузки из облака:', err);
      return null;
    }
  }
}
