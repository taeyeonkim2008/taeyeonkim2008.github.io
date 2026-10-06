import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold">Space not found</h1>
      <p className="mt-2 text-sm text-ink-2">It may have been renamed or removed.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper">
        Back to all spaces
      </Link>
    </div>
  );
}
