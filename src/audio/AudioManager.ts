import { SoundSynthesizer } from './SoundSynthesizer';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private synth: SoundSynthesizer | null = null;

  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;

  private isMusicPlaying: boolean = false;
  private musicTimerId: number | null = null;
  private currentStep: number = 0;

  constructor() {
    this.setupWindowListeners();
  }

  private setupWindowListeners(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.suspend();
      } else {
        this.resume();
      }
    });

    window.addEventListener('blur', () => {
      this.suspend();
    });

    window.addEventListener('focus', () => {
      this.resume();
    });
  }

  public init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // Защита от перегрузок и клиппинга при одновременных звуках (п. 7 ТЗ)
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.synth = new SoundSynthesizer(this.ctx, this.sfxGain);

      // Запуск фоновой уютной мелодии
      this.startBackgroundMusic();
    } catch (e) {
      console.warn('[AudioManager] WebAudio API недоступен:', e);
    }
  }

  public suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    if (muted) {
      this.suspend();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      }
      this.resume();
    }
  }

  public setMasterVolume(value: number): void {
    this.masterVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(value: number): void {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(value: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, value));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // --- Методы воспроизведения SFX ---

  public playClick(): void {
    this.init();
    this.synth?.playClick();
  }

  public playCatSelect(): void {
    this.init();
    this.synth?.playCatSelect();
  }

  public playCatEscape(): void {
    this.init();
    this.synth?.playCatEscape();
  }

  public playCatBlocked(): void {
    this.init();
    this.synth?.playCatBlocked();
  }

  public playCombo(combo: number): void {
    this.init();
    this.synth?.playCombo(combo);
  }

  public playStar(index: number): void {
    this.init();
    this.synth?.playStar(index);
  }

  public playCoin(): void {
    this.init();
    this.synth?.playCoin();
  }

  public playLevelComplete(): void {
    this.init();
    this.synth?.playLevelComplete();
  }

  public playHint(): void {
    this.init();
    this.synth?.playHint();
  }

  // --- Процедурная фоновая музыка (мягкая маримба 100 BPM) ---

  private startBackgroundMusic(): void {
    if (this.isMusicPlaying || !this.ctx || !this.musicGain) return;
    this.isMusicPlaying = true;

    // Уютный пентатонический паттерн (C, D, E, G, A)
    const melody = [
      261.63, 0, 329.63, 0,
      392.00, 0, 440.00, 392.00,
      329.63, 0, 261.63, 0,
      293.66, 0, 392.00, 0
    ];

    const stepDuration = 60 / 100 / 2; // 100 BPM, 8-е ноты

    const scheduleNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

      const note = melody[this.currentStep % melody.length];
      this.currentStep++;

      if (note > 0 && this.musicVolume > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        // Мягкий щипок маримбы
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 0.3);
      }

      this.musicTimerId = window.setTimeout(scheduleNextNote, stepDuration * 1000);
    };

    scheduleNextNote();
  }

  public stopBackgroundMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimerId !== null) {
      clearTimeout(this.musicTimerId);
      this.musicTimerId = null;
    }
  }
}
