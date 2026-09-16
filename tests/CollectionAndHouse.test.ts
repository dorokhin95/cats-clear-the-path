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

  it('купленные котики немедленно заселяются в CatHouseScreen и отображаются в комнате', () => {
    const container = document.createElement('div');
    const house = new CatHouseScreen(progress, { onBack: () => {} });
    house.mount(container);

    // Изначально живёт только базовый Рыжик
    expect(container.textContent).toContain('В домике живут: 1 из 9 котиков!');
    let canvases = container.querySelectorAll('#houseRoomView canvas');
    expect(canvases.length).toBe(1);

    // Покупаем Дымка и Кота-пирата
    progress.addCoins(600);
    progress.buySkin('smoky', 50);
    progress.buySkin('pirate', 400);

    house.updateProgress(progress);

    // Теперь в домике живут 3 котика
    expect(container.textContent).toContain('В домике живут: 3 из 9 котиков!');
    canvases = container.querySelectorAll('#houseRoomView canvas');
    expect(canvases.length).toBe(3);

    // Имена котиков присутствуют в комнате
    expect(container.textContent).toContain('Рыжик');
    expect(container.textContent).toContain('Дымок');
    expect(container.textContent).toContain('Кот-пират');
  });

  it('CollectionScreen отрисовывает превью-холсты для каждого котика', async () => {
    const { CollectionScreen } = await import('../src/ui/CollectionScreen');
    const container = document.createElement('div');
    const collection = new CollectionScreen(progress, {
      onSelectCat: () => {},
      onBuyCat: () => {},
      onBack: () => {}
    });
    collection.mount(container);

    const canvases = container.querySelectorAll('#skinsListContainer canvas');
    expect(canvases.length).toBe(9);
  });

  it('MainMenu отображает выбранного котика и обновляется при смене скина', async () => {
    const { MainMenu } = await import('../src/ui/MainMenu');
    const container = document.createElement('div');
    const menu = new MainMenu(progress, {
      onPlay: () => {},
      onLevelSelect: () => {},
      onCatHouse: () => {},
      onCollection: () => {},
      onSettings: () => {}
    });
    menu.mount(container);

    const mascotTag = container.querySelector('#mainMenuMascotTag');
    expect(mascotTag?.textContent).toContain('Рыжик');

    progress.addCoins(500);
    progress.buySkin('astronaut', 500);
    progress.selectCat('astronaut');
    menu.updateProgress(progress);

    expect(mascotTag?.textContent).toContain('Космонавт');
  });
});
