import { IScreen } from './ScreenManager';
import { PlayerProgress } from '../progression/PlayerProgress';
import { CatCollection } from '../progression/CatCollection';
import { CatRenderer } from '../rendering/CatRenderer';

export interface CatHouseCallbacks {
  onBack: () => void;
  onPetCat?: () => void;
}

interface HouseSpot {
  bottom?: number | string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  zIndex: number;
}

// 9 уютных мест для котиков в комнате (адаптировано под экраны любой ширины)
const HOUSE_SPOTS: HouseSpot[] = [
  { bottom: 24, left: '42%', zIndex: 10 },  // 1. На центральном ковре
  { bottom: 42, left: '7%', zIndex: 9 },    // 2. На кресле слева
  { bottom: 38, right: '7%', zIndex: 9 },   // 3. Возле когтеточки справа
  { top: 56, left: '26%', zIndex: 6 },      // 4. Под окошком
  { top: 56, right: '22%', zIndex: 6 },     // 5. Рядом с цветком
  { bottom: 95, left: '22%', zIndex: 8 },   // 6. На подушке
  { bottom: 90, right: '22%', zIndex: 8 },  // 7. Возле мисочки
  { bottom: 12, left: '20%', zIndex: 11 },  // 8. На коврике спереди слева
  { bottom: 12, right: '28%', zIndex: 11 }  // 9. Играет с клубком справа
];

export class CatHouseScreen implements IScreen {
  public readonly id = 'cat-house';
  private element: HTMLElement | null = null;
  private callbacks: CatHouseCallbacks;
  private progress: PlayerProgress;

  constructor(progress: PlayerProgress, callbacks: CatHouseCallbacks) {
    this.progress = progress;
    this.callbacks = callbacks;
  }

  public mount(container: HTMLElement): void {
    const screen = document.createElement('div');
    screen.className = 'ui-screen ui-screen--opaque';
    screen.id = 'screen-cat-house';
    screen.style.padding = '20px';
    screen.style.justifyContent = 'space-between';
    screen.style.alignItems = 'center';
    screen.style.overflowY = 'auto';

    screen.innerHTML = `
      <!-- Верхняя панель -->
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
        <button id="btnCatHouseBack" class="btn btn-icon" title="Назад">🏠</button>
        <h2 class="title-medium" style="margin: 0; font-size: 24px;">ДОМИК КОТИКОВ</h2>
        <div style="width: 48px;"></div>
      </div>

      <!-- Баннер следующей цели мета-прогресса -->
      <div id="houseMilestoneBanner" style="width: 100%; background: white; padding: 10px 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); text-align: center;">
        <!-- Текст прогресса -->
      </div>

      <!-- Визуальная комната домика котиков -->
      <div id="houseRoomView" style="position: relative; width: 100%; height: 350px; background: linear-gradient(180deg, #FDEED9 0%, #F5E0C3 68%, #D8BE9B 68%, #C9AE89 100%); border-radius: 24px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.06); overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
        <!-- Объекты комнаты генерируются динамически -->
      </div>

      <!-- Подсказка -->
      <p style="color: var(--color-text-muted); font-size: 15px; font-weight: 500; text-align: center;">
        Тапните по котику, чтобы погладить его! ✨
      </p>

      <!-- Нижняя кнопка возврата -->
      <button id="btnCatHouseBackBottom" class="btn btn-primary" style="width: 100%; max-width: 320px;">
        В ГЛАВНОЕ МЕНЮ
      </button>
    `;

    container.appendChild(screen);
    this.element = screen;

    screen.querySelector('#btnCatHouseBack')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    screen.querySelector('#btnCatHouseBackBottom')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    this.renderHouse();
  }

