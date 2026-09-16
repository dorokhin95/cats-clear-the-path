import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from '../src/game/Game';
import { Board } from '../src/game/Board';
import { Cat } from '../src/game/Cat';
import { GameRules } from '../src/game/GameRules';

class MockRenderer {
  public screenToCanvas(x: number, y: number) { return { x, y }; }
  public canvasToGrid(x: number, y: number) {
    return { gridX: Math.floor(x / 50), gridY: Math.floor(y / 50) };
  }
  public getCellSize() { return 50; }
  public render() {}
  public setShowTrajectories() {}
  public spawnCatPaws() {}
  public spawnVictoryConfetti() {}
}

describe('Timer and Combo System', () => {
  let game: Game;
  let board: Board;
  let renderer: any;

  beforeEach(() => {
    renderer = new MockRenderer();
    game = new Game(renderer);
    board = new Board(3, 3);
    // Добавляем котика, который может убежать вправо
    board.addCat(new Cat({ id: 1, x: 1, y: 1, direction: 'right' }));
    // И второго котика, который заблокирован первым
    board.addCat(new Cat({ id: 2, x: 0, y: 1, direction: 'right' }));
    game.loadBoard(board, 1);
  });

  it('таймер уровня не запускается до первого действия игрока', () => {
    game.start();
    expect(game.isTimerStarted()).toBe(false);
    expect(game.getLevelElapsedMs()).toBe(0);

    // Симулируем 1 секунду холостого хода
    game.step(1.0);
    expect(game.getLevelElapsedMs()).toBe(0);
    expect(game.isTimerStarted()).toBe(false);
  });

  it('таймер запускается после первого тапа по котику и идет при step', () => {
    game.start();
    // Тап по котику 1 (координаты 1, 1 -> 55, 55)
    game.handleTap(55, 55);
    expect(game.isTimerStarted()).toBe(true);

    game.step(0.5);
    expect(game.getLevelElapsedMs()).toBeCloseTo(500, 0);

    game.step(0.5);
    expect(game.getLevelElapsedMs()).toBeCloseTo(1000, 0);
  });

  it('таймер останавливается на паузе и возобновляется при resume', () => {
    game.start();
    game.handleTap(55, 55);
    game.step(0.4);
    expect(game.getLevelElapsedMs()).toBeCloseTo(400, 0);

    game.pause();
    expect(game.isPaused()).toBe(true);

    // На паузе step не должен наращивать время уровня
    game.step(0.5);
    expect(game.getLevelElapsedMs()).toBeCloseTo(400, 0);

    game.resume();
    expect(game.isPaused()).toBe(false);
    game.step(0.3);
    expect(game.getLevelElapsedMs()).toBeCloseTo(700, 0);
  });

  it('комбо корректно продолжается в пределах 4.5с и сбрасывается по таймауту', () => {
    const rules = new GameRules(1);

    // Первый правильный ход
    rules.onCorrectMove();
    expect(rules.comboCount).toBe(1);
    expect(rules.maxCombo).toBe(1);
    expect(rules.comboRemainingTime).toBe(GameRules.COMBO_WINDOW_SEC);

    // Прошло 2 секунды
    rules.updateComboTimer(2.0);
    expect(rules.comboRemainingTime).toBeCloseTo(2.5, 1);
    expect(rules.comboCount).toBe(1);

    // Второй ход в пределах окна -> комбо 2
    rules.onCorrectMove();
    expect(rules.comboCount).toBe(2);
    expect(rules.maxCombo).toBe(2);
    expect(rules.comboRemainingTime).toBe(GameRules.COMBO_WINDOW_SEC);

    // Прошло 4.6 секунды -> таймаут комбо
    const timedOut = rules.updateComboTimer(4.6);
    expect(timedOut).toBe(true);
    expect(rules.comboCount).toBe(0); // Текущее комбо сброшено
    expect(rules.maxCombo).toBe(2);   // Рекорд комбо НЕ сброшен!
  });

  it('ошибка мгновенно сбрасывает текущее комбо и его таймер', () => {
    const rules = new GameRules(1);
    rules.onCorrectMove();
    rules.onCorrectMove();
    expect(rules.comboCount).toBe(2);

    rules.onWrongMove();
    expect(rules.comboCount).toBe(0);
    expect(rules.comboRemainingTime).toBe(0);
    expect(rules.maxCombo).toBe(2);
  });
});
