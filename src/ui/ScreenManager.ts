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
  private modalStack: string[] = [];

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

    // При смене экрана гарантированно закрываем все открытые модальные окна
    this.closeAllModals();

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

  private getModalElement(modalId: string): HTMLElement | null {
    return (document.getElementById(modalId) || this.container.querySelector(`#${modalId}`)) as HTMLElement | null;
  }

  public openModal(modalId: string): void {
    const modal = this.getModalElement(modalId);
    if (modal) {
      this.modalStack = this.modalStack.filter((id) => id !== modalId);
      this.modalStack.push(modalId);

      // Стек z-index для вложенных модалок (50, 60, 70...)
      const dynamicZ = 50 + (this.modalStack.length - 1) * 10;
      modal.style.zIndex = `${dynamicZ}`;

      modal.classList.add('active');
      this.activeModals.add(modalId);
    }
  }

  public closeModal(modalId: string): void {
    const modal = this.getModalElement(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.removeProperty('z-index');
      this.activeModals.delete(modalId);
      this.modalStack = this.modalStack.filter((id) => id !== modalId);
    }
  }

  public closeAllModals(): void {
    for (const modalId of this.activeModals) {
      const modal = this.getModalElement(modalId);
      if (modal) {
        modal.classList.remove('active');
        modal.style.removeProperty('z-index');
      }
    }
    const allActive = this.container.querySelectorAll('.modal-overlay.active, .ui-modal.active');
    allActive.forEach((el) => {
      el.classList.remove('active');
      (el as HTMLElement).style.removeProperty('z-index');
    });
    this.activeModals.clear();
    this.modalStack = [];
  }

  public hasActiveModal(): boolean {
    return this.activeModals.size > 0;
  }
}
