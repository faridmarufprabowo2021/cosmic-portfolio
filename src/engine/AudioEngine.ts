// ============================================================================
// NASA & Web Foley Audio Engine
// 1:1 Reconstructed Source from poggufanz.xyz (Module 3544)
// Features: Granular bed cross-fading, lead transient detection, dynamic ducking,
// 4-band FFT equalizer, and interactive foley sound system.
// ============================================================================

export interface SoundConfig {
  files: string[];
  gain: number;
  rate: [number, number];
  gap?: number;
}

export interface BedConfig {
  file: string;
  gain: number;
}

export interface PlayOptions {
  force?: boolean;
  gain?: number;
  pan?: number;
}

export interface AudioBufferEntry {
  buffer: AudioBuffer;
  lead: number;
}

export const SOUND_CONFIGS: Record<string, SoundConfig> = {
  hover: { files: ["ui-hover-1.mp3", "ui-hover-2.mp3", "ui-hover-3.mp3"], gain: 0.1, rate: [0.88, 1.12], gap: 0.06 },
  press: { files: ["ui-press-1.mp3", "ui-press-2.mp3"], gain: 0.3, rate: [0.94, 1.06] },
  detent: { files: ["ui-detent-1.mp3", "ui-detent-2.mp3"], gain: 0.2, rate: [0.78, 0.9], gap: 0.08 },
  toggle: { files: ["ui-toggle.mp3"], gain: 0.34, rate: [0.97, 1.03] },
  step: { files: ["ui-step.mp3"], gain: 0.3, rate: [0.9, 1.1] },
  switchOn: { files: ["ui-switch-on.mp3"], gain: 0.45, rate: [1, 1] },
  switchOff: { files: ["ui-switch-off.mp3"], gain: 0.4, rate: [0.96, 0.96] },
  open: { files: ["ui-open.mp3"], gain: 0.65, rate: [0.97, 1.03] },
  close: { files: ["ui-close.mp3"], gain: 0.6, rate: [0.97, 1.03] },
  travel: { files: ["ui-travel.mp3"], gain: 0.2, rate: [0.94, 1.06], gap: 0.3 },
};

export const BED_CONFIGS: Record<string, BedConfig> = {
  blackhole: { file: "bed-blackhole.mp3", gain: 1.0 },
  tesseract: { file: "bed-tesseract.mp3", gain: 0.8 },
  origin: { file: "bed-origin.mp3", gain: 0.95 },
  trails: { file: "bed-orbits.mp3", gain: 0.85 },
  voyager: { file: "bed-voyager.mp3", gain: 1.0 },
  galaxy: { file: "bed-galaxy.mp3", gain: 0.9 },
};

export const WARP_CONFIGS = {
  full: "fx-warp.mp3",
  lite: "fx-warp-lite.mp3",
};

// 4-band frequency ranges (Hz) for equalizer
const FREQ_BANDS: [number, number][] = [
  [30, 180],
  [180, 800],
  [800, 3200],
  [3200, 10000],
];

// Band compensation dB
const BAND_BIAS = [0, 10, 20, 28];

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

// Pre-computed half-sine and half-cosine curves for granular crossfades
const FADE_IN_CURVE = new Float32Array(64).map((_, i) => Math.sin((i / 63) * Math.PI * 0.5));
const FADE_OUT_CURVE = new Float32Array(64).map((_, i) => Math.cos((i / 63) * Math.PI * 0.5));

/**
 * Granular Voice Spawner for evolving NASA ambient soundscapes
 */
export class AmbientBedVoice {
  private ctx: AudioContext;
  private buffer: AudioBuffer;
  private level: number;
  private timer = 0;
  private stopTimer = 0;
  private nextWhen = 0;
  private alive = true;
  private voices = new Set<AudioBufferSourceNode>();
  private out: GainNode;

  constructor(ctx: AudioContext, buffer: AudioBuffer, destination: AudioNode, level: number) {
    this.ctx = ctx;
    this.buffer = buffer;
    this.level = level;
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(destination);
  }

  public start(fadeDuration: number) {
    const now = this.ctx.currentTime;
    this.out.gain.setValueAtTime(0, now);
    this.out.gain.linearRampToValueAtTime(this.level, now + fadeDuration);
    this.spawn(now);
  }

