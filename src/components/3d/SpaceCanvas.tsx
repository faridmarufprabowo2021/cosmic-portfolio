"use client";

import { useEffect, useRef } from "react";
import { SpaceEngine } from "@/engine/SpaceEngine";

interface SpaceCanvasProps {
  onEngineReady?: (engine: SpaceEngine) => void;
}

export function SpaceCanvas({ onEngineReady }: SpaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SpaceEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new SpaceEngine(canvasRef.current);
    engineRef.current = engine;
    if (onEngineReady) {
      onEngineReady(engine);
    }

    return () => {
      engine.destroy();
    };
  }, [onEngineReady]);

  return (
    <div className="space-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="space-canvas" />
    </div>
  );
}
