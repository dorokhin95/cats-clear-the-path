import { PlayerData } from '../progression/PlayerProgress';

export interface PlatformCapabilities {
  cloudSave: boolean;
  rewardedAds: boolean;
  interstitialAds: boolean;
  haptics: boolean;
  nativeBackButton: boolean;
}

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export interface PlatformService {
  readonly id: 'web' | 'telegram' | 'yandex';
  init(): Promise<void>;
  ready(): void;
  getCapabilities(): PlatformCapabilities;
  saveCloud?(data: PlayerData): Promise<boolean>;
  loadCloud?(): Promise<Partial<PlayerData> | null>;
  showRewarded?(options: { onReward: () => void; onError?: () => void }): void;
  showInterstitial?(levelNumber: number, onClosed?: () => void): void;
  haptic?(type: HapticType): void;
  setBackButtonHandler?(handler: (() => boolean) | null): void;
  onActivityChanged?(handler: (active: boolean) => void): void;
}
