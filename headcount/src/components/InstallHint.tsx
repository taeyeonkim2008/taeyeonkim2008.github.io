"use client";

import { useEffect, useState } from "react";
import { shouldShowInstallHint } from "@/lib/installHint";
import Logo from "./Logo";

const DISMISSED_KEY = "headcount:installHintDismissed";

/** Bottom banner telling iOS Safari users how to add Headcount to their home screen. */
export default function InstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {}
    const nav = navigator as Navigator & { standalone?: boolean };
    const show = shouldShowInstallHint(
      {
        userAgent: nav.userAgent,
        platform: nav.platform,
        maxTouchPoints: nav.maxTouchPoints,
        standalone: nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches,
      },
      dismissed,
    );
    if (!show) return;
    // Let the page settle before sliding in.
    const id = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-label="Add Headcount to your home screen"
      className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-20 mx-auto max-w-md motion-safe:animate-[hint-in_300ms_ease-out] rounded-2xl border border-line bg-card p-3.5 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <Logo size={36} />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">Add Headcount to your home screen</p>
          <p className="mt-0.5 leading-snug text-ink-2">
            Tap{" "}
            <svg className="inline size-4 -translate-y-px text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Share">
              <path d="M12 3v12M8 7l4-4 4 4" />
              <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
            </svg>{" "}
            <strong className="font-semibold text-ink">Share</strong>, then <strong className="font-semibold text-ink">Add to Home Screen</strong> to open it like an app.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-track hover:text-ink"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
