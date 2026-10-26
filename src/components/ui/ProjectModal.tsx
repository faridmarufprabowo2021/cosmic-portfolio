"use client";

import { useEffect, useState } from "react";
import { ProjectRoom } from "@/types/portfolio";
import { X, ExternalLink, Github, BookOpen, Package, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface ProjectModalProps {
  room: ProjectRoom | null;
  onClose: () => void;
}

export function ProjectModal({ room, onClose }: ProjectModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reset active image when opening a different room
  useEffect(() => {
    setActiveImageIdx(0);
  }, [room?.id]);

  const gallery = room?.images && room.images.length > 0
    ? room.images
    : room?.previewImage
    ? [{ url: room.previewImage, caption: room.title }]
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (gallery.length > 1) {
        if (e.key === "ArrowLeft") {
          setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
        }
        if (e.key === "ArrowRight") {
          setActiveImageIdx((prev) => (prev + 1) % gallery.length);
        }
      }
    };
    if (room) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [room, onClose, gallery.length]);

  if (!room) return null;

  const currentImage = gallery[activeImageIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(3,4,9,0.85)] backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl p-6 sm:p-8 md:p-10 border border-[var(--line-bright)] z-10 shadow-2xl animate-scale-up">
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
          {/* Interactive Multi-Photo Gallery Carousel */}
          {gallery.length > 0 && (
            <div className="space-y-3">
              <div className="relative w-full h-56 sm:h-80 rounded-xl overflow-hidden border border-[var(--line)] bg-[#070913] group">
                <img
                  key={currentImage.url}
                  src={currentImage.url}
                  alt={currentImage.caption || room.title}
                  className="w-full h-full object-contain sm:object-cover transition-opacity duration-300"
                />

                {/* Navigation arrows (if multiple images) */}
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length)}
                      aria-label="Previous screenshot"
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[rgba(3,4,9,0.7)] backdrop-blur-md border border-[var(--line)] text-white hover:border-[var(--accent)] hover:bg-[rgba(120,166,255,0.2)] transition-all opacity-80 hover:opacity-100"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev + 1) % gallery.length)}
                      aria-label="Next screenshot"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[rgba(3,4,9,0.7)] backdrop-blur-md border border-[var(--line)] text-white hover:border-[var(--accent)] hover:bg-[rgba(120,166,255,0.2)] transition-all opacity-80 hover:opacity-100"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[rgba(3,4,9,0.75)] backdrop-blur-md border border-[var(--line)] font-mono text-[11px] text-white flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-[var(--accent)]" />
                      <span>{String(activeImageIdx + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Caption */}
              {currentImage.caption && (
                <p className="text-xs font-mono text-[var(--ink-2)] text-center italic">
                  {currentImage.caption}
                </p>
              )}

              {/* Thumbnails Row (if multiple images) */}
              {gallery.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 justify-center sm:justify-start">
                  {gallery.map((img, idx) => (
                    <button
                      key={img.url + idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border transition-all ${
                        activeImageIdx === idx
                          ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-105"
                          : "border-[var(--line)] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
