import { describe, it, expect } from 'vitest';
import { LevelGenerator, Difficulty } from '../src/game/LevelGenerator';
import { LevelSolver } from '../src/game/LevelSolver';

describe('Массовое стресс-тестирование генератора и солвера (Stress QA)', () => {
  it('должен сгенерировать 1000 уровней подряд на всех сложностях со 100% валидным решением (1000/1000 QA)', () => {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert'];
    let solvedCount = 0;
    const totalToGenerate = 1000;

    for (let i = 0; i < totalToGenerate; i++) {
      const diff = difficulties[i % difficulties.length];
      const result = LevelGenerator.generate({
        difficulty: diff,
        id: 1000 + i
      });

      expect(result.solverResult.isSolvable).toBe(true);
      expect(result.solverResult.solutionPath.length).toBe(result.level.cats.length);

      // Проверка соблюдения maxInitialMoves
      const defaults = LevelGenerator.getDifficultyDefaults(diff);
      expect(result.solverResult.initialMovesCount).toBeLessThanOrEqual(defaults.maxInitialMoves);

      // Валидация солвером
      const isValid = LevelSolver.validate(result.board);
      expect(isValid).toBe(true);

      if (isValid) solvedCount++;
    }

    expect(solvedCount).toBe(totalToGenerate);
  }, 30000);

  it('симуляция полного прохождения сгенерированного уровня экспертной сложности (6x6)', () => {
    const generated = LevelGenerator.generate({
      difficulty: 'expert',
      id: 9999
    });

    expect(generated.solverResult.isSolvable).toBe(true);
    const board = generated.board.clone();

    // Проходим уровень по цепочке ходов солвера
    for (const catId of generated.solverResult.solutionPath) {
      const cat = board.getAllCats().find((c) => c.id === catId);
      expect(cat).toBeDefined();
      if (cat) {
        expect(board.canCatEscape(cat)).toBe(true);
        board.releaseCell(cat);
        cat.state = 'escaped';
      }
    }

    // Поле должно быть полностью очищено
    expect(board.isCleared()).toBe(true);
    expect(board.getRemainingCatsCount()).toBe(0);
  });
});
