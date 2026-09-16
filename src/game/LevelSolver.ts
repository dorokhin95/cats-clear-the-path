import { Board } from './Board';

export interface SolverResult {
  isSolvable: boolean;
  solutionPath: number[];
  solutionsCount: number;
  initialMovesCount: number;
  maxDependencyDepth: number;
  forcedPrefixLength: number;
  branchingFactor: number;
}

export class LevelSolver {
  /**
   * Проверяет, решаема ли данная раскладка на поле
   */
  public static validate(board: Board): boolean {
    const result = this.solve(board, 1); // Достаточно найти 1 решение
    return result.isSolvable;
  }

  /**
   * Рассчитывает максимальную глубину зависимости в головоломке
   * (длина самой длинной цепочки блокировок: A ждёт B ждёт C...)
   */
  public static calculateMaxDependencyDepth(board: Board): number {
    const cats = board.getCats();
    if (cats.length === 0) return 0;

    const memo = new Map<number, number>();
    const visiting = new Set<number>();

    const getDepth = (catId: number): number => {
      if (memo.has(catId)) return memo.get(catId)!;
      if (visiting.has(catId)) return 1; // Защита от циклов при некорректных раскладках

      visiting.add(catId);
      const cat = cats.find((c) => c.id === catId);
      if (!cat) {
        visiting.delete(catId);
        return 0;
      }

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
      let maxBlockerDepth = 0;

      while (board.isWithinBounds(cx, cy)) {
        const obstacle = board.getCatAt(cx, cy);
        if (obstacle && obstacle.id !== cat.id) {
          const blockerDepth = getDepth(obstacle.id);
          if (blockerDepth > maxBlockerDepth) {
            maxBlockerDepth = blockerDepth;
          }
        }
        cx += dx;
        cy += dy;
      }

      visiting.delete(catId);
      const depth = 1 + maxBlockerDepth;
      memo.set(catId, depth);
      return depth;
    };

    let maxDepth = 0;
    for (const cat of cats) {
      const d = getDepth(cat.id);
      if (d > maxDepth) {
        maxDepth = d;
      }
    }

    return maxDepth;
  }

  /**
   * Находит решение уровня методом поиска в глубину (DFS) с возвратом
   * @param maxSolutions Лимит на количество искомых альтернативных решений
   */
  public static solve(board: Board, maxSolutions: number = 10): SolverResult {
    const cloned = board.clone();
    const initialAvailable = cloned.getAvailableCats();
    const initialMovesCount = initialAvailable.length;
    const maxDependencyDepth = this.calculateMaxDependencyDepth(board);

    let solutionsCount = 0;
    let firstSolutionPath: number[] = [];

    const search = (currentBoard: Board, currentPath: number[]): boolean => {
      // Базовый случай: все котики ушли с поля
      if (currentBoard.isCleared()) {
        solutionsCount++;
        if (firstSolutionPath.length === 0) {
          firstSolutionPath = [...currentPath];
        }
        return solutionsCount >= maxSolutions;
      }

      const availableCats = currentBoard.getAvailableCats();
      if (availableCats.length === 0) {
        // Тупик (котики остались, но никто не может выйти)
        return false;
      }

      for (const cat of availableCats) {
        // Симулируем ход: создаем клон, убираем котика
        const nextBoard = currentBoard.clone();
        const catInNext = nextBoard.getCatAt(cat.x, cat.y);
        if (catInNext) {
          nextBoard.removeCatFromPuzzle(catInNext);
        }

        currentPath.push(cat.id);
        const shouldStop = search(nextBoard, currentPath);
        currentPath.pop();

        if (shouldStop) {
          return true;
        }
      }

      return false;
    };

    search(cloned, []);

    // Вычисление forcedPrefixLength и branchingFactor по первому найденному пути решения
    let forcedPrefixLength = 0;
    let branchingFactor = 0;

    if (solutionsCount > 0 && firstSolutionPath.length > 0) {
      const simBoard = board.clone();
      let isForced = true;
      let totalChoices = 0;

      for (const catId of firstSolutionPath) {
        const avail = simBoard.getAvailableCats();
        totalChoices += avail.length;

        if (isForced) {
          if (avail.length === 1) {
            forcedPrefixLength++;
          } else {
            isForced = false;
          }
        }

        const cat = simBoard.getCats().find((c) => c.id === catId);
        if (cat) {
          simBoard.removeCatFromPuzzle(cat);
        }
      }

      branchingFactor = Number((totalChoices / firstSolutionPath.length).toFixed(2));
    }

    return {
      isSolvable: solutionsCount > 0,
      solutionPath: firstSolutionPath,
      solutionsCount,
      initialMovesCount,
      maxDependencyDepth,
      forcedPrefixLength,
      branchingFactor
    };
  }
}
