import { Board } from './Board';
import { Cat } from './Cat';
import { LevelData } from './Level';
import { CHAPTER_1_LEVELS } from './levels/chapter1';
import { LevelGenerator, Difficulty } from './LevelGenerator';

export class LevelLoader {
  private static levels: Map<number, LevelData> = new Map();

  static {
    for (const lvl of CHAPTER_1_LEVELS) {
      this.levels.set(lvl.id, lvl);
    }
  }

  public static getLevel(id: number): LevelData | undefined {
    if (!this.levels.has(id)) {
      // Процедурная генерация для бесконечных уровней после главы 1
      let diff: Difficulty = 'normal';
      if (id <= 15) diff = 'normal';
      else if (id <= 25) diff = 'hard';
      else diff = 'expert';

      const generated = LevelGenerator.generate({ id, difficulty: diff });
      this.levels.set(id, generated.level);
    }
    return this.levels.get(id);
  }

  public static getHandcraftedTotal(): number {
    return CHAPTER_1_LEVELS.length;
  }

  public static getTotalLevels(): number {
    return Math.max(this.levels.size, 10);
  }

  /**
   * Преобразует данные уровня LevelData в рабочий экземпляр Board с котиками
   */
  public static loadBoard(levelId: number): { board: Board; levelData: LevelData } | null {
    const data = this.getLevel(levelId);
    if (!data) return null;

    const board = new Board(data.width, data.height);
    for (const catData of data.cats) {
      const cat = new Cat({
        id: catData.id,
        x: catData.x,
        y: catData.y,
        direction: catData.direction,
        skin: catData.skin || 'ginger'
      });
      board.addCat(cat);
    }

    return { board, levelData: data };
  }
}
