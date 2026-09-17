import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerProgress } from '../src/progression/PlayerProgress';
import { CatCollection } from '../src/progression/CatCollection';
import { CatHouseScreen } from '../src/ui/CatHouseScreen';
import { CatRenderer } from '../src/rendering/CatRenderer';

describe('CatCollection & CatHouse Progression', () => {
  let progress: PlayerProgress;

  beforeEach(() => {
    progress = new PlayerProgress();
  });

  it('реестр CatCollection должен содержать корректные данные скинов и шапочек', () => {
    const skins = CatCollection.getAllSkins();
    expect(skins.length).toBe(9);

    const ginger = CatCollection.getSkin('ginger');
    expect(ginger).toBeDefined();
    expect(ginger?.cost).toBe(0);
    expect(ginger?.unlockedByDefault).toBe(true);

    const pirate = CatCollection.getSkin('pirate');
    expect(pirate).toBeDefined();
    expect(pirate?.rarity).toBe('special');
    expect(pirate?.cost).toBe(400);

    const astronaut = CatCollection.getSkin('astronaut');
    expect(astronaut).toBeDefined();
    expect(astronaut?.cost).toBe(500);

    // Каталог шапочек (7 видов включая "none")
    const hats = CatCollection.getAllHats();
    expect(hats.length).toBe(7);

    const noneHat = CatCollection.getHat('none');
    expect(noneHat).toBeDefined();
    expect(noneHat?.cost).toBe(0);

    const bunny = CatCollection.getHat('bunny');
    expect(bunny).toBeDefined();
    expect(bunny?.cost).toBe(120);

    const frog = CatCollection.getHat('frog');
    expect(frog).toBeDefined();
    expect(frog?.cost).toBe(250);

    const santa = CatCollection.getHat('santa');
    expect(santa).toBeDefined();
    expect(santa?.cost).toBe(500);
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

    // Изначально живёт только базовый Рыжик (всего 9 пород котиков)
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

  it('CollectionScreen отрисовывает вкладки Котики и Шапочки с превью-холстами', async () => {
    const { CollectionScreen } = await import('../src/ui/CollectionScreen');
    const container = document.createElement('div');
    const collection = new CollectionScreen(progress, {
      onSelectCat: () => {},
      onBuyCat: () => {},
      onSelectHat: () => {},
      onBuyHat: () => {},
      onBack: () => {}
    });
    collection.mount(container);

    // По умолчанию открыта вкладка "Котики" -> 9 пород
    let canvases = container.querySelectorAll('#collectionItemsContainer canvas');
    expect(canvases.length).toBe(9);

    // Переключаемся на вкладку "Шапочки" -> 7 видов шапок
    const tabHatsBtn = container.querySelector('#tabHatsBtn') as HTMLButtonElement;
    expect(tabHatsBtn).toBeTruthy();
    tabHatsBtn.click();

    canvases = container.querySelectorAll('#collectionItemsContainer canvas');
    expect(canvases.length).toBe(7);
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

  it('CatHouseScreen и PlayerProgress отслеживают индивидуальную наглаженность, эмоции, спад со временем и бонус за всех котиков', async () => {
    const { CatHouseScreen } = await import('../src/ui/CatHouseScreen');
    const container = document.createElement('div');
    let rewardedAmount = 0;
    const house = new CatHouseScreen(progress, {
      onBack: () => {},
      onPetCat: () => {},
      onRewardCoins: (amount) => {
        rewardedAmount += amount;
      }
    });
    house.mount(container);

    const catContainer = container.querySelector('.house-cat-figure') as HTMLElement;
    expect(catContainer).toBeTruthy();

    // Начальный уровень Рыжика - 40%
    expect(progress.getCatPetLevel('ginger')).toBe(40);
    const emotionIcon = catContainer.querySelector('.cat-emotion-icon');
    const barFill = catContainer.querySelector('.cat-pet-bar-fill') as HTMLElement;
    expect(emotionIcon?.textContent).toBe('🐱');
    expect(barFill.style.width).toBe('40%');

    // Тапаем по котику 1 раз: 40% + 25% = 65%
    catContainer.click();
    expect(progress.getCatPetLevel('ginger')).toBe(65);
    expect(emotionIcon?.textContent).toBe('😺');
    expect(barFill.style.width).toBe('65%');

    // Проверяем спад со временем (через 2 часа спадает на 20%)
    const now = Date.now();
    const twoHoursLater = now + 2 * 3600 * 1000;
    expect(progress.getCatPetLevel('ginger', twoHoursLater)).toBe(45);

    // Доглаживаем Рыжика до 100% (еще 2 тапа: 65 -> 90 -> 100)
    catContainer.click();
    expect(progress.getCatPetLevel('ginger')).toBe(90);
    expect(emotionIcon?.textContent).toBe('💖');

    // 3-й клик: 90 -> 100%. Так как Рыжик - единственный разблокированный котик, все котики стали 100%!
    catContainer.click();
    expect(progress.getCatPetLevel('ginger')).toBe(100);
    expect(progress.areAllCatsFullyPetted()).toBe(true);

    // Начислен приятный бонус +15 монет за полную заботу обо всех котиках
    expect(rewardedAmount).toBe(15);
    expect(progress.getCoins()).toBe(15);
  });

  it('игрок может приобрести все 6 платных шапочек, экипировать их и применить ко всем котикам', () => {
    const paidHatIds = ['bunny', 'flower', 'frog', 'winter', 'pumpkin', 'santa'];
    const totalCost = paidHatIds.reduce((sum, id) => sum + (CatCollection.getHat(id)?.cost || 0), 0);

    // Базово выбрана шапка "none"
    expect(progress.getSelectedHat()).toBe('none');
    expect(progress.isHatUnlocked('none')).toBe(true);

    progress.addCoins(totalCost);

    for (const hatId of paidHatIds) {
      const hat = CatCollection.getHat(hatId)!;
      expect(hat).toBeDefined();
      const bought = progress.buyHat(hat.id, hat.cost);
      expect(bought).toBe(true);
      expect(progress.isHatUnlocked(hatId)).toBe(true);
      expect(progress.getSelectedHat()).toBe(hatId);

      // Проверяем установку шапки для всех котиков на доске
      CatRenderer.setActiveHat(hatId);
      expect(CatRenderer.getActiveHat()).toBe(hatId);
    }

    expect(progress.getCoins()).toBe(0);

    // Переключение обратно на "none" (без шапочки)
    expect(progress.selectHat('none')).toBe(true);
    expect(progress.getSelectedHat()).toBe('none');
    CatRenderer.setActiveHat(progress.getSelectedHat());
    expect(CatRenderer.getActiveHat()).toBeNull();

    // Переключение обратно на шапочку-зайку
    expect(progress.selectHat('bunny')).toBe(true);
    expect(progress.getSelectedHat()).toBe('bunny');
    CatRenderer.setActiveHat(progress.getSelectedHat());
    expect(CatRenderer.getActiveHat()).toBe('bunny');
  });
});

