import { describe, it, expect, beforeEach } from 'vitest';
import { WebPlatformService } from '../src/platform/WebPlatformService';
import { TelegramPlatformService } from '../src/platform/TelegramPlatformService';
import { YandexPlatformService } from '../src/platform/YandexPlatformService';
import { PlatformManager } from '../src/platform/PlatformManager';

describe('Platform Architecture', () => {
  beforeEach(() => {
    PlatformManager.setPlatformForTesting(null);
  });

  it('WebPlatformService имеет корректные capabilities без рекламы', () => {
    const web = new WebPlatformService();
    const caps = web.getCapabilities();

    expect(web.id).toBe('web');
    expect(caps.rewardedAds).toBe(false);
    expect(caps.interstitialAds).toBe(false);
    expect(caps.cloudSave).toBe(false);
    expect(caps.nativeBackButton).toBe(false);
  });

  it('TelegramPlatformService поддерживает BackButton и Haptics без Yandex-рекламы', () => {
    const tg = new TelegramPlatformService();
    const caps = tg.getCapabilities();

    expect(tg.id).toBe('telegram');
    expect(caps.rewardedAds).toBe(false);
    expect(caps.interstitialAds).toBe(false);
    expect(caps.nativeBackButton).toBe(true);
    expect(caps.haptics).toBe(true);
  });

  it('YandexPlatformService поддерживает рекламу и облачные сохранения', () => {
    const yandex = new YandexPlatformService();
    const caps = yandex.getCapabilities();

    expect(yandex.id).toBe('yandex');
    expect(caps.rewardedAds).toBe(true);
    expect(caps.interstitialAds).toBe(true);
    expect(caps.cloudSave).toBe(true);
  });

  it('PlatformManager по умолчанию выбирает WebPlatformService для чистого веба', () => {
    const platform = PlatformManager.getPlatform();
    expect(platform.id).toBe('web');
    expect(platform.getCapabilities().rewardedAds).toBe(false);
  });
});
