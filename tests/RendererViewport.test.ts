import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Renderer } from '../src/rendering/Renderer';
import { Board } from '../src/game/Board';

describe('Renderer Viewport & Canvas Resize Resilience', () => {
  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
    document.body.appendChild(container);

    canvas.getContext = vi.fn().mockReturnValue(
      new Proxy({}, {
        get: (_target, prop) => {
          if (prop === 'canvas') return canvas;
          return vi.fn();
        }
      })
    );

    let currentWidth = 400;
    let currentHeight = 700;

    vi.spyOn(canvas, 'getBoundingClientRect').mockImplementation(() => ({
      width: currentWidth,
      height: currentHeight,
      top: 0,
      left: 0,
      bottom: currentHeight,
      right: currentWidth,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));

    (canvas as any)._setWidth = (w: number) => { currentWidth = w; };
    (canvas as any)._setHeight = (h: number) => { currentHeight = h; };
  });

  it('Renderer инициализируется с корректными логическими размерами и буфером', () => {
    const renderer = new Renderer(canvas);
    const size = renderer.getLogicalSize();

    expect(size.width).toBe(400);
    expect(size.height).toBe(700);
    expect(canvas.width).toBeGreaterThanOrEqual(400);
    expect(canvas.height).toBeGreaterThanOrEqual(700);

    renderer.destroy();
  });

  it('Renderer защищен от сброса в 0 при скрытом канвасе (display: none или 0x0)', () => {
    const renderer = new Renderer(canvas);
    expect(renderer.getLogicalSize().width).toBe(400);

    (canvas as any)._setWidth(0);
    (canvas as any)._setHeight(0);

    renderer.handleResize();
    expect(renderer.getLogicalSize().width).toBe(400);
    expect(renderer.getLogicalSize().height).toBe(700);

    renderer.destroy();
  });

  it('checkResize() автоматически синхронизирует размеры перед отрисовкой кадра', () => {
    const renderer = new Renderer(canvas);
    const board = new Board(4, 4);

    (canvas as any)._setWidth(480);
    (canvas as any)._setHeight(820);

    renderer.render(board, 0, 0.016);

    const newSize = renderer.getLogicalSize();
    expect(newSize.width).toBe(480);
    expect(newSize.height).toBe(820);

    renderer.destroy();
  });

  it('screenToCanvas корректно переводит координаты тапа с учетом позиции канваса', () => {
    const renderer = new Renderer(canvas);
    const coords = renderer.screenToCanvas(150, 250);

    expect(coords.x).toBe(150);
    expect(coords.y).toBe(250);

    renderer.destroy();
  });
});
