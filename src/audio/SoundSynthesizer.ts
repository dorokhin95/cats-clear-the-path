export class SoundSynthesizer {
  private ctx: AudioContext;
  private sfxNode: GainNode;
  private catSelectCounter: number = 0;

  constructor(ctx: AudioContext, sfxNode: GainNode) {
    this.ctx = ctx;
    this.sfxNode = sfxNode;
  }

  /**
   * Тактильный клик по кнопке (40 мс)
   */
  public playClick(): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxNode);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Тап по котику (3-4 чередующихся варианта по п. 7 ТЗ)
   */
  public playCatSelect(): void {
    const variants = [
      { startFreq: 520, endFreq: 410, decay: 0.05, type: 'sine' as OscillatorType, vol: 0.32 },
      { startFreq: 580, endFreq: 450, decay: 0.045, type: 'sine' as OscillatorType, vol: 0.30 },
      { startFreq: 490, endFreq: 390, decay: 0.055, type: 'triangle' as OscillatorType, vol: 0.28 },
      { startFreq: 550, endFreq: 430, decay: 0.048, type: 'sine' as OscillatorType, vol: 0.31 }
    ];

    const v = variants[this.catSelectCounter % variants.length];
    this.catSelectCounter++;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = v.type;
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(v.startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(v.endFreq, now + v.decay);

    gain.gain.setValueAtTime(v.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + v.decay);

    osc.connect(gain);
    gain.connect(this.sfxNode);

    osc.start(now);
    osc.stop(now + v.decay + 0.005);
  }

  /**
   * Успешный побег котика (Whoosh + Pop со случайным питчем ±4%)
   */
  public playCatEscape(): void {
    const now = this.ctx.currentTime;
    const pitchMod = 1 + (Math.random() - 0.5) * 0.08; // ±4%

    // 1. Pop импульс
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440 * pitchMod, now);
    osc.frequency.exponentialRampToValueAtTime(880 * pitchMod, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxNode);

    osc.start(now);
    osc.stop(now + 0.16);

    // 2. Редкое мягкое «мяу» (в 15% случаев по п. 48 ТЗ)
    if (Math.random() < 0.15) {
      this.playSoftMeow(now + 0.05, pitchMod);
    }
  }

  private playSoftMeow(startTime: number, pitchMod: number): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650 * pitchMod, startTime);
    osc.frequency.linearRampToValueAtTime(850 * pitchMod, startTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(550 * pitchMod, startTime + 0.28);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxNode);

    osc.start(startTime);
    osc.stop(startTime + 0.29);
  }

  /**
   * Ошибка / Блокировка (мягкое удивленное «мррп!»)
   */
  public playCatBlocked(): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(320, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxNode);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * Звук комбо с циклическим музыкальным мотивом (п. 7 ТЗ)
   */
  public playCombo(combo: number): void {
    const now = this.ctx.currentTime;

    // Циклические музыкальные мотивы по 8 нот (без застревания на одной верхней ноте)
    // Мотив 1: C5, D5, E5, G5, A5, C6, A5, G5
    const motif1 = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 880.0, 783.99];
    // Мотив 2: E5, G5, A5, C6, D6, C6, A5, G5
    const motif2 = [659.25, 783.99, 880.0, 1046.5, 1174.66, 1046.5, 880.0, 783.99];

    const cycle = Math.floor((combo - 1) / 8);
    const stepInCycle = (combo - 1) % 8;
    const activeMotif = cycle % 2 === 0 ? motif1 : motif2;
    const baseFreq = activeMotif[stepInCycle];

    const isAccent = combo % 4 === 0;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isAccent ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isAccent ? 0.32 : 0.22));

    osc.connect(gain);
    gain.connect(this.sfxNode);

    osc.start(now);
    osc.stop(now + (isAccent ? 0.33 : 0.23));

    // На комбо 4, 8, 12... добавляем акцентирующий созвучный обертон (аккорд)
    if (isAccent) {
      const harmonyOsc = this.ctx.createOscillator();
      const harmonyGain = this.ctx.createGain();

      harmonyOsc.type = 'sine';
      harmonyOsc.frequency.setValueAtTime(baseFreq * 1.25, now); // мажорная терция

      harmonyGain.gain.setValueAtTime(0.16, now);
      harmonyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      harmonyOsc.connect(harmonyGain);
      harmonyGain.connect(this.sfxNode);

      harmonyOsc.start(now);
      harmonyOsc.stop(now + 0.31);
    }
  }

  /**
   * Появление звезды на экране победы
   */
  public playStar(starIndex: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freqs = [880, 1174.66, 1567.98]; // A5, D6, G6
    const freq = freqs[Math.min(starIndex, freqs.length - 1)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxNode);

    osc.start(now);
    osc.stop(now + 0.31);
  }

  /**
   * Начисление монетки
   */
  public playCoin(): void {
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.05); // E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxNode);

    osc1.start(now);
    osc1.stop(now + 0.06);

    osc2.start(now + 0.05);
    osc2.stop(now + 0.22);
  }

  /**
   * Триумфальный джингл победы на уровне (1.5 с)
   */
  public playLevelComplete(): void {
    const now = this.ctx.currentTime;
    // Арпеджио победы: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const delays = [0, 0.12, 0.24, 0.38];

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + delays[i];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxNode);

      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  /**
   * Звук активации подсказки (волшебный перелив)
   */
  public playHint(): void {
    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 1046.5, 1318.51];

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxNode);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }
}
