import { PlayerProgress } from '../progression/PlayerProgress';
import { Board } from '../game/Board';
import { SaveService } from './../services/SaveService';

export interface TutorialOverlayData {
  title: string;
  subtitle?: string;
  fingerTarget?: { gridX: number; gridY: number };
  highlightDir?: 'up' | 'down' | 'left' | 'right';
  showLines?: Array<{
    startX: number;
    startY: number;
    dir: 'up' | 'down' | 'left' | 'right';
    isBlocked: boolean;
  }>;
}

export class TutorialController {
  private container: HTMLElement;
  private progress: PlayerProgress;
  private currentLevelId: number = 1;
  private overlayElement: HTMLElement | null = null;
  private isStepFinished: boolean = false;

  constructor(container: HTMLElement, progress: PlayerProgress) {
    this.container = container;
    this.progress = progress;
  }

  public onLevelStart(levelId: number, board: Board): void {
    this.currentLevelId = levelId;
    this.isStepFinished = false;
    this.hideOverlay();

    // Если обучение уже пройдено полностью, баннеры не показываем
    if (this.progress.isTutorialCompleted() && levelId > 1) {
      return;
    }

    if (levelId === 1) {
      this.showLevel1Tutorial(board);
    } else if (levelId === 2) {
      this.showLevel2Tutorial();
    } else if (levelId === 3) {
      this.showLevel3Tutorial();
    }
  }

  public onMoveSuccess(): void {
    if (this.currentLevelId === 1 && !this.isStepFinished) {
      this.isStepFinished = true;
      this.updateMessage('Отлично! Котик убежал 🐾', 'Вот и всё — освободи всех котиков!');
      setTimeout(() => this.hideOverlay(), 1200);
    } else if (this.currentLevelId === 2 || this.currentLevelId === 3) {
      this.hideOverlay();
    }
  }

  public onMoveBlocked(): void {
    if (this.currentLevelId === 3) {
      this.updateMessage(
        'Путь этого котика занят!',
        'Сначала освободи котика впереди, чтобы расчистить дорогу.'
      );
    }
  }

  public onLevelComplete(levelId: number): void {
    if (levelId === 3) {
      this.progress.setTutorialCompleted(true);
      SaveService.save(this.progress);
    }
    this.hideOverlay();
  }

  private showLevel1Tutorial(board: Board): void {
    const cats = board.getCats();
    const targetCat = cats[0];

    this.renderBanner({
      title: 'ОСВОБОДИ ВСЕХ КОТИКОВ',
      subtitle: 'Нажми на котика, если путь перед ним свободен до края.',
      fingerTarget: targetCat ? { gridX: targetCat.x, gridY: targetCat.y } : undefined
    });
  }

  private showLevel2Tutorial(): void {
    this.renderBanner({
      title: 'ВЫБОР ПУТИ',
      subtitle: 'Оба пути свободны. Начни с любого котика!'
    });
  }

  private showLevel3Tutorial(): void {
    this.renderBanner({
      title: 'УСТУПИ ДОРОГУ',
      subtitle: 'Котик не может пройти сквозь другого. Сначала убери преграду!'
    });
  }

  private renderBanner(data: { title: string; subtitle: string; fingerTarget?: { gridX: number; gridY: number } }): void {
    this.hideOverlay();

    const el = document.createElement('div');
    el.id = 'tutorialOverlay';
    el.style.position = 'absolute';
    el.style.top = '72px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.width = 'calc(100% - 32px)';
    el.style.maxWidth = '360px';
    el.style.background = 'rgba(255, 255, 255, 0.96)';
    el.style.backdropFilter = 'blur(8px)';
    el.style.padding = '12px 16px';
    el.style.borderRadius = '16px';
    el.style.boxShadow = '0 6px 20px rgba(54, 54, 54, 0.15)';
    el.style.textAlign = 'center';
    el.style.zIndex = '30';
    el.style.pointerEvents = 'none';
    el.style.animation = 'bannerFadeIn 0.3s ease-out';

    el.innerHTML = `
      <div style="font-weight: 800; font-size: 15px; color: var(--color-primary-green); letter-spacing: 0.5px;">
        ${data.title}
      </div>
      <div style="font-size: 13px; color: var(--color-text-dark); margin-top: 4px; font-weight: 500; line-height: 1.35;">
        ${data.subtitle}
      </div>
    `;

    this.container.appendChild(el);
    this.overlayElement = el;
  }

  public updateMessage(title: string, subtitle: string): void {
    if (!this.overlayElement) return;
    this.overlayElement.innerHTML = `
      <div style="font-weight: 800; font-size: 15px; color: var(--color-accent-orange); letter-spacing: 0.5px;">
        ${title}
      </div>
      <div style="font-size: 13px; color: var(--color-text-dark); margin-top: 4px; font-weight: 500; line-height: 1.35;">
        ${subtitle}
      </div>
    `;
  }

  public hideOverlay(): void {
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }

  public getTutorialData(): TutorialOverlayData | null {
    if (this.progress.isTutorialCompleted() && this.currentLevelId > 1) {
      return null;
    }

    if (this.currentLevelId === 1 && !this.isStepFinished) {
      return {
        title: 'ОСВОБОДИ ВСЕХ КОТИКОВ',
        fingerTarget: { gridX: 1, gridY: 1 },
        highlightDir: 'right',
        showLines: [{ startX: 1, startY: 1, dir: 'right', isBlocked: false }]
      };
    }

    if (this.currentLevelId === 3 && !this.isStepFinished) {
      return {
        title: 'УСТУПИ ДОРОГУ',
        showLines: [
          { startX: 1, startY: 1, dir: 'right', isBlocked: true },
          { startX: 2, startY: 1, dir: 'up', isBlocked: false }
        ]
      };
    }

    return null;
  }
}
