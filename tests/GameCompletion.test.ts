import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Game } from '../src/game/Game';
import { Board } from '../src/game/Board';
import { Cat } from '../src/game/Cat';
import { LevelLoader } from '../src/game/LevelLoader';
import { LevelSolver } from '../src/game/LevelSolver';
import { Renderer } from '../src/rendering/Renderer';

describe('Game Completion & Real Gameplay Flow (Регрессионные тесты победы)', () => {
  let fakeRenderer: Renderer;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 700;
    canvas.getContext = vi.fn().mockReturnValue(
      new Proxy({}, {
        get: (_target, prop) => {
          if (prop === 'canvas') return canvas;
          return vi.fn();
        }
      })
    );
    fakeRenderer = new Renderer(canvas);
  });

  it('Уровень 1 должен реально завершаться победой с вызовом onLevelComplete ровно 1 раз', () => {
    let completeCalls = 0;
    let winResult: any = null;

    const game = new Game(fakeRenderer, {
      onLevelComplete: (result) => {
        completeCalls++;
        winResult = result;
      }
    });

    const board = new Board(3, 3);
    const cat = new Cat({ id: 1, x: 1, y: 1, direction: 'right' });
    board.addCat(cat);

    game.loadBoard(board, 1);
    game.start();

    // 1. Игрок нажимает на котика со свободным выходом вправо
    const tapped = game.processCellTap(1, 1);
    expect(tapped).toBe(true);

    // В момент анимации squashing поле логически уже должно быть пустым
    expect(board.isCleared()).toBe(true);
    expect(board.getRemainingCatsCount()).toBe(0);

    // До истечения таймера задержки победы (500 мс) коллбэк еще не вызван
    game.step(0.2);
    expect(completeCalls).toBe(0);

    // Прошло более 500 мс — победа должна зафиксироваться
    game.step(0.4);
    expect(completeCalls).toBe(1);
    expect(winResult).not.toBeNull();
    expect(winResult.stars).toBe(3);

    // Последующие шаги таймера НЕ должны приводить к повторным вызовам
    game.step(0.5);
    game.step(0.5);
    expect(completeCalls).toBe(1);
  });

  it('все 10 ручных уровней Главы 1 должны реально завершаться победой через Game.processCellTap', () => {
    for (let levelId = 1; levelId <= 10; levelId++) {
      let completeCalls = 0;
      let finalResult: any = null;

      const game = new Game(fakeRenderer, {
        onLevelComplete: (result) => {
          completeCalls++;
          finalResult = result;
        }
      });

      const loaded = LevelLoader.loadBoard(levelId);
      expect(loaded).not.toBeNull();
      if (!loaded) continue;

      const totalCats = loaded.board.getCats().length;
      // Получаем эталонное решение через LevelSolver
      const solverResult = LevelSolver.solve(loaded.board);
      expect(solverResult.isSolvable).toBe(true);
      expect(solverResult.solutionPath.length).toBe(totalCats);

      game.loadBoard(loaded.board, levelId);
      game.start();

      // Выполняем каждый ход солвера через реальный метод processCellTap
      for (const catId of solverResult.solutionPath) {
        // Находим текущее положение котика на поле
        const cat = game.getBoard().getCats().find((c) => c.id === catId);
        expect(cat).toBeDefined();
        if (!cat) break;

        const tapped = game.processCellTap(cat.x, cat.y);
        expect(tapped).toBe(true);
      }

      // После всех ходов поле должно быть логически очищено
      expect(game.getBoard().isCleared()).toBe(true);

      // Проматываем задержку победы
      game.step(0.6);

      // Проверяем победу
      expect(completeCalls).toBe(1);
      expect(finalResult).not.toBeNull();
      expect(finalResult.stars).toBeGreaterThanOrEqual(1);
    }
  });
});
