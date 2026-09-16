import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YandexGamesService } from '../src/services/YandexGamesService';
import { YandexSDK } from '../src/types/yandex';

describe('YandexGamesService', () => {
  let service: YandexGamesService;

  beforeEach(() => {
    // Сброс состояния перед каждым тестом
    service = YandexGamesService.getInstance();
    // Очищаем моки глобального окна
    delete (window as any).YaGames;
    delete (window as any).ysdk;
  });

  it('должен корректно работать в автономном Fallback-режиме при отсутствии SDK', async () => {
    const initialized = await service.init();
    expect(initialized).toBe(false);
    expect(service.isAvailable()).toBe(false);

    // Вызов gameReady не должен приводить к ошибкам
    expect(() => service.gameReady()).not.toThrow();

    // Межстраничная реклама не должна запускаться
    let interstitialShown = true;
    service.showInterstitial(5, (shown) => {
      interstitialShown = shown;
    });
    expect(interstitialShown).toBe(false);

    // Rewarded видео должно отдавать награду в тестовом режиме
    let rewardGranted = false;
    service.showRewardedVideo({
      onReward: () => {
        rewardGranted = true;
      }
    });
    expect(rewardGranted).toBe(true);
  });

  it('не должен показывать рекламу на уровнях 1-3 согласно правилам ТЗ', () => {
    let adShown = true;
    // Уровень 1
    service.showInterstitial(1, (shown) => {
      adShown = shown;
    });
    expect(adShown).toBe(false);

    // Уровень 3
    service.showInterstitial(3, (shown) => {
      adShown = shown;
    });
    expect(adShown).toBe(false);
  });

  it('должен корректно взаимодействовать с SDK при его наличии', async () => {
    let readyCalled = false;
    let fullscreenShown = false;
    let mutedStates: boolean[] = [];

    const mockSDK: Partial<YandexSDK> = {
      features: {
        LoadingAPI: {
          ready: () => {
            readyCalled = true;
          }
        }
      },
      adv: {
        showFullscreenAdv: (opts) => {
          fullscreenShown = true;
          opts.callbacks?.onOpen?.();
          opts.callbacks?.onClose?.(true);
        },
        showRewardedVideo: (opts) => {
          opts.callbacks?.onOpen?.();
          opts.callbacks?.onRewarded?.();
          opts.callbacks?.onClose?.();
        }
      },
      getPlayer: vi.fn().mockResolvedValue({
        getUniqueID: () => 'user123',
        getName: () => 'Tester',
        getPhoto: () => '',
        getData: vi.fn().mockResolvedValue({ lastUnlockedLevel: 5 }),
        setData: vi.fn().mockResolvedValue(undefined),
        getStats: vi.fn(),
        setStats: vi.fn(),
        incrementStats: vi.fn()
      })
    };

    (window as any).YaGames = {
      init: vi.fn().mockResolvedValue(mockSDK)
    };

    // Принудительно сбрасываем флаг инициализации для теста
    (service as any).isInitialized = false;
    (service as any).ysdk = null;
    (service as any).player = null;

    service.configure({
      interstitialCooldownMs: 0,
      minLevelForAds: 4,
      onAudioMuteRequest: (mute) => {
        mutedStates.push(mute);
      }
    });

    const initResult = await service.init();
    expect(initResult).toBe(true);
    expect(service.isAvailable()).toBe(true);

    // Проверка gameReady
    service.gameReady();
    expect(readyCalled).toBe(true);

    // Проверка показа межстраничной рекламы на уровне 5
    let adCallbackResult: boolean | null = null;
    service.showInterstitial(5, (shown) => {
      adCallbackResult = shown;
    });

    expect(fullscreenShown).toBe(true);
    expect(adCallbackResult).toBe(true);
    // Проверка глушения и восстановления звука: mute(true) -> mute(false)
    expect(mutedStates).toEqual([true, false]);

    // Проверка облачных сохранений
    const cloudData = await service.loadFromCloud();
    expect(cloudData).toEqual({ lastUnlockedLevel: 5 });

    const saved = await service.saveToCloud({ coins: 150 });
    expect(saved).toBe(true);
  });
});
