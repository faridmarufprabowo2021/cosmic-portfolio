"use client";

import { ProjectRoom } from "@/types/portfolio";
import { SplitText } from "@/components/ui/SplitText";
import { ArrowUpRight } from "lucide-react";

interface WorksTesseractProps {
  projects: ProjectRoom[];
  onSelectRoom: (room: ProjectRoom) => void;
}

export function WorksTesseract({ projects, onSelectRoom }: WorksTesseractProps) {
  return (
    <section id="works" data-world="tesseract" className="relative py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-24">
        <p className="eyebrow mb-6">
          <span className="eyebrow-idx">01</span>
          <span className="eyebrow-rule" />
          <span>Selected work</span>
        </p>

        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tight mb-8">
          <span className="block text-[var(--ink-2)]">
            <SplitText text="INSIDE THE" variant="rise" stagger={0.03} />
          </span>
          <span className="block text-white">
            <SplitText text="TESSERACT" variant="rise" stagger={0.03} />
          </span>
        </h2>

        <p className="text-base sm:text-lg text-[var(--ink-2)] max-w-2xl leading-relaxed mb-10">
          Past the horizon, time is a direction you can walk. Every project is a room in the lattice,
          lit at the moment it was built.
        </p>

        {/* Facts Banner */}
        <div className="flex flex-wrap gap-8 py-5 border-y border-[var(--line)] font-mono text-xs text-[var(--ink-2)]">
          <div>
            <span className="text-[var(--ink-3)] block mb-1">ROOMS</span>
            <span className="text-white text-sm font-semibold">{String(projects.length).padStart(2, "0")}</span>
          </div>
          <div>
            <span className="text-[var(--ink-3)] block mb-1">SPAN</span>
            <span className="text-white text-sm font-semibold">2026.08 → 2023.10</span>
          </div>
          <div>
            <span className="text-[var(--ink-3)] block mb-1">DIRECTION</span>
            <span className="text-white text-sm font-semibold">Scroll to travel back</span>
          </div>
        </div>
      </header>

      {/* 5 Rooms */}
      <div className="space-y-28">
        {projects.map((room, idx) => (
          <article
            key={room.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
              idx % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Interactive Room Window */}
            <div
              className={`lg:col-span-6 ${idx % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}
            >
              <div
                onClick={() => onSelectRoom(room)}
                data-cursor="Enter"
                className="group relative rounded-2xl glass-panel p-6 sm:p-8 cursor-pointer overflow-hidden border border-[var(--line)] hover:border-[var(--line-bright)] transition-all duration-300 hover:shadow-2xl hover:shadow-[rgba(120,166,255,0.1)]"
              >
                {/* Header Tag */}
                <div className="flex justify-between items-center text-xs font-mono text-[var(--ink-3)] mb-8">
                  <span className="text-[var(--accent)] font-semibold">Room {room.roomNumber}</span>
                  <span>{room.category}</span>
                </div>

                {/* Simulated Tesseract Grid View / Real Preview */}
                <div className="relative h-48 sm:h-64 rounded-xl bg-[rgba(14,20,34,0.4)] border border-[var(--line)] overflow-hidden flex flex-col justify-center items-center text-center">
                  {room.previewImage ? (
                    <>
                      <img
                        src={room.previewImage}
                        alt={room.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(3,4,9,0.9)] via-[rgba(3,4,9,0.3)] to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <h4 className="text-xl sm:text-2xl font-bold text-white tracking-wider mb-1">
                          {room.title}
                        </h4>
                        <span className="font-mono text-[11px] text-[var(--accent)]">
                          Click to enter room →
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent)] mb-4 group-hover:scale-110 group-hover:border-[var(--accent)] transition-all duration-300">
                        <span className="font-mono text-sm">{room.roomNumber}</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold text-white tracking-wider mb-2">
                        {room.title}
                      </h4>
                      <span className="font-mono text-[11px] text-[var(--ink-2)] group-hover:text-white transition-colors">
                        Click to enter room →
                      </span>
                    </>
                  )}
                </div>

                {/* Footer Tag */}
                <div className="flex justify-between items-center text-xs font-mono text-[var(--ink-3)] mt-6 pt-4 border-t border-[var(--line)]">
                  <span>{room.period}</span>
                  <span className="text-white group-hover:text-[var(--accent)] transition-colors">Inspect specs</span>
                </div>
              </div>
            </div>

            {/* Readout Specifications */}
            <div
              className={`lg:col-span-6 space-y-6 ${idx % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}
            >
              <div className="space-y-2">
                <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wider">
                  {room.roomNumber} · {room.category}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {room.title}
                </h3>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[var(--line)] font-mono text-xs">
                <div>
                  <span className="text-[var(--ink-3)] block mb-1">Status</span>
                  <span className="text-white flex items-center gap-1.5">
                    <span className="status-dot" /> {room.status}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--ink-3)] block mb-1">Signal</span>
                  <span className="text-white">{room.signal}</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed">
                {room.description}
              </p>

              {/* Tech Stack Chips */}
              <div className="flex flex-wrap gap-2">
                {room.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs font-mono rounded-md bg-[rgba(255,255,255,0.04)] border border-[var(--line)] text-[var(--ink-2)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectRoom(room)}
                  data-cursor="Enter"
                  className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-[#030409] font-mono text-xs font-bold hover:bg-white transition-colors flex items-center gap-2 group"
                >
                  <span className="act-roll">
                    <span>Enter room</span>
                    <span aria-hidden="true">Enter room</span>
                  </span>
                  <span>→</span>
                </button>

                {room.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-[var(--ink-2)] hover:text-white transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
