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
});
