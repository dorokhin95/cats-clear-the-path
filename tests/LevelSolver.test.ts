import { describe, it, expect } from 'vitest';
import { LevelLoader } from '../src/game/LevelLoader';
import { LevelSolver } from '../src/game/LevelSolver';
import { Board } from '../src/game/Board';
import { Cat } from '../src/game/Cat';

describe('LevelSolver & LevelLoader', () => {
  it('все первые 10 уровней обязаны иметь 100% гарантированное решение', () => {
    const totalLevels = LevelLoader.getHandcraftedTotal();
    expect(totalLevels).toBe(10);

    for (let id = 1; id <= totalLevels; id++) {
      const loaded = LevelLoader.loadBoard(id);
      expect(loaded).not.toBeNull();
      if (!loaded) continue;

      const { board, levelData } = loaded;
      const result = LevelSolver.solve(board);

      expect(result.isSolvable).toBe(true);
      expect(result.solutionPath.length).toBe(levelData.cats.length);
      expect(result.initialMovesCount).toBeGreaterThanOrEqual(1);

      // Проверка валидатора
      expect(LevelSolver.validate(board)).toBe(true);
    }
  });

  it('должен правильно распознавать нерешаемый уровень (кольцевой дедлок)', () => {
    // 4 котика в замкнутом цикле взаимной блокировки
    const deadlockBoard = new Board(4, 4);
    deadlockBoard.addCat(new Cat({ id: 1, x: 1, y: 1, direction: 'right' })); // смотрит в 2
    deadlockBoard.addCat(new Cat({ id: 2, x: 2, y: 1, direction: 'down' }));  // смотрит в 3
    deadlockBoard.addCat(new Cat({ id: 3, x: 2, y: 2, direction: 'left' }));  // смотрит в 4
    deadlockBoard.addCat(new Cat({ id: 4, x: 1, y: 2, direction: 'up' }));    // смотрит в 1

    const result = LevelSolver.solve(deadlockBoard);
    expect(result.isSolvable).toBe(false);
    expect(result.solutionPath.length).toBe(0);
    expect(result.initialMovesCount).toBe(0);
    expect(LevelSolver.validate(deadlockBoard)).toBe(false);
  });

  it('должен рассчитывать метрики сложности: maxDependencyDepth, forcedPrefixLength, branchingFactor', () => {
    // Уровень 1: 1 котик
    const l1 = LevelLoader.loadBoard(1)!;
    const res1 = LevelSolver.solve(l1.board);
    expect(res1.maxDependencyDepth).toBe(1);
    expect(res1.forcedPrefixLength).toBe(1);
    expect(res1.branchingFactor).toBe(1);

    // Уровень 3: цепочка из 2 котиков (1 ждет 2)
    const l3 = LevelLoader.loadBoard(3)!;
    const res3 = LevelSolver.solve(l3.board);
    expect(res3.maxDependencyDepth).toBe(2);
    expect(res3.forcedPrefixLength).toBe(2);
    expect(res3.branchingFactor).toBe(1);

    // Выводим метрики для всех уровней 1-10
    const metrics: Array<{ level: number; cats: number; depth: number; forced: number; branch: number; init: number }> = [];
    for (let i = 1; i <= 10; i++) {
      const loaded = LevelLoader.loadBoard(i)!;
      const res = LevelSolver.solve(loaded.board);
      metrics.push({
        level: i,
        cats: loaded.levelData.cats.length,
        depth: res.maxDependencyDepth,
        forced: res.forcedPrefixLength,
        branch: res.branchingFactor,
        init: res.initialMovesCount
      });
    }
    // Проверяем строгие требования ТЗ
    for (let i = 1; i <= 10; i++) {
      const loaded = LevelLoader.loadBoard(i)!;
      const res = LevelSolver.solve(loaded.board);
      expect(res.isSolvable).toBe(true);

      // Уровни 1-3: не более 2 начальных свободных ходов
      if (i <= 3) {
        expect(res.initialMovesCount).toBeLessThanOrEqual(2);
      }

      // Уровни 8-10: глубина зависимости не менее 3
      if (i >= 8) {
        expect(res.maxDependencyDepth).toBeGreaterThanOrEqual(3);
      }

      // Уровень 10: финал главы (>= 7 котиков, depth >= 3)
      if (i === 10) {
        expect(loaded.levelData.cats.length).toBeGreaterThanOrEqual(7);
        expect(res.maxDependencyDepth).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
