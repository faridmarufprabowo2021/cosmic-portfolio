"use client";

import { useEffect, useState } from "react";
import { ArticleTransmission } from "@/types/portfolio";
import { SplitText } from "@/components/ui/SplitText";
import { calculateVoyagerEphemeris, EphemerisData } from "@/engine/Ephemeris";
import { Radio, ArrowUpRight } from "lucide-react";

interface WritingVoyagerProps {
  transmissions: ArticleTransmission[];
}

export function WritingVoyager({ transmissions }: WritingVoyagerProps) {
  const [ephemeris, setEphemeris] = useState<EphemerisData>(calculateVoyagerEphemeris());

  useEffect(() => {
    const timer = setInterval(() => {
      setEphemeris(calculateVoyagerEphemeris());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="writing" data-world="voyager" className="relative py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-20">
        <p className="eyebrow mb-6">
          <span className="eyebrow-idx">04</span>
          <span className="eyebrow-rule" />
          <span>Writing</span>
        </p>

        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tight mb-8">
          <SplitText text="TRANSMISSIONS" variant="rise" stagger={0.035} />
        </h2>

        <p className="text-base sm:text-lg text-[var(--ink-2)] max-w-2xl leading-relaxed mb-10 font-light">
          Notes from the work, sent outward the way Voyager carries its record: for people I have not met yet.
        </p>

        {/* Live NASA JPL Horizons Ephemeris Telemetry */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-[rgba(120,166,255,0.25)] max-w-2xl bg-[rgba(14,20,34,0.55)]">
          <div className="flex items-center gap-2 mb-6">
            <Radio size={16} className="text-[var(--accent)] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">
              VOYAGER 1 REAL-TIME TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
            <div>
              <span className="text-xs text-[var(--ink-3)] block mb-1">VOYAGER 1 FROM EARTH</span>
              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-wide">
                {ephemeris.formattedKm}{" "}
                <span className="text-xs font-normal text-[var(--ink-2)]">km</span>
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--ink-3)] block mb-1">LIGHT TIME, ONE WAY</span>
              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-wide">
                {ephemeris.formattedLightTime}
              </span>
            </div>
          </div>

          <p className="font-mono text-[11px] text-[var(--ink-3)] mt-6 pt-4 border-t border-[var(--line)]">
            Live, mathematically synchronized with NASA JPL Horizons ephemeris model.
          </p>
        </div>
      </header>

      {/* Transmissions List */}
      <div className="space-y-6 max-w-3xl">
        <h4 className="font-mono text-xs uppercase text-[var(--ink-3)] tracking-wider mb-4">
          LATEST TRANSMISSIONS
        </h4>

        {transmissions.map((post) => (
          <a
            key={post.slug}
            href={post.link}
            className="group block p-6 sm:p-8 rounded-xl glass-panel border border-[var(--line)] hover:border-[var(--accent)] transition-all duration-300"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)] mb-3">
              <span>
                {new Date(post.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {post.readingMinutes} min read
              </span>
              <span className="uppercase px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[10px]">
                {post.lang}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[var(--accent)] transition-colors mb-2 flex items-center justify-between">
              <span>{post.title}</span>
              <ArrowUpRight
                size={18}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]"
              />
            </h3>

            <p className="text-sm text-[var(--ink-2)] leading-relaxed font-light">
              {post.excerpt}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
