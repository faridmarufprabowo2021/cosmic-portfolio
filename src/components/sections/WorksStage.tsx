"use client";

import React, { useEffect, useRef, useState } from "react";
import { ProjectRoom } from "@/types/portfolio";
import {
  SEG_HEIGHT_SVH,
  INITIAL_STATION,
  calcScrollProgress,
  calcStationMetrics,
  calcStationVis,
  calcStationFly,
  calcTopProgress,
  calcScrim,
  calcStationScrollFraction,
} from "@/lib/tesseract-math";
import { audioEngine } from "@/engine/AudioEngine";
import { SplitText } from "@/components/ui/SplitText";

interface WorksStageProps {
  projects: ProjectRoom[];
  onSelectRoom: (room: ProjectRoom) => void;
  onRoomChange?: (roomIndex: number) => void;
}

export function WorksStage({ projects, onSelectRoom, onRoomChange }: WorksStageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStation, setActiveStation] = useState<number>(INITIAL_STATION);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stationEls = Array.from(section.querySelectorAll<HTMLElement>("[data-station]"));
    const axisEl = section.querySelector<HTMLElement>("[data-axis]");
    const cache = new Map<HTMLElement, string>();

    let rafId = 0;
    let lastNearest = Number.NaN;
    let lastScrim = "";

    const updateChoreography = () => {
      rafId = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      // Scrim opacity
      const topProgress = calcTopProgress(rect.top, vh);
      const scrimVal = calcScrim(topProgress).toFixed(3);
      if (scrimVal !== lastScrim) {
        lastScrim = scrimVal;
        section.style.setProperty("--scrim", scrimVal);
      }

      // Station metrics
      const progress = calcScrollProgress(rect.top, rect.height, vh);
      const metrics = calcStationMetrics(progress, projects.length);

      // Update stations
      stationEls.forEach((el) => {
        const stationIdx = Number(el.dataset.station);
        const vis = calcStationVis(stationIdx, metrics);
        const fly = calcStationFly(stationIdx, metrics);

        const visStr = vis.toFixed(3);
        const flyStr = fly.toFixed(3);
        const cacheKey = `${visStr}_${flyStr}`;

        if (cache.get(el) !== cacheKey) {
          cache.set(el, cacheKey);
          el.style.setProperty("--vis", visStr);
          el.style.setProperty("--fly", flyStr);
          el.dataset.on = vis > 0.5 ? "true" : vis > 0.001 ? "fading" : "false";
        }
      });

      // Update axis progress
      if (axisEl) {
        const curIdx = metrics.from + (metrics.to - metrics.from) * metrics.mix;
        const normalizedPos = Math.min(1, Math.max(0, curIdx / Math.max(1, projects.length - 1)));
        axisEl.style.setProperty("--pos", normalizedPos.toFixed(4));
      }

      // Audio detent & state change
      if (metrics.nearest !== lastNearest) {
        if (!Number.isNaN(lastNearest)) {
          audioEngine.play("detent");
        }
        lastNearest = metrics.nearest;
        section.dataset.station = String(metrics.nearest);
        setActiveStation(metrics.nearest);
        if (onRoomChange) {
          onRoomChange(Math.max(0, metrics.nearest));
        }
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateChoreography);
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!document.documentElement.classList.contains("motion-ok")) return;
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-station]");
      if (!target || target.dataset.on === "true") return;

      const rect = section.getBoundingClientRect();
      const stationIdx = Number(target.dataset.station);
      const fraction = calcStationScrollFraction(stationIdx, projects.length);
      const targetScroll = window.scrollY + rect.top + fraction * (rect.height - window.innerHeight);

      window.scrollTo({
        top: Math.round(targetScroll),
        behavior: "smooth",
      });
    };

    updateChoreography();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    section.addEventListener("focusin", onFocusIn);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      section.removeEventListener("focusin", onFocusIn);
    };
  }, [projects.length, onRoomChange]);

  const styleConfig = {
    "--segments": projects.length + 1,
    "--seg": `${SEG_HEIGHT_SVH}svh`,
  } as React.CSSProperties;

  const firstPeriod = projects[0]?.period?.split(/\s+-\s+/)[0] || "";
  const lastPeriod = projects[projects.length - 1]?.period?.split(/\s+-\s+/)[0] || "";

  return (
    <section
      id="works"
      ref={sectionRef}
      data-world="tesseract"
      className="works"
      style={styleConfig}
    >
      <div className="works-stage">
        {/* Pinned Stage Header (Station -1) */}
        <header className="works-head" data-station={INITIAL_STATION}>
          <p className="eyebrow">
            <span className="eyebrow-idx">01</span>
            <span className="eyebrow-rule" />
            <span>Selected work</span>
          </p>

          <h2 className="title mt-7 text-[clamp(40px,6.4vw,112px)]" aria-label="Inside the tesseract">
            <SplitText text="INSIDE THE" className="block" variant="rise" stagger={0.03} />
            <SplitText text="TESSERACT" className="block title-strong" variant="rise" stagger={0.03} delay={0.12} />
          </h2>

          <p className="lede mt-7 max-w-[40ch]">
            Past the horizon, time is a direction you can walk. Every project is a room in the lattice,
            lit at the moment it was built.
          </p>

          <dl className="works-facts">
            <div>
              <dt>Rooms</dt>
              <dd>{String(projects.length).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Span</dt>
              <dd>
                {firstPeriod} <span className="text-[var(--ink-3)]">→</span> {lastPeriod}
              </dd>
            </div>
            <div className="works-hint">
              <dt>Direction</dt>
              <dd>Scroll to travel back</dd>
            </div>
          </dl>
        </header>

        {/* 5 Reconstructed Pinned Project Rooms */}
        {projects.map((proj, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";
          const isLive = proj.status.toLowerCase().includes("active") || proj.status.toLowerCase().includes("live");
          const isActive = activeStation === idx;

          return (
            <article
              key={proj.id}
              className="room"
              data-station={idx}
              data-side={side}
              aria-labelledby={`room-${idx}-title`}
            >
              {/* Room Interactive Window (3D Floating Portal) */}
              <button
                type="button"
                className="room-window group"
                data-room={idx}
                data-cursor="Enter"
                onClick={() => {
                  audioEngine.play("open");
                  onSelectRoom(proj);
                }}
                aria-label={`Explore ${proj.title}`}
              >
                {proj.previewImage ? (
                  <img
                    className="room-img"
                    src={proj.previewImage}
                    alt={`${proj.title} screenshot`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0a0f1d] flex items-center justify-center border border-[var(--line)]">
                    <span className="font-mono text-2xl text-[var(--accent)] font-bold">{proj.roomNumber}</span>
                  </div>
                )}

                <span className="room-tag room-tag--top" aria-hidden="true">
                  <span className="text-[var(--ink)]">Room {proj.roomNumber}</span>
                  <span className="room-tag-sep" />
                  <span>{proj.category}</span>
                </span>

                <span className="room-tag room-tag--bottom" aria-hidden="true">
                  <span className="text-[var(--ink)]">{proj.period}</span>
                  <span className="room-tag-sep" />
                  <span>Click to enter</span>
                </span>
              </button>

              {/* Room HUD Readout with Fly Depth */}
              <div className="room-readout">
                <p className="readout-kicker">
                  <span className="readout-idx">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="readout-type">{proj.category}</span>
                </p>

                <h3 id={`room-${idx}-title`} className="readout-title" aria-label={proj.title}>
                  {isActive ? (
                    <SplitText text={proj.title.toUpperCase()} variant="rise" trigger="mount" stagger={0.03} />
                  ) : (
                    proj.title.toUpperCase()
                  )}
                </h3>

                <dl className="readout-spec">
                  <div>
                    <dt>Period</dt>
                    <dd>{proj.period}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd className={isLive ? "readout-live" : undefined}>
                      {isLive && <span className="status-dot status-dot--sm" aria-hidden="true" />}
                      {proj.status}
                    </dd>
                  </div>
                  <div>
                    <dt>Signal</dt>
                    <dd>{proj.signal}</dd>
                  </div>
                </dl>

                <p className="body room-summary mt-6 max-w-[44ch]">
                  {proj.description}
                </p>

                <ul className="readout-tech" aria-label="Stack">
                  {proj.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                <div className="readout-actions">
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.play("open");
                      onSelectRoom(proj);
                    }}
                    className="act-btn act-btn--solid act-fx"
                  >
                    <span className="act-roll">
                      <span>Enter room</span>
                      <span aria-hidden="true">Enter room</span>
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>

                  {proj.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="act-btn act-btn--ghost"
                    >
                      <span>{link.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          );
        })}

        {/* 3D Timeline Axis Bar */}
        <div className="works-axis" data-axis={true} aria-hidden="true">
          <span className="works-axis-count">
            <span className="text-[var(--ink)]">
              {String(Math.max(0, activeStation) + 1).padStart(2, "0")}
            </span>
            <span className="text-[var(--ink-3)]">
              {" / "}
              {String(projects.length).padStart(2, "0")}
            </span>
          </span>

          <div className="works-axis-track">
            <span className="works-axis-fill" />
            {projects.map((p, idx) => (
              <span
                key={p.id}
                className="works-axis-tick"
                style={{
                  left: `${(idx / Math.max(1, projects.length - 1)) * 100}%`,
                }}
                data-on={activeStation === idx ? "true" : undefined}
              >
                <span className="works-axis-year">{p.period.split(" ")[0]}</span>
                <span className="works-axis-name">{p.title}</span>
              </span>
            ))}
            <span className="works-axis-cursor" />
          </div>
        </div>
      </div>
    </section>
  );
}
