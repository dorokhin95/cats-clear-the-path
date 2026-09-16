import { describe, it, expect } from 'vitest';
import { Board } from '../src/game/Board';
import { Cat } from '../src/game/Cat';

describe('Gameplay Flow & Hint System', () => {
  it('должен подсвечивать котика при подсказке и сбрасывать при начале побега', () => {
    const board = new Board(3, 3);
    const cat1 = new Cat({ id: 1, x: 1, y: 1, direction: 'up' });
    board.addCat(cat1);

    expect(cat1.isHinted).toBe(false);

    // Активация подсказки
    const available = board.getAvailableCats();
    expect(available.length).toBe(1);

    available[0].isHinted = true;
    expect(cat1.isHinted).toBe(true);

    // Совершение хода
    cat1.triggerEscape();
    expect(cat1.isHinted).toBe(false); // Подсказка сброшена
    expect(cat1.state).toBe('squashing');
  });

  it('должен сбрасывать подсказку при ошибке (bump)', () => {
    const cat = new Cat({ id: 1, x: 1, y: 1, direction: 'up' });
    cat.isHinted = true;

    cat.triggerBump();
    expect(cat.isHinted).toBe(false);
    expect(cat.state).toBe('bumping');
  });

  it('должен бесшовно разблокировать процедурный уровень 11 после завершения уровня 10', async () => {
    const { PlayerProgress } = await import('../src/progression/PlayerProgress');
    const { LevelLoader } = await import('../src/game/LevelLoader');
    const { LevelSolver } = await import('../src/game/LevelSolver');
    const { LevelSelect } = await import('../src/ui/LevelSelect');

    const progress = new PlayerProgress();
    expect(progress.getLastUnlockedLevel()).toBe(1);

    // Завершаем уровни 1-10
    for (let i = 1; i <= 10; i++) {
      progress.completeLevel(i, 3, 20);
    }

    expect(progress.getLastUnlockedLevel()).toBe(11);

    // Загружаем уровень 11
    const level11 = LevelLoader.loadBoard(11);
    expect(level11).not.toBeNull();
    expect(level11?.board.getCats().length).toBeGreaterThanOrEqual(4);

    // Уровень 11 полностью решаем
    const solveRes = LevelSolver.solve(level11!.board);
    expect(solveRes.isSolvable).toBe(true);

    // Проверяем отображение в LevelSelect с новой системой глав
    const container = document.createElement('div');
    const levelSelect = new LevelSelect(progress, { onSelectLevel: () => {}, onBack: () => {} });
    levelSelect.mount(container);

    // При прогрессе 11 открыта Глава 2 (уровни 11–20), ровно 10 карточек
    expect(levelSelect.getViewingChapterId()).toBe(2);
    const buttonsCh2 = container.querySelectorAll<HTMLButtonElement>('#levelGridContainer button');
    expect(buttonsCh2.length).toBe(10);

    // Кнопка уровня 11 - текущий доступный (▶️)
    const btn11 = buttonsCh2[0];
    expect(btn11.textContent).toContain('11');
    expect(btn11.textContent).toContain('▶️');

    // Кнопка уровня 12 - заблокирована (🔒)
    const btn12 = buttonsCh2[1];
    expect(btn12.textContent).toContain('12');
    expect(btn12.textContent).toContain('🔒');

    // Переход назад на Главу 1 (уровни 1–10)
    const btnPrev = container.querySelector('#btnChapterPrev') as HTMLButtonElement;
    expect(btnPrev.disabled).toBe(false);
    btnPrev.click();

    const buttonsCh1 = container.querySelectorAll<HTMLButtonElement>('#levelGridContainer button');
    expect(buttonsCh1.length).toBe(10);
    // Кнопка уровня 10 в главе 1 - завершена (⭐⭐⭐)
    const btn10 = buttonsCh1[9];
    expect(btn10.textContent).toContain('10');
    expect(btn10.textContent).toContain('⭐⭐⭐');
  });
});
