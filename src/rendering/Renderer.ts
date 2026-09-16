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
    window.addEventListener('resize', () => this.handleResize());
  }

  public handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.logicalWidth = rect.width;
    this.logicalHeight = rect.height;

    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);

    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);
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
    this.clear();
    this.boardRenderer.render(this.ctx, board, this.logicalWidth, this.logicalHeight, time);

    this.particleSystem.update(deltaTime);
    this.particleSystem.render(this.ctx);
  }
}
