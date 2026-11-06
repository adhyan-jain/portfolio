import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="label">{"//"} 404 signal lost</p>
      <h1 className="display text-[22vw] text-accent">404</h1>
      <Link href="/" className="mono border border-line px-5 py-3 text-sm hover:bg-accent hover:text-bg">
        Back to home
      </Link>
    </main>
  );
}
