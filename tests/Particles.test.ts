import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/rendering/Particles';

describe('ParticleSystem & Object Pooling', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  it('изначально активных частиц быть не должно', () => {
    expect(ps.getActiveCount()).toBe(0);
  });

  it('должен активировать 5–7 частиц-лапок при вызове spawnPawPrints', () => {
    ps.spawnPawPrints(100, 100);
    const active = ps.getActiveCount();
    expect(active).toBeGreaterThanOrEqual(5);
    expect(active).toBeLessThanOrEqual(8);
  });

  it('частицы должны затухать и деактивироваться по истечении времени жизни', () => {
    ps.spawnPawPrints(100, 100);
    expect(ps.getActiveCount()).toBeGreaterThan(0);

    // Симулируем 1.5 секунды
    ps.update(1.5);
    expect(ps.getActiveCount()).toBe(0);
  });

  it('должен спавнить конфетти победы', () => {
    ps.spawnVictoryConfetti(200, 200, 30);
    expect(ps.getActiveCount()).toBe(30);
  });

  it('метод clear должен моментально сбрасывать все активные частицы', () => {
    ps.spawnVictoryConfetti(200, 200, 30);
    expect(ps.getActiveCount()).toBe(30);

    ps.clear();
    expect(ps.getActiveCount()).toBe(0);
  });
});
