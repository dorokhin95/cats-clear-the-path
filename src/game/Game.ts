import { Renderer } from '../rendering/Renderer';
import { Board } from './Board';
import { Cat } from './Cat';
import { GameRules, LevelResult } from './GameRules';
import { LevelData } from './Level';

export interface GameEventCallbacks {
  onRulesUpdate?: (rules: GameRules) => void;
  onLevelComplete?: (result: LevelResult) => void;
  onLevelFailed?: () => void;
  onCorrectMove?: (cat: Cat) => void;
  onWrongMove?: (cat: Cat) => void;
  onCatSelect?: (cat: Cat) => void;
  onTimerTick?: (elapsedMs: number, comboRemainingSec: number) => void;
  onAutoPause?: () => void;
}

export class Game {
  private renderer: Renderer;
  private board: Board;
  private gameRules: GameRules;
  private callbacks: GameEventCallbacks;

  private isRunning: boolean = false;
  private paused: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private isLevelFinished: boolean = false;
  private winDelayTimer: number = 0;

  private levelElapsedMs: number = 0;
  private levelTimerStarted: boolean = false;
  private currentLevelData: LevelData | null = null;

  constructor(renderer: Renderer, callbacks: GameEventCallbacks = {}) {
    this.renderer = renderer;
    this.callbacks = callbacks;
    this.board = new Board(4, 4);
    this.gameRules = new GameRules(1);

    this.setupVisibilityListeners();
  }

  private setupVisibilityListeners(): void {
    const handleAutoPause = () => {
      if (this.isRunning && !this.paused && !this.isLevelFinished) {
        this.pause();
        if (this.callbacks.onAutoPause) {
          this.callbacks.onAutoPause();
        }
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handleAutoPause();
      }
    });

