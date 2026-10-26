"use client";

import { useEffect, useRef, useState } from "react";
import { AudioEngine } from "@/engine/AudioEngine";

interface SoundButtonProps {
  audioEngine: AudioEngine | null;
}

export function SoundButton({ audioEngine }: SoundButtonProps) {
  const [isOn, setIsOn] = useState(true);
  const barsRef = useRef<(HTMLElement | null)[]>([]);

  // Auto-enable audio on first user interaction or mount
  useEffect(() => {
    if (!audioEngine) return;
    const unlockAudio = () => {
      if (isOn && !audioEngine.on) {
        audioEngine.enable();
      }
    };
    unlockAudio();
    window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
    window.addEventListener("scroll", unlockAudio, { once: true, passive: true });
    window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [audioEngine, isOn]);

  useEffect(() => {
    let animId: number;
    const levels = [0, 0, 0, 0];

    const updateBars = () => {
      if (isOn && audioEngine) {
        const liveLevels = audioEngine.getLevels();
        for (let i = 0; i < 4; i++) {
          levels[i] += (liveLevels[i] - levels[i]) * 0.2;
          const bar = barsRef.current[i];
          if (bar) {
            bar.style.height = `${Math.max(15, Math.min(100, levels[i] * 100))}%`;
          }
        }
      } else {
        for (let i = 0; i < 4; i++) {
          const bar = barsRef.current[i];
          if (bar) {
            bar.style.height = "15%";
          }
        }
      }
      animId = requestAnimationFrame(updateBars);
    };

    animId = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animId);
  }, [isOn, audioEngine]);

  const toggleSound = () => {
    if (!audioEngine) return;
    if (isOn) {
      audioEngine.disable();
      setIsOn(false);
    } else {
      audioEngine.enable();
      setIsOn(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="sound-btn flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[rgba(3,4,9,0.6)] backdrop-blur hover:border-[var(--line-bright)] transition-colors"
      aria-label={isOn ? "Sound on" : "Sound off"}
      aria-pressed={isOn}
    >
      <span className="eq flex items-end gap-[3px] h-3 w-3" aria-hidden="true" data-on={isOn ? "" : undefined}>
        {[0, 1, 2, 3].map((i) => (
          <i
            key={i}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            className="w-[2px] bg-[var(--ink)] rounded-full transition-all duration-75"
            style={{ height: isOn ? "40%" : "15%" }}
          />
        ))}
      </span>
      <span className="sound-txt text-xs font-mono tracking-wider uppercase text-[var(--ink-muted)] hidden md:inline">
        Sound
      </span>
    </button>
  );
}
