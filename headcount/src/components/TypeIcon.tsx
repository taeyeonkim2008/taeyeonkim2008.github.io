import type { SpaceType } from "@/lib/types";

export const TYPE_LABEL: Record<SpaceType, string> = { study: "Study", gym: "Gym", dining: "Dining" };
export const TYPE_HEADING: Record<SpaceType, string> = { study: "Study spaces", gym: "Gyms", dining: "Dining halls" };

const PATHS: Record<SpaceType, React.ReactNode> = {
  study: <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z" />,
  gym: <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />,
  dining: <path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.2 1.3-3 4-3 7v3h3" />,
};

export default function TypeIcon({ type, className = "size-4" }: { type: SpaceType; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {PATHS[type]}
    </svg>
  );
}
