"use client";

import { useEffect, useState } from "react";
import type { Link } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";

type Props = {
  initials: string;
  links: Link[];
};

export default function Nav({ initials, links }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Border and blur only kick in once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight whichever section currently occupies the middle of the viewport.
  useEffect(() => {
    const ids = links
      .filter((link) => link.href.startsWith("#"))
      .map((link) => link.href.slice(1));

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <a
          href="#hero"
          className="text-sm font-bold tracking-widest transition-opacity hover:opacity-70"
        >
          {initials}
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                active === link.href.slice(1)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
            aria-expanded={open}
            className="inline-flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md border border-border transition-colors hover:bg-secondary md:hidden"
          >
            <span
              className={`h-px w-4 bg-foreground transition-transform duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-4 bg-foreground transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-4 bg-foreground transition-transform duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-background/95 px-6 pb-4 pt-2 backdrop-blur-lg md:hidden"
          aria-label="Mobile"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