  public renderHouse(): void {
    if (!this.element) return;

    const completedLevels = this.progress.getHighestCompletedLevel();
    const banner = this.element.querySelector('#houseMilestoneBanner');
    const room = this.element.querySelector('#houseRoomView') as HTMLElement;

    if (!banner || !room) return;

    const rawUnlocked = this.progress.getData().unlockedCats || ['ginger'];
    const catSet = new Set<string>(Array.isArray(rawUnlocked) ? rawUnlocked : ['ginger']);
    catSet.add('ginger');
    const selected = this.progress.getSelectedCat();
    if (selected) catSet.add(selected);
    const unlockedCatIds = Array.from(catSet);
    const totalSkins = CatCollection.getAllSkins();
    const unlockedCount = unlockedCatIds.length;

    // 1. Информационный баннер
    let furnitureGoal = '';
    if (completedLevels < 10) {
      furnitureGoal = `🛋️ Мягкое кресло откроется на 10 уровне (ещё ${10 - completedLevels})`;
    } else if (completedLevels < 30) {
      furnitureGoal = `🪵 Когтеточка откроется на 30 уровне (ещё ${30 - completedLevels})`;
    } else {
      furnitureGoal = `🌸 Комната полностью обставлена и наполнена уютом!`;
    }

    banner.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 15px; font-weight: 800; color: var(--color-accent-orange);">
          🐾 В домике живут: ${unlockedCount} из ${totalSkins.length} котиков!
        </span>
        <span style="font-size: 12px; font-weight: 600; color: var(--color-text-muted);">
          ${furnitureGoal}
        </span>
      </div>
    `;

    // 2. Отрисовка интерьера комнаты
    room.innerHTML = `
      <!-- Окно на заднем плане -->
      <div style="position: absolute; top: 16px; left: 36px; width: 68px; height: 84px; background: #C8E6C9; border: 4px solid white; border-radius: 32px 32px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; font-size: 26px;">
        ☀️
      </div>

      <!-- Цветок на стене -->
      <div style="position: absolute; top: 22px; right: 36px; font-size: 34px;">
        🪴
      </div>

      <!-- Картина с рыбкой на стене -->
      <div style="position: absolute; top: 18px; left: 135px; background: white; padding: 4px 8px; border-radius: 8px; font-size: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
        🐟
      </div>

      <!-- Мебель: Кресло (с 10 уровня) -->
      ${
        completedLevels >= 10
          ? `<div style="position: absolute; bottom: 35px; left: 18px; font-size: 60px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15)); z-index: 4;">🛋️</div>`
          : `<div style="position: absolute; bottom: 42px; left: 24px; font-size: 36px; opacity: 0.25; filter: grayscale(1); z-index: 4;" title="Откроется на 10 уровне">🛋️</div>`
      }

      <!-- Мебель: Когтеточка (с 30 уровня) -->
      ${
        completedLevels >= 30
          ? `<div style="position: absolute; bottom: 35px; right: 20px; font-size: 56px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15)); z-index: 4;">🪵</div>`
          : `<div style="position: absolute; bottom: 42px; right: 28px; font-size: 34px; opacity: 0.25; filter: grayscale(1); z-index: 4;" title="Откроется на 30 уровне">🪵</div>`
      }

      <!-- Мисочка с молоком -->
      <div style="position: absolute; bottom: 78px; right: 88px; font-size: 20px; z-index: 5;">
        🥛
      </div>

      <!-- Клубок ниток -->
      <div style="position: absolute; bottom: 10px; right: 110px; font-size: 18px; z-index: 5;">
        🧶
      </div>

      <!-- Уютный большой круглый ковер -->
      <div style="position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); width: 190px; height: 56px; background: #FDE8D0; border: 3px dashed #E8CDB0; border-radius: 50%; z-index: 3;"></div>
    `;

    // 3. Размещение всех купленных котиков
    const reducedMotion = this.progress.getSettings().reducedMotion;

    unlockedCatIds.forEach((catSkinId, index) => {
      const spot = HOUSE_SPOTS[index % HOUSE_SPOTS.length];
      const skinDef = CatCollection.getSkin(catSkinId);
      const catName = skinDef ? skinDef.name : 'Котик';
      const isSelected = this.progress.getSelectedCat() === catSkinId;

      const catContainer = document.createElement('div');
      catContainer.style.position = 'absolute';
      catContainer.style.zIndex = `${spot.zIndex}`;
      catContainer.style.cursor = 'pointer';
      catContainer.style.display = 'flex';
      catContainer.style.flexDirection = 'column';
      catContainer.style.alignItems = 'center';
      catContainer.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      catContainer.title = `${catName} ${isSelected ? '(Любимец ★)' : ''} (нажмите, чтобы погладить!)`;

      if (spot.bottom !== undefined) catContainer.style.bottom = typeof spot.bottom === 'number' ? `${spot.bottom}px` : spot.bottom;
      if (spot.top !== undefined) catContainer.style.top = typeof spot.top === 'number' ? `${spot.top}px` : spot.top;
      if (spot.left !== undefined) catContainer.style.left = typeof spot.left === 'number' ? `${spot.left}px` : spot.left;
      if (spot.right !== undefined) catContainer.style.right = typeof spot.right === 'number' ? `${spot.right}px` : spot.right;

      // Канвас для качественной отрисовки скина котика
      const canvas = document.createElement('canvas');
      canvas.width = 54;
      canvas.height = 54;
      canvas.style.width = '54px';
      canvas.style.height = '54px';
      canvas.style.filter = 'drop-shadow(0 3px 6px rgba(54,54,54,0.18))';

      CatRenderer.renderPreviewToCanvas(canvas, catSkinId);
      catContainer.appendChild(canvas);

      // Имя котика под фигуркой (с отметкой текущего любимца)
      const label = document.createElement('span');
      label.textContent = isSelected ? `★ ${catName}` : catName;
      label.style.fontSize = '10px';
      label.style.fontWeight = '700';
      label.style.color = isSelected ? '#E65100' : '#5D4037';
      label.style.background = isSelected ? '#FFF8E1' : 'rgba(255, 255, 255, 0.85)';
      label.style.border = isSelected ? '1px solid #FFE082' : 'none';
      label.style.padding = '1px 6px';
      label.style.borderRadius = '6px';
      label.style.marginTop = '-2px';
      label.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      label.style.pointerEvents = 'none';
      catContainer.appendChild(label);

      // Интерактивное поглаживание
      catContainer.addEventListener('click', (e) => {
        e.stopPropagation();

        if (!reducedMotion) {
          catContainer.style.transform = 'scale(1.3) translateY(-8px)';
          setTimeout(() => {
            catContainer.style.transform = 'scale(1)';
          }, 220);

          // Всплывающее сердечко ❤️
          const heart = document.createElement('div');
          heart.textContent = '❤️';
          heart.style.position = 'absolute';
          heart.style.left = '16px';
          heart.style.top = '-16px';
          heart.style.fontSize = '22px';
          heart.style.pointerEvents = 'none';
          heart.style.transition = 'all 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
          heart.style.zIndex = '30';
          catContainer.appendChild(heart);

          requestAnimationFrame(() => {
            heart.style.transform = 'translateY(-36px) scale(1.35)';
            heart.style.opacity = '0';
          });

          setTimeout(() => {
            heart.remove();
          }, 700);
        }

        this.callbacks.onPetCat?.();
      });

      room.appendChild(catContainer);
    });
  }

  public show(): void {
    this.renderHouse();
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
    this.renderHouse();
  }
}
