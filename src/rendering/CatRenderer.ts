import { Cat, Direction } from '../game/Cat';

export interface SkinPalette {
  body: string;
  earsInner: string;
  stripes?: string;
  eyes: string;
  blush: string;
  muzzle?: string;
  patch?: string;
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
    body: '#363636',
    earsInner: '#505050',
    eyes: '#76D275',
    blush: 'rgba(255, 255, 255, 0.15)'
  },
  siamese: {
    body: '#F5E6D3',
    earsInner: '#3E2723',
    muzzle: '#4E342E',
    eyes: '#29B6F6',
    blush: 'rgba(255, 120, 120, 0.2)'
  },
  calico: {
    body: '#FFFFFF',
    earsInner: '#FF8A8A',
    patch: '#FF9800',
    stripes: '#37474F',
    eyes: '#66BB6A',
    blush: 'rgba(255, 100, 100, 0.25)'
  },
  hat: {
    body: '#FFB84D',
    earsInner: '#FF8A8A',
    stripes: '#E69B2A',
    eyes: '#363636',
    blush: 'rgba(255, 100, 100, 0.25)'
  },
  pirate: {
    body: '#795548',
    earsInner: '#4E342E',
    eyes: '#FFCA28',
    blush: 'rgba(0, 0, 0, 0.15)'
  },
  astronaut: {
    body: '#E0E0E0',
    earsInner: '#BDBDBD',
    eyes: '#00E5FF',
    blush: 'rgba(0, 229, 255, 0.2)'
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
    this.drawBodyAndHead(ctx, baseRadius, palette, cat.skin, cat.direction, cat.isBlinking);

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
    skinId: string,
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

    // 3. Узоры и пятна скина (полоски, пятна трехцветки, сиамская мордочка)
    this.drawPatterns(ctx, radius, palette, skinId, direction);

    // 4. Мордочка (глаза, носик, щечки), смещенные в направлении взгляда
    this.drawFace(ctx, radius, palette, skinId, direction, isBlinking);

    // 5. Уникальные аксессуары (шляпа, пиратская треуголка, скафандр)
    this.drawAccessories(ctx, radius, skinId, direction);
  }

  private static drawPatterns(
    ctx: CanvasRenderingContext2D,
    radius: number,
    palette: SkinPalette,
    skinId: string,
    direction: Direction
  ): void {
    if (direction === 'up') return;

    // Пятна трёхцветки (Calico)
    if (skinId === 'calico') {
      ctx.save();
      // Рыжее пятно слева
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(-radius * 0.45, -radius * 0.4, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // Темное пятно справа
      ctx.fillStyle = '#37474F';
      ctx.beginPath();
      ctx.arc(radius * 0.5, -radius * 0.35, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Сиамская темная маска (Siamese)
    if (skinId === 'siamese') {
      ctx.save();
      ctx.fillStyle = palette.muzzle || '#4E342E';
      ctx.beginPath();
      let cx = 0;
      let cy = radius * 0.1;
      if (direction === 'left') cx = -radius * 0.25;
      if (direction === 'right') cx = radius * 0.25;
      ctx.ellipse(cx, cy, radius * 0.48, radius * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Полоски на лобике для Рыжика
    if (skinId === 'ginger') {
      ctx.save();
      ctx.strokeStyle = palette.stripes || '#E69B2A';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      const cx = direction === 'left' ? -radius * 0.15 : direction === 'right' ? radius * 0.15 : 0;
      ctx.beginPath();
      ctx.moveTo(cx, -radius * 0.8);
      ctx.lineTo(cx, -radius * 0.5);
      ctx.moveTo(cx - 7, -radius * 0.75);
      ctx.lineTo(cx - 5, -radius * 0.55);
      ctx.moveTo(cx + 7, -radius * 0.75);
      ctx.lineTo(cx + 5, -radius * 0.55);
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawAccessories(
    ctx: CanvasRenderingContext2D,
    radius: number,
    skinId: string,
    _direction: Direction
  ): void {
    // 🎩 Кот в шляпе (Hat)
    if (skinId === 'hat') {
      ctx.save();
      const hatY = -radius * 0.75;
      const hatWidth = radius * 0.85;
      const hatHeight = radius * 0.65;
      // Поля шляпы
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(0, hatY, hatWidth * 0.75, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      // Тулья шляпы
      ctx.fillRect(-hatWidth * 0.4, hatY - hatHeight, hatWidth * 0.8, hatHeight);
      ctx.beginPath();
      ctx.ellipse(0, hatY - hatHeight, hatWidth * 0.4, radius * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Красная лента
      ctx.fillStyle = '#E53935';
      ctx.fillRect(-hatWidth * 0.4, hatY - radius * 0.18, hatWidth * 0.8, radius * 0.16);
      ctx.restore();
    }

    // 🏴‍☠️ Кот-пират (Pirate)
    if (skinId === 'pirate') {
      ctx.save();
      // Пиратская треуголка
      ctx.fillStyle = '#1A1A1A';
      ctx.beginPath();
      ctx.moveTo(-radius * 0.9, -radius * 0.6);
      ctx.lineTo(0, -radius * 1.3);
      ctx.lineTo(radius * 0.9, -radius * 0.6);
      ctx.quadraticCurveTo(0, -radius * 0.45, -radius * 0.9, -radius * 0.6);
      ctx.closePath();
      ctx.fill();
      // Золотой черепок/знак
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(0, -radius * 0.82, radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 🚀 Космонавт (Astronaut)
    if (skinId === 'astronaut') {
      ctx.save();
      // Прозрачный купол шлема
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(129, 212, 250, 0.22)';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Блик на стекле
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.95, -0.8 * Math.PI, -0.3 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
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
    skinId: string,
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

      if (skinId !== 'pirate') {
        ctx.beginPath();
        ctx.arc(offsetX + radius * 0.3, offsetY - radius * 0.05, eyeRadius, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
    } else {
      // Левый глаз
      ctx.beginPath();
      ctx.arc(offsetX - radius * 0.3, offsetY - radius * 0.05, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(offsetX - radius * 0.3 - eyeRadius * 0.3, offsetY - radius * 0.05 - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Правый глаз (или повязка у пирата)
      if (skinId === 'pirate') {
        ctx.save();
        // Ремешок повязки
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(offsetX - radius * 0.5, offsetY - radius * 0.4);
        ctx.lineTo(offsetX + radius * 0.6, offsetY + radius * 0.2);
        ctx.stroke();
        // Сама повязка на правом глазу
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.ellipse(offsetX + radius * 0.3, offsetY - radius * 0.05, eyeRadius * 1.3, eyeRadius * 1.1, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = palette.eyes;
        ctx.beginPath();
        ctx.arc(offsetX + radius * 0.3, offsetY - radius * 0.05, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(offsetX + radius * 0.3 - eyeRadius * 0.3, offsetY - radius * 0.05 - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
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

  /**
   * Отрисовывает превью котика на переданном контексте в заданных координатах
   */
  public static renderPreview(
    ctx: CanvasRenderingContext2D,
    skinId: string,
    centerX: number,
    centerY: number,
    size: number
  ): void {
    ctx.save();
    ctx.translate(centerX, centerY);
    const radius = size * 0.4;
    const palette = PALETTES[skinId] || PALETTES.ginger;

    // Мягкая тень под котиком
    ctx.fillStyle = 'rgba(54, 54, 54, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.85, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    this.drawBodyAndHead(ctx, radius, palette, skinId, 'down', false);
    ctx.restore();
  }

  /**
   * Рисует котика прямо в Canvas элемент заданного размера
   */
  public static renderPreviewToCanvas(canvas: HTMLCanvasElement, skinId: string): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || canvas.width || 64;
    const height = canvas.clientHeight || canvas.height || 64;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    this.renderPreview(ctx, skinId, width / 2, height / 2, Math.min(width, height));
  }
}
