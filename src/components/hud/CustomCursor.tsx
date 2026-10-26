"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Only run on fine-pointer devices (mouse), not touch
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animId: number;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Check hovered element for data-cursor
      const target = e.target as HTMLElement | null;
      const cursorTarget = target?.closest("[data-cursor]") as HTMLElement | null;
      if (cursorTarget) {
        const text = cursorTarget.getAttribute("data-cursor");
        setLabel(text);
        setIsActive(true);
      } else {
        setLabel(null);
        setIsActive(false);
      }
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      animId = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={reticleRef}
      className="reticle hidden md:flex"
      data-active={isActive}
      aria-hidden="true"
    >
      <span className="reticle-label">{label}</span>
    </div>
  );
}
