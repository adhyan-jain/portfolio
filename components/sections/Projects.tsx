import { config, filled, isBlank } from "@/lib/config";
import { Section, Card, Chip } from "../ui";
import { GitHubIcon, ExternalIcon } from "../icons";
import Reveal from "../Reveal";

export default function Projects() {
  const projects = config.projects ?? {};
  const items = filled(projects.items);

  return (
    <Section
      id="projects"
      heading={projects.heading}
      subheading={projects.subheading}
      show={items.length > 0}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item, i) => (
          <Reveal
            key={i}
            delay={i * 80}
            className={item.featured ? "sm:col-span-2" : ""}
          >
            <Card className="flex h-full flex-col overflow-hidden" interactive>
              {!isBlank(item.image) && (
                /* Plain <img>: project images may be remote, user-supplied URLs. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.image}
                  alt={isBlank(item.name) ? "" : item.name}
                  loading="lazy"
                  className="aspect-video w-full border-b border-border object-cover"
                />
              )}

              <div className="flex flex-1 flex-col gap-3 p-6">
                {!isBlank(item.name) && (
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                )}

                {!isBlank(item.description) && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}

                {filled(item.tech).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filled(item.tech).map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                )}

                {(!isBlank(item.repoUrl) || !isBlank(item.liveUrl)) && (
                  <div className="mt-auto flex gap-4 pt-2">
                    {!isBlank(item.repoUrl) && (
                      <a
                        href={item.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <GitHubIcon width={14} height={14} />
                        Source
                      </a>
                    )}
                    {!isBlank(item.liveUrl) && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ExternalIcon />
                        Live
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
