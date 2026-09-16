import { describe, it, expect } from 'vitest';
import { GameRules } from '../src/game/GameRules';

describe('GameRules', () => {
  it('на уровнях 1–5 жизни должны быть бесконечными', () => {
    const rules = new GameRules(1);
    expect(rules.isUnlimitedLives).toBe(true);

    const result = rules.onWrongMove();
    expect(result.isGameOver).toBe(false);
    expect(rules.lives).toBe(3); // Не отнимаются
  });

  it('на уровнях 6+ ошибки отнимают жизни и приводят к поражению на 3-й', () => {
    const rules = new GameRules(6);
    expect(rules.isUnlimitedLives).toBe(false);

    expect(rules.onWrongMove().isGameOver).toBe(false);
    expect(rules.lives).toBe(2);

    expect(rules.onWrongMove().isGameOver).toBe(false);
    expect(rules.lives).toBe(1);

    expect(rules.onWrongMove().isGameOver).toBe(true);
    expect(rules.lives).toBe(0);
  });

  it('правильный ход увеличивает комбо, а ошибка сбрасывает', () => {
    const rules = new GameRules(1);
    expect(rules.onCorrectMove()).toBe(1);
    expect(rules.onCorrectMove()).toBe(2);
    expect(rules.onCorrectMove()).toBe(3);
    expect(rules.maxCombo).toBe(3);

    rules.onWrongMove();
    expect(rules.comboCount).toBe(0);
    expect(rules.maxCombo).toBe(3); // Рекорд сохраняется
  });

  it('правильно рассчитывает звезды и монеты при победе', () => {
    const rules = new GameRules(1);
    rules.onCorrectMove();
    rules.onCorrectMove();

    // 0 ошибок = 3 звезды (10 база + 10 за 3 звезды + 1 комбо бонус = 21)
    const result = rules.calculateResult();
    expect(result.stars).toBe(3);
    expect(result.coins).toBe(21);
    expect(result.isWin).toBe(true);
  });
});