  private spawn(startTime: number) {
    if (!this.alive) return;
    this.timer = 0;
    const { ctx, buffer } = this;
    if (ctx.state !== "running" || (typeof document !== "undefined" && document.hidden)) {
      this.nextWhen = startTime;
      return;
    }

    const fadeDur = Math.min(4, buffer.duration / 5);
    const sliceDur = Math.min(buffer.duration, Math.max(2 * fadeDur + 1, randomRange(12, 22)));
    const offset = randomRange(0, Math.max(0, buffer.duration - sliceDur));
    const playAt = Math.max(startTime, ctx.currentTime);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(gain).connect(this.out);
    gain.gain.setValueCurveAtTime(FADE_IN_CURVE, playAt, fadeDur);
    gain.gain.setValueCurveAtTime(FADE_OUT_CURVE, playAt + sliceDur - fadeDur, fadeDur);

    source.start(playAt, offset, sliceDur);
    this.voices.add(source);

    source.onended = () => {
      this.voices.delete(source);
      source.disconnect();
      gain.disconnect();
    };

    const nextTime = playAt + sliceDur - fadeDur;
    this.nextWhen = nextTime;
    this.timer = window.setTimeout(
      () => this.spawn(nextTime),
      Math.max(0, (nextTime - ctx.currentTime - 3) * 1000)
    );
  }

  public stop(fadeDuration: number) {
    this.alive = false;
    window.clearTimeout(this.timer);
    this.timer = 0;
    const now = this.ctx.currentTime;
    const g = this.out.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + fadeDuration);

    this.stopTimer = window.setTimeout(() => {
      this.stopTimer = 0;
      this.voices.forEach((v) => {
        try { v.stop(); } catch {}
      });
      this.voices.clear();
      this.out.disconnect();
    }, (fadeDuration + 0.3) * 1000);
  }
}

