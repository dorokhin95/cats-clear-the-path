import { IScreen } from './ScreenManager';
import { PlayerProgress } from '../progression/PlayerProgress';
import { CatCollection } from '../progression/CatCollection';
import { CatRenderer } from '../rendering/CatRenderer';
import { SaveService } from '../services/SaveService';
import { renderCoinIcon } from './CoinBadge';

export interface CatHouseCallbacks {
  onBack: () => void;
  onPetCat?: () => void;
  onRewardCoins?: (amount: number) => void;
}

interface HouseSpot {
  bottom?: number | string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  zIndex: number;
}

// 15 уютных мест для всех котиков в богатой комнате Домика
const HOUSE_SPOTS: HouseSpot[] = [
  { bottom: 22, left: '44%', zIndex: 10 },   // 1. На мягком круглом ковре по центру
  { bottom: 58, left: '25%', zIndex: 8 },    // 2. На большом мягком диване
  { bottom: 142, right: '7%', zIndex: 9 },   // 3. На верхней площадке кошачьего дерева-когтеточки
  { top: 74, left: '16%', zIndex: 7 },       // 4. На подоконнике у окошка
  { bottom: 102, left: '4%', zIndex: 8 },    // 5. На средней полочке книжного шкафа
  { bottom: 20, right: '14%', zIndex: 11 },  // 6. В уютной коробке "Для котика" 📦
  { bottom: 82, left: '54%', zIndex: 8 },    // 7. На подушке рядом с диваном
  { bottom: 86, right: '30%', zIndex: 8 },   // 8. Возле двойной мисочки с едой
  { bottom: 12, left: '22%', zIndex: 11 },   // 9. Играет с клубком шерстяных ниток спереди
  { top: 108, right: '20%', zIndex: 8 },    // 10. На настенной полочке под цветком
  { bottom: 28, left: '62%', zIndex: 10 },   // 11. На коврике у дивана
  { bottom: 32, left: '13%', zIndex: 9 },    // 12. Рядом с книжным шкафом
  { bottom: 30, right: '23%', zIndex: 10 },  // 13. У подножия когтеточки
  { bottom: 42, left: '48%', zIndex: 9 },    // 14. В центре ковра
  { bottom: 18, right: '35%', zIndex: 11 }   // 15. Справа на коврике
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
    screen.style.padding = '16px 20px';
    screen.style.justifyContent = 'flex-start';
    screen.style.alignItems = 'center';
    screen.style.gap = '10px';
    screen.style.overflowY = 'auto';

    screen.innerHTML = `
      <!-- Верхняя панель -->
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
        <button id="btnCatHouseBack" class="btn btn-icon" title="Назад">🏠</button>
        <h2 class="title-medium" style="margin: 0; font-size: 24px;">ДОМИК КОТИКОВ</h2>
        <div class="coin-pill" style="display: flex; align-items: center; gap: 6px; font-weight: 700;">
          ${renderCoinIcon(20)}
          <span id="catHouseCoinBalance">${this.progress.getCoins()}</span>
        </div>
      </div>

      <!-- Индикатор общего уюта и счастья в домике -->
      <div id="petLoveWidget" style="width: 100%; background: white; border-radius: 18px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div id="houseCozyHeartIcon" style="font-size: 26px; animation: bounce 2s infinite;">💖</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 14px; font-weight: 800; color: #5D4037;">
              Уют в домике: <span id="houseCozyPercent">${this.progress.getAveragePetLevel()}%</span>
            </span>
            <span id="houseCozyStatus" style="font-size: 11px; font-weight: 700; color: #8D6E63;">
              ${this.getHouseStatusText(this.progress.getAveragePetLevel())}
            </span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 72px; height: 8px; background: #ECEFF1; border-radius: 4px; overflow: hidden; border: 1px solid #CFD8DC; box-shadow: inset 0 1px 2px rgba(0,0,0,0.08);">
            <div id="houseCozyBarFill" style="width: ${this.progress.getAveragePetLevel()}%; height: 100%; background: linear-gradient(90deg, #FF80AB, #F50057); border-radius: 4px; transition: width 0.35s ease, background 0.35s ease;"></div>
          </div>
        </div>
      </div>

      <!-- Баннер целей мета-прогресса и жильцов -->
      <div id="houseMilestoneBanner" style="width: 100%; background: white; padding: 8px 14px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); text-align: center;">
        <!-- Динамический текст прогресса -->
      </div>

      <!-- Визуальная комната домика котиков с богатым интерьером -->
      <div id="houseRoomView" style="position: relative; width: 100%; height: 390px; background: linear-gradient(180deg, #FDEED9 0%, #F5DEC0 66%, #C8A882 66%, #B7946B 68%, #C9AE89 100%); border-radius: 24px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.08); overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
        <!-- Объекты комнаты генерируются динамически -->
      </div>

      <!-- Подсказка -->
      <p style="color: var(--color-text-muted); font-size: 14px; font-weight: 600; text-align: center; margin: 2px 0;">
        Тапните по любому котику, чтобы погладить его! ✨
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

    this.updateHouseCozyHeader();

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
      furnitureGoal = `🛋️ Королевский диван откроется на 10 уровне (ещё ${10 - completedLevels})`;
    } else if (completedLevels < 25) {
      furnitureGoal = `🪵 Кошачье дерево-когтеточка откроется на 25 уровне (ещё ${25 - completedLevels})`;
    } else {
      furnitureGoal = `🌸 Комната полностью обставлена и наполнена уютом!`;
    }

    banner.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 15px; font-weight: 800; color: var(--color-accent-orange);">
          🐾 В домике живут: ${unlockedCount} из ${totalSkins.length} котиков!
        </span>
        <span style="font-size: 12px; font-weight: 600; color: var(--color-text-muted);">
          ${furnitureGoal}
        </span>
      </div>
    `;

    // 2. Отрисовка богатого интерьера комнаты
    room.innerHTML = `
      <!-- Уютная гирлянда под потолком комнаты -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 26px; display: flex; justify-content: space-around; align-items: center; font-size: 15px; opacity: 0.85; pointer-events: none; z-index: 5;">
        <span>🏮</span><span>✨</span><span>🚩</span><span>🏮</span><span>✨</span><span>🚩</span><span>🏮</span><span>✨</span><span>🚩</span><span>🏮</span>
      </div>

      <!-- Окно со шторками и подоконником -->
      <div style="position: absolute; top: 22px; left: 32px; width: 68px; height: 86px; background: #C8E6C9; border: 4px solid white; border-radius: 32px 32px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; font-size: 26px; z-index: 2;">
        ☀️
      </div>
      <!-- Шторки у окна -->
      <div style="position: absolute; top: 20px; left: 24px; width: 14px; height: 75px; background: #FFCCBC; border-radius: 6px 0 0 12px; box-shadow: 1px 2px 5px rgba(0,0,0,0.1); z-index: 3;"></div>
      <div style="position: absolute; top: 20px; left: 98px; width: 14px; height: 75px; background: #FFCCBC; border-radius: 0 6px 12px 0; box-shadow: -1px 2px 5px rgba(0,0,0,0.1); z-index: 3;"></div>
      <!-- Деревянный подоконник -->
      <div style="position: absolute; top: 106px; left: 20px; width: 96px; height: 8px; background: #8D6E63; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.15); z-index: 3;"></div>

      <!-- Картина с рыбкой на стене -->
      <div style="position: absolute; top: 24px; left: 132px; background: #FFF8E1; border: 3px solid #D7CCC8; padding: 4px 8px; border-radius: 8px; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); z-index: 2;">
        🐟
      </div>

      <!-- НАСТЕННАЯ ДЕРЕВЯННАЯ ПОЛКА ДЛЯ ЦВЕТКА И КНИГ (Цветок больше не в воздухе!) -->
      <div style="position: absolute; top: 20px; right: 28px; width: 90px; z-index: 3; display: flex; flex-direction: column; align-items: center;">
        <!-- Предметы на полке: цветок и книги -->
        <div style="display: flex; align-items: flex-end; justify-content: space-around; width: 100%; margin-bottom: -4px;">
          <span style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));" title="Комнатный цветок">🪴</span>
          <span style="font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));" title="Книги">📚</span>
        </div>
        <!-- Сама деревянная полка -->
        <div style="width: 100%; height: 9px; background: #8D6E63; border-radius: 4px; box-shadow: 0 3px 6px rgba(0,0,0,0.2); border-bottom: 2px solid #5D4037;"></div>
        <!-- Кронштейны под полкой -->
        <div style="display: flex; justify-content: space-between; width: 75%; height: 8px;">
          <div style="width: 5px; height: 8px; background: #5D4037; border-radius: 0 0 2px 2px;"></div>
          <div style="width: 5px; height: 8px; background: #5D4037; border-radius: 0 0 2px 2px;"></div>
        </div>
      </div>

      <!-- КНИЖНЫЙ ШКАФ-СТЕЛЛАЖ СЛЕВА -->
      <div style="position: absolute; bottom: 38px; left: 12px; width: 78px; height: 165px; background: #BCAAA4; border: 3px solid #6D4C41; border-radius: 10px 10px 0 0; box-shadow: 2px 4px 12px rgba(0,0,0,0.14); display: flex; flex-direction: column; justify-content: space-between; padding: 4px 6px; z-index: 4;">
        <!-- Верхняя полка: книги и мышка -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 42px; border-bottom: 3px solid #6D4C41;">
          <span style="font-size: 18px;">📚</span>
          <span style="font-size: 14px;">🐁</span>
        </div>
        <!-- Средняя полка: место для котика и клубочка -->
        <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 50px; border-bottom: 3px solid #6D4C41;">
          <span style="font-size: 16px;">🧶</span>
        </div>
        <!-- Нижняя полка: фигурка рыбки и кристалл -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 42px;">
          <span style="font-size: 16px;">💎</span>
          <span style="font-size: 16px;">📖</span>
        </div>
      </div>

      <!-- БОЛЬШОЙ МЯГКИЙ ВЕЛЮРОВЫЙ ДИВАН (с 10 уровня или декор) -->
      ${
        completedLevels >= 10
          ? `
          <div style="position: absolute; bottom: 36px; left: 88px; width: 120px; height: 68px; background: #A5D6A7; border: 3px solid #66BB6A; border-radius: 16px 16px 8px 8px; box-shadow: 0 6px 14px rgba(0,0,0,0.12); display: flex; flex-direction: column; justify-content: space-between; padding: 4px 6px; z-index: 5;" title="Уютный диван">
            <div style="display: flex; justify-content: space-between; font-size: 18px; margin-top: 2px;">
              <span>🟡</span><span>🟠</span>
            </div>
            <div style="width: 100%; height: 22px; background: #81C784; border-radius: 8px;"></div>
          </div>
          `
          : `
          <div style="position: absolute; bottom: 36px; left: 88px; width: 110px; height: 62px; border: 2px dashed #BDBDBD; border-radius: 16px; opacity: 0.45; display: flex; align-items: center; justify-content: center; font-size: 26px; z-index: 5;" title="Откроется на 10 уровне">
            🛋️
          </div>
          `
      }

      <!-- КОШАЧЬЕ ДЕРЕВО-КОГТЕТОЧКА С ЛЕЖАНКОЙ СПРАВА (с 25 уровня) -->
      ${
        completedLevels >= 25
          ? `
          <div style="position: absolute; bottom: 36px; right: 14px; width: 72px; height: 145px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; z-index: 5;" title="Кошачье дерево">
            <!-- Верхняя круглая лежанка -->
            <div style="width: 68px; height: 26px; background: #FFE0B2; border: 3px solid #FFB74D; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 10px; font-weight: 800; color: #E65100;">КОТИК</span>
            </div>
            <!-- Сизалевый столб когтеточки -->
            <div style="width: 16px; height: 95px; background: repeating-linear-gradient(0deg, #D7CCC8, #D7CCC8 4px, #BCAAA4 4px, #BCAAA4 8px); border: 2px solid #8D6E63; border-radius: 4px;"></div>
            <!-- Нижнее основание -->
            <div style="width: 64px; height: 12px; background: #8D6E63; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
          </div>
          `
          : `
          <div style="position: absolute; bottom: 36px; right: 18px; width: 64px; height: 75px; border: 2px dashed #BDBDBD; border-radius: 12px; opacity: 0.45; display: flex; align-items: center; justify-content: center; font-size: 26px; z-index: 5;" title="Откроется на 25 уровне">
            🪵
          </div>
          `
      }

      <!-- КАРТОННАЯ КОРОБКА ДЛЯ КОТИКА СПРАВА ВНИЗУ 📦 -->
      <div style="position: absolute; bottom: 12px; right: 48px; width: 64px; height: 40px; background: #D7CCC8; border: 2px solid #A1887F; border-radius: 6px; box-shadow: 0 3px 8px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 6;" title="Коробка счастья">
        <span style="font-size: 9px; font-weight: 800; color: #5D4037;">📦 МЯУ</span>
      </div>

      <!-- ДВОЙНАЯ МИСОЧКА (МОЛОКО + РЫБКА) -->
      <div style="position: absolute; bottom: 78px; right: 105px; background: white; padding: 2px 6px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 4px; z-index: 6;">
        <span style="font-size: 16px;" title="Молочко">🥛</span>
        <span style="font-size: 16px;" title="Рыбка">🐟</span>
      </div>

      <!-- Клубок шерсти с ниточкой слева спереди -->
      <div style="position: absolute; bottom: 8px; left: 88px; font-size: 20px; z-index: 7; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));" title="Игрушечный клубок">
        🧶
      </div>

      <!-- БОЛЬШОЙ МЯГКИЙ КРУГЛЫЙ КОВЕР В ЦЕНТРЕ КОМНАТЫ -->
      <div style="position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); width: 220px; height: 68px; background: radial-gradient(ellipse at center, #FFF3E0 0%, #FFE0B2 75%, #FFCC80 100%); border: 3px dashed #FFA726; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.06); z-index: 3;"></div>
    `;

    // 3. Размещение всех купленных котиков
    const reducedMotion = this.progress.getSettings().reducedMotion;

    unlockedCatIds.forEach((catSkinId, index) => {
      const spot = HOUSE_SPOTS[index % HOUSE_SPOTS.length];
      const skinDef = CatCollection.getSkin(catSkinId);
      const catName = skinDef ? skinDef.name : 'Котик';
      const isSelected = this.progress.getSelectedCat() === catSkinId;

      const catContainer = document.createElement('div');
      catContainer.className = 'house-cat-figure';
      catContainer.dataset.catId = catSkinId;
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

      // Текущий уровень наглаженности и эмоция
      const petLevel = this.progress.getCatPetLevel(catSkinId);
      const emotion = this.progress.getCatEmotion(petLevel);

      // Плашка эмоции и шкалы наглаженности над котиком
      const statusBadge = document.createElement('div');
      statusBadge.style.display = 'flex';
      statusBadge.style.flexDirection = 'column';
      statusBadge.style.alignItems = 'center';
      statusBadge.style.marginBottom = '2px';
      statusBadge.style.pointerEvents = 'none';

      const emotionEl = document.createElement('span');
      emotionEl.className = 'cat-emotion-icon';
      emotionEl.textContent = emotion.emoji;
      emotionEl.title = emotion.statusText;
      emotionEl.style.fontSize = '16px';
      emotionEl.style.lineHeight = '1';
      emotionEl.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))';
      emotionEl.style.transition = 'transform 0.2s ease';
      statusBadge.appendChild(emotionEl);

      // Миниатюрная полоска наглаженности
      const miniBar = document.createElement('div');
      miniBar.style.width = '36px';
      miniBar.style.height = '5px';
      miniBar.style.background = 'rgba(0,0,0,0.22)';
      miniBar.style.borderRadius = '3px';
      miniBar.style.overflow = 'hidden';
      miniBar.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.3)';
      miniBar.style.border = '1px solid rgba(255,255,255,0.7)';
      miniBar.style.marginTop = '2px';

      const miniBarFill = document.createElement('div');
      miniBarFill.className = 'cat-pet-bar-fill';
      miniBarFill.style.width = `${petLevel}%`;
      miniBarFill.style.height = '100%';
      miniBarFill.style.borderRadius = '2px';
      miniBarFill.style.background = emotion.color;
      miniBarFill.style.transition = 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease';
      miniBar.appendChild(miniBarFill);
      statusBadge.appendChild(miniBar);

      catContainer.appendChild(statusBadge);

      // Канвас для качественной детальной отрисовки домашнего котика
      const canvas = document.createElement('canvas');
      canvas.width = 76;
      canvas.height = 76;
      canvas.style.width = '76px';
      canvas.style.height = '76px';
      canvas.style.filter = 'drop-shadow(0 4px 10px rgba(54,54,54,0.18))';

      CatRenderer.renderPreviewToCanvas(canvas, catSkinId);
      catContainer.appendChild(canvas);

      // Имя котика под фигуркой (с отметкой текущего любимца)
      const label = document.createElement('span');
      label.textContent = isSelected ? `★ ${catName}` : catName;
      label.style.fontSize = '11px';
      label.style.fontWeight = '700';
      label.style.color = isSelected ? '#E65100' : '#5D4037';
      label.style.background = isSelected ? '#FFF8E1' : 'rgba(255, 255, 255, 0.9)';
      label.style.border = isSelected ? '1px solid #FFE082' : '1px solid rgba(0,0,0,0.06)';
      label.style.padding = '2px 8px';
      label.style.borderRadius = '8px';
      label.style.marginTop = '-4px';
      label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
      label.style.pointerEvents = 'none';
      catContainer.appendChild(label);

      // Интерактивное поглаживание котика
      catContainer.addEventListener('click', (e) => {
        e.stopPropagation();

        // 1. Поглаживание конкретного котика
        const petResult = this.progress.petCat(catSkinId);
        SaveService.save(this.progress);

        // 2. Обновление эмоции и шкалы этого котика
        const newEmotion = this.progress.getCatEmotion(petResult.newLevel);
        emotionEl.textContent = newEmotion.emoji;
        emotionEl.title = newEmotion.statusText;
        miniBarFill.style.width = `${petResult.newLevel}%`;
        miniBarFill.style.background = newEmotion.color;

        // 3. Обновление общего уюта в домике
        this.updateHouseCozyHeader();

        // 4. Звук мурлыканья
        this.callbacks.onPetCat?.();

        // 5. Анимация подпрыгивания и всплывающих сердечек
        if (!reducedMotion) {
          catContainer.style.transform = 'scale(1.22) translateY(-7px)';
          emotionEl.style.transform = 'scale(1.35)';
          setTimeout(() => {
            catContainer.style.transform = 'scale(1)';
            emotionEl.style.transform = 'scale(1)';
          }, 220);

          // Всплывающее сердечко ❤️
          const heart = document.createElement('div');
          heart.textContent = petResult.newLevel >= 80 ? '💖' : '❤️';
          heart.style.position = 'absolute';
          heart.style.left = '26px';
          heart.style.top = '-14px';
          heart.style.fontSize = '24px';
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

        // 6. Скрытый приятный бонус, если ВСЕ котики теперь на 100%!
        if (petResult.allMaxBonus) {
          this.callbacks.onRewardCoins?.(petResult.rewardCoins);
          this.updateHouseCozyHeader();
          this.triggerAllCatsCelebration();
        }
      });

      room.appendChild(catContainer);
    });
  }

  private updateHouseCozyHeader(): void {
    if (!this.element) return;
    const avg = this.progress.getAveragePetLevel();
    const percentEl = this.element.querySelector('#houseCozyPercent');
    const statusEl = this.element.querySelector('#houseCozyStatus');
    const barEl = this.element.querySelector('#houseCozyBarFill') as HTMLElement;
    const coinEl = this.element.querySelector('#catHouseCoinBalance');

    if (percentEl) percentEl.textContent = `${avg}%`;
    if (statusEl) statusEl.textContent = this.getHouseStatusText(avg);
    if (barEl) {
      barEl.style.width = `${avg}%`;
      barEl.style.background = avg >= 80
        ? 'linear-gradient(90deg, #FF80AB, #F50057)'
        : avg >= 50
        ? 'linear-gradient(90deg, #81C784, #4CAF50)'
        : 'linear-gradient(90deg, #FFB74D, #FF9800)';
    }
    if (coinEl) coinEl.textContent = `${this.progress.getCoins()}`;
  }

  private getHouseStatusText(avgLevel: number): string {
    if (avgLevel >= 95) return 'Все котики мурчат от счастья! 💖';
    if (avgLevel >= 75) return 'В домике царит любовь и радость ✨';
    if (avgLevel >= 50) return 'Котики довольны, но не против ласки 🐾';
    if (avgLevel >= 25) return 'Котики соскучились по вам 🐱';
    return 'Котикам очень не хватает вашего тепла 🥺';
  }

  private triggerAllCatsCelebration(): void {
    const room = this.element?.querySelector('#houseRoomView');
    if (!room) return;

    // Все котики в комнате подпрыгивают от восторга
    const catFigures = room.querySelectorAll<HTMLElement>('.house-cat-figure');
    catFigures.forEach((catEl, idx) => {
      setTimeout(() => {
        catEl.style.transform = 'scale(1.25) translateY(-10px)';
        setTimeout(() => {
          catEl.style.transform = 'scale(1)';
        }, 320);

        // Салют сердечек от каждого
        const heart = document.createElement('div');
        heart.textContent = '💖';
        heart.style.position = 'absolute';
        heart.style.left = '28px';
        heart.style.top = '-16px';
        heart.style.fontSize = '26px';
        heart.style.pointerEvents = 'none';
        heart.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        heart.style.zIndex = '40';
        catEl.appendChild(heart);

        requestAnimationFrame(() => {
          heart.style.transform = 'translateY(-45px) scale(1.5)';
          heart.style.opacity = '0';
        });

        setTimeout(() => heart.remove(), 850);
      }, idx * 60);
    });

    // Праздничный блеск звёздочек над комнатой
    for (let i = 0; i < 8; i++) {
      const star = document.createElement('div');
      star.textContent = ['✨', '🌟', '💖', '⭐'][i % 4];
      star.style.position = 'absolute';
      star.style.left = `${12 + Math.random() * 76}%`;
      star.style.top = `${20 + Math.random() * 50}%`;
      star.style.fontSize = `${20 + Math.random() * 12}px`;
      star.style.pointerEvents = 'none';
      star.style.zIndex = '35';
      star.style.transition = 'all 1s ease-out';
      star.style.opacity = '1';
      room.appendChild(star);

      requestAnimationFrame(() => {
        star.style.transform = `translateY(-35px) scale(${1.2 + Math.random() * 0.4})`;
        star.style.opacity = '0';
      });

      setTimeout(() => star.remove(), 1100);
    }
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

