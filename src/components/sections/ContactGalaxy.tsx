"use client";

import { PersonalProfile } from "@/types/portfolio";

interface ContactGalaxyProps {
  personal: PersonalProfile;
  onReturnToOrigin?: () => void;
}

export function ContactGalaxy({ personal, onReturnToOrigin }: ContactGalaxyProps) {
  const handleScrollTop = () => {
    if (onReturnToOrigin) {
      onReturnToOrigin();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section
      id="contact"
      data-world="galaxy"
      className="section relative flex min-h-[100svh] flex-col pb-[var(--gy)]"
    >
      <div className="relative">
        <p className="eyebrow" data-reveal="true">
          <span className="eyebrow-idx">05</span>
          <span className="eyebrow-rule" />
          <span>Contact</span>
        </p>

        <h2 className="display contact-title mt-8" aria-label="Let's connect">
          <span className="split split--warp block" style={{ "--st": "0.035s" } as React.CSSProperties}>
            <span className="split-word" aria-hidden="true">
              {"LET'S".split("").map((ch, idx) => (
                <span key={idx} className="split-ch" style={{ "--i": idx } as React.CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          </span>
          <span className="split split--warp block display-strong" style={{ "--st": "0.035s" } as React.CSSProperties}>
            <span className="split-word" aria-hidden="true">
              {"CONNECT".split("").map((ch, idx) => (
                <span key={idx} className="split-ch" style={{ "--i": idx } as React.CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          </span>
        </h2>

        <p className="body-muted lede mt-8 max-w-[44ch]" data-reveal="true">
          I&apos;m always interested in discussing new opportunities, innovative projects, or just having a conversation about technology, backend engineering &amp; AI.
        </p>
      </div>

      {/* Galaxy Portal anchor & Return to origin */}
      <div className="pointer-events-none relative mt-8 h-28 md:contents">
        <div
          data-anchor="galaxy"
          className="pointer-events-none absolute z-20 left-1/2 top-1/2 aspect-square w-[150vw] -translate-x-1/2 -translate-y-1/2 md:left-[70%] md:top-[42%] md:w-[min(82vw,1200px)]"
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTop();
            }}
            className="galaxy-portal pointer-events-auto"
            aria-label="Return to origin through the galaxy"
          >
            <span className="portal-label" aria-hidden="true">
              Return to origin
            </span>
          </a>
        </div>
      </div>

      {/* Contact Link Cards */}
      <ul className="contact-list relative z-30 mt-16 md:mt-24 md:max-w-[920px]">
        <li data-reveal="true" style={{ "--d": "0s" } as React.CSSProperties}>
          <a href={`mailto:${personal.email}`} className="contact-row group">
            <span className="contact-key">Email</span>
            <span className="contact-value">{personal.email}</span>
            <span className="contact-go" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="M5 11 11 5M6 5h5v5" />
              </svg>
            </span>
          </a>
        </li>

        <li data-reveal="true" style={{ "--d": "0.08s" } as React.CSSProperties}>
          <a href={personal.github} target="_blank" rel="noopener noreferrer" className="contact-row group">
            <span className="contact-key">GitHub</span>
            <span className="contact-value">{personal.githubHandle}</span>
            <span className="contact-go" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="M5 11 11 5M6 5h5v5" />
              </svg>
            </span>
          </a>
        </li>

        <li data-reveal="true" style={{ "--d": "0.16s" } as React.CSSProperties}>
          <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="contact-row group">
            <span className="contact-key">LinkedIn</span>
            <span className="contact-value">{personal.name}</span>
            <span className="contact-go" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="M5 11 11 5M6 5h5v5" />
              </svg>
            </span>
          </a>
        </li>

        <li className="contact-row contact-row--static" data-reveal="true" style={{ "--d": "0.24s" } as React.CSSProperties}>
          <span className="contact-key">Based in</span>
          <span className="contact-value text-[var(--ink-2)]">{personal.location}</span>
        </li>
      </ul>

      {/* Site Footer */}
      <footer className="site-foot relative mt-auto pt-24">
        <p>
          © 2026 {personal.name}. Built with Next.js &amp; Three.js.
          <br />
          Earth maps adapted from{" "}
          <a className="link-line" href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">
            Solar System Scope / INOVE
          </a>
          , <a className="link-line" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Resized.
          <br />
          Voyager 1 model by{" "}
          <a className="link-line" href="https://science.nasa.gov/resource/voyager-3d-model/" target="_blank" rel="noreferrer">
            NASA
          </a>
          , compressed; its distance from{" "}
          <a className="link-line" href="https://ssd.jpl.nasa.gov/horizons/" target="_blank" rel="noreferrer">
            JPL Horizons
          </a>
          .
          <br />
          Sound edited from NASA recordings (Artemis II launch, Van Allen Probes, Cassini, Stardust), Chandra sonifications (NASA/CXC/SAO/K. Arcand, SYSTEM Sounds) and Kenney foley, CC0.
        </p>
        <button type="button" onClick={handleScrollTop} className="link-line site-foot-top">
          Back to top ↑
        </button>
      </footer>

      {/* Cosmic Microwave Background Caption & Wall */}
      <p className="cmb-caption">
        <span>Afterglow of the Big Bang</span> <span className="cmb-caption-dot">·</span>{" "}
        <span className="cmb-caption-age">Light from 13.8 billion years ago</span>
      </p>
      <div data-anchor="cmb" className="cmb-wall" aria-hidden="true" />
    </section>
  );
}
