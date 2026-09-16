import { Board } from './Board';
import { Cat, Direction } from './Cat';
import { LevelData, CatData, LevelPerformanceConfig } from './Level';
import { LevelSolver, SolverResult } from './LevelSolver';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export interface GeneratorOptions {
  width?: number;
  height?: number;
  catCount?: number;
  difficulty?: Difficulty;
  id?: number;
  chapter?: number;
  name?: string;
  maxAttempts?: number;
  seed?: string | number;
}

export interface GeneratedLevel {
  level: LevelData;
  board: Board;
  solverResult: SolverResult;
}

const AVAILABLE_SKINS = ['ginger', 'smoky', 'snowball', 'shadow'];
const ALL_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function createPRNG(seed: number | string): () => number {
  let s = typeof seed === 'string' ? hashString(seed) : (seed | 0);
  return function mulberry32(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class LevelGenerator {
  /**
   * Настройки по умолчанию для каждого уровня сложности
   */
  public static getDifficultyDefaults(diff: Difficulty): {
    width: number;
    height: number;
    catCount: number;
    maxInitialMoves: number;
  } {
    switch (diff) {
      case 'easy':
        return { width: 3, height: 3, catCount: 4, maxInitialMoves: 3 };
      case 'normal':
        return { width: 4, height: 4, catCount: 7, maxInitialMoves: 2 };
      case 'hard':
        return { width: 5, height: 5, catCount: 11, maxInitialMoves: 2 };
      case 'expert':
        return { width: 6, height: 6, catCount: 16, maxInitialMoves: 1 };
    }
  }

  /**
   * Генерирует уровень с гарантированным решением (100% solvable) методом детерминированного обратного построения.
   */
  public static generate(options: GeneratorOptions = {}): GeneratedLevel {
    const levelId = options.id ?? 999;
    const diff = options.difficulty ?? 'normal';
    const defaults = this.getDifficultyDefaults(diff);

    const width = options.width ?? defaults.width;
    const height = options.height ?? defaults.height;
    const catCount = Math.min(options.catCount ?? defaults.catCount, width * height - 1);
    const maxAttempts = options.maxAttempts ?? 150;
    const seed = options.seed ?? `v2:${levelId}`;
    const rng = createPRNG(seed);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const generated = this.tryGenerateReverse(width, height, catCount, diff, rng);
      if (!generated) continue;
      if (generated.catsData.length !== catCount) continue; // Строгое совпадение количества

      // Валидируем через LevelSolver
      const solverResult = LevelSolver.solve(generated.board, 5);
      if (!solverResult.isSolvable) {
        continue;
      }

      // Строгое ограничение на начальные доступные ходы (без ослабления!)
      if (solverResult.initialMovesCount > defaults.maxInitialMoves) {
        continue;
      }

      const levelData: LevelData = {
        id: levelId,
        chapter: options.chapter ?? Math.floor((levelId - 1) / 10) + 1,
        name: options.name ?? `Уровень ${levelId}`,
        width,
        height,
        cats: generated.catsData
      };

      return {
        level: levelData,
        board: generated.board,
        solverResult
      };
    }

    // Контролируемый резервный уровень с точным числом catCount
    return this.createFallbackLevel(width, height, catCount, levelId);
  }

  /**
   * Попытка сгенерировать расстановку методом обратного построения:
   * от пустой доски размещаем котиков так, чтобы в обратном порядке каждый мог свободно выйти.
   */
  private static tryGenerateReverse(
    width: number,
    height: number,
    targetCount: number,
    diff: Difficulty,
    rng: () => number
  ): { board: Board; catsData: CatData[] } | null {
    const board = new Board(width, height);
    const catsData: CatData[] = [];
    let currentId = 1;

    // Шаг 1: Размещаем первого котика (он выйдет последним) со свободным выходом наружу
    const emptyCells = this.getEmptyCells(board);
    if (emptyCells.length === 0) return null;

    const firstCell = emptyCells[Math.floor(rng() * emptyCells.length)];
    const openDirs = this.getOpenDirections(board, firstCell.x, firstCell.y);
    if (openDirs.length === 0) return null;

    const firstDir = openDirs[Math.floor(rng() * openDirs.length)];
    const firstCat = new Cat({
      id: currentId,
      x: firstCell.x,
      y: firstCell.y,
      direction: firstDir,
      skin: this.getRandomSkin(rng)
    });
    board.addCat(firstCat);
    catsData.push({
      id: currentId++,
      x: firstCell.x,
      y: firstCell.y,
      direction: firstDir,
      skin: firstCat.skin
    });

    // Вероятность блокировки существующего котика для создания глубины зависимости
    const blockProbability = diff === 'expert' ? 0.95 : diff === 'hard' ? 0.8 : diff === 'normal' ? 0.65 : 0.45;

    // Шаг 2: Поочередно добавляем котиков
    let stuckCounter = 0;
    while (catsData.length < targetCount && stuckCounter < 80) {
      stuckCounter++;

      const tryBlockExisting = rng() < blockProbability;
      let placed = false;

      if (tryBlockExisting) {
        // Выбираем котика из уже существующих, у которого сейчас открыт выход наружу
        const currentlyFreeCats = board.getAvailableCats();
        const pool = currentlyFreeCats.length > 0 ? currentlyFreeCats : board.getCats();
        const targetCat = pool[Math.floor(rng() * pool.length)];

        // Находим свободные клетки на линии его взгляда
        const blockCells = this.getCellsInSight(board, targetCat.x, targetCat.y, targetCat.direction);

        if (blockCells.length > 0) {
          const blockCell = blockCells[Math.floor(rng() * blockCells.length)];
          const newOpenDirs = this.getOpenDirections(board, blockCell.x, blockCell.y);

          if (newOpenDirs.length > 0) {
            const dir = newOpenDirs[Math.floor(rng() * newOpenDirs.length)];
            const newCat = new Cat({
              id: currentId,
              x: blockCell.x,
              y: blockCell.y,
              direction: dir,
              skin: this.getRandomSkin(rng)
            });
            board.addCat(newCat);
            catsData.push({
              id: currentId++,
              x: blockCell.x,
              y: blockCell.y,
              direction: dir,
              skin: newCat.skin
            });
            placed = true;
          }
        }
      }

      if (!placed) {
        // Если не удалось встать на траектории котика, пробуем поставить котика в свободную клетку,
        // направив его в сторону существующего котика (создавая новую зависимость без роста initialMoves)
        const freeCells = this.getEmptyCells(board);
        if (freeCells.length === 0) break;

        const cell = freeCells[Math.floor(rng() * freeCells.length)];
        let blockedDir: Direction | null = null;

        for (const dir of ALL_DIRECTIONS) {
          let dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
          let dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
          let cx = cell.x + dx;
          let cy = cell.y + dy;
          while (board.isWithinBounds(cx, cy)) {
            if (board.getCatAt(cx, cy) !== null) {
              blockedDir = dir;
              break;
            }
            cx += dx;
            cy += dy;
          }
          if (blockedDir) break;
        }

        if (blockedDir) {
          const newCat = new Cat({
            id: currentId,
            x: cell.x,
            y: cell.y,
            direction: blockedDir,
            skin: this.getRandomSkin(rng)
          });
          board.addCat(newCat);
          catsData.push({
            id: currentId++,
            x: cell.x,
            y: cell.y,
            direction: blockedDir,
            skin: newCat.skin
          });
          placed = true;
        } else if (diff !== 'expert') {
          // Для лёгких сложностей разрешаем открытый выход наружу
          const dirs = this.getOpenDirections(board, cell.x, cell.y);
          if (dirs.length > 0) {
            const dir = dirs[Math.floor(rng() * dirs.length)];
            const newCat = new Cat({
              id: currentId,
              x: cell.x,
              y: cell.y,
              direction: dir,
              skin: this.getRandomSkin(rng)
            });
            board.addCat(newCat);
            catsData.push({
              id: currentId++,
              x: cell.x,
              y: cell.y,
              direction: dir,
              skin: newCat.skin
            });
          }
        }
      }
    }

    // Принимаем только при точном совпадении с targetCount
    if (catsData.length !== targetCount) {
      return null;
    }

    return { board, catsData };
  }

  /**
   * Возвращает список клеток на линии взгляда котика до края поля
   */
  private static getCellsInSight(
    board: Board,
    startX: number,
    startY: number,
    direction: Direction
  ): { x: number; y: number }[] {
    const cells: { x: number; y: number }[] = [];
    let dx = 0;
    let dy = 0;
    if (direction === 'up') dy = -1;
    if (direction === 'down') dy = 1;
    if (direction === 'left') dx = -1;
    if (direction === 'right') dx = 1;

    let x = startX + dx;
    let y = startY + dy;

    while (board.isWithinBounds(x, y)) {
      if (board.getCatAt(x, y) === null) {
        cells.push({ x, y });
      }
      x += dx;
      y += dy;
    }

    return cells;
  }

  /**
   * Возвращает список направлений, в которых путь от (x, y) до границы поля полностью свободен
   */
  private static getOpenDirections(board: Board, x: number, y: number): Direction[] {
    const open: Direction[] = [];

    for (const dir of ALL_DIRECTIONS) {
      let dx = 0;
      let dy = 0;
      if (dir === 'up') dy = -1;
      if (dir === 'down') dy = 1;
      if (dir === 'left') dx = -1;
      if (dir === 'right') dx = 1;

      let curX = x + dx;
      let curY = y + dy;
      let isClear = true;

      while (board.isWithinBounds(curX, curY)) {
        if (board.getCatAt(curX, curY) !== null) {
          isClear = false;
          break;
        }
        curX += dx;
        curY += dy;
      }

      if (isClear) {
        open.push(dir);
      }
    }

    return open;
  }

  /**
   * Возвращает список всех свободных клеток поля
   */
  private static getEmptyCells(board: Board): { x: number; y: number }[] {
    const empty: { x: number; y: number }[] = [];
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        if (board.getCatAt(x, y) === null) {
          empty.push({ x, y });
        }
      }
    }
    return empty;
  }

  /**
   * Случайный скин из палитры с поддержкой PRNG
   */
  private static getRandomSkin(rng: () => number): string {
    const index = Math.floor(rng() * AVAILABLE_SKINS.length);
    return AVAILABLE_SKINS[index];
  }

  /**
   * Гарантированный резервный уровень с точным количеством targetCount котиков
   * и строгим initialMovesCount = 1 (чистая цепочка зависимостей).
   */
  private static createFallbackLevel(
    width: number,
    height: number,
    targetCount: number,
    id: number
  ): GeneratedLevel {
    const board = new Board(width, height);
    const catsData: CatData[] = [];

    // Змейка по ячейкам поля:
    // Первый котик на (0, 0) направлен вверх (свободен).
    // Каждый следующий котик направлен в клетку предыдущего котика.
    const path: { x: number; y: number }[] = [];
    for (let y = 0; y < height; y++) {
      if (y % 2 === 0) {
        for (let x = 0; x < width; x++) path.push({ x, y });
      } else {
        for (let x = width - 1; x >= 0; x--) path.push({ x, y });
      }
    }

    for (let i = 0; i < targetCount; i++) {
      const pos = path[i];
      let dir: Direction = 'up';

      if (i === 0) {
        // Первый котик свободно выходит вверх наружу
        dir = 'up';
      } else {
        // Направлен в сторону предыдущего котика
        const prev = path[i - 1];
        if (prev.x < pos.x) dir = 'left';
        else if (prev.x > pos.x) dir = 'right';
        else if (prev.y < pos.y) dir = 'up';
        else dir = 'down';
      }

      const catData: CatData = {
        id: i + 1,
        x: pos.x,
        y: pos.y,
        direction: dir,
        skin: AVAILABLE_SKINS[i % AVAILABLE_SKINS.length]
      };

      catsData.push(catData);
      board.addCat(
        new Cat({
          id: catData.id,
          x: catData.x,
          y: catData.y,
          direction: catData.direction,
          skin: catData.skin
        })
      );
    }

    const solverResult = LevelSolver.solve(board);

    // Детерминированный расчет нормативных показателей времени и комбо
    const goldTimeSec = Math.max(15, Math.round(10 + catsData.length * 4 + solverResult.maxDependencyDepth * 3));
    const silverTimeSec = Math.round(goldTimeSec * 1.6);
    const comboTarget = Math.max(2, Math.min(catsData.length - 1, Math.round(catsData.length * 0.75)));

    const performance: LevelPerformanceConfig = {
      goldTimeMs: goldTimeSec * 1000,
      silverTimeMs: silverTimeSec * 1000,
      comboTarget
    };

    const level: LevelData = {
      id,
      chapter: Math.floor((id - 1) / 10) + 1,
      name: `Уровень ${id}`,
      width,
      height,
      cats: catsData,
      performance
    };

    return {
      level,
      board,
      solverResult
    };
  }
}
