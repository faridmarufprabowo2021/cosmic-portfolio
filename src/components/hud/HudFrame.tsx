"use client";

import { NavHeader } from "./NavHeader";
import { DepthGauge } from "./DepthGauge";
import { LiveClock } from "./LiveClock";
import { CustomCursor } from "./CustomCursor";
import { AudioEngine } from "@/engine/AudioEngine";

interface HudFrameProps {
  progress: number;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  audioEngine: AudioEngine | null;
  city?: string;
}

export function HudFrame({
  progress,
  activeSection,
  onNavigate,
  audioEngine,
  city = "West Java",
}: HudFrameProps) {
  const showScrollCue = progress < 0.08;

  return (
    <>
      {/* 4 Corner Alignment Marks */}
      <span className="hud-mark hud-mark-tl" aria-hidden="true" />
      <span className="hud-mark hud-mark-tr" aria-hidden="true" />
      <span className="hud-mark hud-mark-bl" aria-hidden="true" />
      <span className="hud-mark hud-mark-br" aria-hidden="true" />

      {/* Top & Bottom Gradient Scrims */}
      <div className="hud-scrim hud-scrim--top" aria-hidden="true" />
      <div className="hud-scrim hud-scrim--bottom" aria-hidden="true" />

      {/* Nav Header */}
      <NavHeader
        activeSection={activeSection}
        onNavigate={onNavigate}
        audioEngine={audioEngine}
      />

      {/* Vertical Depth Meter */}
      <DepthGauge progress={progress} activeSection={activeSection} />

      {/* Real-time Clock */}
      <LiveClock city={city} />

      {/* Custom Spring Cursor */}
      <CustomCursor />

      {/* Hero Scroll Cue */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-500 font-mono text-[11px] text-[var(--ink-3)] tracking-widest uppercase flex items-center gap-3"
        style={{ opacity: showScrollCue ? 1 : 0 }}
      >
        <span className="w-8 h-[1px] bg-[var(--line-bright)]" />
        <span className="hidden sm:inline">Scroll to fall into the singularity</span>
        <span className="sm:hidden">Scroll</span>
        <span className="w-8 h-[1px] bg-[var(--line-bright)]" />
      </div>
    </>
  );
}
