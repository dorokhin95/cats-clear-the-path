import { Cat, Direction } from '../game/Cat';

export interface SkinPalette {
  body: string;
  earsInner: string;
  stripes?: string;
  eyes: string;
  blush: string;
}

const PALETTES: Record<string, SkinPalette> = {
  ginger: {
    body: '#FFB84D',
    earsInner: '#FF8A8A',
    stripes: '#E69B2A',
    eyes: '#363636',
    blush: 'rgba(255, 100, 100, 0.25)'
  },
  smoky: {
    body: '#B8C0CC',
    earsInner: '#FFB2B2',
    eyes: '#363636',
    blush: 'rgba(255, 100, 100, 0.2)'
  },
  snowball: {
    body: '#FFFFFF',
    earsInner: '#FFB6C1',
    eyes: '#4A90E2',
    blush: 'rgba(255, 120, 120, 0.25)'
  },
  shadow: {
    body: '#424242',
    earsInner: '#616161',
    eyes: '#76D275',
    blush: 'rgba(255, 255, 255, 0.15)'
  }
};

export class CatRenderer {
  public static renderCat(
    ctx: CanvasRenderingContext2D,
    cat: Cat,
    cellCenterX: number,
    cellCenterY: number,
    cellSize: number,
    time: number
  ): void {
    if (cat.state === 'escaped' || cat.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = cat.opacity;

    // Смещение и анимационный сдвиг
    const posX = cellCenterX + cat.visualOffsetX;
    const posY = cellCenterY + cat.visualOffsetY;

    ctx.translate(posX, posY);

    // Idle-дыхание и пульсация подсказки
    let idleScale = 1;
    if (cat.state === 'idle') {
      const hintPulse = cat.isHinted ? Math.sin(time * 0.008) * 0.06 : 0;
      idleScale = 1 + Math.sin(time * 0.0025 + cat.idlePhase) * 0.025 + hintPulse;
    }

    ctx.scale(cat.scaleX * idleScale, cat.scaleY * idleScale);

    // Базовый радиус тела (75-85% клетки, значит радиус ~ 38-40% cellSize)
    const baseRadius = cellSize * 0.38;
    const palette = PALETTES[cat.skin] || PALETTES.ginger;

    // Пульсирующий золотистый ореол подсказки 💡
    if (cat.isHinted && cat.state === 'idle') {
      ctx.save();
      const pulse = Math.sin(time * 0.008) * 0.5 + 0.5;
      ctx.shadowColor = 'rgba(255, 184, 77, 0.8)';
      ctx.shadowBlur = 12 + pulse * 8;
      ctx.strokeStyle = `rgba(255, 184, 77, ${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * (1.18 + pulse * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Мягкая тень под котиком
    ctx.fillStyle = 'rgba(54, 54, 54, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, baseRadius * 0.85, baseRadius * 0.8, baseRadius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Поворот котика в зависимости от направления
    this.drawBodyAndHead(ctx, baseRadius, palette, cat.direction, cat.isBlinking);

    // Контрастный шеврон направления движения
    this.drawDirectionMarker(ctx, baseRadius, cat.direction);

    // Восклицательный знак при ошибке
    if (cat.state === 'bumping') {
      this.drawExclamation(ctx, baseRadius);
    }

    ctx.restore();
  }

  private static drawDirectionMarker(ctx: CanvasRenderingContext2D, radius: number, direction: Direction): void {
    ctx.save();
    let angle = 0;
    if (direction === 'down') angle = Math.PI / 2;
    else if (direction === 'left') angle = Math.PI;
    else if (direction === 'up') angle = -Math.PI / 2;
    else if (direction === 'right') angle = 0;

    ctx.rotate(angle);

    // Стрелка/шеврон на внешнем краю тела котика
    const markerDist = radius * 0.98;
    const arrowWidth = radius * 0.38;
    const arrowLength = radius * 0.32;

    ctx.fillStyle = '#2B2D42';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(markerDist - arrowLength, -arrowWidth / 2);
    ctx.lineTo(markerDist + arrowLength * 0.5, 0);
    ctx.lineTo(markerDist - arrowLength, arrowWidth / 2);
    ctx.lineTo(markerDist - arrowLength * 0.4, 0);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private static drawBodyAndHead(
    ctx: CanvasRenderingContext2D,
    radius: number,
    palette: SkinPalette,
    direction: Direction,
    isBlinking: boolean
  ): void {
    // 1. Ушки
    this.drawEars(ctx, radius, palette, direction);

    // 2. Тело/голова (круглая уютная форма)
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Мордочка (глаза, носик, щечки), смещенные в направлении взгляда
    this.drawFace(ctx, radius, palette, direction, isBlinking);
  }

  private static drawEars(
    ctx: CanvasRenderingContext2D,
    radius: number,
    palette: SkinPalette,
    direction: Direction
  ): void {
    ctx.save();
    ctx.fillStyle = palette.body;

    // Конфигурация ушек в зависимости от направления
    let ear1 = { x1: -radius * 0.7, y1: -radius * 0.4, x2: -radius * 0.9, y2: -radius * 1.1, x3: -radius * 0.2, y3: -radius * 0.8 };
    let ear2 = { x1: radius * 0.7, y1: -radius * 0.4, x2: radius * 0.9, y2: -radius * 1.1, x3: radius * 0.2, y3: -radius * 0.8 };

    if (direction === 'up') {
      // Вид со спины / ушки торчат прямо вверх
      ear1 = { x1: -radius * 0.6, y1: -radius * 0.5, x2: -radius * 0.8, y2: -radius * 1.2, x3: -radius * 0.1, y3: -radius * 0.9 };
      ear2 = { x1: radius * 0.6, y1: -radius * 0.5, x2: radius * 0.8, y2: -radius * 1.2, x3: radius * 0.1, y3: -radius * 0.9 };
    } else if (direction === 'left') {
      ear1 = { x1: -radius * 0.8, y1: -radius * 0.3, x2: -radius * 1.1, y2: -radius * 0.9, x3: -radius * 0.3, y3: -radius * 0.8 };
      ear2 = { x1: radius * 0.4, y1: -radius * 0.5, x2: radius * 0.7, y2: -radius * 1.1, x3: radius * 0.1, y3: -radius * 0.8 };
    } else if (direction === 'right') {
      ear1 = { x1: -radius * 0.4, y1: -radius * 0.5, x2: -radius * 0.7, y2: -radius * 1.1, x3: -radius * 0.1, y3: -radius * 0.8 };
      ear2 = { x1: radius * 0.8, y1: -radius * 0.3, x2: radius * 1.1, y2: -radius * 0.9, x3: radius * 0.3, y3: -radius * 0.8 };
    }

    // Левое ухо
    ctx.beginPath();
    ctx.moveTo(ear1.x1, ear1.y1);
    ctx.lineTo(ear1.x2, ear1.y2);
    ctx.lineTo(ear1.x3, ear1.y3);
    ctx.closePath();
    ctx.fill();

    // Правое ухо
    ctx.beginPath();
    ctx.moveTo(ear2.x1, ear2.y1);
    ctx.lineTo(ear2.x2, ear2.y2);
    ctx.lineTo(ear2.x3, ear2.y3);
    ctx.closePath();
    ctx.fill();

    // Внутренняя часть ушек (розовая)
    if (direction !== 'up') {
      ctx.fillStyle = palette.earsInner;
      ctx.beginPath();
      ctx.moveTo((ear1.x1 + ear1.x2) / 2, (ear1.y1 + ear1.y2) / 2);
      ctx.lineTo(ear1.x2 * 0.9, ear1.y2 * 0.9);
      ctx.lineTo((ear1.x3 + ear1.x2) / 2, (ear1.y3 + ear1.y2) / 2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo((ear2.x1 + ear2.x2) / 2, (ear2.y1 + ear2.y2) / 2);
      ctx.lineTo(ear2.x2 * 0.9, ear2.y2 * 0.9);
      ctx.lineTo((ear2.x3 + ear2.x2) / 2, (ear2.y3 + ear2.y2) / 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private static drawFace(
    ctx: CanvasRenderingContext2D,
    radius: number,
    palette: SkinPalette,
    direction: Direction,
    isBlinking: boolean
  ): void {
    if (direction === 'up') {
      // Со спины виден милый хвостик и затылок
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.arc(0, -radius * 0.2, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    let offsetX = 0;
    let offsetY = 0;

    if (direction === 'down') {
      offsetY = radius * 0.15;
    } else if (direction === 'left') {
      offsetX = -radius * 0.3;
    } else if (direction === 'right') {
      offsetX = radius * 0.3;
    }

    // Румянец на щечках
    ctx.fillStyle = palette.blush;
    ctx.beginPath();
    ctx.arc(offsetX - radius * 0.4, offsetY + radius * 0.12, radius * 0.14, 0, Math.PI * 2);
    ctx.arc(offsetX + radius * 0.4, offsetY + radius * 0.12, radius * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Глаза
    ctx.fillStyle = palette.eyes;
    const eyeRadius = radius * 0.12;

    if (isBlinking) {
      // Моргание — закрытые дуги глаз
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = palette.eyes;
      ctx.beginPath();
      ctx.arc(offsetX - radius * 0.3, offsetY - radius * 0.05, eyeRadius, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(offsetX + radius * 0.3, offsetY - radius * 0.05, eyeRadius, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else {
      // Открытые глаза с белыми бликами
      ctx.beginPath();
      ctx.arc(offsetX - radius * 0.3, offsetY - radius * 0.05, eyeRadius, 0, Math.PI * 2);
      ctx.arc(offsetX + radius * 0.3, offsetY - radius * 0.05, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Блики
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(offsetX - radius * 0.3 - eyeRadius * 0.3, offsetY - radius * 0.05 - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
      ctx.arc(offsetX + radius * 0.3 - eyeRadius * 0.3, offsetY - radius * 0.05 - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Носик
    ctx.fillStyle = '#FF7A7A';
    ctx.beginPath();
    ctx.arc(offsetX, offsetY + radius * 0.12, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Ротик (ω)
    ctx.strokeStyle = '#5E4436';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(offsetX - radius * 0.08, offsetY + radius * 0.22, radius * 0.08, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(offsetX + radius * 0.08, offsetY + radius * 0.22, radius * 0.08, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  private static drawExclamation(ctx: CanvasRenderingContext2D, radius: number): void {
    ctx.save();
    ctx.translate(0, -radius * 1.3);

    // Пузырек
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Восклицательный знак
    ctx.fillStyle = '#F06A6A';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 0);

    ctx.restore();
  }
}
