"use client";

import { useEffect, useState } from "react";

export function LoaderIntro() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Reveal animation sequence
    const timer = setTimeout(() => {
      setIsLoaded(true);
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 1000);
      return () => clearTimeout(removeTimer);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`loader-root fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030409] transition-opacity duration-1000 ${
        isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ "--bang": "0.62s" } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="loader-art" />
      <div className="loader-pre relative flex items-center justify-center mb-6">
        <div className="pre-galaxy">
          <div className="pre-whirl">
            <div className="pre-spin animate-spin duration-[20s]">
              <img
                src="/textures/loader/galaxy.webp"
                alt=""
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain opacity-80"
              />
            </div>
          </div>
        </div>
        <img
          className="pre-core absolute w-24 h-24 sm:w-32 sm:h-32 object-contain animate-pulse"
          src="/textures/loader/core.webp"
          alt=""
        />
        <span className="pre-point absolute w-2 h-2 rounded-full bg-white shadow-[0_0_12px_#fff]" />
      </div>

      <div className="loader-seam" />

      <div className="loader-inner text-center font-mono">
        <p className="loader-cap flex items-center gap-4 text-xs text-[var(--ink-2)]">
          <span className="loader-epoch flex items-center gap-2">
            <span className="text-white font-bold tracking-wider">Big Crunch</span>
            <span className="loader-age text-[var(--accent)] font-semibold">t &lt; 0</span>
          </span>
          <span className="text-[var(--ink-3)]">·</span>
          <span className="text-[var(--ink-3)]">Surakarta, ID</span>
        </p>
      </div>
    </div>
  );
}
