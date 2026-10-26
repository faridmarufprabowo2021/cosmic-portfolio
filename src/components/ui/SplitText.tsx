"use client";

import React from "react";

interface SplitTextProps {
  text: string;
  variant?: "rise" | "expose" | "warp";
  className?: string;
  stagger?: number; // seconds
  delay?: number; // seconds base delay
  trigger?: "mount" | "scroll" | string;
}

export function SplitText({
  text,
  variant = "rise",
  className = "",
  stagger = 0.035,
  delay = 0,
  trigger = "scroll",
}: SplitTextProps) {
  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <span className={`inline-block ${className}`} data-trigger={trigger} data-variant={variant}>
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
                    animationDelay: `${delay + charIndex * stagger}s`,
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
