"use client";

import { Dithering } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import PixelDissolve from "@/components/pixel/PixelDissolve";

// Page-colored washes that leave calm space where the text sits.
// "top" suits a left-aligned headline near the top; "center" is a tall column for a centered hero with a subhead and actions.
const CALM = {
  top: "bg-[radial-gradient(90%_60%_at_50%_18%,rgba(18,18,17,0.92)_0%,rgba(18,18,17,0.6)_45%,rgba(18,18,17,0)_80%)]",
  center:
    "bg-[radial-gradient(48%_70%_at_50%_42%,rgba(18,18,17,0.96)_0%,rgba(18,18,17,0.88)_55%,rgba(18,18,17,0)_100%)]",
};

/**
 * Ordered-dither shader behind the hero, the same square pixels as the "c" in the logo.
 * Its back color is the page color itself, so only the amber pixels show: no box, no edge.
 * The bottom breaks into page-colored tiles. This is the one rich moment; the chrome stays neutral.
 */
export default function HeroBackdrop({
  className = "h-full",
  calm = "top",
}: {
  className?: string;
  calm?: keyof typeof CALM;
}) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${className}`}>
      <Dithering
        className="absolute inset-0 h-full w-full"
        colorBack="#121211"
        colorFront="#c7841c"
        shape="warp"
        type="4x4"
        size={3}
        scale={0.9}
        speed={reduce ? 0 : 0.22}
      />
      <div className={`absolute inset-0 ${CALM[calm]}`} />
      <PixelDissolve />
    </div>
  );
}
