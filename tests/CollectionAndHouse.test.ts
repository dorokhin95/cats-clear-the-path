import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerProgress } from '../src/progression/PlayerProgress';
import { CatCollection } from '../src/progression/CatCollection';
import { CatHouseScreen } from '../src/ui/CatHouseScreen';

describe('CatCollection & CatHouse Progression', () => {
  let progress: PlayerProgress;

  beforeEach(() => {
    progress = new PlayerProgress();
  });

  it('реестр CatCollection должен содержать корректные данные скинов', () => {
    const skins = CatCollection.getAllSkins();
    expect(skins.length).toBeGreaterThanOrEqual(8);

    const ginger = CatCollection.getSkin('ginger');
    expect(ginger).toBeDefined();
    expect(ginger?.cost).toBe(0);
    expect(ginger?.unlockedByDefault).toBe(true);

    const pirate = CatCollection.getSkin('pirate');
    expect(pirate).toBeDefined();
    expect(pirate?.rarity).toBe('special');
    expect(pirate?.cost).toBe(400);
  });

  it('игрок не может купить скин, если не хватает монет', () => {
    expect(progress.getCoins()).toBe(0);
    const bought = progress.buySkin('smoky', 50);
    expect(bought).toBe(false);
    expect(progress.isCatUnlocked('smoky')).toBe(false);
  });

  it('игрок успешно покупает скин при наличии монет и он автоматически выбирается', () => {
    progress.addCoins(100);
    const bought = progress.buySkin('smoky', 50);

    expect(bought).toBe(true);
    expect(progress.getCoins()).toBe(50);
    expect(progress.isCatUnlocked('smoky')).toBe(true);
    expect(progress.getSelectedCat()).toBe('smoky');
  });

  it('нельзя выбрать закрытый скин, но можно переключать открытые', () => {
    expect(progress.selectCat('shadow')).toBe(false);
    expect(progress.getSelectedCat()).toBe('ginger');

    progress.addCoins(200);
    progress.buySkin('shadow', 100);
    expect(progress.getSelectedCat()).toBe('shadow');

    // Переключение обратно на Рыжика
    expect(progress.selectCat('ginger')).toBe(true);
    expect(progress.getSelectedCat()).toBe('ginger');
  });

  it('CatHouseScreen корректно монтируется и отображает прогресс', () => {
    const container = document.createElement('div');
    const house = new CatHouseScreen(progress, { onBack: () => {} });
    house.mount(container);

    expect(container.querySelector('#screen-cat-house')).not.toBeNull();
    expect(container.textContent).toContain('ДОМИК КОТИКОВ');
  });
});
