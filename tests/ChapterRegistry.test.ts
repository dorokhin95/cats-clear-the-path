import { describe, it, expect } from 'vitest';
import { ChapterRegistry } from '../src/game/ChapterRegistry';

describe('ChapterRegistry', () => {
  it('корректно определяет главу по номеру уровня', () => {
    expect(ChapterRegistry.getChapterByLevel(1).id).toBe(1);
    expect(ChapterRegistry.getChapterByLevel(5).id).toBe(1);
    expect(ChapterRegistry.getChapterByLevel(10).id).toBe(1);

    expect(ChapterRegistry.getChapterByLevel(11).id).toBe(2);
    expect(ChapterRegistry.getChapterByLevel(20).id).toBe(2);

    expect(ChapterRegistry.getChapterByLevel(21).id).toBe(3);
    expect(ChapterRegistry.getChapterByLevel(28).id).toBe(3);
    expect(ChapterRegistry.getChapterByLevel(30).id).toBe(3);

    expect(ChapterRegistry.getChapterByLevel(31).id).toBe(4);
  });

  it('содержит ровно 10 уровней на главу с правильными диапазонами', () => {
    const ch1 = ChapterRegistry.getChapter(1);
    expect(ch1.startLevel).toBe(1);
    expect(ch1.endLevel).toBe(10);
    expect(ch1.name).toBe('Уютная квартира');

    const ch2 = ChapterRegistry.getChapter(2);
    expect(ch2.startLevel).toBe(11);
    expect(ch2.endLevel).toBe(20);
    expect(ch2.name).toBe('Двор');

    const ch3 = ChapterRegistry.getChapter(3);
    expect(ch3.startLevel).toBe(21);
    expect(ch3.endLevel).toBe(30);
    expect(ch3.name).toBe('Парк');
  });

  it('проверяет доступность глав в зависимости от прогресса игрока', () => {
    // При прогрессе 1 доступна только 1 глава
    expect(ChapterRegistry.isChapterUnlocked(1, 1)).toBe(true);
    expect(ChapterRegistry.isChapterUnlocked(2, 1)).toBe(false);
    expect(ChapterRegistry.getMaxUnlockedChapter(1)).toBe(1);

    // При прогрессе 11 доступна 1 и 2 главы
    expect(ChapterRegistry.isChapterUnlocked(1, 11)).toBe(true);
    expect(ChapterRegistry.isChapterUnlocked(2, 11)).toBe(true);
    expect(ChapterRegistry.isChapterUnlocked(3, 11)).toBe(false);
    expect(ChapterRegistry.getMaxUnlockedChapter(11)).toBe(2);

    // При прогрессе 28 доступны главы 1, 2, 3; глава 4 заблокирована
    expect(ChapterRegistry.isChapterUnlocked(1, 28)).toBe(true);
    expect(ChapterRegistry.isChapterUnlocked(2, 28)).toBe(true);
    expect(ChapterRegistry.isChapterUnlocked(3, 28)).toBe(true);
    expect(ChapterRegistry.isChapterUnlocked(4, 28)).toBe(false);
    expect(ChapterRegistry.getMaxUnlockedChapter(28)).toBe(3);
  });
});
