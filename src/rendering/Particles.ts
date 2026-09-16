export type ParticleType = 'paw' | 'star' | 'confetti' | 'dust';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  type: ParticleType;
  active: boolean;
}

export class ParticleSystem {
  private pool: Particle[] = [];
  private readonly maxParticles: number = 150;
  private reducedMotion: boolean = false;

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  constructor() {
    // Предварительное выделение пула частиц
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        rotation: 0,
        vRot: 0,
        scale: 1,
        alpha: 1,
        life: 0,
        maxLife: 1,
        color: '#FFB84D',
        type: 'paw',
        active: false
      });
    }
  }

  private getFreeParticle(): Particle | null {
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.pool[i].active) {
        return this.pool[i];
      }
    }
    return null;
  }

  /**
   * Спавн мягких следов-лапок 🐾 при побеге котика (5-7 частиц по п. 40 ТЗ)
   */
  public spawnPawPrints(x: number, y: number, color: string = '#FFB84D'): void {
    if (this.reducedMotion) return;
    const count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const p = this.getFreeParticle();
      if (!p) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;

      p.active = true;
      p.type = 'paw';
      p.x = x + (Math.random() - 0.5) * 16;
      p.y = y + (Math.random() - 0.5) * 16;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 15; // лёгкий дрейф вверх
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 2;
      p.scale = 0.6 + Math.random() * 0.4;
      p.alpha = 0.9;
      p.life = 0;
      p.maxLife = 0.4 + Math.random() * 0.2; // 400-600 мс
      p.color = color;
    }
  }

  /**
   * Спавн конфетти при победе на уровне (п. 26 ТЗ)
   */
  public spawnVictoryConfetti(centerX: number, centerY: number, count: number = 40): void {
    if (this.reducedMotion) return;
    const colors = ['#62C98C', '#FFB84D', '#63B7FF', '#FF8A8A', '#FFAAA6'];

    for (let i = 0; i < count; i++) {
      const p = this.getFreeParticle();
      if (!p) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 180;

      p.active = true;
      p.type = 'confetti';
      p.x = centerX;
      p.y = centerY;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 60; // взрыв вверх
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 8;
      p.scale = 0.7 + Math.random() * 0.6;
      p.alpha = 1;
      p.life = 0;
      p.maxLife = 0.9 + Math.random() * 0.6; // 0.9-1.5 сек
      p.color = colors[Math.floor(Math.random() * colors.length)];
    }
  }

  public update(deltaTime: number): void {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life += deltaTime;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      // Перемещение
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;

      // Гравитация для конфетти
      if (p.type === 'confetti') {
        p.vy += 220 * deltaTime;
      }

      p.rotation += p.vRot * deltaTime;

      // Плавное угасание
      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active || p.alpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);

      if (p.type === 'paw') {
        this.drawPaw(ctx, p.color);
      } else if (p.type === 'confetti') {
        this.drawConfetti(ctx, p.color);
      }

      ctx.restore();
    }
    ctx.restore();
  }

  private drawPaw(ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    // Центральная подушечка лапки
    ctx.beginPath();
    ctx.ellipse(0, 2, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 пальчика-подушечки
    const toeRadius = 1.8;
    ctx.beginPath();
    ctx.arc(-4, -3, toeRadius, 0, Math.PI * 2);
    ctx.arc(-1.5, -5, toeRadius, 0, Math.PI * 2);
    ctx.arc(1.5, -5, toeRadius, 0, Math.PI * 2);
    ctx.arc(4, -3, toeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawConfetti(ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(-4, -2.5, 8, 5);
  }

  public clear(): void {
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool[i].active = false;
    }
  }

  public getActiveCount(): number {
    let c = 0;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.pool[i].active) c++;
    }
    return c;
  }
}
