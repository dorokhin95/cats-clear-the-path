import { Board } from '../game/Board';
import { BoardRenderer } from './BoardRenderer';
import { ParticleSystem } from './Particles';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number = 1;
  private logicalWidth: number = 0;
  private logicalHeight: number = 0;
  private boardRenderer: BoardRenderer;
  private particleSystem: ParticleSystem;
  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('[Renderer] Не удалось получить 2D контекст для Canvas');
    }
    this.ctx = context;
    this.boardRenderer = new BoardRenderer();
    this.particleSystem = new ParticleSystem();
    this.handleResize();

    // Реактивное отслеживание физического размера канваса и контейнера
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.canvas);
      if (this.canvas.parentElement) {
        this.resizeObserver.observe(this.canvas.parentElement);
      }
    }

    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('orientationchange', () => {
      // На мобильных устройствах ориентация применяется с небольшой задержкой
      setTimeout(() => this.handleResize(), 50);
    });
  }

  public handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;

    // Защита от нулевых или временных нестабильных размеров при переключении экранов
    if (width <= 0 || height <= 0) {
      // Если у нас уже есть валидные размеры - не трогаем их при скрытом состоянии
      if (this.logicalWidth > 0 && this.logicalHeight > 0) {
        return;
      }

      const parentRect = this.canvas.parentElement?.getBoundingClientRect();
      if (parentRect && parentRect.width > 0 && parentRect.height > 0) {
        width = parentRect.width;
        height = parentRect.height;
      } else if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
        width = Math.min(window.innerWidth, 480);
        height = window.innerHeight;
      } else {
        width = 390;
        height = 700;
      }
    }

    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.logicalWidth = width;
    this.logicalHeight = height;

    const pixelWidth = Math.round(width * this.dpr);
    const pixelHeight = Math.round(height * this.dpr);

    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }

    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * Быстрая проверка соответствия размеров перед отрисовкой кадра
   */
  public checkResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (
        Math.abs(rect.width - this.logicalWidth) > 0.5 ||
        Math.abs(rect.height - this.logicalHeight) > 0.5 ||
        this.canvas.width !== Math.round(rect.width * this.dpr)
      ) {
        this.handleResize();
      }
    }
  }

  public getLogicalSize(): { width: number; height: number } {
    return { width: this.logicalWidth, height: this.logicalHeight };
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  public screenToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  public canvasToGrid(canvasX: number, canvasY: number, board: Board): { gridX: number; gridY: number } | null {
    return this.boardRenderer.canvasToGrid(canvasX, canvasY, board);
  }

  public getCellSize(): number {
    return this.boardRenderer.getCellSize();
  }

  public setShowTrajectories(show: boolean): void {
    this.boardRenderer.setShowTrajectories(show);
  }

  public setReducedMotion(reduced: boolean): void {
    this.particleSystem.setReducedMotion(reduced);
  }

  public spawnCatPaws(gridX: number, gridY: number): void {
    const center = this.boardRenderer.getCellCenter(gridX, gridY);
    this.particleSystem.spawnPawPrints(center.x, center.y);
  }

  public spawnVictoryConfetti(): void {
    const center = this.boardRenderer.getBoardCenter();
    this.particleSystem.spawnVictoryConfetti(center.x, center.y, 45);
  }

  public render(board: Board, time: number, deltaTime: number): void {
    this.checkResize();
    this.clear();
    this.boardRenderer.render(this.ctx, board, this.logicalWidth, this.logicalHeight, time);

    this.particleSystem.update(deltaTime);
    this.particleSystem.render(this.ctx);
  }

  public destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}
