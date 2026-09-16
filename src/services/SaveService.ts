import { PlayerProgress, PlayerData } from '../progression/PlayerProgress';

export class SaveService {
  public static readonly STORAGE_KEY_V2 = 'cats_clear_the_path_save_v2';
  public static readonly STORAGE_KEY_V1 = 'cats_clear_the_path_save_v1';

  /**
   * Сохраняет состояние игрока в localStorage
   */
  public static save(progress: PlayerProgress): boolean {
    try {
      const data = progress.getData();
      data.saveVersion = PlayerProgress.CURRENT_SAVE_VERSION;
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.STORAGE_KEY_V2, serialized);
      // Также дублируем в V1 для обратной совместимости
      localStorage.setItem(this.STORAGE_KEY_V1, serialized);
      return true;
    } catch (e) {
      console.warn('[SaveService] Ошибка сохранения в localStorage:', e);
      return false;
    }
  }

  /**
   * Загружает состояние игрока из localStorage с безопасной миграцией
   */
  public static load(): PlayerProgress {
    try {
      // 1. Попытка загрузки актуального сохранения V2
      let raw = localStorage.getItem(this.STORAGE_KEY_V2);

      // 2. Если V2 нет, миграция из старого V1
      if (!raw) {
        raw = localStorage.getItem(this.STORAGE_KEY_V1);
        if (raw) {
          console.log('[SaveService] Обнаружено сохранение V1. Выполняется миграция на схему V2...');
        }
      }

      if (!raw) {
        return new PlayerProgress();
      }

      const parsed = JSON.parse(raw) as Partial<PlayerData>;

      // Валидация ключевых полей
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof parsed.lastUnlockedLevel !== 'number' ||
        parsed.lastUnlockedLevel < 1
      ) {
        console.warn('[SaveService] Данные сохранения повреждены. Создается новый профиль.');
        return new PlayerProgress();
      }

      // Безопасная миграция полей рекордов и котиков
      if (!parsed.bestTimeMsPerLevel) parsed.bestTimeMsPerLevel = {};
      if (!parsed.bestComboPerLevel) parsed.bestComboPerLevel = {};
      if (!parsed.bestScorePerLevel) parsed.bestScorePerLevel = {};
      if (typeof parsed.petCount !== 'number') parsed.petCount = 0;
      if (typeof parsed.catPetting !== 'object' || parsed.catPetting === null) {
        parsed.catPetting = {};
      }
      if (!Array.isArray(parsed.unlockedCats) || parsed.unlockedCats.length === 0) {
        parsed.unlockedCats = ['ginger'];
        if (parsed.selectedCat && parsed.selectedCat !== 'ginger') {
          parsed.unlockedCats.push(parsed.selectedCat);
        }
      }
      parsed.saveVersion = PlayerProgress.CURRENT_SAVE_VERSION;

      const progress = new PlayerProgress(parsed);
      // Фиксируем миграцию в V2
      this.save(progress);

      return progress;
    } catch (e) {
      console.warn('[SaveService] Не удалось прочитать сохранение, возврат к значениям по умолчанию:', e);
      return new PlayerProgress();
    }
  }

  /**
   * Сброс всех сохранений
   */
  public static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY_V2);
      localStorage.removeItem(this.STORAGE_KEY_V1);
    } catch (e) {
      console.warn('[SaveService] Ошибка очистки хранилища:', e);
    }
  }
}
