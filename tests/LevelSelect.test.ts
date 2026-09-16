import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LevelSelect } from '../src/ui/LevelSelect';
import { PlayerProgress } from '../src/progression/PlayerProgress';

describe('LevelSelect UI', () => {
  let container: HTMLElement;
  const dummyCallbacks = {
    onSelectLevel: vi.fn(),
    onBack: vi.fn()
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('при прогрессе 1 по умолчанию открывает Главу 1 и рендерит ровно 10 карточек (1–10)', () => {
    const progress = new PlayerProgress({ lastUnlockedLevel: 1 });
    const levelSelect = new LevelSelect(progress, dummyCallbacks);
    levelSelect.mount(container);

    expect(levelSelect.getViewingChapterId()).toBe(1);

    const cards = container.querySelectorAll('.level-card');
    expect(cards.length).toBe(10);
    expect(cards[0].querySelector('.level-card__number')?.textContent).toBe('1');
    expect(cards[9].querySelector('.level-card__number')?.textContent).toBe('10');

    // Кнопка назад заблокирована на главе 1
    const btnPrev = container.querySelector('#btnChapterPrev') as HTMLButtonElement;
    expect(btnPrev.disabled).toBe(true);

    // Кнопка вперед заблокирована, т.к. глава 2 еще не открыта
    const btnNext = container.querySelector('#btnChapterNext') as HTMLButtonElement;
    expect(btnNext.disabled).toBe(true);
  });

  it('при прогрессе 11 по умолчанию открывает Главу 2 (11–20)', () => {
    const progress = new PlayerProgress({ lastUnlockedLevel: 11 });
    const levelSelect = new LevelSelect(progress, dummyCallbacks);
    levelSelect.mount(container);

    expect(levelSelect.getViewingChapterId()).toBe(2);

    const cards = container.querySelectorAll('.level-card');
    expect(cards.length).toBe(10);
    expect(cards[0].querySelector('.level-card__number')?.textContent).toBe('11');
    expect(cards[9].querySelector('.level-card__number')?.textContent).toBe('20');

    // Кнопка назад активна (можно вернуться к главе 1)
    const btnPrev = container.querySelector('#btnChapterPrev') as HTMLButtonElement;
    expect(btnPrev.disabled).toBe(false);

    // Кнопка вперед не активна, так как глава 3 еще закрыта
    const btnNext = container.querySelector('#btnChapterNext') as HTMLButtonElement;
    expect(btnNext.disabled).toBe(true);
  });

  it('при прогрессе 28 отображает Главу 3 с уровнями 21–30', () => {
    const progress = new PlayerProgress({ lastUnlockedLevel: 28 });
    const levelSelect = new LevelSelect(progress, dummyCallbacks);
    levelSelect.mount(container);

    expect(levelSelect.getViewingChapterId()).toBe(3);

    const cards = container.querySelectorAll('.level-card');
    expect(cards.length).toBe(10);
    expect(cards[0].querySelector('.level-card__number')?.textContent).toBe('21');
    expect(cards[9].querySelector('.level-card__number')?.textContent).toBe('30');

    // Уровень 28 - текущий
    expect(cards[7].classList.contains('level-card--current')).toBe(true);
    // Уровни 29 и 30 - заблокированы
    expect(cards[8].classList.contains('level-card--locked')).toBe(true);
    expect(cards[9].classList.contains('level-card--locked')).toBe(true);

    // Глава 4 заблокирована
    const btnNext = container.querySelector('#btnChapterNext') as HTMLButtonElement;
    expect(btnNext.disabled).toBe(true);

    // Переход назад на главу 2 и 1 работает
    const btnPrev = container.querySelector('#btnChapterPrev') as HTMLButtonElement;
    expect(btnPrev.disabled).toBe(false);
    btnPrev.click();
    expect(levelSelect.getViewingChapterId()).toBe(2);
    expect(container.querySelectorAll('.level-card').length).toBe(10);
    expect(container.querySelector('.level-card__number')?.textContent).toBe('11');

    btnPrev.click();
    expect(levelSelect.getViewingChapterId()).toBe(1);
    expect(container.querySelectorAll('.level-card').length).toBe(10);
    expect(container.querySelector('.level-card__number')?.textContent).toBe('1');
    expect(btnPrev.disabled).toBe(true);
  });
});
