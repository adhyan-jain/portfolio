import type { ReactNode } from "react";
import { isBlank } from "@/lib/config";
import Reveal from "./Reveal";

/** Centered page gutter shared by every section. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-6 ${className}`}>{children}</div>
  );
}

/**
 * A titled page section. Renders nothing at all when `show` is false, which is
 * how empty config entries disappear along with their heading and divider.
 */
export function Section({
  id,
  heading,
  subheading,
  show = true,
  centered = false,
  children,
}: {
  id: string;
  heading?: string;
  subheading?: string;
  show?: boolean;
  centered?: boolean;
  children: ReactNode;
}) {
  if (!show) return null;

  return (
    <section id={id} className="border-t border-border py-20 sm:py-24">
      <Container className={centered ? "text-center" : ""}>
        {!isBlank(heading) && (
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {heading}
            </h2>
            <div
              className={`mt-3 h-px w-12 bg-foreground/25 ${centered ? "mx-auto" : ""}`}
            />
          </Reveal>
        )}

        {!isBlank(subheading) && (
          <Reveal delay={60}>
            <p
              className={`mt-4 max-w-2xl text-muted-foreground ${centered ? "mx-auto" : ""}`}
            >
              {subheading}
            </p>
          </Reveal>
        )}

        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}

/** Small pill used for tech tags, interests, and hero metadata. */
export function Chip({
  children,
  size = "sm",
}: {
  children: ReactNode;
  size?: "sm" | "lg";
}) {
  const scale = size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border bg-secondary/50 font-medium text-secondary-foreground transition-colors hover:bg-secondary ${scale}`}
    >
      {children}
    </span>
  );
}

/** Bordered surface used by cards across the page. */
export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const hover = interactive
    ? "transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-lg hover:shadow-black/5"
    : "";
  return (
    <div
      className={`rounded-lg border border-border bg-card ${hover} ${className}`}
    >
      {children}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
};

export function ButtonLink({
  href,
  children,
  variant = "outline",
  size = "md",
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent",
    outline:
      "border border-border bg-transparent hover:bg-secondary hover:border-foreground/25",
    ghost: "border border-transparent hover:bg-secondary",
  };
  const sizes = { md: "h-10 px-4 text-sm", lg: "h-11 px-6 text-sm" };
  const external = /^https?:/i.test(href);

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </a>
  );
}
