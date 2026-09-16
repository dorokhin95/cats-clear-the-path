import { LevelPerformanceConfig } from './Level';

export interface LevelResult {
  stars: number;
  coins: number;
  comboBonus: number;
  maxCombo: number;
  errors: number;
  completionTimeMs: number;
  performanceScore: number;
  isWin: boolean;
}

export interface PerformanceBreakdown {
  score: number;
  speedScore: number;
  accuracyScore: number;
  comboScore: number;
}

export class GameRules {
  public static readonly COMBO_WINDOW_SEC = 4.5;
  public static readonly STAR_2_THRESHOLD = 60;
  public static readonly STAR_3_THRESHOLD = 85;

  public lives: number = 3;
  public readonly maxLives: number = 3;
  public isUnlimitedLives: boolean = false;
  public errorsCount: number = 0;
  public comboCount: number = 0;
  public maxCombo: number = 0;
  public comboRemainingTime: number = 0;
  public levelNumber: number = 1;

  constructor(levelNumber: number = 1) {
    this.resetForLevel(levelNumber);
  }

  public resetForLevel(levelNumber: number): void {
    this.levelNumber = levelNumber;
    this.lives = this.maxLives;
    this.isUnlimitedLives = levelNumber <= 5; // Уровни 1–5 без ограничения ошибок
    this.errorsCount = 0;
    this.comboCount = 0;
    this.maxCombo = 0;
    this.comboRemainingTime = 0;
  }

  /**
   * Обновляет таймер комбо на каждом кадре геймплея.
   * Возвращает true, если комбо только что сбросилось по таймауту.
   */
  public updateComboTimer(deltaTime: number): boolean {
    if (this.comboRemainingTime > 0) {
      this.comboRemainingTime = Math.max(0, this.comboRemainingTime - deltaTime);
      if (this.comboRemainingTime === 0 && this.comboCount > 0) {
        this.comboCount = 0; // Сброс текущего комбо, но maxCombo не сбрасывается!
        return true;
      }
    }
    return false;
  }

  public onCorrectMove(): number {
    this.comboCount++;
    this.comboRemainingTime = GameRules.COMBO_WINDOW_SEC;
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }
    return this.comboCount;
  }

  public onWrongMove(): { isGameOver: boolean; remainingLives: number } {
    this.comboCount = 0; // Ошибка мгновенно сбрасывает комбо
    this.comboRemainingTime = 0;
    this.errorsCount++;

    if (!this.isUnlimitedLives) {
      this.lives = Math.max(0, this.lives - 1);
    }

    return {
      isGameOver: !this.isUnlimitedLives && this.lives === 0,
      remainingLives: this.lives
    };
  }

  public addLives(amount: number): number {
    this.lives = Math.min(this.maxLives, this.lives + amount);
    return this.lives;
  }

  /**
   * Расчет детализированного рейтинга performanceScore (0–100)
   */
  public calculatePerformanceBreakdown(
    completionTimeMs: number,
    performanceConfig?: LevelPerformanceConfig
  ): PerformanceBreakdown {
    const goldTimeMs = performanceConfig?.goldTimeMs || 25000;
    const silverTimeMs = performanceConfig?.silverTimeMs || 45000;
    const comboTarget = performanceConfig?.comboTarget || 3;

    // 1. Скорость (до 50 баллов)
    let speedScore = 10;
    if (completionTimeMs <= goldTimeMs) {
      speedScore = 50;
    } else if (completionTimeMs <= silverTimeMs) {
      const ratio = (completionTimeMs - goldTimeMs) / Math.max(1, silverTimeMs - goldTimeMs);
      speedScore = 50 - ratio * (50 - 30);
    } else if (completionTimeMs <= silverTimeMs * 2) {
      const ratio = (completionTimeMs - silverTimeMs) / Math.max(1, silverTimeMs);
      speedScore = 30 - ratio * (30 - 10);
    } else {
      speedScore = 10;
    }

    // 2. Точность (до 30 баллов)
    let accuracyScore = 0;
    if (this.errorsCount === 0) {
      accuracyScore = 30;
    } else if (this.errorsCount === 1) {
      accuracyScore = 20;
    } else if (this.errorsCount === 2) {
      accuracyScore = 10;
    } else {
      accuracyScore = 0;
    }

    // 3. Комбо (до 20 баллов)
    const comboScore = Math.min(this.maxCombo / Math.max(1, comboTarget), 1) * 20;

    const totalScore = Math.round(Math.min(100, Math.max(0, speedScore + accuracyScore + comboScore)));

    return {
      score: totalScore,
      speedScore: Math.round(speedScore),
      accuracyScore,
      comboScore: Math.round(comboScore)
    };
  }

  /**
   * Вычисление звезд (минимум 1 звезда за прохождение)
   */
  public calculateStars(performanceScore: number): number {
    const isWin = this.isUnlimitedLives || this.lives > 0;
    if (!isWin) return 0;

    if (performanceScore >= GameRules.STAR_3_THRESHOLD) return 3;
    if (performanceScore >= GameRules.STAR_2_THRESHOLD) return 2;
    return 1; // Завершение уровня = минимум 1 звезда
  }

  public calculateResult(
    completionTimeMs: number = 0,
    performanceConfig?: LevelPerformanceConfig
  ): LevelResult {
    const isWin = this.isUnlimitedLives || this.lives > 0;
    const breakdown = this.calculatePerformanceBreakdown(completionTimeMs, performanceConfig);
    const stars = isWin ? this.calculateStars(breakdown.score) : 0;

    let baseCoins = 0;
    let starCoins = 0;
    let comboBonus = 0;

    if (isWin) {
      baseCoins = 10;
      if (stars === 2) starCoins = 5;
      if (stars === 3) starCoins = 10;
      // Бонус за комбо до +5 монет
      comboBonus = Math.min(5, Math.max(0, Math.floor(this.maxCombo / 2)));
    }

    return {
      stars,
      coins: baseCoins + starCoins + comboBonus,
      comboBonus,
      maxCombo: this.maxCombo,
      errors: this.errorsCount,
      completionTimeMs,
      performanceScore: breakdown.score,
      isWin
    };
  }
}
