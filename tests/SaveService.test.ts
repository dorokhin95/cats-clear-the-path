import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerProgress } from '../src/progression/PlayerProgress';
import { SaveService } from '../src/services/SaveService';

describe('PlayerProgress & SaveService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('должен инициализировать начальный профиль с корректными значениями', () => {
    const progress = new PlayerProgress();
    expect(progress.getLastUnlockedLevel()).toBe(1);
    expect(progress.getCoins()).toBe(0);
    expect(progress.getRemainingHints()).toBe(3);
    expect(progress.isLevelUnlocked(1)).toBe(true);
    expect(progress.isLevelUnlocked(2)).toBe(false);
  });

  it('должен начислять звезды, монеты и открывать следующий уровень', () => {
    const progress = new PlayerProgress();

    progress.completeLevel(1, 3, 20);

    expect(progress.getStarsForLevel(1)).toBe(3);
    expect(progress.getCoins()).toBe(20);
    expect(progress.getLastUnlockedLevel()).toBe(2);
    expect(progress.isLevelUnlocked(2)).toBe(true);
  });

  it('SaveService должен сохранять и загружать прогресс без потерь', () => {
    const progress = new PlayerProgress();
    progress.completeLevel(1, 3, 20);
    progress.completeLevel(2, 2, 15);
    progress.useHint();

    SaveService.save(progress);

    const loaded = SaveService.load();
    expect(loaded.getLastUnlockedLevel()).toBe(3);
    expect(loaded.getStarsForLevel(1)).toBe(3);
    expect(loaded.getStarsForLevel(2)).toBe(2);
    expect(loaded.getCoins()).toBe(35);
    expect(loaded.getRemainingHints()).toBe(2);
  });

  it('SaveService должен безопасно восстанавливаться при повреждении данных в хранилище', () => {
    localStorage.setItem('cats_clear_the_path_save_v1', '{ invalid json: broken }}}');

    const loaded = SaveService.load();
    expect(loaded).toBeInstanceOf(PlayerProgress);
    expect(loaded.getLastUnlockedLevel()).toBe(1);
  });
});
