import { Cat, Direction } from '../game/Cat';

export interface SkinPalette {
  body: string;
  bodyLight: string;
  bodyDark: string;
  stroke: string;
  earsInner: string;
  eyes: string;
  eyesPupil: string;
  eyesGlint?: string;
  blush: string;
  muzzle?: string;
  stripes?: string;
  patch?: string;
  patch2?: string;
  whiskers: string;
  paws: string;
  tailTip?: string;
}

const PALETTES: Record<string, SkinPalette> = {
  ginger: {
    body: '#FFA726',
    bodyLight: '#FFCC80',
    bodyDark: '#F57C00',
    stroke: '#E65100',
    earsInner: '#FFAB91',
    eyes: '#5D4037',
    eyesPupil: '#2E1C0C',
    eyesGlint: '#8D6E63',
    blush: 'rgba(255, 112, 67, 0.32)',
    muzzle: '#FFF8E1',
    stripes: '#E65100',
    whiskers: '#BF360C',
    paws: '#FFFFFF',
    tailTip: '#FFFFFF'
  },
  smoky: {
    body: '#90A4AE',
    bodyLight: '#CFD8DC',
    bodyDark: '#607D8B',
    stroke: '#455A64',
    earsInner: '#FFCDD2',
    eyes: '#FFB300',
    eyesPupil: '#4E342E',
    eyesGlint: '#FFE082',
    blush: 'rgba(244, 143, 177, 0.3)',
    muzzle: '#ECEFF1',
    whiskers: '#37474F',
    paws: '#ECEFF1'
  },
  snowball: {
    body: '#FFFFFF',
    bodyLight: '#FFFFFF',
    bodyDark: '#E0E0E0',
    stroke: '#BDBDBD',
    earsInner: '#F8BBD0',
    eyes: '#29B6F6',
    eyesPupil: '#01579B',
    eyesGlint: '#B3E5FC',
    blush: 'rgba(255, 128, 171, 0.3)',
    muzzle: '#FFFFFF',
    whiskers: '#9E9E9E',
    paws: '#FFFFFF'
  },
  shadow: {
    body: '#263238',
    bodyLight: '#37474F',
    bodyDark: '#1A2327',
    stroke: '#0F171A',
    earsInner: '#455A64',
    eyes: '#66BB6A',
    eyesPupil: '#1B5E20',
    eyesGlint: '#C8E6C9',
    blush: 'rgba(255, 255, 255, 0.15)',
    muzzle: '#37474F',
    whiskers: '#78909C',
    paws: '#263238'
  },
  siamese: {
    body: '#F5EBE1',
    bodyLight: '#FAF5F0',
    bodyDark: '#E5D5C5',
    stroke: '#8D6E63',
    earsInner: '#4E342E',
    muzzle: '#3E2723',
    eyes: '#0288D1',
    eyesPupil: '#01579B',
    eyesGlint: '#B3E5FC',
    blush: 'rgba(255, 138, 128, 0.25)',
    whiskers: '#4E342E',
    paws: '#3E2723'
  },
  calico: {
    body: '#FFFFFF',
    bodyLight: '#FFFFFF',
    bodyDark: '#EEEEEE',
    stroke: '#BDBDBD',
    earsInner: '#FFAB91',
    patch: '#FB8C00',
    patch2: '#37474F',
    eyes: '#43A047',
    eyesPupil: '#1B5E20',
    eyesGlint: '#A5D6A7',
    blush: 'rgba(255, 112, 67, 0.3)',
    muzzle: '#FFFFFF',
    whiskers: '#616161',
    paws: '#FFFFFF'
  },
  hat: {
    body: '#FFA726',
    bodyLight: '#FFCC80',
    bodyDark: '#F57C00',
    stroke: '#E65100',
    earsInner: '#FFAB91',
    stripes: '#E65100',
    eyes: '#5D4037',
    eyesPupil: '#2E1C0C',
    eyesGlint: '#8D6E63',
    blush: 'rgba(255, 112, 67, 0.32)',
    muzzle: '#FFF8E1',
    whiskers: '#BF360C',
    paws: '#FFFFFF'
  },
  pirate: {
    body: '#8D6E63',
    bodyLight: '#BCAAA4',
    bodyDark: '#5D4037',
    stroke: '#3E2723',
    earsInner: '#4E342E',
    eyes: '#FFCA28',
    eyesPupil: '#3E2723',
    eyesGlint: '#FFF9C4',
    blush: 'rgba(0, 0, 0, 0.15)',
    muzzle: '#D7CCC8',
    whiskers: '#3E2723',
    paws: '#5D4037'
  },
  astronaut: {
    body: '#ECEFF1',
    bodyLight: '#FFFFFF',
    bodyDark: '#CFD8DC',
    stroke: '#90A4AE',
    earsInner: '#B0BEC5',
    eyes: '#00E5FF',
    eyesPupil: '#006064',
    eyesGlint: '#E0F7FA',
    blush: 'rgba(0, 229, 255, 0.25)',
    muzzle: '#FFFFFF',
    whiskers: '#78909C',
    paws: '#FFFFFF'
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

    // Базовый радиус тела
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

    // Мягкая естественная тень под котиком
    ctx.fillStyle = 'rgba(54, 54, 54, 0.14)';
    ctx.beginPath();
    ctx.ellipse(0, baseRadius * 0.85, baseRadius * 0.82, baseRadius * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Отрисовка котика (ушки, тело, шерстка, мордочка, аксессуары)
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

    // Крупная, сверх-контрастная и четкая стрелка направления движения (белая с жирным черным контуром)
    const startX = -radius * 0.2;
    const arrowTipX = radius * 0.92;
    const headLength = radius * 0.54;
    const headWidth = radius * 0.66;
    const shaftHalfWidth = radius * 0.2;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#151722';
    ctx.lineWidth = 3.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    // Хвостик стрелки
    ctx.moveTo(startX, -shaftHalfWidth);
    // До основания наконечника сверху
    ctx.lineTo(arrowTipX - headLength, -shaftHalfWidth);
    // Верхнее крыло наконечника
    ctx.lineTo(arrowTipX - headLength, -headWidth / 2);
    // Острие стрелки
    ctx.lineTo(arrowTipX, 0);
    // Нижнее крыло наконечника
    ctx.lineTo(arrowTipX - headLength, headWidth / 2);
    // До основания наконечника снизу
    ctx.lineTo(arrowTipX - headLength, shaftHalfWidth);
    // Завершение хвостика
    ctx.lineTo(startX, shaftHalfWidth);
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
    // 1. Хвостик сзади
    this.drawTail(ctx, radius, palette, direction);

    // 2. Ушки
    this.drawEars(ctx, radius, palette, skinId, direction);

    // 3. Тело и голова с мягким кавайным силуэтом (пухлые щёчки и градиент шерсти)
    let bodyFill: string | CanvasGradient = palette.body;
    try {
      const grad = ctx.createRadialGradient(
        -radius * 0.25,
        -radius * 0.25,
        radius * 0.1,
        0,
        0,
        radius * 1.05
      );
      if (grad && typeof grad.addColorStop === 'function') {
        grad.addColorStop(0, palette.bodyLight);
        grad.addColorStop(0.65, palette.body);
        grad.addColorStop(1, palette.bodyDark);
        bodyFill = grad;
      }
    } catch {
      bodyFill = palette.body;
    }

    ctx.fillStyle = bodyFill;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    // Округлая форма с мягкими щечками
    ctx.ellipse(0, 0, radius, radius * 0.94, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. Светлая манишка на грудке (если есть)
    if (palette.muzzle && skinId !== 'shadow' && direction !== 'up') {
      ctx.save();
      ctx.fillStyle = palette.muzzle;
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.58, radius * 0.46, radius * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Маленькие пушистые лапки спереди (при взгляде вниз или спереди)
    if (direction === 'down') {
      this.drawPaws(ctx, radius, palette);
    }

    // 6. Узоры и пятна скина (полоски, калико, сиамская мордочка)
    this.drawPatterns(ctx, radius, palette, skinId, direction);

    // 7. Мордочка (глазки, носик, улыбка, усики, румянец)
    this.drawFace(ctx, radius, palette, skinId, direction, isBlinking);

    // 8. Уникальные аксессуары (шляпа, пиратская треуголка, скафандр)
    this.drawAccessories(ctx, radius, skinId, direction);
  }

  private static drawTail(
    ctx: CanvasRenderingContext2D,
    radius: number,
    palette: SkinPalette,
    direction: Direction
  ): void {
    ctx.save();
    ctx.strokeStyle = palette.body;
    ctx.lineWidth = radius * 0.22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (direction === 'up') {
      // Со спины хвостик задорно поднят вверх
      ctx.moveTo(radius * 0.2, radius * 0.6);
      ctx.quadraticCurveTo(radius * 0.7, radius * 0.3, radius * 0.65, -radius * 0.1);
    } else if (direction === 'left') {
      ctx.moveTo(radius * 0.5, radius * 0.4);
      ctx.quadraticCurveTo(radius * 0.9, radius * 0.2, radius * 0.85, -radius * 0.2);
    } else if (direction === 'right') {
      ctx.moveTo(-radius * 0.5, radius * 0.4);
      ctx.quadraticCurveTo(-radius * 0.9, radius * 0.2, -radius * 0.85, -radius * 0.2);
    } else {
      // Вид спереди (хвостик мягко выглядывает справа)
      ctx.moveTo(radius * 0.45, radius * 0.45);
      ctx.quadraticCurveTo(radius * 0.88, radius * 0.3, radius * 0.78, -radius * 0.1);
    }
    ctx.stroke();

    // Белый кончик хвоста (если есть в палитре)
    if (palette.tailTip) {
      ctx.strokeStyle = palette.tailTip;
      ctx.lineWidth = radius * 0.18;
      ctx.beginPath();
      if (direction === 'left') {
        ctx.arc(radius * 0.85, -radius * 0.2, radius * 0.08, 0, Math.PI * 2);
      } else if (direction === 'right') {
        ctx.arc(-radius * 0.85, -radius * 0.2, radius * 0.08, 0, Math.PI * 2);
      } else {
        ctx.arc(radius * 0.78, -radius * 0.1, radius * 0.08, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  private static drawPaws(ctx: CanvasRenderingContext2D, radius: number, palette: SkinPalette): void {
    ctx.save();
    ctx.fillStyle = palette.paws || '#FFFFFF';
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1.2;

    // Левая лапка
    ctx.beginPath();
    ctx.ellipse(-radius * 0.32, radius * 0.74, radius * 0.18, radius * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Правая лапка
    ctx.beginPath();
    ctx.ellipse(radius * 0.32, radius * 0.74, radius * 0.18, radius * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Розовые подушечки лапок
    ctx.fillStyle = '#FFAAA6';
    ctx.beginPath();
    ctx.arc(-radius * 0.32, radius * 0.76, radius * 0.06, 0, Math.PI * 2);
    ctx.arc(radius * 0.32, radius * 0.76, radius * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private static drawEars(
    ctx: CanvasRenderingContext2D,
    radius: number,
    palette: SkinPalette,
    skinId: string,
    direction: Direction
  ): void {
    ctx.save();
    ctx.fillStyle = palette.body;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    // Конфигурация ушек
    let e1Base = { x: -radius * 0.72, y: -radius * 0.38 };
    let e1Tip = { x: -radius * 0.88, y: -radius * 1.15 };
    let e1In = { x: -radius * 0.18, y: -radius * 0.82 };

    let e2Base = { x: radius * 0.72, y: -radius * 0.38 };
    let e2Tip = { x: radius * 0.88, y: -radius * 1.15 };
    let e2In = { x: radius * 0.18, y: -radius * 0.82 };

    if (direction === 'up') {
      e1Tip = { x: -radius * 0.8, y: -radius * 1.22 };
      e2Tip = { x: radius * 0.8, y: -radius * 1.22 };
    } else if (direction === 'left') {
      e1Tip = { x: -radius * 1.05, y: -radius * 0.95 };
      e2Tip = { x: radius * 0.72, y: -radius * 1.12 };
    } else if (direction === 'right') {
      e1Tip = { x: -radius * 0.72, y: -radius * 1.12 };
      e2Tip = { x: radius * 1.05, y: -radius * 0.95 };
    }

    // Левое ухо
    ctx.beginPath();
    ctx.moveTo(e1Base.x, e1Base.y);
    ctx.quadraticCurveTo(e1Tip.x * 0.95, e1Tip.y * 1.05, e1Tip.x, e1Tip.y);
    ctx.quadraticCurveTo(e1In.x * 0.8, e1Tip.y * 0.85, e1In.x, e1In.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Правое ухо
    ctx.beginPath();
    ctx.moveTo(e2Base.x, e2Base.y);
    ctx.quadraticCurveTo(e2Tip.x * 0.95, e2Tip.y * 1.05, e2Tip.x, e2Tip.y);
    ctx.quadraticCurveTo(e2In.x * 0.8, e2Tip.y * 0.85, e2In.x, e2In.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Внутренняя нежная розовая часть ушек (при виде спереди/сбоку)
    if (direction !== 'up') {
      ctx.fillStyle = palette.earsInner;
      // Левая розовая вставка
      ctx.beginPath();
      ctx.moveTo(e1Base.x * 0.85, e1Base.y * 0.85);
      ctx.lineTo(e1Tip.x * 0.88, e1Tip.y * 0.88);
      ctx.lineTo(e1In.x * 0.85, e1In.y * 0.85);
      ctx.closePath();
      ctx.fill();

      // Правая розовая вставка
      ctx.beginPath();
      ctx.moveTo(e2Base.x * 0.85, e2Base.y * 0.85);
      ctx.lineTo(e2Tip.x * 0.88, e2Tip.y * 0.88);
      ctx.lineTo(e2In.x * 0.85, e2In.y * 0.85);
      ctx.closePath();
      ctx.fill();
    }

    // Пиратская золотая серёжка в левом ушке 💍
    if (skinId === 'pirate') {
      ctx.save();
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(e1Base.x - 2, e1Base.y + 2, radius * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
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
      // Рыжее пятно на левой щечке
      ctx.fillStyle = palette.patch || '#FB8C00';
      ctx.beginPath();
      ctx.arc(-radius * 0.45, -radius * 0.4, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // Тёмно-графитовое пятно на правом ушке
      ctx.fillStyle = palette.patch2 || '#37474F';
      ctx.beginPath();
      ctx.arc(radius * 0.5, -radius * 0.42, radius * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Сиамская темная маска (Siamese)
    if (skinId === 'siamese') {
      ctx.save();
      ctx.fillStyle = palette.muzzle || '#3E2723';
      ctx.beginPath();
      let cx = 0;
      let cy = radius * 0.1;
      if (direction === 'left') cx = -radius * 0.25;
      if (direction === 'right') cx = radius * 0.25;
      ctx.ellipse(cx, cy, radius * 0.52, radius * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Полоски на лобике для Рыжика
    if (skinId === 'ginger' || skinId === 'hat') {
      ctx.save();
      ctx.strokeStyle = palette.stripes || '#E65100';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      const cx = direction === 'left' ? -radius * 0.15 : direction === 'right' ? radius * 0.15 : 0;
      ctx.beginPath();
      ctx.moveTo(cx, -radius * 0.78);
      ctx.lineTo(cx, -radius * 0.48);
      ctx.moveTo(cx - 7, -radius * 0.72);
      ctx.lineTo(cx - 5, -radius * 0.52);
      ctx.moveTo(cx + 7, -radius * 0.72);
      ctx.lineTo(cx + 5, -radius * 0.52);
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawFace(
    ctx: CanvasRenderingContext2D,
    radius: number,
    palette: SkinPalette,
    skinId: string,
    direction: Direction,
    isBlinking: boolean
  ): void {
    if (direction === 'up') return;

    let offsetX = 0;
    let offsetY = 0;

    if (direction === 'down') {
      offsetY = radius * 0.12;
    } else if (direction === 'left') {
      offsetX = -radius * 0.28;
    } else if (direction === 'right') {
      offsetX = radius * 0.28;
    }

    // 1. Румянец на щёчках
    ctx.fillStyle = palette.blush;
    ctx.beginPath();
    ctx.arc(offsetX - radius * 0.48, offsetY + radius * 0.16, radius * 0.16, 0, Math.PI * 2);
    ctx.arc(offsetX + radius * 0.48, offsetY + radius * 0.16, radius * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // 2. Усики (Whiskers) — изящные кошачьи усики по 2 с каждой стороны
    ctx.save();
    ctx.strokeStyle = palette.whiskers;
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.6;

    // Левые усики
    ctx.beginPath();
    ctx.moveTo(offsetX - radius * 0.38, offsetY + radius * 0.14);
    ctx.lineTo(offsetX - radius * 0.85, offsetY + radius * 0.06);
    ctx.moveTo(offsetX - radius * 0.38, offsetY + radius * 0.22);
    ctx.lineTo(offsetX - radius * 0.82, offsetY + radius * 0.28);
    ctx.stroke();

    // Правые усики
    ctx.beginPath();
    ctx.moveTo(offsetX + radius * 0.38, offsetY + radius * 0.14);
    ctx.lineTo(offsetX + radius * 0.85, offsetY + radius * 0.06);
    ctx.moveTo(offsetX + radius * 0.38, offsetY + radius * 0.22);
    ctx.lineTo(offsetX + radius * 0.82, offsetY + radius * 0.28);
    ctx.stroke();
    ctx.restore();

    // 3. Выразительные живые кавайные глазки с двойным бликом
    const eyeRadius = radius * 0.15;
    const eyeSpacing = radius * 0.32;

    if (isBlinking) {
      // Моргание — улыбающиеся закрытые дуги глаз
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = palette.eyes;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(offsetX - eyeSpacing, offsetY - radius * 0.04, eyeRadius, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      if (skinId !== 'pirate') {
        ctx.beginPath();
        ctx.arc(offsetX + eyeSpacing, offsetY - radius * 0.04, eyeRadius, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
    } else {
      // Левый открытый глаз
      this.drawKawaiiEye(ctx, offsetX - eyeSpacing, offsetY - radius * 0.04, eyeRadius, palette);

      // Правый глаз (или повязка у пирата)
      if (skinId === 'pirate') {
        ctx.save();
        // Ремешок повязки
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(offsetX - radius * 0.65, offsetY - radius * 0.35);
        ctx.lineTo(offsetX + radius * 0.75, offsetY + radius * 0.25);
        ctx.stroke();
        // Повязка на правом глазу
        ctx.fillStyle = '#212121';
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(offsetX + eyeSpacing, offsetY - radius * 0.04, eyeRadius * 1.25, eyeRadius * 1.15, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        this.drawKawaiiEye(ctx, offsetX + eyeSpacing, offsetY - radius * 0.04, eyeRadius, palette);
      }
    }

    // 4. Аккуратный розовый носик
    ctx.fillStyle = '#FF7A7A';
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY + radius * 0.14, radius * 0.09, radius * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Улыбающийся ротик (ω)
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(offsetX - radius * 0.08, offsetY + radius * 0.22, radius * 0.08, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(offsetX + radius * 0.08, offsetY + radius * 0.22, radius * 0.08, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  private static drawKawaiiEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    palette: SkinPalette
  ): void {
    ctx.save();

    // Радужка с насыщенным цветом
    ctx.fillStyle = palette.eyes;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 1.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Глубокий зрачок в центре
    ctx.fillStyle = palette.eyesPupil || '#1A1A1A';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.08, size * 0.65, size * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();

    // Главный сияющий блик (сверху-слева)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - size * 0.32, y - size * 0.32, size * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Маленький вторичный блик (снизу-справа)
    ctx.beginPath();
    ctx.arc(x + size * 0.28, y + size * 0.28, size * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private static drawAccessories(
    ctx: CanvasRenderingContext2D,
    radius: number,
    skinId: string,
    _direction: Direction
  ): void {
    // 🎩 Кот в шляпе (Hat): стильный котелок с алой лентой и золотой пряжкой
    if (skinId === 'hat') {
      ctx.save();
      const hatY = -radius * 0.78;
      const hatWidth = radius * 0.92;
      const hatHeight = radius * 0.68;

      // Поля шляпы
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(0, hatY, hatWidth * 0.76, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Тулья шляпы
      let hatCrownFill: string | CanvasGradient = '#212121';
      try {
        const crownGrad = ctx.createLinearGradient(0, hatY - hatHeight, 0, hatY);
        if (crownGrad && typeof crownGrad.addColorStop === 'function') {
          crownGrad.addColorStop(0, '#37474F');
          crownGrad.addColorStop(1, '#212121');
          hatCrownFill = crownGrad;
        }
      } catch {
        hatCrownFill = '#212121';
      }
      ctx.fillStyle = hatCrownFill;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-hatWidth * 0.42, hatY - hatHeight, hatWidth * 0.84, hatHeight, [8, 8, 0, 0]);
      } else {
        ctx.rect(-hatWidth * 0.42, hatY - hatHeight, hatWidth * 0.84, hatHeight);
      }
      ctx.fill();

      // Шелковая алая лента
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(-hatWidth * 0.42, hatY - radius * 0.2, hatWidth * 0.84, radius * 0.16);

      // Золотая пряжка
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(-radius * 0.12, hatY - radius * 0.2, radius * 0.24, radius * 0.16);

      ctx.restore();
    }

    // 🏴‍☠️ Кот-пират (Pirate): треуголка с золотым символом
    if (skinId === 'pirate') {
      ctx.save();
      const hatY = -radius * 0.75;
      const hatW = radius * 1.35;

      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#BCAAA4';
      ctx.lineWidth = 1.8;

      // Форма треуголки
      ctx.beginPath();
      ctx.moveTo(-hatW * 0.5, hatY + radius * 0.05);
      ctx.quadraticCurveTo(0, hatY - radius * 0.65, hatW * 0.5, hatY + radius * 0.05);
      ctx.quadraticCurveTo(0, hatY - radius * 0.15, -hatW * 0.5, hatY + radius * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Золотой знак лапки на треуголке
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(0, hatY - radius * 0.22, radius * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 🚀 Космонавт (Astronaut): объемный шлем с бликами и скафандром
    if (skinId === 'astronaut') {
      ctx.save();
      // Прозрачный стеклянный купол шлема
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(129, 212, 250, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Сферический дуговой блик на стекле
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.98, -0.82 * Math.PI, -0.28 * Math.PI);
      ctx.stroke();

      // Маленький дополнительный блик снизу
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.98, 0.35 * Math.PI, 0.55 * Math.PI);
      ctx.stroke();

      // Металлическое кольцо скафандра снизу
      ctx.fillStyle = '#78909C';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.92, radius * 0.72, radius * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
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
   * Отрисовывает детального домашнего котика в сидячей уютной позе спереди (для Домика, Магазина и Маскота)
   */
  public static renderHomeCat(
    ctx: CanvasRenderingContext2D,
    skinId: string,
    centerX: number,
    centerY: number,
    size: number
  ): void {
    ctx.save();
    ctx.translate(centerX, centerY);

    const scale = size / 100;
    ctx.scale(scale, scale);

    const palette = PALETTES[skinId] || PALETTES.ginger;

    // 1. Мягкая тень на полу
    ctx.fillStyle = 'rgba(54, 54, 54, 0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 42, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Хвостик, выглядывающий сбоку
    ctx.save();
    ctx.strokeStyle = palette.body;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(14, 28);
    ctx.quadraticCurveTo(40, 24, 34, 4);
    ctx.stroke();

    if (palette.tailTip) {
      ctx.strokeStyle = palette.tailTip;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(34, 4, 4.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Тело сидящего пушистого котика
    ctx.save();
    let bodyGrad: string | CanvasGradient = palette.body;
    try {
      const g = ctx.createRadialGradient(-6, 12, 4, 0, 18, 36);
      if (g && typeof g.addColorStop === 'function') {
        g.addColorStop(0, palette.bodyLight);
        g.addColorStop(0.68, palette.body);
        g.addColorStop(1, palette.bodyDark);
        bodyGrad = g;
      }
    } catch {
      bodyGrad = palette.body;
    }
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(-20, 38);
    ctx.quadraticCurveTo(-26, 20, -18, 4);
    ctx.quadraticCurveTo(0, -2, 18, 4);
    ctx.quadraticCurveTo(26, 20, 20, 38);
    ctx.quadraticCurveTo(0, 43, -20, 38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. Белая манишка на грудке
    if (palette.muzzle && skinId !== 'shadow') {
      ctx.save();
      ctx.fillStyle = palette.muzzle;
      ctx.beginPath();
      ctx.ellipse(0, 20, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Передние лапки с подушечками
    ctx.save();
    ctx.fillStyle = palette.paws || '#FFFFFF';
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1.6;

    // Левая лапка
    ctx.beginPath();
    ctx.ellipse(-9, 36, 7.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Правая лапка
    ctx.beginPath();
    ctx.ellipse(9, 36, 7.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Розовые подушечки
    ctx.fillStyle = '#FFAAA6';
    ctx.beginPath();
    ctx.arc(-9, 37.5, 2.5, 0, Math.PI * 2);
    ctx.arc(9, 37.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Ушки
    ctx.save();
    ctx.fillStyle = palette.body;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    // Левое ушко
    ctx.beginPath();
    ctx.moveTo(-24, -14);
    ctx.quadraticCurveTo(-34, -38, -28, -40);
    ctx.quadraticCurveTo(-14, -30, -6, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Правое ушко
    ctx.beginPath();
    ctx.moveTo(24, -14);
    ctx.quadraticCurveTo(34, -38, 28, -40);
    ctx.quadraticCurveTo(14, -30, 6, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Розовые вставки в ушки
    ctx.fillStyle = palette.earsInner;
    ctx.beginPath();
    ctx.moveTo(-20, -16);
    ctx.lineTo(-27, -36);
    ctx.lineTo(-8, -24);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(20, -16);
    ctx.lineTo(27, -36);
    ctx.lineTo(8, -24);
    ctx.closePath();
    ctx.fill();

    // Пиратская золотая серёжка в левом ушке
    if (skinId === 'pirate') {
      ctx.save();
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(-28, -22, 5.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 7. Голова с пухлыми щечками
    ctx.save();
    let headGrad: string | CanvasGradient = palette.body;
    try {
      const hg = ctx.createRadialGradient(-8, -18, 5, 0, -10, 32);
      if (hg && typeof hg.addColorStop === 'function') {
        hg.addColorStop(0, palette.bodyLight);
        hg.addColorStop(0.7, palette.body);
        hg.addColorStop(1, palette.bodyDark);
        headGrad = hg;
      }
    } catch {
      headGrad = palette.body;
    }
    ctx.fillStyle = headGrad;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.ellipse(0, -10, 30, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 8. Узоры скинов
    // Пятна трёхцветки (Calico)
    if (skinId === 'calico') {
      ctx.save();
      ctx.fillStyle = palette.patch || '#FB8C00';
      ctx.beginPath();
      ctx.arc(-16, -14, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = palette.patch2 || '#37474F';
      ctx.beginPath();
      ctx.arc(18, -16, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Сиамская маска
    if (skinId === 'siamese') {
      ctx.save();
      ctx.fillStyle = palette.muzzle || '#3E2723';
      ctx.beginPath();
      ctx.ellipse(0, -6, 18, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Полоски на лобике у Рыжика и Кота в шляпе
    if (skinId === 'ginger' || skinId === 'hat') {
      ctx.save();
      ctx.strokeStyle = palette.stripes || '#E65100';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, -22);
      ctx.moveTo(-7, -30);
      ctx.lineTo(-5, -23);
      ctx.moveTo(7, -30);
      ctx.lineTo(5, -23);
      ctx.stroke();
      ctx.restore();
    }

    // 9. Румянец на щечках
    ctx.fillStyle = palette.blush;
    ctx.beginPath();
    ctx.arc(-17, -4, 6.5, 0, Math.PI * 2);
    ctx.arc(17, -4, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 10. Усики
    ctx.save();
    ctx.strokeStyle = palette.whiskers;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    // Левые усики
    ctx.moveTo(-12, -4);
    ctx.lineTo(-34, -8);
    ctx.moveTo(-12, 1);
    ctx.lineTo(-32, 5);
    // Правые усики
    ctx.moveTo(12, -4);
    ctx.lineTo(34, -8);
    ctx.moveTo(12, 1);
    ctx.lineTo(32, 5);
    ctx.stroke();
    ctx.restore();

    // 11. Выразительные сияющие глазки
    const eyeSpacing = 12.5;
    const eyeY = -12;
    const eyeRadius = 5.6;

    // Левый глаз
    this.drawKawaiiEye(ctx, -eyeSpacing, eyeY, eyeRadius, palette);

    // Правый глаз (или повязка у пирата)
    if (skinId === 'pirate') {
      ctx.save();
      // Ремешок повязки через мордочку
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-24, -20);
      ctx.lineTo(26, -4);
      ctx.stroke();

      // Сама повязка на правом глазу
      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(eyeSpacing, eyeY, eyeRadius * 1.3, eyeRadius * 1.2, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      this.drawKawaiiEye(ctx, eyeSpacing, eyeY, eyeRadius, palette);
    }

    // 12. Розовый носик
    ctx.fillStyle = '#FF7A7A';
    ctx.beginPath();
    ctx.ellipse(0, -4.5, 3.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 13. Улыбающийся ротик (ω)
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-3.2, -1.5, 3.2, 0.15 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(3.2, -1.5, 3.2, 0.1 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // 14. Специфические детальные аксессуары
    // 🎩 Шляпа-котелок
    if (skinId === 'hat') {
      ctx.save();
      const hatY = -28;
      // Поля
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(0, hatY, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Тулья
      let crownFill: string | CanvasGradient = '#263238';
      try {
        const cg = ctx.createLinearGradient(0, hatY - 22, 0, hatY);
        if (cg && typeof cg.addColorStop === 'function') {
          cg.addColorStop(0, '#37474F');
          cg.addColorStop(1, '#212121');
          crownFill = cg;
        }
      } catch {
        crownFill = '#263238';
      }
      ctx.fillStyle = crownFill;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-14, hatY - 22, 28, 22, [6, 6, 0, 0]);
      } else {
        ctx.rect(-14, hatY - 22, 28, 22);
      }
      ctx.fill();

      // Шелковая алая лента
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(-14, hatY - 7, 28, 6);

      // Золотая пряжка
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 2;
      ctx.strokeRect(-4, hatY - 7, 8, 6);
      ctx.restore();
    }

    // 🏴‍☠️ Пиратская треуголка
    if (skinId === 'pirate') {
      ctx.save();
      const hatY = -28;
      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#BCAAA4';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(-36, hatY + 4);
      ctx.quadraticCurveTo(0, hatY - 24, 36, hatY + 4);
      ctx.quadraticCurveTo(0, hatY - 6, -36, hatY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Золотой знак лапки на треуголке
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(0, hatY - 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 🚀 Скафандр космонавта
    if (skinId === 'astronaut') {
      ctx.save();
      // Стеклянный сферический купол шлема
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 3.2;
      ctx.fillStyle = 'rgba(129, 212, 250, 0.22)';
      ctx.beginPath();
      ctx.arc(0, -9, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Сферические световые блики
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -9, 31, -0.82 * Math.PI, -0.28 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -9, 31, 0.35 * Math.PI, 0.55 * Math.PI);
      ctx.stroke();

      // Металлическое кольцо воротника
      ctx.fillStyle = '#78909C';
      ctx.strokeStyle = '#546E7A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 24, 24, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

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
    this.renderHomeCat(ctx, skinId, centerX, centerY, size);
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

    this.renderHomeCat(ctx, skinId, width / 2, height / 2, Math.min(width, height));
  }
}
