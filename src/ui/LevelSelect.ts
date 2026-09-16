import { IScreen } from './ScreenManager';
import { PlayerProgress } from '../progression/PlayerProgress';
import { ChapterRegistry, ChapterDefinition } from '../game/ChapterRegistry';

export interface LevelSelectCallbacks {
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export class LevelSelect implements IScreen {
  public readonly id = 'level-select';
  private element: HTMLElement | null = null;
  private callbacks: LevelSelectCallbacks;
  private progress: PlayerProgress;
  private viewingChapterId: number = 1;

  constructor(progress: PlayerProgress, callbacks: LevelSelectCallbacks) {
    this.progress = progress;
    this.callbacks = callbacks;
    this.viewingChapterId = ChapterRegistry.getChapterByLevel(progress.getLastUnlockedLevel()).id;
  }

  public mount(container: HTMLElement): void {
    const screen = document.createElement('div');
    screen.className = 'ui-screen ui-screen--opaque';
    screen.id = 'screen-level-select';
    screen.style.padding = '16px 20px';
    screen.style.justifyContent = 'flex-start';
    screen.style.alignItems = 'center';
    screen.style.gap = '14px';
    screen.style.overflowY = 'auto';

    screen.innerHTML = `
      <!-- Верхняя панель с кнопкой назад -->
      <div style="width: 100%; max-width: 380px; display: flex; justify-content: space-between; align-items: center;">
        <button id="btnLevelSelectBack" class="btn btn-icon" title="В главное меню" aria-label="В главное меню">🏠</button>
        <h2 class="title-medium" style="margin: 0; font-size: 22px;">ВЫБОР УРОВНЯ</h2>
        <div style="width: 48px;"></div>
      </div>

      <!-- Навигация по главам: ◀ Глава X: Название ▶ -->
      <div class="chapter-nav-bar">
        <button id="btnChapterPrev" class="chapter-nav-btn" aria-label="Предыдущая глава">◀</button>
        <div class="chapter-header-box">
          <div id="chapterTitleText" class="chapter-title">Глава 1: Уютная квартира</div>
          <div id="chapterStarsText" class="chapter-stars">⭐ 0 / 30</div>
        </div>
        <button id="btnChapterNext" class="chapter-nav-btn" aria-label="Следующая глава">▶</button>
      </div>

      <!-- Сетка уровней главы: строго 10 карточек (5x2) -->
      <div id="levelGridContainer" class="level-grid-container">
        <!-- Генерируется динамически -->
      </div>
    `;

    container.appendChild(screen);
    this.element = screen;

    screen.querySelector('#btnLevelSelectBack')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    const btnPrev = screen.querySelector('#btnChapterPrev') as HTMLButtonElement;
    btnPrev?.addEventListener('click', () => {
      if (this.viewingChapterId > 1) {
        this.viewingChapterId--;
        this.renderChapter();
      }
    });

    const btnNext = screen.querySelector('#btnChapterNext') as HTMLButtonElement;
    btnNext?.addEventListener('click', () => {
      const lastUnlocked = this.progress.getLastUnlockedLevel();
      if (ChapterRegistry.isChapterUnlocked(this.viewingChapterId + 1, lastUnlocked)) {
        this.viewingChapterId++;
        this.renderChapter();
      }
    });

    this.renderChapter();
  }

  public renderChapter(): void {
    if (!this.element) return;

    const chapter: ChapterDefinition = ChapterRegistry.getChapter(this.viewingChapterId);
    const lastUnlocked = this.progress.getLastUnlockedLevel();

    // 1. Обновляем шапку главы
    const titleEl = this.element.querySelector('#chapterTitleText');
    if (titleEl) {
      titleEl.textContent = `Глава ${chapter.id}: ${chapter.name}`;
    }

    // Подсчет звезд текущей главы (10 уровней * 3 max = 30)
    let chapterStars = 0;
    for (let id = chapter.startLevel; id <= chapter.endLevel; id++) {
      chapterStars += this.progress.getStarsForLevel(id);
    }
    const maxPossibleStars = (chapter.endLevel - chapter.startLevel + 1) * 3;
    const starsEl = this.element.querySelector('#chapterStarsText');
    if (starsEl) {
      starsEl.textContent = `⭐ ${chapterStars} / ${maxPossibleStars}`;
    }

    // 2. Обновляем состояние кнопок переключения глав
    const btnPrev = this.element.querySelector('#btnChapterPrev') as HTMLButtonElement;
    if (btnPrev) {
      btnPrev.disabled = this.viewingChapterId <= 1;
    }

    const btnNext = this.element.querySelector('#btnChapterNext') as HTMLButtonElement;
    if (btnNext) {
      const nextUnlocked = ChapterRegistry.isChapterUnlocked(this.viewingChapterId + 1, lastUnlocked);
      btnNext.disabled = !nextUnlocked;
    }

    // 3. Рендерим ровно 10 карточек текущей главы
    const gridContainer = this.element.querySelector('#levelGridContainer');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    for (let id = chapter.startLevel; id <= chapter.endLevel; id++) {
      const isCompleted = id < lastUnlocked;
      const isCurrent = id === lastUnlocked;
      const stars = this.progress.getStarsForLevel(id);

      const btn = document.createElement('button');
      btn.className = 'level-card';

      if (isCurrent) {
        btn.classList.add('level-card--current');
        btn.setAttribute('aria-label', `Уровень ${id}, текущий`);
        btn.innerHTML = `
          <span class="level-card__number">${id}</span>
          <span class="level-card__badge" style="font-size: 13px;">▶️</span>
        `;
        btn.addEventListener('click', () => this.callbacks.onSelectLevel(id));
      } else if (isCompleted) {
        btn.classList.add('level-card--completed');
        const badge = stars > 0 ? '⭐'.repeat(stars) : '✔️';
        const badgeColor = stars > 0 ? '' : 'color: #4ADE80; font-weight: 900;';
        btn.setAttribute('aria-label', `Уровень ${id}, пройден, звезд: ${stars}`);
        btn.innerHTML = `
          <span class="level-card__number">${id}</span>
          <span class="level-card__badge" style="${badgeColor}">${badge}</span>
        `;
        btn.addEventListener('click', () => this.callbacks.onSelectLevel(id));
      } else {
        btn.classList.add('level-card--locked');
        btn.disabled = true;
        btn.setAttribute('aria-label', `Уровень ${id}, заблокирован`);
        btn.innerHTML = `
          <span class="level-card__number">${id}</span>
          <span class="level-card__badge">🔒</span>
        `;
      }

      gridContainer.appendChild(btn);
    }
  }

  public show(): void {
    // При входе открываем главу, соответствующую текущему прогрессу игрока
    this.viewingChapterId = ChapterRegistry.getChapterByLevel(this.progress.getLastUnlockedLevel()).id;
    this.renderChapter();
    if (this.element) {
      this.element.classList.add('active');
    }
  }

  public hide(): void {
    if (this.element) {
      this.element.classList.remove('active');
    }
  }

  public updateProgress(progress: PlayerProgress): void {
    this.progress = progress;
    this.renderChapter();
  }

  public getViewingChapterId(): number {
    return this.viewingChapterId;
  }

  public setViewingChapterId(chapterId: number): void {
    this.viewingChapterId = chapterId;
    this.renderChapter();
  }
}
