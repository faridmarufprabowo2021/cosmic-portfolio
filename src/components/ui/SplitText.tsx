"use client";

import React from "react";

interface SplitTextProps {
  text: string;
  variant?: "rise" | "expose" | "warp";
  className?: string;
  stagger?: number; // seconds
}

export function SplitText({
  text,
  variant = "rise",
  className = "",
  stagger = 0.035,
}: SplitTextProps) {
  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wIdx) => {
        const chars = Array.from(word);
        return (
          <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
            {chars.map((char, cIdx) => {
              const charIndex = globalCharIndex++;
              return (
                <span
                  key={cIdx}
                  className="inline-block transition-transform duration-700 ease-out"
                  style={{
                    animationDelay: `${charIndex * stagger}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
