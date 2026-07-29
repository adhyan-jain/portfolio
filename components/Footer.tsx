import { config, isBlank } from "@/lib/config";
import { Container } from "./ui";

export default function Footer() {
  const footer = config.footer ?? {};
  const name = config.profile?.name;

  // Fall back to a generated copyright line when none is configured.
  const copyright = isBlank(footer.copyright)
    ? isBlank(name)
      ? ""
      : `© ${new Date().getFullYear()} ${name}`
    : footer.copyright;

  if (isBlank(footer.note) && isBlank(copyright)) return null;

  return (
    <footer className="border-t border-border py-8">
      <Container className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        {!isBlank(footer.note) && <p>{footer.note}</p>}
        {!isBlank(copyright) && <p>{copyright}</p>}
      </Container>
    </footer>
  );
}
