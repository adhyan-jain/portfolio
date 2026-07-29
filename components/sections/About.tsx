import { config, filled, isBlank } from "@/lib/config";
import { Section, Card } from "../ui";
import Reveal from "../Reveal";

export default function About() {
  const about = config.about ?? {};
  const paragraphs = filled(about.paragraphs);
  const highlights = filled(about.highlights);

  return (
    <Section
      id="about"
      heading={about.heading}
      subheading={about.subheading}
      show={paragraphs.length > 0 || highlights.length > 0}
    >
      <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
        {paragraphs.length > 0 && (
          <div className="space-y-4">
            {paragraphs.map((text, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="leading-relaxed text-muted-foreground">{text}</p>
              </Reveal>
            ))}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="space-y-3">
            {highlights.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <Card className="px-4 py-3" interactive>
                  {!isBlank(item.label) && (
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </span>
                  )}
                  {!isBlank(item.value) && (
                    <span className="mt-1 block font-semibold">{item.value}</span>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
