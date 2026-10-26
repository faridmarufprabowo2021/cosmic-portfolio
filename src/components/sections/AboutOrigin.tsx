"use client";

import { PersonalProfile } from "@/types/portfolio";

interface AboutOriginProps {
  personal: PersonalProfile;
}

export function AboutOrigin({ personal }: AboutOriginProps) {
  const words = personal.quote.split(" ");

  return (
    <section id="about" data-world="origin" className="section section-origin relative">
      <div className="grid grid-cols-12 gap-y-14 md:gap-x-6">
        {/* Eyebrow & Dawn Statement */}
        <div className="relative col-span-12">
          <p className="eyebrow" data-reveal="true">
            <span className="eyebrow-idx">02</span>
            <span className="eyebrow-rule" />
            <span>About</span>
          </p>

          <p className="statement mt-9 max-w-[26ch]">
            {words.map((word, idx) => (
              <span key={idx} className="dawn-w" style={{ "--a": "0.160" } as React.CSSProperties}>
                {word}{" "}
              </span>
            ))}
          </p>

          {/* Comet anchor for 3D trajectory alignment */}
          <div data-anchor="comet" aria-hidden="true" className="comet-anchor" />
        </div>

        {/* Bio Narrative Paragraphs */}
        <div className="col-span-12 space-y-5 lg:col-span-6 xl:col-span-5" data-reveal="true">
          <p className="lede">{personal.tagline}</p>
          {personal.paragraphs.map((para, i) => (
            <p key={i} className="body">
              {para}
            </p>
          ))}
        </div>

        {/* Profile Facts & Portrait */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-6 xl:col-start-7">
          <div className="grid gap-10 sm:grid-cols-[1fr_200px]">
            <div data-reveal="true" style={{ "--d": "0.1s" } as React.CSSProperties}>
              <p className="label mb-4">Profile</p>
              <dl className="facts">
                {personal.facts.map((fact) => (
                  <div key={fact.key} className="facts-row">
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="portrait self-start" data-reveal="true" style={{ "--d": "0.25s" } as React.CSSProperties}>
              <div className="portrait-frame">
                <img
                  src={personal.photo}
                  alt={`${personal.name}, profile photo`}
                  width={320}
                  height={400}
                  loading="lazy"
                  className="block aspect-[4/5] w-full object-cover"
                />
              </div>
              <figcaption className="portrait-cap">
                <span>“{personal.quote}”</span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Capabilities & Stack */}
        <div className="col-span-12 grid gap-10 border-t border-[var(--line)] pt-10 md:grid-cols-2 halo" data-reveal="true">
          <div>
            <p className="label mb-5">Capabilities</p>
            <ul className="caps">
              {personal.capabilities.map((cap, idx) => (
                <li key={cap}>
                  <span className="caps-idx">{String(idx + 1).padStart(2, "0")}</span>
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label mb-5">Stack</p>
            <ul className="chips">
              {personal.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Origin Planet Anchor */}
      <div
        data-anchor="origin"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[44svh]"
      >
        <p className="origin-tag halo">
          <span className="text-[var(--ink)]">Origin</span> — {personal.location}
          <br />
          {personal.coordinates}
        </p>
      </div>
    </section>
  );
}
