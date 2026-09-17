import { describe, it, expect } from 'vitest';
import { renderGoldenStar, renderEmptyStar } from '../src/ui/StarBadge';

describe('StarBadge Component', () => {
  it('генерирует валидный SVG золотой звезды с градиентом и бликами', () => {
    const svg = renderGoldenStar(48);
    expect(svg).toContain('<svg');
    expect(svg).toContain('win-star-svg--gold');
    expect(svg).toContain('width="48"');
    expect(svg).toContain('height="48"');
    expect(svg).toContain('linearGradient');
    expect(svg).toContain('#FFD54F');
    expect(svg).toContain('#FF8F00');
    expect(svg).toContain('circle'); // Искорка-блик
  });

  it('генерирует валидный SVG пустого слота звезды с мягким фоном', () => {
    const svg = renderEmptyStar(58);
    expect(svg).toContain('<svg');
    expect(svg).toContain('win-star-svg--empty');
    expect(svg).toContain('width="58"');
    expect(svg).toContain('height="58"');
    expect(svg).toContain('#ECE5D8');
    expect(svg).not.toContain('🖤');
  });

  it('поддерживает разные размеры звезд', () => {
    const s1 = renderGoldenStar(32);
    const s2 = renderGoldenStar(64);
    expect(s1).toContain('width="32"');
    expect(s2).toContain('width="64"');
  });
});
