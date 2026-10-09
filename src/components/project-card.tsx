/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";

const MAX_TAGS = 5;
// Descriptions longer than this are clamped behind a "More" toggle.
const CLAMP_THRESHOLD = 170;

function ProjectMedia({
  src,
  video,
  alt,
}: {
  src?: string;
  video?: string;
  alt: string;
}) {
  const [imageError, setImageError] = useState(false);
  const frame =
    "aspect-video w-full overflow-hidden rounded-[10px] bg-muted outline outline-1 -outline-offset-1 outline-white/10";

  if (video) {
    return (
      <div className={frame}>
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  if (!src || imageError) return <div className={frame} />;

  return (
    <div className={frame}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  image,
  video,
  links,
  className,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const clampable = description.length > CLAMP_THRESHOLD;
  const hasMedia = Boolean(image || video);
  const visibleTags = tags.slice(0, MAX_TAGS);
  const hiddenTags = tags.slice(MAX_TAGS);

  return (
    <article
      className={cn(
        // Outer radius = inner media radius (10px) + padding (6px).
        "group flex h-full flex-col rounded-2xl border border-border bg-card/40 p-1.5 transition-colors duration-200 hover:border-foreground/25",
        className,
      )}
    >
      {hasMedia &&
        (href ? (
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden
            className="block shrink-0"
          >
            <ProjectMedia src={image} video={video} alt={title} />
          </Link>
        ) : (
          <ProjectMedia src={image} video={video} alt={title} />
        ))}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
              {title}
            </h3>
            {dates && (
              <time className="font-mono text-xs text-muted-foreground">
                {dates}
              </time>
            )}
          </div>
          {href && (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${title}`}
              className="-m-2 flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowUpRight
                className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )}
        </div>

        <div className="text-sm leading-relaxed text-muted-foreground">
          <Markdown
            components={{
              p: ({ children }) => (
                <p
                  className={cn(
                    "text-pretty",
                    clampable && !expanded && "line-clamp-3",
                  )}
                >
                  {children}
                </p>
              ),
              code: ({ children }) => (
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground/90">
                  {children}
                </code>
              ),
            }}
          >
            {description}
          </Markdown>
          {clampable && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="mt-1.5 rounded text-xs font-medium text-brand transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {visibleTags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-muted/70 px-2 py-1 font-mono text-[11px] leading-none text-muted-foreground"
              >
                {tag}
              </li>
            ))}
            {hiddenTags.length > 0 && (
              <li
                title={hiddenTags.join(", ")}
                className="rounded-md px-1.5 py-1 font-mono text-[11px] leading-none text-muted-foreground/70"
              >
                +{hiddenTags.length}
              </li>
            )}
          </ul>
        )}

        {links && links.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {links.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium transition-[background-color,border-color,transform] duration-150 hover:border-foreground/25 hover:bg-muted active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.icon}
                {link.type}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
