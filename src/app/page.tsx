"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Lenis from "lenis";
import { portfolioConfig } from "@/config/portfolio.config";
import { SpaceEngine } from "@/engine/SpaceEngine";
import { AudioEngine } from "@/engine/AudioEngine";
import { SpaceCanvas } from "@/components/3d/SpaceCanvas";
import { HudFrame } from "@/components/hud/HudFrame";
import { HeroSingularity } from "@/components/sections/HeroSingularity";
import { WorksStage } from "@/components/sections/WorksStage";
import { AboutOrigin } from "@/components/sections/AboutOrigin";
import { TrailsStage } from "@/components/sections/TrailsStage";
import { WritingVoyager } from "@/components/sections/WritingVoyager";
import { ContactGalaxy } from "@/components/sections/ContactGalaxy";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { LoaderIntro } from "@/components/ui/LoaderIntro";
import { ProjectRoom } from "@/types/portfolio";

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [selectedRoom, setSelectedRoom] = useState<ProjectRoom | null>(null);

  const engineRef = useRef<SpaceEngine | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize AudioEngine on client
  useEffect(() => {
    audioRef.current = new AudioEngine();
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    const sections = ["top", "works", "about", "log", "writing", "contact"];

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const reqId = requestAnimationFrame(raf);

    lenis.on("scroll", (e: { progress: number; scroll: number }) => {
      const p = Math.max(0, Math.min(1, e.progress));
      setScrollProgress(p);

      if (engineRef.current) {
        engineRef.current.setScrollProgress(p);
      }

      // Check active section
      const height = window.innerHeight;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= height * 0.45) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    });

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  // Update world audio when active section changes
  useEffect(() => {
    if (audioRef.current && audioRef.current.on) {
      audioRef.current.setWorld(activeSection);
    }
  }, [activeSection]);

  // Global hover audio effect for interactive elements
  useEffect(() => {
    const onPointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('a, button, [data-cursor], [role="button"]')) {
        audioRef.current?.playHover();
      }
    };
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => window.removeEventListener("pointerover", onPointerOver);
  }, []);

  const handleEngineReady = useCallback((engine: SpaceEngine) => {
    engineRef.current = engine;
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0, duration: 1.8 });
    }
  };

  const handleSelectRoom = (room: ProjectRoom) => {
    if (audioRef.current) {
      audioRef.current.playRoom();
    }
    setSelectedRoom(room);
  };

  const handleReturnToOrigin = () => {
    if (audioRef.current) {
      audioRef.current.playWarp();
    }
    if (engineRef.current) {
      engineRef.current.triggerWarp(() => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, { immediate: true });
        }
      });
    } else if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 2.0 });
    }
  };

  return (
    <main className="relative min-h-screen bg-[#030409] text-[#e6ebf5] selection:bg-[rgba(120,166,255,0.3)]">
      {/* Intro Loader Animation */}
      <LoaderIntro />

      {/* 3D WebGL Background Canvas */}
      <SpaceCanvas onEngineReady={handleEngineReady} />

      {/* Futuristic Instrument HUD Frame Overlay */}
      <HudFrame
        progress={scrollProgress}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        audioEngine={audioRef.current}
        city={portfolioConfig.personal.city}
      />

      {/* Scrollable Content Sections with Reconstructed Pinned Stages */}
      <div className="relative z-10">
        <HeroSingularity personal={portfolioConfig.personal} />

        <WorksStage
          projects={portfolioConfig.projects}
          onSelectRoom={handleSelectRoom}
          onRoomChange={(roomIdx) => {
            if (engineRef.current) {
              engineRef.current.setScrollProgress(scrollProgress, roomIdx);
            }
          }}
        />

        <AboutOrigin personal={portfolioConfig.personal} />

        <TrailsStage experiences={portfolioConfig.experiences} />

        <WritingVoyager transmissions={portfolioConfig.transmissions} />

        <ContactGalaxy
          personal={portfolioConfig.personal}
          onReturnToOrigin={handleReturnToOrigin}
        />
      </div>

      {/* Interactive Project Room Detail Modal */}
      <ProjectModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </main>
  );
}
