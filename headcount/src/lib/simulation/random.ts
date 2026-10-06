// Deterministic pseudo-randomness. Everything is a pure function of its inputs,
// so the simulation needs no stored state and gives the same answer on every
// server instance (important on serverless hosts like Vercel).

/** FNV-1a hash of a string to an unsigned 32-bit int. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mix two ints into a well-distributed unsigned 32-bit int. */
function mix(a: number, b: number): number {
  let h = (a ^ Math.imul(b, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Deterministic value in [0, 1) for (seed, n). */
export function rand01(seed: number, n: number): number {
  return mix(seed, n) / 0x100000000;
}

/** Deterministic value in [-1, 1) keyed by a string. */
export function randSigned(key: string): number {
  return rand01(hashString(key), 0) * 2 - 1;
}

/**
 * Smooth 1-D value noise in [-1, 1]. Random values are placed every `period`
 * units of `t` and blended with smoothstep, so nearby `t` give nearby outputs.
 */
export function valueNoise(seed: number, t: number, period: number): number {
  const x = t / period;
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = rand01(seed, i) * 2 - 1;
  const b = rand01(seed, i + 1) * 2 - 1;
  return a + (b - a) * u;
}