    window.addEventListener('blur', () => {
      handleAutoPause();
    });
  }

  public loadBoard(board: Board, levelNumber: number, levelData?: LevelData): void {
    this.board = board;
    this.currentLevelData = levelData || null;
    this.gameRules.resetForLevel(levelNumber);
    this.isLevelFinished = false;
    this.winDelayTimer = 0;
    this.levelElapsedMs = 0;
    this.levelTimerStarted = false;
    this.renderer.setShowTrajectories(levelNumber <= 3);

    if (this.callbacks.onRulesUpdate) {
      this.callbacks.onRulesUpdate(this.gameRules);
    }
    if (this.callbacks.onTimerTick) {
      this.callbacks.onTimerTick(0, 0);
    }
  }

  public getBoard(): Board {
    return this.board;
  }

  public getRules(): GameRules {
    return this.gameRules;
  }

  public getLevelElapsedMs(): number {
    return this.levelElapsedMs;
  }

  public isTimerStarted(): boolean {
    return this.levelTimerStarted;
  }

  public revive(extraLives: number = 2): void {
    this.gameRules.addLives(extraLives);
    this.isLevelFinished = false;
    if (this.callbacks.onRulesUpdate) {
      this.callbacks.onRulesUpdate(this.gameRules);
    }
    this.resume();
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public pause(): void {
    if (this.paused) return;
    this.paused = true;
  }

  public resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.lastTime = performance.now();
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public triggerHint(): boolean {
    const available = this.board.getAvailableCats();
    if (available.length === 0) return false;

    for (const cat of this.board.getCats()) {
      cat.isHinted = false;
    }

    available[0].isHinted = true;
    return true;
  }

  public handleTap(clientX: number, clientY: number): boolean {
    if (this.paused || !this.isRunning || this.isLevelFinished) return false;

    const canvasCoords = this.renderer.screenToCanvas(clientX, clientY);
    const cell = this.renderer.canvasToGrid(canvasCoords.x, canvasCoords.y, this.board);

    if (!cell) return false;
    return this.processCellTap(cell.gridX, cell.gridY);
  }

  public processCellTap(gridX: number, gridY: number): boolean {
    if (this.paused || !this.isRunning || this.isLevelFinished) return false;

    const cat = this.board.getCatAt(gridX, gridY);
    if (!cat || cat.state !== 'idle') return false;

    // Звук тапа воспроизводится ТОЛЬКО при нажатии на существующего idle-котика
    if (this.callbacks.onCatSelect) {
      this.callbacks.onCatSelect(cat);
    }

    // Старт таймера уровня по первому игровому действию
    if (!this.levelTimerStarted) {
      this.levelTimerStarted = true;
    }

    // Сбрасываем подсветку подсказки со всех котиков при совершении действия
    for (const c of this.board.getCats()) {
      c.isHinted = false;
    }

    // Проверка свободного пути (Raycast)
    const canEscape = this.board.canCatEscape(cat);

    if (canEscape) {
      // 1. Успешный ход
      cat.triggerEscape();
      this.board.removeCatFromPuzzle(cat); // Клетка моментально свободна для логики
      this.renderer.spawnCatPaws(cat.x, cat.y); // Спавн лапок 🐾
      this.gameRules.onCorrectMove();

      if (this.callbacks.onCorrectMove) {
        this.callbacks.onCorrectMove(cat);
      }

      if (this.callbacks.onRulesUpdate) {
        this.callbacks.onRulesUpdate(this.gameRules);
      }

      // Проверка победы (все ли котики покинули поле)
      if (this.board.isCleared()) {
        this.isLevelFinished = true;
        this.winDelayTimer = 0.5; // 500 мс задержка по ТЗ, чтобы последний котик убежал
        this.renderer.spawnVictoryConfetti(); // Конфетти победы 🎉
      }
      return true;
    } else {
      // 2. Ошибочный ход
      cat.triggerBump();
      const { isGameOver } = this.gameRules.onWrongMove();

      if (this.callbacks.onWrongMove) {
        this.callbacks.onWrongMove(cat);
      }

      if (this.callbacks.onRulesUpdate) {
        this.callbacks.onRulesUpdate(this.gameRules);
      }

      if (isGameOver) {
        this.isLevelFinished = true;
        setTimeout(() => {
          if (this.callbacks.onLevelFailed) {
            this.callbacks.onLevelFailed();
          }
        }, 300);
      }
      return false;
    }
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.paused) {
      this.step(deltaTime);
      this.render(currentTime, deltaTime);
    }

    this.animFrameId = requestAnimationFrame((time) => this.loop(time));
  }

  /**
   * Шаг игрового времени (вызывается в цикле и в тестах)
   */
  public step(deltaTime: number): void {
    const cellSize = this.renderer.getCellSize();
    const cats = this.board.getCats();

    for (const cat of cats) {
      cat.update(deltaTime, cellSize);
    }

    // Отсчет таймера уровня и комбо при активном геймплее
    if (this.isRunning && !this.paused && this.levelTimerStarted && !this.isLevelFinished) {
      this.levelElapsedMs += deltaTime * 1000;
      const comboTimedOut = this.gameRules.updateComboTimer(deltaTime);
      if (comboTimedOut && this.callbacks.onRulesUpdate) {
        this.callbacks.onRulesUpdate(this.gameRules);
      }
      if (this.callbacks.onTimerTick) {
        this.callbacks.onTimerTick(this.levelElapsedMs, this.gameRules.comboRemainingTime);
      }
    }

    // Обработка таймера победы
    if (this.isLevelFinished && this.winDelayTimer > 0) {
      this.winDelayTimer -= deltaTime;
      if (this.winDelayTimer <= 0) {
        this.winDelayTimer = 0;
        this.isLevelFinished = false; // Победа зафиксирована, исключаем повторный вызов
        if (this.callbacks.onLevelComplete) {
          const result = this.gameRules.calculateResult(
            Math.round(this.levelElapsedMs),
            this.currentLevelData?.performance
          );
          this.callbacks.onLevelComplete(result);
        }
      }
    }
  }

  private render(currentTime: number, deltaTime: number): void {
    this.renderer.render(this.board, currentTime, deltaTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
