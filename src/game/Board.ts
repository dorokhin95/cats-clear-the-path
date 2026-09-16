import { Cat } from './Cat';

export class Board {
  public readonly width: number;
  public readonly height: number;
  private grid: (Cat | null)[][];
  private cats: Map<number, Cat> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => Array(width).fill(null));
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public addCat(cat: Cat): boolean {
    if (!this.isWithinBounds(cat.x, cat.y)) return false;
    if (this.grid[cat.y][cat.x] !== null) return false;

    this.grid[cat.y][cat.x] = cat;
    this.cats.set(cat.id, cat);
    return true;
  }

  public getCatAt(x: number, y: number): Cat | null {
    if (!this.isWithinBounds(x, y)) return null;
    return this.grid[y][x];
  }

  /**
   * Освобождает клетку сетки, когда котик начинает побег.
   * Котик остаётся в списке cats до завершения анимации.
   */
  public releaseCell(cat: Cat): void {
    if (this.isWithinBounds(cat.x, cat.y) && this.grid[cat.y][cat.x]?.id === cat.id) {
      this.grid[cat.y][cat.x] = null;
    }
  }

  /**
   * Логическое удаление котика из головоломки при правильном ходе.
   * Освобождает клетку сетки, делая её доступной для других котиков.
   */
  public removeCatFromPuzzle(cat: Cat): void {
    this.releaseCell(cat);
  }

  /**
   * Проверка возможности выхода котика (Raycast до края поля)
   * Возвращает true, только если ВСЕ клетки от котика до границы поля пусты.
   */
  public canCatEscape(cat: Cat): boolean {
    if (cat.state === 'escaped') return false;
    if (!this.isWithinBounds(cat.x, cat.y) || this.grid[cat.y][cat.x]?.id !== cat.id) {
      return false;
    }

    let dx = 0;
    let dy = 0;

    switch (cat.direction) {
      case 'up':
        dy = -1;
        break;
      case 'down':
        dy = 1;
        break;
      case 'left':
        dx = -1;
        break;
      case 'right':
        dx = 1;
        break;
    }

    let cx = cat.x + dx;
    let cy = cat.y + dy;

    while (this.isWithinBounds(cx, cy)) {
      const obstacle = this.grid[cy][cx];
      // Если на пути есть котик, который ещё занимает клетку — путь заблокирован
      if (obstacle !== null && obstacle.id !== cat.id) {
        return false;
      }
      cx += dx;
      cy += dy;
    }

    return true;
  }

  /**
   * Возвращает дальность до края поля или препятствия, а также статус блокировки
   */
  public getCatPathInfo(cat: Cat): { steps: number; isBlocked: boolean } {
    let dx = 0;
    let dy = 0;
    switch (cat.direction) {
      case 'up': dy = -1; break;
      case 'down': dy = 1; break;
      case 'left': dx = -1; break;
      case 'right': dx = 1; break;
    }

    let cx = cat.x + dx;
    let cy = cat.y + dy;
    let steps = 0;

    while (this.isWithinBounds(cx, cy)) {
      steps++;
      const obstacle = this.grid[cy][cx];
      if (obstacle !== null && obstacle.id !== cat.id) {
        return { steps, isBlocked: true };
      }
      cx += dx;
      cy += dy;
    }

    // Выход за край доски
    steps += 0.8;
    return { steps, isBlocked: false };
  }

  /**
   * Возвращает список всех котиков, способных выйти в текущий момент
   */
  public getAvailableCats(): Cat[] {
    const available: Cat[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cat = this.grid[y][x];
        if (cat !== null && cat.state === 'idle' && this.canCatEscape(cat)) {
          available.push(cat);
        }
      }
    }
    return available;
  }

  public getCats(): Cat[] {
    return Array.from(this.cats.values());
  }

  public getAllCats(): Cat[] {
    return this.getCats();
  }

  public getRemainingCatsCount(): number {
    let count = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] !== null) {
          count++;
        }
      }
    }
    return count;
  }

  public isCleared(): boolean {
    return this.getRemainingCatsCount() === 0;
  }

  /**
   * Клонирует доску (для симуляции ходов в LevelSolver)
   * Клонирует ТОЛЬКО котиков, которые логически остаются на сетке grid.
   */
  public clone(): Board {
    const cloned = new Board(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cat = this.grid[y][x];
        if (cat !== null) {
          cloned.addCat(
            new Cat({
              id: cat.id,
              x: cat.x,
              y: cat.y,
              direction: cat.direction,
              skin: cat.skin
            })
          );
        }
      }
    }
    return cloned;
  }
}
