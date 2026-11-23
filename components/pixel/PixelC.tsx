"use client";

import { motion, useReducedMotion } from "motion/react";
import { PIXEL_C } from "./pixels";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The tiled "c" from the Tackbox logo, rebuilt in code. Tiles drop in one by one
 * along the curve of the letter when it scrolls into view, and nudge on hover.
 */
export default function PixelC({ tile = 20, gap = 4, className = "" }: { tile?: number; gap?: number; className?: string }) {
  const reduce = useReducedMotion();

  // Order tiles along the curve, top right around to bottom right, so the letter draws itself
  const tiles = PIXEL_C.flatMap((row, y) =>
    [...row].map((kind, x) => ({ kind, x, y })).filter((t) => t.kind !== ".")
  )
    .map((t) => ({ ...t, angle: Math.atan2(t.y - 4, -(t.x - 4)) }))
    .sort((a, b) => a.angle - b.angle);

  const size = PIXEL_C.length * tile + (PIXEL_C.length - 1) * gap;

  return (
    <div
      aria-hidden
      className={`group relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {tiles.map((t, i) => (
        <motion.span
          key={`${t.x}-${t.y}`}
          className={`absolute rounded-[3px] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 ${
            t.kind === "*"
              ? "bg-amber"
              : t.kind === "o"
                ? "border border-line-strong bg-raised"
                : "border border-line-strong bg-card"
          }`}
          style={{
            width: tile,
            height: tile,
            left: t.x * (tile + gap),
            top: t.y * (tile + gap),
            transitionDelay: `${i * 12}ms`,
          }}
          // Same start state on server and client so hydration matches; reduced motion just skips the tween
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={reduce ? { duration: 0 } : { duration: 0.35, delay: i * 0.035, ease }}
        />
      ))}
    </div>
  );
}
