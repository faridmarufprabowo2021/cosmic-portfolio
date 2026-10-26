"use client";

import { useEffect, useState } from "react";

interface LiveClockProps {
  timeZone?: string;
  city?: string;
}

export function LiveClock({ timeZone = "Asia/Jakarta", city = "Surakarta" }: LiveClockProps) {
  const [timeStr, setTimeStr] = useState("00:00:00");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const updateClock = () => {
      setTimeStr(formatter.format(new Date()));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  return (
    <div className="fixed bottom-6 right-[var(--gx)] z-40 hidden sm:block pointer-events-none">
      <p className="font-mono text-xs text-[var(--ink-2)] tracking-wider">
        <span className="tabular-nums text-white font-medium">{timeStr}</span>{" "}
        <span className="text-[var(--ink-3)] text-[11px]">UTC+7 · {city}</span>
      </p>
    </div>
  );
}
