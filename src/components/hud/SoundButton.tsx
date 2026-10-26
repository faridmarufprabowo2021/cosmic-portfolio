"use client";

import { useEffect, useRef, useState } from "react";
import { AudioEngine } from "@/engine/AudioEngine";

interface SoundButtonProps {
  audioEngine: AudioEngine | null;
}

export function SoundButton({ audioEngine }: SoundButtonProps) {
  const [isOn, setIsOn] = useState(false);
  const barsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let animId: number;
    const levels = [0, 0, 0, 0];

    const updateBars = () => {
      if (isOn && audioEngine) {
        audioEngine.getLevels(levels);
        barsRef.current.forEach((bar, i) => {
          if (bar) {
            const h = 3 + levels[i] * 9;
            bar.style.height = `${h.toFixed(1)}px`;
          }
        });
      } else {
        barsRef.current.forEach((bar) => {
          if (bar) bar.style.height = "3px";
        });
      }
      animId = requestAnimationFrame(updateBars);
    };

    animId = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animId);
  }, [isOn, audioEngine]);

  const handleToggle = () => {
    if (!audioEngine) return;
    const newState = audioEngine.toggle();
    setIsOn(newState);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="sound-btn flex items-center px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[rgba(14,20,34,0.65)] backdrop-blur-md text-xs font-mono transition-colors hover:border-[var(--line-bright)] hover:text-white"
      aria-label={isOn ? "Sound on" : "Sound off"}
      aria-pressed={isOn}
    >
      <span className="eq" aria-hidden="true">
        <i ref={(el) => { barsRef.current[0] = el; }} />
        <i ref={(el) => { barsRef.current[1] = el; }} />
        <i ref={(el) => { barsRef.current[2] = el; }} />
        <i ref={(el) => { barsRef.current[3] = el; }} />
      </span>
      <span className="text-[11px] text-[var(--ink-2)]">{isOn ? "Sound ON" : "Sound"}</span>
    </button>
  );
}
