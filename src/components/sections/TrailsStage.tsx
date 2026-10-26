"use client";

import React, { useEffect, useRef, useState } from "react";
import { ExperienceRole } from "@/types/portfolio";
import {
  SEG_HEIGHT_SVH,
  QUARTER_MONTHS,
  TWO_PI,
  calcRoleRadius,
  calcPeriodSpan,
  projectCircle,
  getEarliestPeriod,
  calcTrailsStationMetrics,
  calcTrailsVis,
  PeriodSpan,
} from "@/lib/trails-math";
import { calcScrollProgress } from "@/lib/tesseract-math";
import { SplitText } from "@/components/ui/SplitText";

interface TrailsStageProps {
  experiences: ExperienceRole[];
}

export function TrailsStage({ experiences }: TrailsStageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement>(null);

  const [activeStation, setActiveStation] = useState<number>(-1);
  const [litStation, setLitStation] = useState<number>(-1);
  const [exposedMask, setExposedMask] = useState<number>(0);
  const [spans, setSpans] = useState<PeriodSpan[] | null>(null);

  useEffect(() => {
    setSpans(experiences.map((e) => calcPeriodSpan(e.period, new Date())));
  }, [experiences]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const trails = trailsRef.current;
    if (!section || !stage || !trails) return;

    const count = experiences.length;
    const stationEls = Array.from(section.querySelectorAll<HTMLElement>("[data-station]"));
    const logEls = Array.from(section.querySelectorAll<HTMLElement>("[data-log]"));

    let rafId = 0;
    let timerId = 0;
    let maxLit = -1;
    let lastStation = Number.NaN;
    let autoExposureStarted = false;
    let currentMask = 0;

    const exposeRole = (idx: number) => {
      if (!(currentMask & (1 << idx))) {
        currentMask |= 1 << idx;
        setExposedMask(currentMask);
      }
    };

    const lightStation = (idx: number) => {
      if (idx > maxLit) {
        maxLit = Math.min(idx, count - 1);
        setLitStation(maxLit);
      }
    };

    const setStation = (idx: number) => {
      if (idx !== lastStation) {
        lastStation = idx;
        setActiveStation(idx);
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lightStation(count - 1);
      for (let i = 0; i < count; i++) exposeRole(i);
    }

    const updateChoreography = () => {
      rafId = 0;
      const vh = window.innerHeight;
      const isSticky = getComputedStyle(stage).position === "sticky";

      if (isSticky) {
        const rect = section.getBoundingClientRect();
        const progress = calcScrollProgress(rect.top, rect.height, vh);
        const metrics = calcTrailsStationMetrics(progress, count);

        stationEls.forEach((el) => {
          const sIdx = Number(el.dataset.station);
          const vis = calcTrailsVis(sIdx, metrics);
          el.style.setProperty("--vis", vis.toFixed(3));
          el.dataset.on = vis > 0.5 ? "true" : vis > 0.001 ? "fading" : "false";
        });

        setStation(metrics.nearest);

        if (metrics.nearest >= 0 && rect.top <= 1 && rect.bottom >= vh - 1) {
          lightStation(metrics.nearest);
          exposeRole(metrics.nearest);
        }
        return;
      }

      // Fallback for non-sticky mobile
      let nearestIdx = 0;
      let minDistance = Infinity;

      logEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < 0.85 * vh && r.bottom > 0) {
          exposeRole(Number(el.dataset.log));
        }
        const dist = Math.abs(r.top + r.height / 2 - vh / 2);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = Number(el.dataset.log);
        }
      });

      stationEls.forEach((el) => {
        el.style.removeProperty("--vis");
        const sIdx = Number(el.dataset.station);
        el.dataset.on = sIdx < 0 || sIdx === nearestIdx ? "true" : "false";
      });

      setStation(nearestIdx);

      if (!autoExposureStarted) {
        const tRect = trails.getBoundingClientRect();
        if (tRect.top < 0.8 * vh && tRect.bottom > 0.2 * vh) {
          autoExposureStarted = true;
          let step = 0;
          const advance = () => {
            lightStation(step);
            step++;
            if (step < count) {
              timerId = window.setTimeout(advance, 900);
            }
          };
          advance();
        }
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateChoreography);
      }
    };

    updateChoreography();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [experiences.length]);

  const styleConfig = {
    "--stations": experiences.length + 1,
    "--seg": `${SEG_HEIGHT_SVH}svh`,
  } as React.CSSProperties;

  const earliestDate = getEarliestPeriod(experiences.map((e) => e.period));

  return (
    <section
      id="log"
      ref={sectionRef}
      data-world="trails"
      className="trails-sec"
      style={styleConfig}
    >
      <div ref={stageRef} className="trails-stage">
        {/* Pinned Trails Header */}
        <header className="trails-head" data-station={-1}>
          <p className="eyebrow" data-reveal={true}>
            <span className="eyebrow-idx">03</span>
            <span className="eyebrow-rule" />
            <span>Experience</span>
          </p>

          <h2 className="title mt-7 text-[clamp(36px,5.6vw,92px)]" aria-label="Professional experience">
            <SplitText text="PROFESSIONAL" className="block" variant="expose" stagger={0.045} />
            <SplitText text="EXPERIENCE" className="block title-strong" variant="expose" stagger={0.045} delay={0.2} />
          </h2>

          <p className="lede trails-lede">
            A long exposure since {earliestDate}, shutter still open. The sky turns once a year here: each moon is a month, each trail a role.
          </p>

          <p className="label trails-count">
            {String(experiences.length).padStart(2, "0")} roles <span className="text-[var(--ink-3)]">·</span> newest first
          </p>
        </header>

        {/* Circular Sky Projection Overlay (Months + Role Ring Markers) */}
        <div ref={trailsRef} data-anchor="trails" aria-hidden="true" className="trails">
          {QUARTER_MONTHS.map(({ month, turn }) => {
            const angle = turn * TWO_PI;
            const proj = projectCircle(angle);
            const style = {
              "--sx": proj.x.toFixed(4),
              "--sy": proj.y.toFixed(4),
              "--r": (0.115).toFixed(4),
            } as React.CSSProperties;

            return (
              <span key={month} className="trail-month" style={style}>
                {month}
              </span>
            );
          })}

          {spans?.map((span, idx) => {
            const angle = span.start + span.span;
            const proj = projectCircle(angle);
            const radius = calcRoleRadius(idx, spans.length);
            const style = {
              "--sx": proj.x.toFixed(4),
              "--sy": proj.y.toFixed(4),
              "--r": radius.toFixed(4),
            } as React.CSSProperties;

            return (
              <span
                key={experiences[idx].company}
                data-trail={idx}
                data-lit={idx <= litStation ? "" : undefined}
                data-on={idx === activeStation ? "" : undefined}
                className="trail-label"
                style={style}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
            );
          })}
        </div>

        {/* Roles Stack */}
        <div data-anchor="ground" className="trails-roles">
          {experiences.map((exp, idx) => {
            const isExposed = (exposedMask & (1 << idx)) !== 0;
            const xpProp = (k: number) =>
              ({
                "data-xp": "",
                style: { "--k": k } as React.CSSProperties,
              } as const);

            return (
              <article
                key={exp.id}
                data-log={idx}
                data-station={idx}
                data-exposed={isExposed ? "" : undefined}
                className="role"
              >
                <div className="role-meta" {...xpProp(0)}>
                  <span className="flex items-center gap-3">
                    <span className="text-[var(--ink)]">{exp.index}</span>
                    {exp.isCurrent && (
                      <span className="role-now">
                        <span className="status-dot status-dot--sm" aria-hidden="true" />
                        {" Current"}
                      </span>
                    )}
                  </span>
                  <span className="role-period">{exp.period}</span>
                </div>

                <h3 className="role-title" aria-label={exp.title}>
                  {isExposed ? (
                    <SplitText
                      text={exp.title}
                      trigger="mount"
                      variant="expose"
                      stagger={0.03}
                      delay={0.1}
                    />
                  ) : (
                    exp.title
                  )}
                </h3>

                <p className="role-company" {...xpProp(2)}>
                  {exp.company}
                  <span className="text-[var(--ink-3)]"> — {exp.companyType}</span>
                </p>

                <p className="label role-where" {...xpProp(3)}>
                  {exp.location} <span className="text-[var(--ink-3)]">·</span> {exp.focus}
                </p>

                <ul className="role-points">
                  {exp.points.map((pt, pIdx) => (
                    <li key={pIdx} className="body" {...xpProp(4 + pIdx)}>
                      {pt}
                    </li>
                  ))}
                </ul>

                <ul className="chips role-chips" aria-label="Stack" {...xpProp(4 + exp.points.length)}>
                  {exp.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
