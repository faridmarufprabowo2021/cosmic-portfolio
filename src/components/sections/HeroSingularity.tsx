"use client";

import { PersonalProfile } from "@/types/portfolio";

interface HeroSingularityProps {
  personal: PersonalProfile;
}

export function HeroSingularity({ personal }: HeroSingularityProps) {
  return (
    <section
      id="top"
      data-world="blackhole"
      aria-labelledby="hero-heading"
      className="relative min-h-[100svh] overflow-x-clip"
    >
      <h1 id="hero-heading" tabIndex={-1} className="sr-only">
        {personal.name}
      </h1>
      <div
        data-anchor="blackhole"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[160vw] -translate-x-1/2 -translate-y-1/2 sm:w-[min(129vw,174vh)]"
      />
    </section>
  );
}
