// Real NASA & Web Foley Audio Engine matching poggufanz.xyz module 3544

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bedsGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  public isEnabled = false;

  private buffers = new Map<string, AudioBuffer>();
  private currentBed: { name: string; source: AudioBufferSourceNode; gain: GainNode } | null = null;

  private bedsMap: Record<string, string> = {
    top: "bed-blackhole.mp3",
    works: "bed-tesseract.mp3",
    about: "bed-origin.mp3",
    log: "bed-orbits.mp3",
    writing: "bed-voyager.mp3",
    contact: "bed-galaxy.mp3",
  };

  constructor() {}

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx({ latencyHint: "interactive" });

    this.master = this.ctx.createGain();
    this.master.gain.setValueAtTime(0, this.ctx.currentTime);

    // Dynamics compressor for clean sound
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -3;
    compressor.knee.value = 4;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Analyser node for 4-bar equalizer UI
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -15;
    this.analyser.smoothingTimeConstant = 0.75;

    this.bedsGain = this.ctx.createGain();
    this.bedsGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.bedsGain.connect(this.master);
    this.sfxGain.connect(this.master);

    this.master.connect(compressor);
    compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Preload audio files
    this.preloadFiles();
  }

  private async loadBuffer(filename: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    if (this.buffers.has(filename)) {
      return this.buffers.get(filename)!;
    }
    try {
      const res = await fetch(`/audio/${filename}`);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
      this.buffers.set(filename, audioBuf);
      return audioBuf;
    } catch {
      return null;
    }
  }

  private preloadFiles() {
    const list = [
      "ui-hover-1.mp3", "ui-hover-2.mp3", "ui-hover-3.mp3",
      "ui-press-1.mp3", "ui-press-2.mp3", "ui-open.mp3", "ui-close.mp3",
      "ui-toggle.mp3", "ui-travel.mp3", "fx-warp.mp3",
      "bed-blackhole.mp3", "bed-tesseract.mp3", "bed-origin.mp3",
      "bed-orbits.mp3", "bed-voyager.mp3", "bed-galaxy.mp3",
    ];
    list.forEach((f) => this.loadBuffer(f));
  }

  public toggle(): boolean {
    this.initContext();
    if (!this.ctx || !this.master) return false;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isEnabled = !this.isEnabled;
    const now = this.ctx.currentTime;

    if (this.isEnabled) {
      this.playSfx("ui-switch-on.mp3", 0.5);
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.linearRampToValueAtTime(0.9, now + 0.8);
      this.setWorld("top");
    } else {
      this.playSfx("ui-switch-off.mp3", 0.4);
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.5);
      if (this.currentBed) {
        this.currentBed.gain.gain.linearRampToValueAtTime(0, now + 0.4);
      }
    }

    return this.isEnabled;
  }

  public async setWorld(sectionId: string) {
    if (!this.isEnabled || !this.ctx || !this.bedsGain) return;
    const filename = this.bedsMap[sectionId] || "bed-blackhole.mp3";
    if (this.currentBed && this.currentBed.name === filename) return;

    const buffer = await this.loadBuffer(filename);
    if (!buffer || !this.ctx || !this.isEnabled) return;

    const now = this.ctx.currentTime;

    // Cross-fade out previous bed
    if (this.currentBed) {
      const oldGain = this.currentBed.gain;
      const oldSrc = this.currentBed.source;
      oldGain.gain.linearRampToValueAtTime(0, now + 1.2);
      setTimeout(() => {
        try { oldSrc.stop(); oldSrc.disconnect(); } catch {}
      }, 1400);
    }

    // Start new looped bed
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 1.2);

    source.connect(gain);
    gain.connect(this.bedsGain);

    source.start(now);
    this.currentBed = { name: filename, source, gain };
  }

  public async playSfx(filename: string, volume = 0.5, playbackRate = 1.0) {
    if (!this.isEnabled || !this.ctx || !this.sfxGain) return;
    const buffer = await this.loadBuffer(filename);
    if (!buffer) return;

    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = playbackRate;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);

    src.connect(gain);
    gain.connect(this.sfxGain);

    src.start(now);
    src.onended = () => {
      src.disconnect();
      gain.disconnect();
    };
  }

  public playHover() {
    const list = ["ui-hover-1.mp3", "ui-hover-2.mp3", "ui-hover-3.mp3"];
    const pick = list[Math.floor(Math.random() * list.length)];
    const rate = 0.9 + Math.random() * 0.2;
    this.playSfx(pick, 0.25, rate);
  }

  public playClick() {
    const list = ["ui-press-1.mp3", "ui-press-2.mp3"];
    const pick = list[Math.floor(Math.random() * list.length)];
    const rate = 0.95 + Math.random() * 0.1;
    this.playSfx(pick, 0.5, rate);
  }

  public playRoom() {
    this.playSfx("ui-open.mp3", 0.7);
  }

  public playRoomClose() {
    this.playSfx("ui-close.mp3", 0.6);
  }

  public playWarp() {
    this.playSfx("fx-warp.mp3", 0.95);
  }

  public playTravel() {
    this.playSfx("ui-travel.mp3", 0.4);
  }

  public getLevels(out: number[] = [0, 0, 0, 0]): number[] {
    if (!this.isEnabled || !this.analyser) {
      return [0, 0, 0, 0];
    }

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    // 4 frequency bins
    const step = Math.floor(data.length / 4);
    for (let i = 0; i < 4; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += data[i * step + j];
      }
      out[i] = Math.min(1.0, (sum / step) / 160);
    }
    return out;
  }
}
