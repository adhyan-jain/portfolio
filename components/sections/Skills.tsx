import { config, filled, isBlank } from "@/lib/config";
import { Section, Card } from "../ui";
import Reveal from "../Reveal";

export default function Skills() {
  const skills = config.skills ?? {};
  const items = filled(skills.items);

  return (
    <Section
      id="skills"
      heading={skills.heading}
      subheading={skills.subheading}
      show={items.length > 0}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 70}>
            <Card className="h-full p-6" interactive>
              {!isBlank(item.icon) && (
                <div className="mb-3 text-2xl" aria-hidden>
                  {item.icon}
                </div>
              )}
              {!isBlank(item.title) && (
                <h3 className="font-semibold text-foreground">{item.title}</h3>
              )}
              {!isBlank(item.description) && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
