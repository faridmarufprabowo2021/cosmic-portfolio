"use client";

import { PersonalProfile } from "@/types/portfolio";
import { SplitText } from "@/components/ui/SplitText";
import { ArrowUpRight, ArrowUp, Sparkles, Mail, Github, Linkedin, MapPin } from "lucide-react";

interface ContactGalaxyProps {
  personal: PersonalProfile;
  onReturnToOrigin: () => void;
}

export function ContactGalaxy({ personal, onReturnToOrigin }: ContactGalaxyProps) {
  return (
    <section id="contact" data-world="galaxy" className="relative min-h-[100svh] py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <p className="eyebrow mb-6">
          <span className="eyebrow-idx">05</span>
          <span className="eyebrow-rule" />
          <span>Contact</span>
        </p>

        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tight mb-8">
          <span className="block text-[var(--ink-2)]">
            <SplitText text="LET'S" variant="warp" stagger={0.035} />
          </span>
          <span className="block text-white">
            <SplitText text="CONNECT" variant="warp" stagger={0.035} />
          </span>
        </h2>

        <p className="text-base sm:text-lg text-[var(--ink-2)] max-w-2xl leading-relaxed mb-16 font-light">
          I'm always interested in discussing new opportunities, innovative projects,
          or just having a conversation about technology, AI & Web3.
        </p>

        {/* Hyperdrive Warp Jump Portal Button */}
        <div className="mb-20">
          <button
            type="button"
            onClick={onReturnToOrigin}
            data-cursor="Warp"
            className="group relative inline-flex items-center gap-4 px-8 py-5 rounded-2xl glass-panel border border-[var(--accent)]/50 hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-[rgba(120,166,255,0.25)] transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(120,166,255,0.15)] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="w-10 h-10 rounded-full bg-[rgba(120,166,255,0.2)] border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
              <Sparkles size={18} />
            </div>

            <div className="text-left font-mono">
              <span className="block text-xs text-[var(--accent)] uppercase tracking-wider">
                PORTAL INTERACTIVE
              </span>
              <span className="block text-base sm:text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors">
                Return to origin through the galaxy →
              </span>
            </div>
          </button>
        </div>

        {/* Contact Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <a
            href={`mailto:${personal.email}`}
            className="flex items-center justify-between p-5 rounded-xl glass-panel border border-[var(--line)] hover:border-[var(--line-bright)] text-sm font-mono text-[var(--ink)] hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[var(--accent)]" />
              <span className="text-[var(--ink-3)]">Email</span>
              <span className="text-white">{personal.email}</span>
            </div>
            <ArrowUpRight size={16} className="text-[var(--ink-3)] group-hover:text-white transition-colors" />
          </a>

          <a
            href={personal.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 rounded-xl glass-panel border border-[var(--line)] hover:border-[var(--line-bright)] text-sm font-mono text-[var(--ink)] hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Github size={16} className="text-[var(--accent)]" />
              <span className="text-[var(--ink-3)]">GitHub</span>
              <span className="text-white">{personal.githubHandle}</span>
            </div>
            <ArrowUpRight size={16} className="text-[var(--ink-3)] group-hover:text-white transition-colors" />
          </a>

          <a
            href={personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 rounded-xl glass-panel border border-[var(--line)] hover:border-[var(--line-bright)] text-sm font-mono text-[var(--ink)] hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Linkedin size={16} className="text-[var(--accent)]" />
              <span className="text-[var(--ink-3)]">LinkedIn</span>
              <span className="text-white">{personal.name}</span>
            </div>
            <ArrowUpRight size={16} className="text-[var(--ink-3)] group-hover:text-white transition-colors" />
          </a>

          <div className="flex items-center justify-between p-5 rounded-xl glass-panel border border-[var(--line)] text-sm font-mono text-[var(--ink)]">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-[var(--accent)]" />
              <span className="text-[var(--ink-3)]">Based in</span>
              <span className="text-white">{personal.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Epilogue Credits */}
      <footer className="mt-32 pt-12 border-t border-[var(--line)] font-mono text-[11px] text-[var(--ink-3)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p>© 2026 {personal.name}. Built with Next.js 15, Three.js & Tailwind CSS.</p>

          <button
            type="button"
            onClick={onReturnToOrigin}
            className="flex items-center gap-1.5 text-[var(--accent)] hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>

        <p className="leading-relaxed font-light text-[10px]">
          Astrophysical telemetry: Voyager 1 distance ephemeris formulated from NASA JPL Horizons.
          Solar system textures adapted from Solar System Scope / NASA, CC BY 4.0. Space audio synthesis based on Chandra X-ray sonifications and Voyager plasma wave frequencies.
        </p>

        <p className="text-[10px] text-[var(--accent)]/60 pt-2">
          Afterglow of the Big Bang · Light from 13.8 billion years ago
        </p>
      </footer>
    </section>
  );
}
