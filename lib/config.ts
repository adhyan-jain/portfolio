import raw from "@/config/portfolio.json";
import type { Config } from "./types";

export const config = raw as Config;

/**
 * Treats "", null, [], and objects whose values are all empty as absent —
 * recursively. Unfilled config fields then hide their UI instead of rendering
 * empty headings, dangling separators, or blank cards.
 */
export function isBlank(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.every(isBlank);
  if (typeof value === "object") return Object.values(value).every(isBlank);
  return false;
}

export const filled = <T,>(items: T[] | undefined): T[] =>
  (items ?? []).filter((item) => !isBlank(item));

/** Joins a start/end pair, tolerating either side being absent. */
export function dateRange(start?: string, end?: string): string {
  const a = isBlank(start) ? "" : start!.trim();
  const b = isBlank(end) ? "" : end!.trim();
  if (a && b) return `${a} — ${b}`;
  return a || b;
}

/** Falls back to the initials of `name` when `initials` is not set. */
export function initialsOf(initials: string, name: string): string {
  if (!isBlank(initials)) return initials;
  if (isBlank(name)) return "—";
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Nav entries whose target section rendered nothing are dropped. */
export function visibleNav() {
  const has = {
    about: !isBlank(config.about?.paragraphs) || !isBlank(config.about?.highlights),
    technologies: !isBlank(config.technologies?.groups),
    skills: !isBlank(config.skills?.items),
    experience: !isBlank(config.experience?.items),
    education: !isBlank(config.education?.items),
    projects: !isBlank(config.projects?.items),
    interests: !isBlank(config.interests?.items),
    contact: !isBlank(config.contact?.email) || !isBlank(config.socials),
  } as Record<string, boolean>;

  return filled(config.nav).filter((item) => {
    if (isBlank(item.label) || isBlank(item.href)) return false;
    if (!item.href.startsWith("#")) return true;
    const id = item.href.slice(1);
    return has[id] ?? true;
  });
}
