import { SettingsData } from '../ui/SettingsMenu';

export interface PlayerData {
  saveVersion?: number;
  lastUnlockedLevel: number;
  starsPerLevel: Record<number, number>;
  coins: number;
  unlockedCats: string[];
  selectedCat: string;
  remainingHints: number;
  settings: SettingsData;
  tutorialCompleted: boolean;
  bestTimeMsPerLevel: Record<number, number>;
  bestComboPerLevel: Record<number, number>;
  bestScorePerLevel: Record<number, number>;
  petCount?: number;
}

export class PlayerProgress {
  public static readonly CURRENT_SAVE_VERSION = 2;
  private data: PlayerData;

  constructor(initialData?: Partial<PlayerData>) {
    this.data = {
      saveVersion: PlayerProgress.CURRENT_SAVE_VERSION,
      lastUnlockedLevel: 1,
      starsPerLevel: {},
      coins: 0,
      unlockedCats: ['ginger'],
      selectedCat: 'ginger',
      remainingHints: 3,
      petCount: 0,
      settings: {
        musicVolume: 0.7,
        sfxVolume: 0.8,
        vibration: true,
        reducedMotion: false,
        language: 'ru'
      },
      tutorialCompleted: false,
      bestTimeMsPerLevel: {},
      bestComboPerLevel: {},
      bestScorePerLevel: {},
      ...initialData
    };

    // Гарантируем, что unlockedCats всегда является массивом и накапливает всех разблокированных котиков
    const existingCats: string[] = Array.isArray(initialData?.unlockedCats) && initialData!.unlockedCats.length > 0
      ? initialData!.unlockedCats
      : ['ginger'];

    const catSet = new Set<string>(existingCats);
    catSet.add('ginger');
    if (this.data.selectedCat) {
      catSet.add(this.data.selectedCat);
    }
    this.data.unlockedCats = Array.from(catSet);

    // Гарантируем инициализацию рекордов при частичных данных
    if (!this.data.bestTimeMsPerLevel) this.data.bestTimeMsPerLevel = {};
    if (!this.data.bestComboPerLevel) this.data.bestComboPerLevel = {};
    if (!this.data.bestScorePerLevel) this.data.bestScorePerLevel = {};
    this.data.saveVersion = PlayerProgress.CURRENT_SAVE_VERSION;
  }

  public getData(): PlayerData {
    return JSON.parse(JSON.stringify(this.data));
  }

  public getLastUnlockedLevel(): number {
    return this.data.lastUnlockedLevel;
  }

  /**
   * Возвращает номер максимального фактически завершённого уровня (устраняет ошибку off-by-one)
   */
  public getHighestCompletedLevel(): number {
    return Math.max(0, this.data.lastUnlockedLevel - 1);
  }

  public getCoins(): number {
    return this.data.coins;
  }

  public addCoins(amount: number): number {
    this.data.coins += Math.max(0, amount);
    return this.data.coins;
  }

  public getStarsForLevel(levelId: number): number {
    return this.data.starsPerLevel[levelId] || 0;
  }

  public getTotalStars(): number {
    return Object.values(this.data.starsPerLevel).reduce((acc, stars) => acc + stars, 0);
  }

  public getBestTime(levelId: number): number | undefined {
    return this.data.bestTimeMsPerLevel[levelId];
  }

  public getBestCombo(levelId: number): number | undefined {
    return this.data.bestComboPerLevel[levelId];
  }

  public getBestScore(levelId: number): number | undefined {
    return this.data.bestScorePerLevel[levelId];
  }

