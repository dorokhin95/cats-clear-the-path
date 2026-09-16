export type Direction = 'up' | 'down' | 'left' | 'right';
export type CatState = 'idle' | 'squashing' | 'escaping' | 'bumping' | 'escaped';

export interface CatConfig {
  id: number;
  x: number;
  y: number;
  direction: Direction;
  skin?: string;
}

export class Cat {
  public readonly id: number;
  public x: number;
  public y: number;
  public direction: Direction;
  public skin: string;
  public state: CatState = 'idle';

  // Анимационные смещения и трансформации
  public visualOffsetX: number = 0;
  public visualOffsetY: number = 0;
  public scaleX: number = 1;
  public scaleY: number = 1;
  public opacity: number = 1;
  public bumpTimer: number = 0;
  public squashTimer: number = 0;
  public escapeTimer: number = 0;

  // Случайный сдвиг фазы моргания и дыхания, чтобы котики не дышали абсолютно синхронно
  public readonly idlePhase: number = Math.random() * Math.PI * 2;
  public blinkTimer: number = 2 + Math.random() * 3;
  public isBlinking: boolean = false;

  public isHinted: boolean = false;

  constructor(config: CatConfig) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.direction = config.direction;
    this.skin = config.skin || 'ginger';
  }

  /**
   * Запуск анимации успешного выхода (squash -> побег)
   */
  public triggerEscape(): void {
    if (this.state !== 'idle') return;
    this.isHinted = false;
    this.state = 'squashing';
    this.squashTimer = 0.08; // 80 мс на squash
  }

  /**
   * Запуск анимации блокировки / ошибки (рывок -> отскок)
   */
  public triggerBump(): void {
    if (this.state !== 'idle') return;
    this.isHinted = false;
    this.state = 'bumping';
    this.bumpTimer = 0.22; // 220 мс на рывок и возврат
  }

  /**
   * Обновление анимаций котика на основе deltaTime (в секундах)
   */
  public update(deltaTime: number, cellSize: number): void {
    if (this.state === 'escaped') return;

    // Обновление таймера моргания в состоянии idle
    if (this.state === 'idle') {
      this.blinkTimer -= deltaTime;
      if (this.blinkTimer <= 0) {
        if (!this.isBlinking) {
          this.isBlinking = true;
          this.blinkTimer = 0.12; // 120 мс длится закрытие глаз
        } else {
          this.isBlinking = false;
          this.blinkTimer = 3 + Math.random() * 3;
        }
      }
      return;
    }

    // Фаза Squash (приседание перед рывком)
    if (this.state === 'squashing') {
      this.squashTimer -= deltaTime;
      const progress = 1 - Math.max(0, this.squashTimer / 0.08);

      if (this.direction === 'up' || this.direction === 'down') {
        this.scaleY = 1 - Math.sin(progress * Math.PI) * 0.2;
        this.scaleX = 1 + Math.sin(progress * Math.PI) * 0.15;
      } else {
        this.scaleX = 1 - Math.sin(progress * Math.PI) * 0.2;
        this.scaleY = 1 + Math.sin(progress * Math.PI) * 0.15;
      }

      if (this.squashTimer <= 0) {
        this.state = 'escaping';
        this.escapeTimer = 0.32; // 320 мс на побег за экран
        this.scaleX = 1;
        this.scaleY = 1;
      }
      return;
    }

    // Фаза Escaping (стремительный побег за край)
    if (this.state === 'escaping') {
      this.escapeTimer -= deltaTime;
      const progress = 1 - Math.max(0, this.escapeTimer / 0.32);
      // Ускорение easeInQuad
      const eased = progress * progress;
      const escapeDistance = cellSize * 8; // Гарантированно вылетает за край поля

      switch (this.direction) {
        case 'up':
          this.visualOffsetY = -eased * escapeDistance;
          break;
        case 'down':
          this.visualOffsetY = eased * escapeDistance;
          break;
        case 'left':
          this.visualOffsetX = -eased * escapeDistance;
          break;
        case 'right':
          this.visualOffsetX = eased * escapeDistance;
          break;
      }

      // Небольшое затухание в самом конце
      if (progress > 0.8) {
        this.opacity = Math.max(0, 1 - (progress - 0.8) / 0.2);
      }

      if (this.escapeTimer <= 0) {
        this.state = 'escaped';
        this.opacity = 0;
      }
      return;
    }

    // Фаза Bumping (рывок в препятствие и отскок назад)
    if (this.state === 'bumping') {
      this.bumpTimer -= deltaTime;
      const progress = 1 - Math.max(0, this.bumpTimer / 0.22);
      // Синусоидальный рывок туда и обратно: sin(0..PI)
      const bumpOffset = Math.sin(progress * Math.PI) * 12; // 12 px

      switch (this.direction) {
        case 'up':
          this.visualOffsetY = -bumpOffset;
          break;
        case 'down':
          this.visualOffsetY = bumpOffset;
          break;
        case 'left':
          this.visualOffsetX = -bumpOffset;
          break;
        case 'right':
          this.visualOffsetX = bumpOffset;
          break;
      }

      if (this.bumpTimer <= 0) {
        this.state = 'idle';
        this.visualOffsetX = 0;
        this.visualOffsetY = 0;
      }
    }
  }
}
