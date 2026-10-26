"use client";

import { PersonalProfile } from "@/types/portfolio";
import { SplitText } from "@/components/ui/SplitText";

interface AboutOriginProps {
  personal: PersonalProfile;
}

export function AboutOrigin({ personal }: AboutOriginProps) {
  return (
    <section id="about" data-world="origin" className="relative py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-20">
        <p className="eyebrow mb-6">
          <span className="eyebrow-idx">02</span>
          <span className="eyebrow-rule" />
          <span>About</span>
        </p>

        {/* Dawn Statement */}
        <p className="text-2xl sm:text-4xl md:text-5xl font-light text-white leading-tight max-w-4xl">
          <span>{personal.statement.lead}</span>{" "}
          <span className="text-[var(--ink-3)] font-normal">{personal.statement.focus}</span>
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
        {/* Bio Paragraphs */}
        <div className="lg:col-span-6 space-y-6">
          <p className="text-lg sm:text-xl text-[var(--accent)] font-medium leading-relaxed">
            {personal.tagline}
          </p>

          {personal.paragraphs.map((p, i) => (
            <p key={i} className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed font-light">
              {p}
            </p>
          ))}
        </div>

        {/* Profile Facts & Quote & Portrait */}
        <div className="lg:col-span-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-6">
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-[var(--line)]">
              <h4 className="font-mono text-xs uppercase text-[var(--ink-3)] tracking-wider mb-6">
                PROFILE SPECIFICATIONS
              </h4>

              <dl className="space-y-4 font-mono text-xs">
                {personal.facts.map((fact) => (
                  <div key={fact.key} className="flex justify-between py-2 border-b border-[var(--line)]">
                    <dt className="text-[var(--ink-3)]">{fact.label}</dt>
                    <dd className="text-white text-right font-medium">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Profile Photo */}
            <div className="rounded-2xl overflow-hidden glass-panel border border-[var(--line)] p-2 flex flex-col items-center">
              <img
                src={personal.photo}
                alt={personal.name}
                className="w-full aspect-[4/5] object-cover rounded-xl"
              />
              <span className="text-[10px] font-mono text-[var(--ink-3)] mt-2 text-center">
                Muhammad Faiq
              </span>
            </div>
          </div>

          {/* Quote Card */}
          <div className="p-6 rounded-2xl bg-[rgba(14,20,34,0.35)] border border-[var(--line)]">
            <blockquote className="text-sm text-[var(--ink-2)] italic font-light leading-relaxed">
              “{personal.quote}”
            </blockquote>
          </div>
        </div>
      </div>

      {/* Capabilities & Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12 border-t border-[var(--line)]">
        <div>
          <h4 className="font-mono text-xs uppercase text-[var(--ink-3)] tracking-wider mb-6">
            CAPABILITIES
          </h4>
          <ul className="space-y-3 font-mono text-sm">
            {personal.capabilities.map((cap, i) => (
              <li key={cap} className="flex items-center gap-4 text-white">
                <span className="text-xs text-[var(--accent)] font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase text-[var(--ink-3)] tracking-wider mb-6">
            STACK MATRIX
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {personal.stack.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[var(--line)] font-mono text-xs text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Origin Geotag */}
      <div className="mt-20 pt-8 border-t border-[var(--line)] flex justify-between items-center font-mono text-xs text-[var(--ink-3)]">
        <p>
          <span className="text-[var(--accent)] font-bold">ORIGIN</span> — {personal.location}
        </p>
        <p>{personal.coordinates}</p>
      </div>
    </section>
  );
}
