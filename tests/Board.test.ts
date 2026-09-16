import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../src/game/Board';
import { Cat } from '../src/game/Cat';

describe('Board & Cat escape logic', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(4, 4);
  });

  it('должен позволять котику выйти, если путь до края чист', () => {
    // Котик в (1, 1) смотрит вверх (up). На пути (1, 0) пусто.
    const cat = new Cat({ id: 1, x: 1, y: 1, direction: 'up' });
    board.addCat(cat);

    expect(board.canCatEscape(cat)).toBe(true);
  });

  it('должен блокировать котика, если на пути другой котик', () => {
    // Котик 1 в (1, 2) смотрит вверх (up)
    // Котик 2 в (1, 1) блокирует путь
    const cat1 = new Cat({ id: 1, x: 1, y: 2, direction: 'up' });
    const cat2 = new Cat({ id: 2, x: 1, y: 1, direction: 'right' });

    board.addCat(cat1);
    board.addCat(cat2);

    expect(board.canCatEscape(cat1)).toBe(false);
    expect(board.canCatEscape(cat2)).toBe(true);
  });

  it('должен разблокировать путь после освобождения клетки', () => {
    const cat1 = new Cat({ id: 1, x: 1, y: 2, direction: 'up' });
    const cat2 = new Cat({ id: 2, x: 1, y: 1, direction: 'right' });

    board.addCat(cat1);
    board.addCat(cat2);

    // Котик 2 начинает побег и освобождает клетку
    cat2.triggerEscape();
    board.releaseCell(cat2);

    // Теперь котик 1 может выйти!
    expect(board.canCatEscape(cat1)).toBe(true);
  });

  it('корректно проверяет выходы во все 4 стороны', () => {
    const catUp = new Cat({ id: 1, x: 1, y: 0, direction: 'up' });
    const catDown = new Cat({ id: 2, x: 1, y: 3, direction: 'down' });
    const catLeft = new Cat({ id: 3, x: 0, y: 1, direction: 'left' });
    const catRight = new Cat({ id: 4, x: 3, y: 1, direction: 'right' });

    board.addCat(catUp);
    board.addCat(catDown);
    board.addCat(catLeft);
    board.addCat(catRight);

    expect(board.canCatEscape(catUp)).toBe(true);
    expect(board.canCatEscape(catDown)).toBe(true);
    expect(board.canCatEscape(catLeft)).toBe(true);
    expect(board.canCatEscape(catRight)).toBe(true);
  });

  it('должен считать доску очищенной сразу после removeCatFromPuzzle, даже если котик в состоянии squashing', () => {
    const testBoard = new Board(3, 3);
    const cat = new Cat({ id: 1, x: 1, y: 1, direction: 'up' });
    testBoard.addCat(cat);

    expect(testBoard.isCleared()).toBe(false);
    expect(testBoard.getRemainingCatsCount()).toBe(1);

    // Котик начинает побег
    cat.triggerEscape();
    testBoard.removeCatFromPuzzle(cat);

    // Котик находится в состоянии анимации squashing
    expect(cat.state).toBe('squashing');
    // Но логически клетка пуста, и доска считается очищенной!
    expect(testBoard.getCatAt(1, 1)).toBeNull();
    expect(testBoard.getRemainingCatsCount()).toBe(0);
    expect(testBoard.isCleared()).toBe(true);

    // В клоне доски котика быть не должно
    const clone = testBoard.clone();
    expect(clone.isCleared()).toBe(true);
  });
});