  public completeLevel(
    levelId: number,
    stars: number,
    coinsEarned: number,
    timeMs?: number,
    combo?: number,
    score?: number
  ): void {
    // 1. Сохраняем максимум звезд
    const currentStars = this.data.starsPerLevel[levelId] || 0;
    if (stars > currentStars) {
      this.data.starsPerLevel[levelId] = stars;
    }

    // 2. Начисляем монеты
    this.addCoins(coinsEarned);

    // 3. Открываем следующий уровень
    if (levelId >= this.data.lastUnlockedLevel) {
      this.data.lastUnlockedLevel = levelId + 1;
    }

    // 4. Обновляем рекорд по времени (минимальное время)
    if (timeMs !== undefined && timeMs > 0) {
      const prevTime = this.data.bestTimeMsPerLevel[levelId];
      if (!prevTime || timeMs < prevTime) {
        this.data.bestTimeMsPerLevel[levelId] = timeMs;
      }
    }

    // 5. Обновляем рекорд по комбо (максимальное комбо)
    if (combo !== undefined && combo > 0) {
      const prevCombo = this.data.bestComboPerLevel[levelId] || 0;
      if (combo > prevCombo) {
        this.data.bestComboPerLevel[levelId] = combo;
      }
    }

    // 6. Обновляем рекорд по рейтингу (максимальный score 0–100)
    if (score !== undefined && score > 0) {
      const prevScore = this.data.bestScorePerLevel[levelId] || 0;
      if (score > prevScore) {
        this.data.bestScorePerLevel[levelId] = score;
      }
    }
  }

  public isLevelUnlocked(levelId: number): boolean {
    return levelId <= this.data.lastUnlockedLevel;
  }

  public getRemainingHints(): number {
    return this.data.remainingHints;
  }

  public useHint(): boolean {
    if (this.data.remainingHints > 0) {
      this.data.remainingHints--;
      return true;
    }
    return false;
  }

  public addHints(amount: number): void {
    this.data.remainingHints += Math.max(0, amount);
  }

  public getSelectedCat(): string {
    return this.data.selectedCat;
  }

  public selectCat(skinId: string): boolean {
    if (this.isCatUnlocked(skinId)) {
      this.data.selectedCat = skinId;
      return true;
    }
    return false;
  }

  public isCatUnlocked(skinId: string): boolean {
    return this.data.unlockedCats.includes(skinId);
  }

  public buySkin(skinId: string, cost: number): boolean {
    if (this.isCatUnlocked(skinId)) return true;
    if (this.data.coins < cost) return false;

    this.data.coins -= cost;
    const catSet = new Set(this.data.unlockedCats || ['ginger']);
    catSet.add(skinId);
    this.data.unlockedCats = Array.from(catSet);
    this.data.selectedCat = skinId;
    return true;
  }

  public updateSettings(settings: SettingsData): void {
    this.data.settings = { ...settings };
  }

  public getSettings(): SettingsData {
    return { ...this.data.settings };
  }

  public isTutorialCompleted(): boolean {
    return !!this.data.tutorialCompleted;
  }

  public setTutorialCompleted(completed: boolean): void {
    this.data.tutorialCompleted = completed;
  }

  public getPetCount(): number {
    return this.data.petCount || 0;
  }

  public incrementPetCount(): { newCount: number; rewardCoins: number } {
    this.data.petCount = (this.data.petCount || 0) + 1;
    let rewardCoins = 0;
    // Каждые 15 поглаживаний котики дарят игроку 5 монеток
    if (this.data.petCount % 15 === 0) {
      rewardCoins = 5;
      this.addCoins(rewardCoins);
    }
    return { newCount: this.data.petCount, rewardCoins };
  }

  public getPetRank(): { rankName: string; icon: string; nextThreshold: number } {
    const count = this.getPetCount();
    if (count < 10) return { rankName: 'Знакомый котиков', icon: '🐾', nextThreshold: 10 };
    if (count < 30) return { rankName: 'Друг пушистиков', icon: '🧶', nextThreshold: 30 };
    if (count < 60) return { rankName: 'Любимый хозяин', icon: '💖', nextThreshold: 60 };
    if (count < 100) return { rankName: 'Мастер поглаживаний', icon: '👑', nextThreshold: 100 };
    return { rankName: 'Повелитель мурлыканья', icon: '🌟', nextThreshold: 1000000 };
  }
}
