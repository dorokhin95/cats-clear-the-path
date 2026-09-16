import { PlatformService } from './PlatformService';
import { WebPlatformService } from './WebPlatformService';
import { TelegramPlatformService } from './TelegramPlatformService';
import { YandexPlatformService } from './YandexPlatformService';

export class PlatformManager {
  private static instance: PlatformService | null = null;

  public static getPlatform(): PlatformService {
    if (!this.instance) {
      this.instance = this.detectPlatform();
    }
    return this.instance;
  }

  public static setPlatformForTesting(service: PlatformService | null): void {
    this.instance = service;
  }

  private static detectPlatform(): PlatformService {
    if (typeof window === 'undefined') {
      return new WebPlatformService();
    }

    // 1. Возможность явного переопределения через URL query параметр (для разработки и тестов)
    const urlParams = new URLSearchParams(window.location.search);
    const platformOverride = urlParams.get('platform');
    if (platformOverride === 'telegram') {
      return new TelegramPlatformService();
    }
    if (platformOverride === 'yandex') {
      return new YandexPlatformService();
    }
    if (platformOverride === 'web') {
      return new WebPlatformService();
    }

    // 2. Автоопределение окружения Telegram Mini App
    if (
      window.Telegram?.WebApp &&
      (window.Telegram.WebApp.initData || window.Telegram.WebApp.version || (window as any).TelegramWebviewProxy)
    ) {
      return new TelegramPlatformService();
    }

    // 3. Автоопределение окружения Яндекс Игры
    if (
      (window as any).YaGames ||
      window.location.hostname.includes('yandex') ||
      window.location.search.includes('ysdk')
    ) {
      return new YandexPlatformService();
    }

    // 4. По умолчанию чистая Web-версия (GitHub Pages)
    return new WebPlatformService();
  }
}
