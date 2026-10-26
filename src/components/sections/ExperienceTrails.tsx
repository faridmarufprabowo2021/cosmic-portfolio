"use client";

import { ExperienceRole } from "@/types/portfolio";
import { SplitText } from "@/components/ui/SplitText";

interface ExperienceTrailsProps {
  experiences: ExperienceRole[];
}

export function ExperienceTrails({ experiences }: ExperienceTrailsProps) {
  return (
    <section id="log" data-world="trails" className="relative py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-24">
        <p className="eyebrow mb-6">
          <span className="eyebrow-idx">03</span>
          <span className="eyebrow-rule" />
          <span>Experience</span>
        </p>

        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tight mb-8">
          <span className="block text-[var(--ink-2)]">
            <SplitText text="PROFESSIONAL" variant="expose" stagger={0.035} />
          </span>
          <span className="block text-white">
            <SplitText text="EXPERIENCE" variant="expose" stagger={0.035} />
          </span>
        </h2>

        <p className="text-base sm:text-lg text-[var(--ink-2)] max-w-2xl leading-relaxed mb-6 font-light">
          A long exposure since Oct 2023, shutter still open. The sky turns once a year here:
          each moon is a month, each trail a role.
        </p>

        <p className="font-mono text-xs text-[var(--ink-3)]">
          {String(experiences.length).padStart(2, "0")} roles · newest first
        </p>
      </header>

      {/* Roles Timeline */}
      <div className="space-y-16">
        {experiences.map((exp) => (
          <article
            key={exp.id}
            className="p-6 sm:p-10 rounded-2xl glass-panel border border-[var(--line)] hover:border-[var(--line-bright)] transition-all duration-300 relative overflow-hidden group"
          >
            {/* Meta Top */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--line)] font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[var(--accent)]">{exp.index}</span>
                {exp.isCurrent && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px]">
                    <span className="status-dot bg-emerald-400 shadow-emerald-400" /> Current
                  </span>
                )}
              </div>
              <span className="text-[var(--ink-2)]">{exp.period}</span>
            </div>

            {/* Role & Company */}
            <div className="mt-6 mb-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                {exp.title}
              </h3>
              <p className="text-base font-mono text-[var(--ink)]">
                {exp.company}{" "}
                <span className="text-[var(--ink-3)] text-sm">— {exp.companyType}</span>
              </p>
              <p className="text-xs font-mono text-[var(--accent)] mt-1">
                {exp.location} · {exp.focus}
              </p>
            </div>

            {/* Bullet Points */}
            <ul className="space-y-2.5 mb-8 text-sm text-[var(--ink-2)] leading-relaxed font-light">
              {exp.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[var(--accent)] mt-1.5 text-xs">▪</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {/* Tech Chips */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--line)]">
              {exp.tech.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-[rgba(255,255,255,0.03)] border border-[var(--line)] text-[var(--ink-2)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
