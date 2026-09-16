import { Board } from '../game/Board';
import { CatRenderer } from './CatRenderer';

export class BoardRenderer {
  private boardX: number = 0;
  private boardY: number = 0;
  private boardSize: number = 0;
  private cellSize: number = 0;
  private padding: number = 12;
  private showTrajectories: boolean = false;

  public render(
    ctx: CanvasRenderingContext2D,
    board: Board,
    canvasWidth: number,
    canvasHeight: number,
    time: number
  ): void {
    // 1. Расчёт размеров и центрирования поля
    this.boardSize = Math.min(canvasWidth * 0.9, canvasHeight * 0.65);
    this.boardX = (canvasWidth - this.boardSize) / 2;
    this.boardY = (canvasHeight - this.boardSize) / 2 + 15; // Смещение чуть ниже центра для баланса с верхним HUD

    const gridSize = Math.max(board.width, board.height);
    this.cellSize = (this.boardSize - this.padding * 2) / gridSize;

    // 2. Отрисовка подложки игрового поля
    ctx.save();
    ctx.shadowColor = 'rgba(54, 54, 54, 0.08)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(this.boardX, this.boardY, this.boardSize, this.boardSize, 28);
    ctx.fill();
    ctx.restore();

    // 3. Отрисовка ячеек поля
    const startX = this.boardX + this.padding;
    const startY = this.boardY + this.padding;

    for (let r = 0; r < board.height; r++) {
      for (let c = 0; c < board.width; c++) {
        const cx = startX + c * this.cellSize;
        const cy = startY + r * this.cellSize;

        ctx.fillStyle = '#FBF3E4';
        ctx.beginPath();
        ctx.roundRect(cx + 3, cy + 3, this.cellSize - 6, this.cellSize - 6, 14);
        ctx.fill();
      }
    }

    // 3.5. Отрисовка траекторий направления (для уровней 1-3 или обучающего режима)
    if (this.showTrajectories) {
      this.renderTrajectories(ctx, board, startX, startY);
    }

    // 4. Отрисовка котиков
    const cats = board.getCats();
    for (const cat of cats) {
      const centerX = startX + cat.x * this.cellSize + this.cellSize / 2;
      const centerY = startY + cat.y * this.cellSize + this.cellSize / 2;

      CatRenderer.renderCat(ctx, cat, centerX, centerY, this.cellSize, time);
    }
  }

  public setShowTrajectories(show: boolean): void {
    this.showTrajectories = show;
  }

  private renderTrajectories(
    ctx: CanvasRenderingContext2D,
    board: Board,
    startX: number,
    startY: number
  ): void {
    const cats = board.getCats();
    for (const cat of cats) {
      if (cat.state !== 'idle') continue;

      const pathInfo = board.getCatPathInfo(cat);
      const cx = startX + cat.x * this.cellSize + this.cellSize / 2;
      const cy = startY + cat.y * this.cellSize + this.cellSize / 2;

      let dx = 0;
      let dy = 0;
      switch (cat.direction) {
        case 'up': dy = -1; break;
        case 'down': dy = 1; break;
        case 'left': dx = -1; break;
        case 'right': dx = 1; break;
      }

      const endX = cx + dx * (pathInfo.steps * this.cellSize);
      const endY = cy + dy * (pathInfo.steps * this.cellSize);

      ctx.save();
      if (!pathInfo.isBlocked) {
        // Свободный путь — мягкая полупрозрачная изумрудно-зелёная линия
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.65)';
        ctx.fillStyle = 'rgba(74, 222, 128, 0.85)';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
      } else {
        // Заблокированный путь — полупрозрачная кораллово-красная линия с точкой преграды
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.55)';
        ctx.fillStyle = 'rgba(248, 113, 113, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([5, 5]);
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Маркер на конце траектории
      ctx.setLineDash([]);
      ctx.beginPath();
      if (!pathInfo.isBlocked) {
        ctx.arc(endX, endY, 7, 0, Math.PI * 2);
      } else {
        ctx.arc(endX, endY, 5, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.restore();
    }
  }

  public getCellSize(): number {
    return this.cellSize;
  }

  public getCellCenter(gridX: number, gridY: number): { x: number; y: number } {
    const startX = this.boardX + this.padding;
    const startY = this.boardY + this.padding;
    return {
      x: startX + gridX * this.cellSize + this.cellSize / 2,
      y: startY + gridY * this.cellSize + this.cellSize / 2
    };
  }

  public getBoardCenter(): { x: number; y: number } {
    return {
      x: this.boardX + this.boardSize / 2,
      y: this.boardY + this.boardSize / 2
    };
  }

  /**
   * Преобразует координаты клика на Canvas в ячейку сетки (gridX, gridY)
   */
  public canvasToGrid(canvasX: number, canvasY: number, board: Board): { gridX: number; gridY: number } | null {
    const startX = this.boardX + this.padding;
    const startY = this.boardY + this.padding;

    if (
      canvasX < startX ||
      canvasX > startX + board.width * this.cellSize ||
      canvasY < startY ||
      canvasY > startY + board.height * this.cellSize
    ) {
      return null;
    }

    const gridX = Math.floor((canvasX - startX) / this.cellSize);
    const gridY = Math.floor((canvasY - startY) / this.cellSize);

    if (board.isWithinBounds(gridX, gridY)) {
      return { gridX, gridY };
    }

    return null;
  }
}
