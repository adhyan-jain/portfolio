import { config, filled, isBlank } from "@/lib/config";
import { Container, ButtonLink, Chip } from "../ui";
import { SocialIcon } from "../icons";
import Reveal from "../Reveal";

export default function Hero() {
  const { profile, hero, socials } = config;
  const quote = profile.quote ?? { text: "", author: "" };
  const meta = [profile.location, profile.availability].filter((v) => !isBlank(v));
  const ctas = [
    { ...hero?.primaryCta, variant: "primary" as const },
    { ...hero?.secondaryCta, variant: "outline" as const },
  ].filter((cta) => !isBlank(cta.label) && !isBlank(cta.href));
  const links = filled(socials).filter((s) => !isBlank(s.href) && !isBlank(s.label));

  return (
    <section
      id="hero"
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-24"
    >
      {/* Soft radial wash anchored behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.045] blur-3xl"
      />

      <Container className="relative">
        <div className="flex flex-col-reverse items-start gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            {!isBlank(profile.greeting) && (
              <Reveal>
                <p className="mb-4 font-mono text-sm text-muted-foreground">
                  {profile.greeting}
                </p>
              </Reveal>
            )}

            {!isBlank(profile.name) && (
              <Reveal delay={80}>
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                  {profile.name}
                </h1>
              </Reveal>
            )}

            {!isBlank(profile.headline) && (
              <Reveal delay={160}>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                  {profile.headline}
                </h2>
              </Reveal>
            )}

            {!isBlank(profile.tagline) && (
              <Reveal delay={240}>
                <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                  {profile.tagline}
                </p>
              </Reveal>
            )}

            {!isBlank(quote.text) && (
              <Reveal delay={300}>
                <blockquote className="mt-6 border-l-2 border-border pl-4 text-sm italic text-muted-foreground">
                  <p>{quote.text}</p>
                  {!isBlank(quote.author) && (
                    <cite className="mt-1 block not-italic opacity-70">
                      — {quote.author}
                    </cite>
                  )}
                </blockquote>
              </Reveal>
            )}

            {meta.length > 0 && (
              <Reveal delay={340}>
                <div className="mt-6 flex flex-wrap gap-2">
                  {meta.map((value) => (
                    <Chip key={value}>{value}</Chip>
                  ))}
                </div>
              </Reveal>
            )}

            {ctas.length > 0 && (
              <Reveal delay={400}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {ctas.map((cta) => (
                    <ButtonLink
                      key={cta.href}
                      href={cta.href!}
                      variant={cta.variant}
                      size="lg"
                    >
                      {cta.label}
                    </ButtonLink>
                  ))}
                </div>
              </Reveal>
            )}

            {links.length > 0 && (
              <Reveal delay={460}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {links.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <SocialIcon name={social.icon} />
                      {social.label}
                    </a>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {!isBlank(profile.avatar) && (
            <Reveal delay={200}>
              {/* Plain <img>: the avatar path is user-supplied and may be remote. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar}
                alt={isBlank(profile.name) ? "Portrait" : profile.name}
                className="h-40 w-40 rounded-2xl border border-border object-cover sm:h-56 sm:w-56"
              />
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
