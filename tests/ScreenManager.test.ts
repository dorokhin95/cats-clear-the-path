import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenManager, IScreen } from '../src/ui/ScreenManager';

class MockScreen implements IScreen {
  public id: string;
  public isShown = false;
  public isMounted = false;

  constructor(id: string) {
    this.id = id;
  }

  mount(_container: HTMLElement): void {
    this.isMounted = true;
  }

  show(): void {
    this.isShown = true;
  }

  hide(): void {
    this.isShown = false;
  }
}

describe('ScreenManager', () => {
  let container: HTMLElement;
  let manager: ScreenManager;

  beforeEach(() => {
    container = document.createElement('div');
    manager = new ScreenManager(container);
  });

  it('должен монтировать и регистрировать экраны', () => {
    const screenA = new MockScreen('screen-a');
    manager.register(screenA);

    expect(screenA.isMounted).toBe(true);
  });

  it('должен переключать активный экран', () => {
    const screenA = new MockScreen('screen-a');
    const screenB = new MockScreen('screen-b');

    manager.register(screenA);
    manager.register(screenB);

    manager.show('screen-a');
    expect(manager.getCurrentScreenId()).toBe('screen-a');
    expect(screenA.isShown).toBe(true);
    expect(screenB.isShown).toBe(false);

    manager.show('screen-b');
    expect(manager.getCurrentScreenId()).toBe('screen-b');
    expect(screenA.isShown).toBe(false);
    expect(screenB.isShown).toBe(true);
  });

  it('должен вызывать onScreenChanged при переключении экрана', () => {
    const screenA = new MockScreen('screen-a');
    manager.register(screenA);
    let changedTo: string | null = null;
    manager.onScreenChanged = (id) => {
      changedTo = id;
    };

    manager.show('screen-a');
    expect(changedTo).toBe('screen-a');
  });

  it('должен корректно управлять стеком модальных окон, z-index и закрытием', () => {
    const modalPause = document.createElement('div');
    modalPause.id = 'modal-pause';
    modalPause.className = 'modal-overlay';
    container.appendChild(modalPause);

    const modalSettings = document.createElement('div');
    modalSettings.id = 'modal-settings';
    modalSettings.className = 'modal-overlay';
    container.appendChild(modalSettings);

    // 1. Открытие паузы
    manager.openModal('modal-pause');
    expect(modalPause.classList.contains('active')).toBe(true);
    expect(modalPause.style.zIndex).toBe('50');
    expect(manager.hasActiveModal()).toBe(true);

    // 2. Открытие настроек поверх паузы (z-index должен вырасти до 60)
    manager.openModal('modal-settings');
    expect(modalSettings.classList.contains('active')).toBe(true);
    expect(modalSettings.style.zIndex).toBe('60');

    // 3. Закрытие настроек
    manager.closeModal('modal-settings');
    expect(modalSettings.classList.contains('active')).toBe(false);
    expect(modalSettings.style.zIndex).toBe('');
    expect(modalPause.classList.contains('active')).toBe(true);

    // 4. closeAllModals закрывает все окна
    manager.closeAllModals();
    expect(modalPause.classList.contains('active')).toBe(false);
    expect(manager.hasActiveModal()).toBe(false);
  });

  it('должен автоматически закрывать открытые модалки при смене экрана', () => {
    const modal = document.createElement('div');
    modal.id = 'modal-win';
    modal.className = 'modal-overlay';
    container.appendChild(modal);

    const screenA = new MockScreen('screen-a');
    manager.register(screenA);

    manager.openModal('modal-win');
    expect(modal.classList.contains('active')).toBe(true);

    // Переключение экрана должно сбросить все модалки
    manager.show('screen-a');
    expect(modal.classList.contains('active')).toBe(false);
    expect(manager.hasActiveModal()).toBe(false);
  });
});
