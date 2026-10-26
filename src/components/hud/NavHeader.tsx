"use client";

import { useEffect, useRef, useState } from "react";
import { SoundButton } from "./SoundButton";
import { AudioEngine } from "@/engine/AudioEngine";
import { Menu, X } from "lucide-react";

interface NavHeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  audioEngine: AudioEngine | null;
}

const NAV_ITEMS = [
  { id: "works", code: "01", label: "Works" },
  { id: "about", code: "02", label: "About" },
  { id: "log", code: "03", label: "Experience" },
  { id: "writing", code: "04", label: "Writing" },
  { id: "contact", code: "05", label: "Contact" },
];

export function NavHeader({ activeSection, onNavigate, audioEngine }: NavHeaderProps) {
  const [thumbStyle, setThumbStyle] = useState<{ x: number; w: number; on: boolean }>({
    x: 0,
    w: 0,
    on: false,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector(`[data-id="${activeSection}"]`) as HTMLElement | null;
    if (activeEl) {
      setThumbStyle({
        x: activeEl.offsetLeft,
        w: activeEl.offsetWidth,
        on: true,
      });
    } else {
      setThumbStyle((prev) => ({ ...prev, on: false }));
    }
  }, [activeSection]);

  const handleNavClick = (id: string) => {
    if (audioEngine) audioEngine.playClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="hud-top">
        {/* Desktop Primary Nav */}
        <nav ref={navRef} className="nav-pill-track hidden md:flex" aria-label="Primary Navigation">
          <span
            className="nav-thumb"
            style={{
              width: `${thumbStyle.w}px`,
              transform: `translate3d(${thumbStyle.x}px, 0, 0)`,
              opacity: thumbStyle.on ? 1 : 0,
            }}
            aria-hidden="true"
          />

          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-id={item.id}
              data-active={activeSection === item.id}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.id);
              }}
              className="nav-link"
            >
              <span className="nav-idx">{item.code}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Mobile Logo / Brand Indicator */}
        <div className="md:hidden flex items-center gap-2">
          <span className="status-dot" />
          <span className="font-mono text-xs tracking-widest text-[var(--ink)]">COSMIC</span>
        </div>

        {/* Actions: Sound & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <SoundButton audioEngine={audioEngine} />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full border border-[var(--line)] bg-[rgba(14,20,34,0.65)] text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[rgba(3,4,9,0.95)] backdrop-blur-xl flex flex-col justify-center px-8 md:hidden">
          <p className="eyebrow mb-8">
            <span className="eyebrow-idx">00</span>
            <span className="eyebrow-rule" />
            <span>Navigation</span>
          </p>

          <ul className="space-y-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className="flex items-baseline gap-4 text-2xl font-mono text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  <span className="text-xs text-[var(--ink-3)]">{item.code}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
