import { SettingsData } from '../ui/SettingsMenu';

export interface CatPetStatus {
  level: number;       // 0..100 (процент наглаженности)
  lastPetTime: number; // timestamp Date.now()
}

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
  catPetting?: Record<string, CatPetStatus>;
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
      catPetting: initialData?.catPetting ? { ...initialData.catPetting } : {},
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

    if (!this.data.catPetting) this.data.catPetting = {};

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

  public getUnlockedCats(): string[] {
    return Array.from(new Set(this.data.unlockedCats || ['ginger']));
  }

  /**
   * Возвращает текущий уровень наглаженности конкретного котика (0..100%)
   * Наглаженность постепенно уменьшается со временем (скорость: ~10% в час)
   */
  public getCatPetLevel(catId: string, now: number = Date.now()): number {
    if (!this.data.catPetting) {
      this.data.catPetting = {};
    }
    const status = this.data.catPetting[catId];
    if (!status) {
      // Начальный базовый уровень для нового котика - 40% (спокоен, не расстроен)
      return 40;
    }
    const elapsedMs = Math.max(0, now - status.lastPetTime);
    const elapsedHours = elapsedMs / (1000 * 3600);
    const decay = elapsedHours * 10; // -10% за каждый час
    return Math.max(0, Math.min(100, Math.round(status.level - decay)));
  }

  /**
   * Возвращает иконку эмоции котика и текстовое состояние на основе процента наглаженности
   */
  public getCatEmotion(level: number): { emoji: string; statusText: string; color: string } {
    if (level >= 80) return { emoji: '💖', statusText: 'Обожает вас!', color: '#E91E63' };
    if (level >= 50) return { emoji: '😺', statusText: 'Доволен и мурчит', color: '#4CAF50' };
    if (level >= 25) return { emoji: '🐱', statusText: 'Спокоен', color: '#FFA000' };
    if (level >= 1) return { emoji: '🥺', statusText: 'Хочет ласки', color: '#FF7043' };
    return { emoji: '😿', statusText: 'Очень скучает', color: '#9E9E9E' };
  }

  /**
   * Проверяет, наглажены ли ВСЕ разблокированные котики до 100%
   */
  public areAllCatsFullyPetted(now: number = Date.now()): boolean {
    const unlocked = this.getUnlockedCats();
    if (unlocked.length === 0) return false;
    return unlocked.every(catId => this.getCatPetLevel(catId, now) >= 100);
  }

  /**
   * Средний уровень счастья и уюта в домике (0..100%)
   */
  public getAveragePetLevel(now: number = Date.now()): number {
    const unlocked = this.getUnlockedCats();
    if (unlocked.length === 0) return 0;
    const sum = unlocked.reduce((acc, catId) => acc + this.getCatPetLevel(catId, now), 0);
    return Math.round(sum / unlocked.length);
  }

  /**
   * Погладить конкретного котика:
   * - Добавляет +25% к наглаженности (до 100%)
   * - Фиксирует timestamp поглаживания
   * - Если ВСЕ котики в доме достигли 100%, начисляет скрытый бонус (+15 монет)
   */
  public petCat(catId: string, now: number = Date.now()): { newLevel: number; allMaxBonus: boolean; rewardCoins: number } {
    if (!this.data.catPetting) {
      this.data.catPetting = {};
    }
    this.data.petCount = (this.data.petCount || 0) + 1;

    // Были ли все котики на 100% ДО этого поглаживания?
    const wasAllHappy = this.areAllCatsFullyPetted(now);

    const currentLevel = this.getCatPetLevel(catId, now);
    const newLevel = Math.min(100, currentLevel + 25);

    this.data.catPetting[catId] = {
      level: newLevel,
      lastPetTime: now
    };

    // Стали ли теперь ВСЕ котики 100%?
    const isAllHappyNow = this.areAllCatsFullyPetted(now);
    let allMaxBonus = false;
    let rewardCoins = 0;

    if (!wasAllHappy && isAllHappyNow) {
      allMaxBonus = true;
      rewardCoins = 15;
      this.addCoins(rewardCoins);
    }

    return { newLevel, allMaxBonus, rewardCoins };
  }

  public getPetCount(): number {
    return this.data.petCount || 0;
  }

  public incrementPetCount(): { newCount: number; rewardCoins: number } {
    this.data.petCount = (this.data.petCount || 0) + 1;
    let rewardCoins = 0;
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
