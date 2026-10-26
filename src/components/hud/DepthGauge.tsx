"use client";

interface DepthGaugeProps {
  progress: number; // 0.0 to 1.0
  activeSection: string;
}

const SECTIONS = [
  { id: "top", tick: 0.0 },
  { id: "works", tick: 0.2 },
  { id: "about", tick: 0.4 },
  { id: "log", tick: 0.6 },
  { id: "writing", tick: 0.8 },
  { id: "contact", tick: 1.0 },
];

export function DepthGauge({ progress, activeSection }: DepthGaugeProps) {
  const depthValue = String(Math.round(progress * 100)).padStart(3, "0");

  return (
    <div className="depth" aria-hidden="true">
      <span className="depth-key">Depth</span>
      <div className="depth-track">
        <span
          className="depth-fill"
          style={{ height: `${(progress * 100).toFixed(1)}%` }}
        />

        {SECTIONS.map((sec) => (
          <span
            key={sec.id}
            className="absolute left-[-2px] w-[6px] h-[1px] bg-[var(--line-bright)] transition-colors"
            style={{
              top: `${sec.tick * 100}%`,
              backgroundColor: activeSection === sec.id ? "var(--accent)" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}

        <span
          className="depth-marker"
          style={{ top: `${(progress * 100).toFixed(1)}%` }}
        >
          <span className="depth-read">{depthValue}</span>
        </span>
      </div>
    </div>
  );
}
