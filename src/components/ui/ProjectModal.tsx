"use client";

import { useEffect } from "react";
import { ProjectRoom } from "@/types/portfolio";
import { X, ExternalLink, Github, BookOpen, Package } from "lucide-react";

interface ProjectModalProps {
  room: ProjectRoom | null;
  onClose: () => void;
}

export function ProjectModal({ room, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (room) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [room, onClose]);

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(3,4,9,0.85)] backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 sm:p-8 md:p-10 border border-[var(--line-bright)] z-10 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[rgba(120,166,255,0.1)] text-[var(--accent)] border border-[rgba(120,166,255,0.2)]">
              ROOM {room.roomNumber}
            </span>
            <span className="text-xs font-mono text-[var(--ink-2)]">{room.category}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-cursor="Close"
            className="p-1.5 rounded-full border border-[var(--line)] hover:border-[var(--line-bright)] text-[var(--ink-2)] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="mt-6 space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {room.previewImage && (
            <div className="relative w-full h-44 sm:h-56 rounded-xl overflow-hidden border border-[var(--line)]">
              <img
                src={room.previewImage}
                alt={room.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              {room.title}
            </h3>
            <p className="text-sm font-mono text-[var(--ink-2)]">
              {room.period} · <span className="status-dot mr-1" /> {room.status}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--line)]">
            <span className="text-xs font-mono text-[var(--accent)]">SIGNAL:</span>{" "}
            <span className="text-xs font-mono text-white">{room.signal}</span>
          </div>

          <p className="text-sm sm:text-base text-[var(--ink)] leading-relaxed">
            {room.description}
          </p>

          <div>
            <h4 className="text-xs font-mono uppercase text-[var(--ink-3)] tracking-wider mb-2.5">
              Architecture & Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {room.tech.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-[rgba(255,255,255,0.05)] border border-[var(--line)] text-[var(--ink-2)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="pt-4 border-t border-[var(--line)] flex flex-wrap gap-3">
            {room.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Open"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(120,166,255,0.12)] border border-[rgba(120,166,255,0.25)] text-xs font-mono text-white hover:bg-[rgba(120,166,255,0.25)] transition-colors group"
              >
                {link.type === "code" && <Github size={14} />}
                {link.type === "live" && <ExternalLink size={14} />}
                {link.type === "docs" && <BookOpen size={14} />}
                {link.type === "npm" && <Package size={14} />}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
