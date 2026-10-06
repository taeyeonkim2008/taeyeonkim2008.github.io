// Generates the app icons from one design: a 3×3 grid of seats, five taken.
// Run with `npm run icons` after changing the design; outputs are committed.
// Uses sharp, which ships with Next.js.

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const INK = "#16181d";
const TAKEN = "#5b8cff";
const FREE = "#f6f5f1";
const FILLED = new Set([0, 1, 3, 4, 6]);

/** 3×3 dot grid centered in a 512 box. `spacing` and `r` control its size. */
function dots(spacing, r) {
  return Array.from({ length: 9 }, (_, i) => {
    const cx = 256 + ((i % 3) - 1) * spacing;
    const cy = 256 + (Math.floor(i / 3) - 1) * spacing;
    return FILLED.has(i)
      ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${TAKEN}"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FREE}" fill-opacity="0.32"/>`;
  }).join("");
}

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${body}</svg>`;

// Rounded tile with transparent corners — browsers, Android "any".
const rounded = svg(`<rect width="512" height="512" rx="116" fill="${INK}"/>${dots(128, 40)}`);
// Full-bleed square — iOS rounds the corners itself.
const square = svg(`<rect width="512" height="512" fill="${INK}"/>${dots(124, 38)}`);
// Maskable: Android may crop to a circle, so keep dots inside the 80% safe zone.
const maskable = svg(`<rect width="512" height="512" fill="${INK}"/>${dots(108, 32)}`);

const png = (source, size, file) => sharp(Buffer.from(source)).resize(size, size).png().toFile(file);

await mkdir("public/icons", { recursive: true });
await Promise.all([
  png(rounded, 192, "public/icons/icon-192.png"),
  png(rounded, 512, "public/icons/icon-512.png"),
  png(maskable, 192, "public/icons/icon-maskable-192.png"),
  png(maskable, 512, "public/icons/icon-maskable-512.png"),
  png(square, 180, "src/app/apple-icon.png"),
  writeFile("src/app/icon.svg", rounded),
]);
console.log("Icons written to public/icons and src/app");
