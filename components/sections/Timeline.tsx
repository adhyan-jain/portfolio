import type { ReactNode } from "react";
import { isBlank } from "@/lib/config";
import { Chip } from "../ui";
import { ExternalIcon } from "../icons";
import Reveal from "../Reveal";

export type TimelineEntry = {
  title: string;
  org: string;
  orgUrl?: string;
  date: string;
  location?: string;
  /** Secondary line under the org — used for education scores. */
  meta?: string;
  description?: string;
  bullets?: string[];
  tech?: string[];
};

/** Shared vertical timeline behind both Experience and Education. */
export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative space-y-10 border-l border-border pl-8">
      {entries.map((entry, i) => (
        <Reveal key={i} delay={i * 90}>
          <li className="relative">
            <span
              aria-hidden
              className="absolute -left-[2.31rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-foreground/40 bg-background"
            />

            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                {!isBlank(entry.title) && (
                  <h3 className="font-semibold text-foreground">{entry.title}</h3>
                )}
                {!isBlank(entry.org) && (
                  <OrgLine name={entry.org} url={entry.orgUrl} />
                )}
              </div>
              {!isBlank(entry.date) && (
                <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {entry.date}
                </span>
              )}
            </div>

            {[entry.location, entry.meta]
              .filter((value) => !isBlank(value))
              .map((value) => (
                <p key={value} className="mt-1 text-xs text-muted-foreground">
                  {value}
                </p>
              ))}

            {!isBlank(entry.description) && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {entry.description}
              </p>
            )}

            {entry.bullets && entry.bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {entry.bullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:text-foreground/40 before:content-['▸']"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            {entry.tech && entry.tech.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.tech.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            )}
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

function OrgLine({ name, url }: { name: string; url?: string }): ReactNode {
  if (isBlank(url)) {
    return <p className="text-sm text-muted-foreground">{name}</p>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {name}
      <ExternalIcon />
    </a>
  );
}
