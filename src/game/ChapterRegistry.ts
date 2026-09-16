export interface ChapterDefinition {
  id: number;
  name: string;
  startLevel: number;
  endLevel: number;
}

const CHAPTER_NAMES: Record<number, string> = {
  1: 'Уютная квартира',
  2: 'Двор',
  3: 'Парк',
  4: 'Крыши',
  5: 'Ночной город'
};

export class ChapterRegistry {
  public static readonly LEVELS_PER_CHAPTER = 10;

  /**
   * Возвращает определение главы по её порядковому номеру
   */
  public static getChapter(chapterId: number): ChapterDefinition {
    const validId = Math.max(1, chapterId);
    const startLevel = (validId - 1) * this.LEVELS_PER_CHAPTER + 1;
    const endLevel = validId * this.LEVELS_PER_CHAPTER;
    const name = CHAPTER_NAMES[validId] || `Новые приключения (Часть ${validId})`;

    return {
      id: validId,
      name,
      startLevel,
      endLevel
    };
  }

  /**
   * Возвращает главу, в которую входит данный уровень
   */
  public static getChapterByLevel(levelId: number): ChapterDefinition {
    const validLevel = Math.max(1, levelId);
    const chapterId = Math.floor((validLevel - 1) / this.LEVELS_PER_CHAPTER) + 1;
    return this.getChapter(chapterId);
  }

  /**
   * Проверяет, разблокирована ли глава для игрока
   */
  public static isChapterUnlocked(chapterId: number, lastUnlockedLevel: number): boolean {
    if (chapterId <= 1) return true;
    const chapter = this.getChapter(chapterId);
    return lastUnlockedLevel >= chapter.startLevel;
  }

  /**
   * Возвращает максимальную разблокированную главу для игрока
   */
  public static getMaxUnlockedChapter(lastUnlockedLevel: number): number {
    return this.getChapterByLevel(lastUnlockedLevel).id;
  }
}
