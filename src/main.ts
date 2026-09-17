import './styles/main.css';
import { Renderer } from './rendering/Renderer';
import { Game } from './game/Game';
import { LevelLoader } from './game/LevelLoader';
import { ScreenManager } from './ui/ScreenManager';
import { SplashScreen } from './ui/SplashScreen';
import { MainMenu } from './ui/MainMenu';
import { GameplayHUD } from './ui/GameplayHUD';
import { PauseMenu } from './ui/PauseMenu';
import { SettingsMenu, SettingsData } from './ui/SettingsMenu';
import { WinScreen } from './ui/WinScreen';
import { LoseScreen } from './ui/LoseScreen';
import { LevelSelect } from './ui/LevelSelect';
import { CollectionScreen } from './ui/CollectionScreen';
import { CatHouseScreen } from './ui/CatHouseScreen';
import { AudioManager } from './audio/AudioManager';
import { SaveService } from './services/SaveService';
import { PlatformManager } from './platform/PlatformManager';
import { LevelResult } from './game/GameRules';
import { TutorialController } from './tutorial/TutorialController';
import { CatRenderer } from './rendering/CatRenderer';

async function initApp(): Promise<void> {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const canvasLayer = document.querySelector('.canvas-layer') as HTMLElement;
  const uiLayer = document.getElementById('uiLayer') as HTMLElement;

  if (!canvas || !uiLayer) {
    console.error('[App] Не удалось обнаружить ключевые элементы разметки canvas/uiLayer');
    return;
  }

  // 1. Инициализация кросс-платформенного адаптера (Web / Telegram / Yandex)
  const platform = PlatformManager.getPlatform();
  await platform.init();
  const caps = platform.getCapabilities();

  // 2. Загрузка сохранённого прогресса
  const playerProgress = SaveService.load();
  let currentLevelId = playerProgress.getLastUnlockedLevel();
  CatRenderer.setActiveHat(playerProgress.getSelectedHat());

  // 3. Инициализация аудиосистемы с сохраненными настройками
  const audioManager = new AudioManager();
  let currentSettings: SettingsData = playerProgress.getSettings();
  audioManager.setMusicVolume(currentSettings.musicVolume);
  audioManager.setSfxVolume(currentSettings.sfxVolume);

  // 4. Инициализация рендерера с поддержкой reducedMotion
  const renderer = new Renderer(canvas);
  renderer.setReducedMotion(currentSettings.reducedMotion);

  // 5. Инициализация менеджера экранов
  const screenManager = new ScreenManager(uiLayer);

  // 6. Централизованное управление видимостью Canvas и паузой
  const setGameplayVisible = (visible: boolean) => {
    if (visible) {
      canvasLayer?.classList.remove('hidden');
      renderer.handleResize();
      requestAnimationFrame(() => {
        renderer.handleResize();
      });
    } else {
      game.pause();
      canvasLayer?.classList.add('hidden');
      tutorialController.hideOverlay();
    }
  };

  // Реакция на переключение экранов
  screenManager.onScreenChanged = (screenId) => {
    if (screenId === 'gameplay-hud') {
      setGameplayVisible(true);
      // Интеграция с нативной кнопкой «Назад» в Telegram
      platform.setBackButtonHandler?.(() => {
        audioManager.playClick();
        game.pause();
        pauseMenu?.open();
        return true;
      });
    } else {
      setGameplayVisible(false);
      if (screenId === 'main-menu' || screenId === 'splash') {
        platform.setBackButtonHandler?.(null);
      } else {
        platform.setBackButtonHandler?.(() => {
          audioManager.playClick();
          updateCoinsDisplay();
          screenManager.show('main-menu');
          return true;
        });
      }
    }
  };

  // 7. Модальное окно настроек с немедленным сохранением
  const settingsMenu = new SettingsMenu(screenManager, currentSettings, (newSettings) => {
    currentSettings = { ...newSettings };
    audioManager.setMusicVolume(newSettings.musicVolume);
    audioManager.setSfxVolume(newSettings.sfxVolume);
    renderer.setReducedMotion(newSettings.reducedMotion);

    playerProgress.updateSettings(newSettings);
    SaveService.save(playerProgress);
    platform.saveCloud?.(playerProgress.getData());
  });
  settingsMenu.mount(uiLayer);

  let pauseMenu: PauseMenu | null = null;
  let winScreen: WinScreen | null = null;
  let loseScreen: LoseScreen | null = null;
  let levelSelect: LevelSelect | null = null;
  let collectionScreen: CollectionScreen | null = null;
  let catHouseScreen: CatHouseScreen | null = null;
  let mainMenu: MainMenu | null = null;
  let lastLevelResult: LevelResult | null = null;
  const tutorialController = new TutorialController(uiLayer, playerProgress);

  const updateCoinsDisplay = () => {
    const el = document.getElementById('menuCoinBalance');
    if (el) el.textContent = `${playerProgress.getCoins()}`;
    mainMenu?.updateProgress(playerProgress);
  };

  // 8. Функция загрузки уровня
  const loadGameLevel = (levelId: number) => {
    screenManager.closeAllModals();
    winScreen?.close();
    loseScreen?.close();
    pauseMenu?.close();
    settingsMenu.close();

    renderer.handleResize();
    currentLevelId = levelId;
    const selectedSkin = playerProgress.getSelectedCat();
    const loaded = LevelLoader.loadBoard(levelId, selectedSkin);
    if (!loaded) {
      console.warn(`[App] Уровень ${levelId} не найден, сброс на уровень 1`);
      currentLevelId = 1;
      const first = LevelLoader.loadBoard(1, selectedSkin);
      if (first) {
        game.loadBoard(first.board, 1, first.levelData);
        gameplayHUD.setLevel(1, true);
        gameplayHUD.setRemainingCats(first.board.getRemainingCatsCount());
        tutorialController.onLevelStart(1, first.board);
      }
      return;
    }
    game.loadBoard(loaded.board, levelId, loaded.levelData);
    gameplayHUD.setLevel(levelId, loaded.board.getCats().length <= 2 && levelId <= 5);
    gameplayHUD.setRemainingCats(loaded.board.getRemainingCatsCount());
    tutorialController.onLevelStart(levelId, loaded.board);
  };

  // 9. Создание HUD
  const gameplayHUD = new GameplayHUD({
    onPause: () => {
      audioManager.playClick();
      game.pause();
      pauseMenu?.open();
    },
    onHint: () => {
      if (playerProgress.getRemainingHints() > 0) {
        const hinted = game.triggerHint();
        if (hinted) {
          playerProgress.useHint();
          SaveService.save(playerProgress);
          platform.saveCloud?.(playerProgress.getData());
          gameplayHUD.setHintCount(playerProgress.getRemainingHints());
          audioManager.playHint();
          if (currentSettings.vibration) platform.haptic?.('medium');
        }
      } else if (caps.rewardedAds && platform.showRewarded) {
        platform.showRewarded({
          onReward: () => {
            playerProgress.addHints(1);
            SaveService.save(playerProgress);
            platform.saveCloud?.(playerProgress.getData());
            gameplayHUD.setHintCount(playerProgress.getRemainingHints());
            const hinted = game.triggerHint();
            if (hinted) {
              playerProgress.useHint();
              SaveService.save(playerProgress);
              platform.saveCloud?.(playerProgress.getData());
              gameplayHUD.setHintCount(playerProgress.getRemainingHints());
            }
            audioManager.playHint();
          }
        });
      }
    }
  });
  gameplayHUD.setHintCount(playerProgress.getRemainingHints());

  // 10. Экраны Победы и Поражения
  winScreen = new WinScreen(screenManager, {
    onNextLevel: () => {
      audioManager.playClick();
      const nextId = currentLevelId + 1;
      if (caps.interstitialAds && platform.showInterstitial) {
        platform.showInterstitial(currentLevelId, () => {
          loadGameLevel(nextId);
          game.resume();
        });
      } else {
        loadGameLevel(nextId);
        game.resume();
      }
    },
    onMainMenu: () => {
      audioManager.playClick();
      tutorialController.hideOverlay();
      updateCoinsDisplay();
      screenManager.show('main-menu');
    },
    onStarPop: (starIndex) => {
      audioManager.playStar(starIndex);
      audioManager.playCoin();
    },
    onDoubleReward: (onSuccess) => {
      if (caps.rewardedAds && platform.showRewarded) {
        platform.showRewarded({
          onReward: () => {
            const bonus = lastLevelResult ? lastLevelResult.coins : 20;
            playerProgress.addCoins(bonus);
            SaveService.save(playerProgress);
            platform.saveCloud?.(playerProgress.getData());
            updateCoinsDisplay();
            audioManager.playCoin();
            onSuccess();
          }
        });
      }
    }
  });
  winScreen.mount(uiLayer);

  loseScreen = new LoseScreen(screenManager, {
    onRetry: () => {
      audioManager.playClick();
      loadGameLevel(currentLevelId);
      game.resume();
    },
    onMainMenu: () => {
      audioManager.playClick();
      tutorialController.hideOverlay();
      updateCoinsDisplay();
      screenManager.show('main-menu');
    },
    onRevive: () => {
      if (caps.rewardedAds && platform.showRewarded) {
        platform.showRewarded({
          onReward: () => {
            audioManager.playClick();
            game.revive(2);
          }
        });
      }
    }
  });
  loseScreen.mount(uiLayer);

  // 11. Выбор уровней
  levelSelect = new LevelSelect(playerProgress, {
    onSelectLevel: (levelId) => {
      audioManager.playClick();
      loadGameLevel(levelId);
      screenManager.show('gameplay-hud');
      game.resume();
    },
    onBack: () => {
      audioManager.playClick();
      updateCoinsDisplay();
      screenManager.show('main-menu');
    }
  });

  // 12. Коллекция
  collectionScreen = new CollectionScreen(playerProgress, {
    onSelectCat: (skinId) => {
      audioManager.playClick();
      playerProgress.selectCat(skinId);
      SaveService.save(playerProgress);
      collectionScreen?.updateProgress(playerProgress);
      catHouseScreen?.updateProgress(playerProgress);
      mainMenu?.updateProgress(playerProgress);
    },
    onBuyCat: (skin) => {
      audioManager.playCoin();
      const success = playerProgress.buySkin(skin.id, skin.cost);
      if (success) {
        SaveService.save(playerProgress);
        collectionScreen?.updateProgress(playerProgress);
        catHouseScreen?.updateProgress(playerProgress);
        mainMenu?.updateProgress(playerProgress);
        updateCoinsDisplay();
      }
    },
    onSelectHat: (hatId) => {
      audioManager.playClick();
      playerProgress.selectHat(hatId);
      CatRenderer.setActiveHat(hatId);
      SaveService.save(playerProgress);
      collectionScreen?.updateProgress(playerProgress);
      catHouseScreen?.updateProgress(playerProgress);
      mainMenu?.updateProgress(playerProgress);
    },
    onBuyHat: (hat) => {
      audioManager.playCoin();
      const success = playerProgress.buyHat(hat.id, hat.cost);
      if (success) {
        CatRenderer.setActiveHat(hat.id);
        SaveService.save(playerProgress);
        collectionScreen?.updateProgress(playerProgress);
        catHouseScreen?.updateProgress(playerProgress);
        mainMenu?.updateProgress(playerProgress);
        updateCoinsDisplay();
      }
    },
    onBack: () => {
      audioManager.playClick();
      updateCoinsDisplay();
      screenManager.show('main-menu');
    }
  });

  // 13. Домик котиков
  catHouseScreen = new CatHouseScreen(playerProgress, {
    onBack: () => {
      audioManager.playClick();
      updateCoinsDisplay();
      screenManager.show('main-menu');
    },
    onPetCat: () => {
      audioManager.playCatEscape();
    },
    onRewardCoins: (_amount) => {
      audioManager.playCoin();
      updateCoinsDisplay();
    }
  });

  // 14. Инициализация игрового цикла
  const game = new Game(renderer, {
    onRulesUpdate: (rules) => {
      gameplayHUD.setLives(rules.lives);
      gameplayHUD.setCombo(rules.comboCount);
      gameplayHUD.setLevel(rules.levelNumber, rules.isUnlimitedLives);
    },
    onTimerTick: (elapsedMs, comboRemainingSec) => {
      gameplayHUD.setElapsedTime(elapsedMs);
      gameplayHUD.setComboState(game.getRules().comboCount, comboRemainingSec);
    },
    onCatSelect: (_cat) => {
      audioManager.playCatSelect();
      if (currentSettings.vibration) {
        platform.haptic?.('light');
      }
    },
    onLevelComplete: (result) => {
      console.log(`[Game] Уровень ${currentLevelId} пройден!`, result);
      lastLevelResult = result;
      tutorialController.onLevelComplete(currentLevelId);

      playerProgress.completeLevel(
        currentLevelId,
        result.stars,
        result.coins,
        result.completionTimeMs,
        result.maxCombo,
        result.performanceScore
      );
      SaveService.save(playerProgress);
      platform.saveCloud?.(playerProgress.getData());
      updateCoinsDisplay();
      levelSelect?.updateProgress(playerProgress);

      audioManager.playLevelComplete();
      winScreen?.show(
        result,
        playerProgress.getBestTime(currentLevelId),
        playerProgress.getBestCombo(currentLevelId),
        caps.rewardedAds
      );
    },
    onLevelFailed: () => {
      console.log(`[Game] Уровень ${currentLevelId} проигран!`);
      tutorialController.hideOverlay();
      audioManager.playCatBlocked();
      loseScreen?.show(caps.rewardedAds);
    },
    onCorrectMove: (cat) => {
      console.log(`[Game] Правильный ход: котик ${cat.id} убежал!`);
      gameplayHUD.setRemainingCats(game.getBoard().getRemainingCatsCount());
      tutorialController.onMoveSuccess();
      audioManager.playCatEscape();
      if (currentSettings.vibration) {
        platform.haptic?.('success');
      }
      const combo = game.getRules().comboCount;
      if (combo >= 2) {
        audioManager.playCombo(combo);
      }
    },
    onWrongMove: (cat) => {
      console.log(`[Game] Ошибка: котик ${cat.id} заблокирован!`);
      tutorialController.onMoveBlocked();
      audioManager.playCatBlocked();
      if (currentSettings.vibration) {
        platform.haptic?.('error');
      }
    },
    onAutoPause: () => {
      if (screenManager.getCurrentScreenId() === 'gameplay-hud' && !pauseMenu?.isOpen()) {
        pauseMenu?.open();
      }
    }
  });

  // Загружаем начальный уровень игрока
  loadGameLevel(currentLevelId);

  // Обработка клика по Canvas (звук выбора котика воспроизводится строго внутри Game при попадании)
  canvas.addEventListener('pointerdown', (e) => {
    audioManager.init();
    game.handleTap(e.clientX, e.clientY);
  });

  // Обработка деактивации окна (например, сворачивание в Telegram)
  platform.onActivityChanged?.((active) => {
    if (!active && screenManager.getCurrentScreenId() === 'gameplay-hud' && !pauseMenu?.isOpen()) {
      game.pause();
      pauseMenu?.open();
    }
  });

  // 15. Меню паузы
  pauseMenu = new PauseMenu(screenManager, {
    onResume: () => {
      audioManager.playClick();
      game.resume();
    },
    onRestart: () => {
      audioManager.playClick();
      loadGameLevel(currentLevelId);
      game.resume();
    },
    onSettings: () => {
      audioManager.playClick();
      settingsMenu.open();
    },
    onMainMenu: () => {
      audioManager.playClick();
      tutorialController.hideOverlay();
      updateCoinsDisplay();
      screenManager.show('main-menu');
    }
  });
  pauseMenu.mount(uiLayer);

  // 16. Главное меню
  mainMenu = new MainMenu(playerProgress, {
    onPlay: () => {
      audioManager.init();
      audioManager.playClick();
      const targetLevel = playerProgress.getLastUnlockedLevel();
      loadGameLevel(targetLevel);
      screenManager.show('gameplay-hud');
      game.resume();
    },
    onLevelSelect: () => {
      audioManager.playClick();
      levelSelect?.updateProgress(playerProgress);
      screenManager.show('level-select');
    },
    onCatHouse: () => {
      audioManager.playClick();
      catHouseScreen?.updateProgress(playerProgress);
      screenManager.show('cat-house');
    },
    onCollection: () => {
      audioManager.playClick();
      collectionScreen?.updateProgress(playerProgress);
      screenManager.show('collection');
    },
    onSettings: () => {
      audioManager.playClick();
      settingsMenu.open();
    },
    onPetMascot: () => {
      audioManager.playCatEscape();
    }
  });

  // 17. Сплэш-экран
  const splashScreen = new SplashScreen(() => {
    platform.ready();
    updateCoinsDisplay();
    screenManager.show('main-menu');
  });

  // 18. Регистрация экранов
  screenManager.register(splashScreen);
  screenManager.register(mainMenu);
  screenManager.register(gameplayHUD);
  screenManager.register(levelSelect);
  screenManager.register(collectionScreen);
  screenManager.register(catHouseScreen);

  // 19. Запуск приложения: показываем splash и скрываем Canvas
  setGameplayVisible(false);
  screenManager.show('splash');
  game.start();

  console.log(`[App] «Котики: путь свободен!» запущено на платформе: ${platform.id}`);
}

window.addEventListener('DOMContentLoaded', () => {
  initApp().catch((err) => console.error('[App] Ошибка запуска приложения:', err));
});
