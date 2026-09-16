import { describe, it, expect } from 'vitest';
import { LevelGenerator, Difficulty } from '../src/game/LevelGenerator';
import { LevelSolver } from '../src/game/LevelSolver';
import { LevelLoader } from '../src/game/LevelLoader';

describe('LevelGenerator', () => {
  it('должен генерировать 100% решаемый уровень для каждой сложности (easy, normal, hard, expert)', () => {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert'];

    for (const diff of difficulties) {
      const generated = LevelGenerator.generate({ difficulty: diff });

      expect(generated.level).toBeDefined();
      expect(generated.board).toBeDefined();
      expect(generated.solverResult.isSolvable).toBe(true);
      expect(generated.solverResult.solutionPath.length).toBe(generated.level.cats.length);

      // Проверка валидности координат и уникальности клеток
      const occupiedCells = new Set<string>();
      for (const cat of generated.level.cats) {
        expect(cat.x).toBeGreaterThanOrEqual(0);
        expect(cat.x).toBeLessThan(generated.level.width);
        expect(cat.y).toBeGreaterThanOrEqual(0);
        expect(cat.y).toBeLessThan(generated.level.height);

        const key = `${cat.x},${cat.y}`;
        expect(occupiedCells.has(key)).toBe(false);
        occupiedCells.add(key);
      }
    }
  });

  it('решение солвера должно полностью очищать игровое поле доски', () => {
    const generated = LevelGenerator.generate({ difficulty: 'normal', catCount: 6 });
    const board = generated.board.clone();

    for (const catId of generated.solverResult.solutionPath) {
      const cat = board.getAllCats().find((c) => c.id === catId);
      expect(cat).toBeDefined();
      if (cat) {
        expect(board.canCatEscape(cat)).toBe(true);
        board.releaseCell(cat);
        cat.state = 'escaped';
      }
    }

    expect(board.isCleared()).toBe(true);
  });

  it('LevelLoader должен бесшовно загружать процедурные уровни выше главы 1', () => {
    const level11 = LevelLoader.loadBoard(11);
    expect(level11).not.toBeNull();
    expect(level11?.levelData.id).toBe(11);
    expect(level11?.board.getAllCats().length).toBeGreaterThan(0);

    const level20 = LevelLoader.loadBoard(20);
    expect(level20).not.toBeNull();
    expect(level20?.levelData.id).toBe(20);

    // Валидация солвером
    expect(LevelSolver.validate(level11!.board)).toBe(true);
    expect(LevelSolver.validate(level20!.board)).toBe(true);
  });

  it('стресс-проверка: пакетная генерация 25 уровней подряд — все 100% solvable', () => {
    for (let i = 1; i <= 25; i++) {
      const diff: Difficulty = i % 2 === 0 ? 'normal' : 'hard';
      const result = LevelGenerator.generate({ difficulty: diff, id: 100 + i });
      expect(result.solverResult.isSolvable).toBe(true);
      expect(result.board.getAllCats().length).toBeGreaterThanOrEqual(3);
    }
  });

  it('детерминированность: генерация с одинаковым seed или id возвращает 100% идентичный уровень', () => {
    const runA = LevelGenerator.generate({ id: 42, difficulty: 'hard' });
    const runB = LevelGenerator.generate({ id: 42, difficulty: 'hard' });

    expect(runA.level.cats.length).toBe(runB.level.cats.length);
    for (let i = 0; i < runA.level.cats.length; i++) {
      const catA = runA.level.cats[i];
      const catB = runB.level.cats[i];
      expect(catA.x).toBe(catB.x);
      expect(catA.y).toBe(catB.y);
      expect(catA.direction).toBe(catB.direction);
      expect(catA.skin).toBe(catB.skin);
    }
  });

  it('строгое соблюдение количества котиков и maxInitialMoves для сложностей hard и expert', () => {
    const hardLevel = LevelGenerator.generate({ difficulty: 'hard', id: 77, catCount: 10 });
    expect(hardLevel.level.cats.length).toBe(10);
    expect(hardLevel.solverResult.initialMovesCount).toBeLessThanOrEqual(2);

    const expertLevel = LevelGenerator.generate({ difficulty: 'expert', id: 88, catCount: 12 });
    expect(expertLevel.level.cats.length).toBe(12);
    expect(expertLevel.solverResult.initialMovesCount).toBeLessThanOrEqual(1);
  });
});
