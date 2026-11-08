import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="tab text-sm text-muted">No sheet at this address</p>
      <h1 className="stencil text-[22vw] leading-none text-accent">404</h1>
      <Link href="/" className="border border-line-strong px-5 py-3 text-sm hover:border-hud">
        Back to the drawing set
      </Link>
    </main>
  );
}
