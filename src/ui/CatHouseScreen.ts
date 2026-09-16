import { IScreen } from './ScreenManager';
import { PlayerProgress } from '../progression/PlayerProgress';

export interface CatHouseCallbacks {
  onBack: () => void;
  onPetCat?: () => void;
}

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
      <div id="houseRoomView" style="position: relative; width: 100%; height: 320px; background: linear-gradient(180deg, #FDEED9 0%, #F5E0C3 70%, #D8BE9B 70%, #C9AE89 100%); border-radius: 24px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.06); overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 24px;">
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
    const room = this.element.querySelector('#houseRoomView');

    if (!banner || !room) return;

    // 1. Обновление баннера целей (по фактически пройденным уровням)
    let goalText = '';
    if (completedLevels < 5) {
      goalText = `🐾 Пройдите 5 уровней, чтобы заселить второго котика! (Осталось: ${5 - completedLevels})`;
    } else if (completedLevels < 10) {
      goalText = `🛋️ До открытия мягкого кресла осталось ${10 - completedLevels} уровней!`;
    } else if (completedLevels < 20) {
      goalText = `🚪 До открытия просторной гостиной осталось ${20 - completedLevels} уровней!`;
    } else if (completedLevels < 30) {
      goalText = `🪵 До открытия когтеточки осталось ${30 - completedLevels} уровней!`;
    } else {
      goalText = `🌸 Домик полон уюта и тепла! Спасённые котики счастливы!`;
    }

    banner.innerHTML = `<span style="font-size: 14px; font-weight: 700; color: var(--color-text-dark);">${goalText}</span>`;

    // 2. Отрисовка интерьера комнаты
    room.innerHTML = `
      <!-- Окно на заднем плане -->
      <div style="position: absolute; top: 20px; left: 40px; width: 64px; height: 80px; background: #C8E6C9; border: 4px solid white; border-radius: 32px 32px 4px 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; font-size: 24px;">
        ☀️
      </div>

      <!-- Цветок на стене -->
      <div style="position: absolute; top: 30px; right: 40px; font-size: 34px;">
        🪴
      </div>

      <!-- Мебель: Кресло (с 10 уровня) -->
      ${
        completedLevels >= 10
          ? `<div style="position: absolute; bottom: 45px; left: 30px; font-size: 56px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));">🛋️</div>`
          : ''
      }

      <!-- Мебель: Когтеточка (с 30 уровня) -->
      ${
        completedLevels >= 30
          ? `<div style="position: absolute; bottom: 45px; right: 30px; font-size: 52px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));">🪵</div>`
          : ''
      }

      <!-- Уютный круглый коврик -->
      <div style="position: absolute; bottom: 18px; width: 170px; height: 50px; background: #FDE8D0; border: 3px dashed #E8CDB0; border-radius: 50%;"></div>

      <!-- Первый котик (Рыжик) -->
      <div id="houseCat1" style="position: relative; z-index: 5; font-size: 54px; cursor: pointer; transform: scale(1); transition: transform 0.2s ease; margin-bottom: 5px;">
        🐱
      </div>

      <!-- Второй спасённый котик (с 5 уровня) -->
      ${
        completedLevels >= 5
          ? `<div id="houseCat2" style="position: absolute; bottom: 35px; right: 85px; z-index: 5; font-size: 48px; cursor: pointer; transform: scale(1); transition: transform 0.2s ease;">🐈</div>`
          : ''
      }
    `;

    // Интерактивное поглаживание котиков
    const reducedMotion = this.progress.getSettings().reducedMotion;
    const petCat = (targetEl: HTMLElement) => {
      if (!reducedMotion) {
        targetEl.style.transform = 'scale(1.25)';
        setTimeout(() => {
          targetEl.style.transform = 'scale(1)';
        }, 200);

        // Создание всплывающего сердечка
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.position = 'absolute';
        heart.style.left = `${targetEl.offsetLeft + 16}px`;
        heart.style.top = `${targetEl.offsetTop - 10}px`;
        heart.style.fontSize = '24px';
        heart.style.pointerEvents = 'none';
        heart.style.transition = 'all 0.6s ease-out';
        heart.style.zIndex = '20';

        room.appendChild(heart);

        requestAnimationFrame(() => {
          heart.style.transform = 'translateY(-40px) scale(1.3)';
          heart.style.opacity = '0';
        });

        setTimeout(() => {
          heart.remove();
        }, 650);
      }

      this.callbacks.onPetCat?.();
    };

    const cat1 = room.querySelector('#houseCat1') as HTMLElement;
    cat1?.addEventListener('click', () => petCat(cat1));

    const cat2 = room.querySelector('#houseCat2') as HTMLElement;
    cat2?.addEventListener('click', () => petCat(cat2));
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
