"use client";

import { useEffect, useState } from "react";
import { ArticleTransmission } from "@/types/portfolio";
import { calculateVoyagerEphemeris, EphemerisData } from "@/engine/Ephemeris";

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
    <section id="writing" data-world="voyager" className="tx-sec" aria-labelledby="tx-title">
      <div className="tx-stage">
        <div className="tx-copy">
          <p className="eyebrow" data-reveal="true">
            <span className="eyebrow-idx">04</span>
            <span className="eyebrow-rule" />
            <span>Writing</span>
          </p>

          <h2 id="tx-title" className="title tx-title" aria-label="Transmissions">
            <span className="split split--rise block" style={{ "--st": "0.035s" } as React.CSSProperties}>
              <span className="split-word" aria-hidden="true">
                {"TRANSMISSIONS".split("").map((ch, idx) => (
                  <span key={idx} className="split-ch" style={{ "--i": idx } as React.CSSProperties}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          </h2>

          <p className="lede tx-lede" data-reveal="true">
            Notes from the work, sent outward the way Voyager carries its record: for people I have not met yet.
          </p>

          <dl className="tx-read" data-reveal="true" style={{ "--d": "0.08s" } as React.CSSProperties}>
            <div>
              <dt>Voyager 1 from Earth</dt>
              <dd>
                <span className="tx-num">{ephemeris.formattedKm}</span> km
              </dd>
            </div>
            <div>
              <dt>Light time, one way</dt>
              <dd>
                <span className="tx-num">{ephemeris.formattedLightTime}</span>
              </dd>
            </div>
          </dl>

          <p className="tx-src" data-reveal="true" style={{ "--d": "0.12s" } as React.CSSProperties}>
            Live, from NASA JPL&apos;s Horizons ephemeris.
          </p>

          <ol className="tx-list" aria-label="Latest writing">
            {transmissions.map((t, idx) => (
              <li
                key={t.slug}
                data-reveal="true"
                style={{ "--d": `${0.16 + idx * 0.07}s` } as React.CSSProperties}
              >
                <a href={t.link || `/blog/${t.slug}/`} className="tx-row" lang={t.lang}>
                  <span className="tx-meta">
                    <time dateTime={t.date}>
                      {new Date(t.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    <span aria-hidden="true"> · </span>
                    {t.readingMinutes} min
                  </span>
                  <span className="tx-name">{t.title}</span>
                  <span className="tx-excerpt">{t.excerpt}</span>
                </a>
              </li>
            ))}
          </ol>

          <div className="tx-more" data-reveal="true" style={{ "--d": "0.36s" } as React.CSSProperties}>
            <a href="/blog/" className="act act--solid">
              <span className="act-label">
                <span className="act-roll">
                  <span>All writing</span>
                  <span aria-hidden="true">All writing</span>
                </span>
              </span>
              <span className="act-port" data-icon="right" aria-hidden="true">
                <span className="act-glyph">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
                <span className="act-glyph act-glyph--next">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* 3D Voyager & Saturn Anchor */}
        <div data-anchor="voyager" aria-hidden="true" className="voyager-box" data-pinned="true">
          <div data-anchor="saturn" className="saturn-anchor" />
        </div>
      </div>
    </section>
  );
}
