import { mulberry32 } from "./pixels";

const COLS = 128; // wider than any screen; the grid is centered and cropped
const ROWS = 8;

/**
 * A band of page-colored tiles that eats the bottom of the hero backdrop,
 * so it breaks into pixels instead of ending on an edge. The last row is solid.
 */
export default function PixelDissolve({ tile = 16, className = "" }: { tile?: number; className?: string }) {
  const rand = mulberry32(7);
  const cells: { on: boolean; delay: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    // Density climbs toward the bottom: sparse at the top of the band, solid at the end
    const p = r === ROWS - 1 ? 1 : Math.pow((r + 1) / ROWS, 1.4);
    for (let c = 0; c < COLS; c++) {
      cells.push({ on: rand() < p, delay: Math.round(200 + (ROWS - r) * 60 + rand() * 600) });
    }
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden ${className}`}
      style={{ height: tile * ROWS }}
    >
      <div
        className="grid shrink-0"
        style={{ gridTemplateColumns: `repeat(${COLS}, ${tile}px)`, gridAutoRows: `${tile}px` }}
      >
        {cells.map((cell, i) =>
          cell.on ? (
            <span key={i} className="pixel-in bg-background" style={{ animationDelay: `${cell.delay}ms` }} />
          ) : (
            <span key={i} />
          )
        )}
      </div>
    </div>
  );
}
