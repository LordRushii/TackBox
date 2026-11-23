// Shared helpers for the pixel motif taken from the Tackbox logo, whose "c" is built from square tiles.

/** Small deterministic PRNG so server and client render the same tiles (no hydration mismatch). */
export function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The "c" from the logo on a 9x9 grid. "#" is an outlined tile, "o" a filled tile, "*" the amber cursor tile. */
export const PIXEL_C = [
  "..#o###..",
  ".##...o#.",
  "#o.......",
  "##.......",
  "#o.......",
  "##.......",
  "o#.......",
  ".#o...##.",
  "..##o#*..",
];
