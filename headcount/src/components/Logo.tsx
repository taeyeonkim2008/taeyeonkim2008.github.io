/** Original mark: a 3×3 grid of dots, partly filled — "how many seats are taken". */
export default function Logo({ size = 22 }: { size?: number }) {
  const filled = new Set([0, 1, 3, 4, 6]);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="6" fill="var(--ink)" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle
          key={i}
          cx={6 + (i % 3) * 6}
          cy={6 + Math.floor(i / 3) * 6}
          r="1.9"
          fill={filled.has(i) ? "var(--accent)" : "var(--paper)"}
          opacity={filled.has(i) ? 1 : 0.35}
        />
      ))}
    </svg>
  );
}
