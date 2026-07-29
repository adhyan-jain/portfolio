import { config, filled, isBlank } from "@/lib/config";
import { Section, Card, Chip } from "../ui";
import Reveal from "../Reveal";

export default function Technologies() {
  const tech = config.technologies ?? {};
  const groups = filled(tech.groups).filter((g) => filled(g.items).length > 0);

  return (
    <Section
      id="technologies"
      heading={tech.heading}
      subheading={tech.subheading}
      show={groups.length > 0}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, i) => (
          <Reveal key={i} delay={i * 70}>
            <Card className="h-full p-5" interactive>
              {!isBlank(group.category) && (
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.category}
                </h3>
              )}
              <div className="flex flex-wrap gap-2">
                {filled(group.items).map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
