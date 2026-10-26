"use client";

import { PersonalProfile } from "@/types/portfolio";
import { SplitText } from "@/components/ui/SplitText";

interface HeroSingularityProps {
  personal: PersonalProfile;
}

export function HeroSingularity({ personal }: HeroSingularityProps) {
  return (
    <section
      id="top"
      data-world="blackhole"
      className="relative min-h-[100svh] flex flex-col justify-center items-center px-6 text-center overflow-x-clip pointer-events-none"
    >
      <div className="max-w-4xl mx-auto space-y-6 pt-20">
        <p className="eyebrow justify-center">
          <span className="eyebrow-idx">00</span>
          <span className="eyebrow-rule" />
          <span>SINGULARITY · HORIZON</span>
        </p>

        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight uppercase text-white drop-shadow-2xl">
          <SplitText text={personal.name} variant="rise" stagger={0.04} />
        </h1>

        <p className="font-mono text-sm sm:text-base text-[var(--accent)] tracking-widest uppercase">
          {personal.title}
        </p>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-[var(--ink-2)] leading-relaxed font-light">
          {personal.tagline}
        </p>
      </div>
    </section>
  );
}
