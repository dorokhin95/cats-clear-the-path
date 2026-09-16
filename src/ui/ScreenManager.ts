export interface IScreen {
  id: string;
  mount(container: HTMLElement): void;
  unmount?(): void;
  show(): void;
  hide(): void;
}

export class ScreenManager {
  private container: HTMLElement;
  private screens: Map<string, IScreen> = new Map();
  private currentScreenId: string | null = null;
  private activeModals: Set<string> = new Set();

  public onScreenChanged?: (screenId: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public register(screen: IScreen): void {
    this.screens.set(screen.id, screen);
    screen.mount(this.container);
  }

  public show(screenId: string): void {
    if (this.currentScreenId === screenId) return;

    if (this.currentScreenId) {
      const current = this.screens.get(this.currentScreenId);
      if (current) current.hide();
    }

    const next = this.screens.get(screenId);
    if (!next) {
      console.warn(`[ScreenManager] Экран "${screenId}" не найден.`);
      return;
    }

    next.show();
    this.currentScreenId = screenId;
    this.onScreenChanged?.(screenId);
  }

  public getCurrentScreenId(): string | null {
    return this.currentScreenId;
  }

  public openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModals.add(modalId);
    }
  }

  public closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      this.activeModals.delete(modalId);
    }
  }

  public hasActiveModal(): boolean {
    return this.activeModals.size > 0;
  }
}
