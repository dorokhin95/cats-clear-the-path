import { describe, it, expect, beforeEach } from 'vitest';
import { GameRules } from '../src/game/GameRules';
import { PlayerProgress } from '../src/progression/PlayerProgress';
import { SaveService } from '../src/services/SaveService';

describe('Performance Stars & Save Records', () => {
  let rules: GameRules;

  beforeEach(() => {
    rules = new GameRules(1);
  });

  it('гарантирует минимум 1 звезду при любом завершении уровня', () => {
    // Очень медленно, 2 ошибки, без комбо
    const result = rules.calculateResult(120000, {
      goldTimeMs: 10000,
      silverTimeMs: 20000,
      comboTarget: 3
    });

    expect(result.isWin).toBe(true);
    expect(result.stars).toBeGreaterThanOrEqual(1);
  });

  it('начисляет 3 звезды при результате >= 85 и 2 звезды при >= 60', () => {
    // Идеальный результат: 0 ошибок (+30), комбо 3/3 (+20), время <= gold (+50) = 100
    rules.onCorrectMove();
    rules.onCorrectMove();
    rules.onCorrectMove();
    const perfect = rules.calculateResult(8000, {
      goldTimeMs: 10000,
      silverTimeMs: 20000,
      comboTarget: 3
    });
    expect(perfect.performanceScore).toBe(100);
    expect(perfect.stars).toBe(3);

    // Средний результат: 1 ошибка (остается 20 за точность), время silver (30 за скорость), комбо 2/3 (13 за комбо) -> ~63
    rules.resetForLevel(1);
    rules.onCorrectMove();
    rules.onCorrectMove();
    rules.onWrongMove();
    const medium = rules.calculateResult(20000, {
      goldTimeMs: 10000,
      silverTimeMs: 20000,
      comboTarget: 3
    });
    expect(medium.performanceScore).toBeGreaterThanOrEqual(60);
    expect(medium.performanceScore).toBeLessThan(85);
    expect(medium.stars).toBe(2);
  });

  it('PlayerProgress сохраняет и улучшает только лучшие рекорды', () => {
    const progress = new PlayerProgress();

    // Первое прохождение уровня 1
    progress.completeLevel(1, 2, 15, 25000, 3, 72);
    expect(progress.getStarsForLevel(1)).toBe(2);
    expect(progress.getBestTime(1)).toBe(25000);
    expect(progress.getBestCombo(1)).toBe(3);
    expect(progress.getBestScore(1)).toBe(72);

    // Второе прохождение: хуже по времени (30000), меньше комбо (2), меньше score (60)
    progress.completeLevel(1, 1, 10, 30000, 2, 60);
    expect(progress.getStarsForLevel(1)).toBe(2); // Звезды не уменьшились
    expect(progress.getBestTime(1)).toBe(25000);   // Время не ухудшилось
    expect(progress.getBestCombo(1)).toBe(3);      // Комбо не ухудшилось
    expect(progress.getBestScore(1)).toBe(72);     // Очки не ухудшились

    // Третье прохождение: рекордное (быстрее, больше комбо, больше очков)
    progress.completeLevel(1, 3, 20, 18000, 5, 95);
    expect(progress.getStarsForLevel(1)).toBe(3);
    expect(progress.getBestTime(1)).toBe(18000);
    expect(progress.getBestCombo(1)).toBe(5);
    expect(progress.getBestScore(1)).toBe(95);
  });

  it('SaveService безопасно мигрирует старое сохранение V1 в схему V2 без потерь', () => {
    // Симулируем старое сохранение V1 в localStorage
    const oldV1Data = {
      lastUnlockedLevel: 15,
      starsPerLevel: { 1: 3, 2: 2, 3: 3 },
      coins: 240,
      unlockedCats: ['ginger', 'smoky'],
      selectedCat: 'smoky',
      remainingHints: 2,
      settings: {
        musicVolume: 0.5,
        sfxVolume: 0.6,
        vibration: false,
        reducedMotion: true,
        language: 'ru'
      },
      tutorialCompleted: true
    };

    localStorage.clear();
    localStorage.setItem(SaveService.STORAGE_KEY_V1, JSON.stringify(oldV1Data));

    // Загрузка через SaveService должна обнаружить V1 и выполнить миграцию
    const loaded = SaveService.load();
    expect(loaded.getLastUnlockedLevel()).toBe(15);
    expect(loaded.getCoins()).toBe(240);
    expect(loaded.isCatUnlocked('smoky')).toBe(true);
    expect(loaded.getSelectedCat()).toBe('smoky');
    expect(loaded.getStarsForLevel(1)).toBe(3);
    expect(loaded.getHighestCompletedLevel()).toBe(14);

    // Новые поля рекордов инициализированы
    expect(loaded.getData().bestTimeMsPerLevel).toBeDefined();
    expect(loaded.getData().bestComboPerLevel).toBeDefined();
    expect(loaded.getData().bestScorePerLevel).toBeDefined();
    expect(loaded.getData().saveVersion).toBe(2);

    // V2 теперь сохранен в localStorage
    expect(localStorage.getItem(SaveService.STORAGE_KEY_V2)).not.toBeNull();
  });
});
