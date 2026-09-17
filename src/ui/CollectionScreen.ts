import { IScreen } from './ScreenManager';
import { PlayerProgress } from '../progression/PlayerProgress';
import { CatCollection, SkinDefinition } from '../progression/CatCollection';
import { CatRenderer } from '../rendering/CatRenderer';
import { renderCoinIcon } from './CoinBadge';

export interface CollectionCallbacks {
  onSelectCat: (skinId: string) => void;
  onBuyCat: (skin: SkinDefinition) => void;
  onBack: () => void;
}

export class CollectionScreen implements IScreen {
  public readonly id = 'collection';
  private element: HTMLElement | null = null;
  private callbacks: CollectionCallbacks;
  private progress: PlayerProgress;

  constructor(progress: PlayerProgress, callbacks: CollectionCallbacks) {
    this.progress = progress;
    this.callbacks = callbacks;
  }

  public mount(container: HTMLElement): void {
    const screen = document.createElement('div');
    screen.className = 'ui-screen ui-screen--opaque';
    screen.id = 'screen-collection';
    screen.style.padding = '20px';
    screen.style.justifyContent = 'flex-start';
    screen.style.alignItems = 'center';
    screen.style.gap = '14px';
    screen.style.overflowY = 'auto';

    screen.innerHTML = `
      <!-- Верхний бар -->
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
        <button id="btnCollectionBack" class="btn btn-icon" title="Назад">🏠</button>
        <h2 class="title-medium" style="margin: 0; font-size: 24px;">МОИ КОТИКИ</h2>
        <div class="coin-pill" style="display: flex; align-items: center; gap: 6px; font-weight: 700;">
          ${renderCoinIcon(20)}
          <span id="collectionCoinBalance">0</span>
        </div>
      </div>

      <!-- Сетка котиков -->
      <div id="skinsListContainer" style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 6px;">
        <!-- Карточки генерируются динамически -->
      </div>
    `;

    container.appendChild(screen);
    this.element = screen;

    screen.querySelector('#btnCollectionBack')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    this.renderSkins();
  }

  public renderSkins(): void {
    const container = this.element?.querySelector('#skinsListContainer');
    const coinEl = this.element?.querySelector('#collectionCoinBalance');
    if (coinEl) coinEl.textContent = `${this.progress.getCoins()}`;
    if (!container) return;

    container.innerHTML = '';
    const skins = CatCollection.getAllSkins();
    const currentSelected = this.progress.getSelectedCat();
    const coins = this.progress.getCoins();

    for (const skin of skins) {
      const isUnlocked = this.progress.isCatUnlocked(skin.id);
      const isSelected = currentSelected === skin.id;

      const card = document.createElement('div');
      card.style.background = 'white';
      card.style.borderRadius = '18px';
      card.style.padding = '14px 16px';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';
      card.style.boxShadow = '0 4px 12px rgba(54, 54, 54, 0.06)';
      card.style.gap = '12px';

      const rarityColor = skin.rarity === 'special' ? '#9B51E0' : skin.rarity === 'rare' ? '#2F80ED' : '#6FCF97';
      const rarityLabel = skin.rarity === 'special' ? 'Особый' : skin.rarity === 'rare' ? 'Редкий' : 'Обычный';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
          <div id="skinCanvasContainer_${skin.id}" style="width: 68px; height: 68px; min-width: 68px; border-radius: 16px; background: #FFF6EC; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: relative; overflow: hidden;"></div>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; font-size: 18px; color: var(--color-text-dark);">${skin.name}</span>
              <span style="font-size: 11px; font-weight: 700; color: white; background: ${rarityColor}; padding: 2px 8px; border-radius: 10px;">
                ${rarityLabel}
              </span>
            </div>
            <div style="font-size: 13px; color: var(--color-text-muted); max-width: 160px; line-height: 1.2;">
              ${skin.description}
            </div>
          </div>
        </div>
        <div id="btnContainer_${skin.id}"></div>
      `;

      // Генерация наглядного превью котика на Canvas
      const previewBox = card.querySelector(`#skinCanvasContainer_${skin.id}`);
      if (previewBox) {
        const canvas = document.createElement('canvas');
        canvas.width = 68;
        canvas.height = 68;
        canvas.style.width = '68px';
        canvas.style.height = '68px';
        CatRenderer.renderPreviewToCanvas(canvas, skin.id);
        previewBox.appendChild(canvas);
      }

      const btnContainer = card.querySelector(`#btnContainer_${skin.id}`);
      if (btnContainer) {
        if (isSelected) {
          const btn = document.createElement('button');
          btn.className = 'btn';
          btn.style.background = '#E8F7EE';
          btn.style.color = 'var(--color-primary-green)';
          btn.style.border = '2px solid var(--color-primary-green)';
          btn.style.padding = '8px 14px';
          btn.style.fontSize = '14px';
          btn.textContent = 'ВЫБРАН ✓';
          btnContainer.appendChild(btn);
        } else if (isUnlocked) {
          const btn = document.createElement('button');
          btn.className = 'btn btn-secondary';
          btn.style.padding = '8px 16px';
          btn.style.fontSize = '14px';
          btn.textContent = 'ВЫБРАТЬ';
          btn.addEventListener('click', () => {
            this.callbacks.onSelectCat(skin.id);
            this.renderSkins();
          });
          btnContainer.appendChild(btn);
        } else {
          const btn = document.createElement('button');
          const canAfford = coins >= skin.cost;
          btn.className = `btn ${canAfford ? 'btn-accent' : ''}`;
          if (!canAfford) {
            btn.style.background = '#E5DDCF';
            btn.style.color = '#8A8174';
            btn.style.boxShadow = 'none';
            btn.style.cursor = 'not-allowed';
          }
          btn.style.padding = '8px 14px';
          btn.style.fontSize = '14px';
          btn.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 5px;">${skin.cost} ${renderCoinIcon(16)}</span>`;
          if (canAfford) {
            btn.addEventListener('click', () => {
              this.callbacks.onBuyCat(skin);
              this.renderSkins();
            });
          }
          btnContainer.appendChild(btn);
        }
      }

      container.appendChild(card);
    }
  }

  public show(): void {
    this.renderSkins();
    if (this.element) {
      this.element.classList.add('active');
    }
  }

  public hide(): void {
    if (this.element) {
      this.element.classList.remove('active');
    }
  }

  public updateProgress(progress: PlayerProgress): void {
    this.progress = progress;
    this.renderSkins();
  }
}
