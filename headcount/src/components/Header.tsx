import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          Headcount
        </Link>
        <Link href="/about" className="rounded-full px-3 py-1.5 text-sm text-ink-2 hover:bg-track">
          About
        </Link>
      </div>
    </header>
  );
}
