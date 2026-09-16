export interface YandexPlayer {
  getUniqueID(): string;
  getName(): string;
  getPhoto(size: 'small' | 'medium' | 'large'): string;
  getData(keys?: string[]): Promise<Record<string, any>>;
  setData(data: Record<string, any>, flush?: boolean): Promise<void>;
  getStats(keys?: string[]): Promise<Record<string, number>>;
  setStats(stats: Record<string, number>): Promise<void>;
  incrementStats(increments: Record<string, number>): Promise<Record<string, number>>;
}

export interface YandexAdvCallbacks {
  onOpen?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: any) => void;
  onOffline?: () => void;
}

export interface YandexRewardedCallbacks {
  onOpen?: () => void;
  onRewarded?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}

export interface YandexSDK {
  features?: {
    LoadingAPI?: {
      ready: () => void;
    };
  };
  adv: {
    showFullscreenAdv: (options: { callbacks?: YandexAdvCallbacks }) => void;
    showRewardedVideo: (options: { callbacks?: YandexRewardedCallbacks }) => void;
  };
  getPlayer: (options?: { scopes?: boolean }) => Promise<YandexPlayer>;
  feedback?: {
    canReview: () => Promise<{ value: boolean; reason?: string }>;
    requestReview: () => Promise<{ value: boolean }>;
  };
}

declare global {
  interface Window {
    YaGames?: {
      init: () => Promise<YandexSDK>;
    };
    ysdk?: YandexSDK;
  }
}