/**
 * Main Audio Engine Manager
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ui: GainNode | null = null;
  private fx: GainNode | null = null;
  private beds: GainNode | null = null;
  private duck: GainNode | null = null;
  private muffle: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;

  public on = true;
  private failed = false;
  private offTimer = 0;
  private world: string | null = null;
  private bins: Uint8Array | null = null;

  private cache = new Map<string, Promise<AudioBufferEntry | null>>();
  private ready = new Map<string, AudioBufferEntry>();
  private playing = new Map<string, AmbientBedVoice>();
  private turn = new Map<string, number>();
  private last = new Map<string, number>();
  private warpVoice: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

  constructor() {}

  public ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === "undefined") return null;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx({ latencyHint: "interactive" });
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -3;
    compressor.knee.value = 4;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.minDecibels = -100;
    this.analyser.maxDecibels = -20;
    this.analyser.smoothingTimeConstant = 0.6;

    this.master.connect(compressor).connect(this.analyser).connect(ctx.destination);

    this.ui = ctx.createGain();
    this.ui.gain.value = 1.0;
    this.ui.connect(this.master);

    this.fx = ctx.createGain();
    this.fx.gain.value = 0.8;
    this.fx.connect(this.master);

    this.beds = ctx.createGain();
    this.beds.gain.value = 0.55;

    this.duck = ctx.createGain();
    this.duck.gain.value = 1.0;

    this.muffle = ctx.createBiquadFilter();
    this.muffle.type = "lowpass";
    this.muffle.frequency.value = 18000;
    this.muffle.Q.value = 0.5;

    this.beds.connect(this.duck).connect(this.muffle).connect(this.master);

    return ctx;
  }

  public load(filename: string): Promise<AudioBufferEntry | null> {
    const existing = this.cache.get(filename);
    if (existing) return existing;

    const promise = (async () => {
      const ctx = this.ensure();
      if (!ctx) return null;

      try {
        const res = await fetch(`/audio/${filename}`);
        if (!res.ok) throw new Error(`${res.status} ${filename}`);
        const arrayBuf = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuf);

        // Detect lead silence to trim transient for instant trigger
        const scanSamples = Math.min(buffer.length, Math.floor(0.12 * buffer.sampleRate));
        let leadIndex = scanSamples;
        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
          const data = buffer.getChannelData(ch);
          for (let i = 0; i < leadIndex; i++) {
            if (Math.abs(data[i]) > 0.003) {
              leadIndex = i;
              break;
            }
          }
        }
        const lead = leadIndex >= scanSamples ? 0 : Math.max(0, leadIndex / buffer.sampleRate - 0.001);

        const entry: AudioBufferEntry = { buffer, lead };
        this.ready.set(filename, entry);
        return entry;
      } catch {
        this.failed = true;
        return null;
      }
    })();

    this.cache.set(filename, promise);
    return promise;
  }

  public enable() {
    const ctx = this.ensure();
    if (!ctx) return;

    window.clearTimeout(this.offTimer);
    this.on = true;
    if (typeof document !== "undefined") {
      document.documentElement.dataset.audio = "loading";
      if (!document.hidden) ctx.resume();
    }

    const now = ctx.currentTime;
    if (this.master) {
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(1.0, now + 0.25);
    }

    this.load(SOUND_CONFIGS.switchOn.files[0]).then(() => {
      if (this.on && typeof document !== "undefined" && !document.hidden) {
        this.play("switchOn");
      }
    });

    const allFiles = [
      ...Object.values(SOUND_CONFIGS).flatMap((c) => c.files),
      WARP_CONFIGS.full,
      WARP_CONFIGS.lite,
    ];

    Promise.all(allFiles.map((f) => this.load(f))).then(() => {
      if (this.on && typeof document !== "undefined") {
        document.documentElement.dataset.audio = this.failed ? "error" : "on";
      }
    });

    this.world = null;
    this.syncWorld(1.6);
  }

  public disable() {
    const ctx = this.ctx;
    if (!ctx) return;

    this.play("switchOff", { force: true });
    this.on = false;
    if (typeof document !== "undefined") {
      document.documentElement.dataset.audio = "off";
    }

    const now = ctx.currentTime;
    if (this.master) {
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.setValueAtTime(this.master.gain.value, now + 0.2);
      this.master.gain.linearRampToValueAtTime(0, now + 0.75);
    }

    this.offTimer = window.setTimeout(() => {
      if (!this.on) {
        this.playing.forEach((voice) => voice.stop(0.05));
        this.playing.clear();
        this.world = null;
        ctx.suspend();
      }
    }, 950);
  }

  public play(name: string, options: PlayOptions = {}) {
    const ctx = this.ctx;
    if (!ctx || (!this.on && !options.force) || (!options.force && typeof document !== "undefined" && document.hidden)) {
      return;
    }

    const config = SOUND_CONFIGS[name];
    if (!config) return;

    const now = ctx.currentTime;
    if (config.gap && now - (this.last.get(name) ?? -1) < config.gap) {
      return;
    }

    const count = config.files.length;
    const startIdx = this.turn.get(name) ?? Math.floor(Math.random() * count);
    let entry: AudioBufferEntry | undefined;
    let offset = 0;

    for (; offset < count && !entry; offset++) {
      entry = this.ready.get(config.files[(startIdx + offset) % count]);
    }

    if (!entry) return;

    this.turn.set(name, (startIdx + offset) % count);
    this.last.set(name, now);

    const src = ctx.createBufferSource();
    src.buffer = entry.buffer;
    src.playbackRate.value = randomRange(config.rate[0], config.rate[1]);

    const gain = ctx.createGain();
    const targetGain = config.gain * (options.gain ?? 1) * Math.pow(10, randomRange(-1.2, 1.2) / 20);
    gain.gain.value = targetGain;
    src.connect(gain);

    let outputNode: AudioNode = gain;
    if (options.pan && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = clamp(options.pan, -1, 1);
      gain.connect(panner);
      outputNode = panner;
    }

    if (this.ui) outputNode.connect(this.ui);

    src.onended = () => {
      src.disconnect();
      gain.disconnect();
      if (outputNode !== gain) outputNode.disconnect();
    };

    src.start(now, entry.lead);
  }

  public warp(minimal = false) {
    const ctx = this.ctx;
    if (!ctx || !this.on || (typeof document !== "undefined" && document.hidden)) return;

    const filename = minimal ? WARP_CONFIGS.lite : WARP_CONFIGS.full;
    const entry = this.ready.get(filename);
    if (!entry) return;

    this.stopWarp(0.05);
    const now = ctx.currentTime;

    if (this.duck) {
      const d = this.duck.gain;
      d.cancelScheduledValues(now);
      d.setValueAtTime(d.value, now);
      d.linearRampToValueAtTime(0.06, now + 0.35);
      d.setValueAtTime(0.06, now + (minimal ? 0.4 : 2.2));
      d.linearRampToValueAtTime(1.0, now + (minimal ? 1.4 : 4.2));
    }

    const src = ctx.createBufferSource();
    src.buffer = entry.buffer;

    const gain = ctx.createGain();
    if (this.fx) src.connect(gain).connect(this.fx);

    src.onended = () => {
      if (this.warpVoice?.src === src) this.warpVoice = null;
      src.disconnect();
      gain.disconnect();
    };

    src.start(now, entry.lead);
    this.warpVoice = { src, gain };
  }

  public warpSkip() {
    const ctx = this.ctx;
    if (!ctx || !this.warpVoice) return;
    this.stopWarp(0.25);
    const now = ctx.currentTime;
    if (this.duck) {
      const d = this.duck.gain;
      d.cancelScheduledValues(now);
      d.setValueAtTime(d.value, now);
      d.linearRampToValueAtTime(1.0, now + 1.2);
    }
  }

  public stopWarp(duration = 0.05) {
    const ctx = this.ctx;
    const voice = this.warpVoice;
    if (!ctx || !voice) return;

    const now = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, now + duration);

    try { voice.src.stop(now + duration + 0.02); } catch {}
    this.warpVoice = null;
  }

  public get isEnabled(): boolean {
    return this.on;
  }

  public toggle(): boolean {
    if (this.on) {
      this.disable();
    } else {
      this.enable();
    }
    return this.on;
  }

  public playHover() {
    this.play("hover");
  }

  public playClick() {
    this.play("press");
  }

  public playRoom() {
    this.play("open");
  }

  public playRoomClose() {
    this.play("close");
  }

  public playWarp() {
    this.warp();
  }

  public setWorld(worldName: string) {
    if (this.on) this.syncWorld();
  }

  public getLevels(out: number[] = [0, 0, 0, 0]): number[] {
    const f32 = new Float32Array(4);
    this.levels(f32);
    out[0] = f32[0];
    out[1] = f32[1];
    out[2] = f32[2];
    out[3] = f32[3];
    return out;
  }

  public levels(out: Float32Array | number[]): Float32Array | number[] {
    const analyser = this.analyser;
    if (!this.ctx || !analyser || !this.on || (typeof document !== "undefined" && document.hidden)) {
      if (out instanceof Float32Array) out.fill(0);
      else for (let i = 0; i < out.length; i++) out[i] = 0;
      return out;
    }

    if (!this.bins) {
      this.bins = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(this.bins as unknown as Uint8Array<ArrayBuffer>);

    const hzPerBin = this.ctx.sampleRate / analyser.fftSize;
    const dbRange = analyser.maxDecibels - analyser.minDecibels;

    FREQ_BANDS.forEach(([low, high], idx) => {
      const startBin = Math.max(1, Math.floor(low / hzPerBin));
      const endBin = Math.min(this.bins!.length - 1, Math.ceil(high / hzPerBin));
      let sum = 0;
      for (let b = startBin; b <= endBin; b++) sum += this.bins![b];
      const avg = sum / (endBin - startBin + 1);
      const db = analyser.minDecibels + (avg / 255) * dbRange + BAND_BIAS[idx];
      out[idx] = clamp((db - -72) / 40, 0, 1);
    });

    return out;
  }

  public syncWorld(fadeTime = 3.2) {
    if (!this.on || !this.ctx || !this.beds) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const midY = window.innerHeight / 2;
    let targetWorld: string | null = null;

    const sections = Array.from(document.querySelectorAll("[data-world]")) as HTMLElement[];
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= midY && rect.bottom > midY) {
        const w = sec.dataset.world;
        if (w && w in BED_CONFIGS) {
          targetWorld = w;
          break;
        }
      }
    }

    if (!targetWorld || targetWorld === this.world) return;

    this.world = targetWorld;
    this.playing.forEach((voice, key) => {
      if (key !== targetWorld) {
        voice.stop(fadeTime);
        this.playing.delete(key);
      }
    });

    const config = BED_CONFIGS[targetWorld];
    this.load(config.file).then((entry) => {
      if (!entry || !this.on || this.world !== targetWorld || this.playing.has(targetWorld)) return;
      const voice = new AmbientBedVoice(this.ctx!, entry.buffer, this.beds!, config.gain);
      this.playing.set(targetWorld, voice);
      voice.start(fadeTime);
    });
  }
}

// Global singleton instance matching module 3544 x4
export const audioEngine = new AudioEngine();
export const x4 = audioEngine;
