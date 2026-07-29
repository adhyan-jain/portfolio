import { config, filled, isBlank } from "@/lib/config";
import { Section, Chip } from "../ui";
import Reveal from "../Reveal";

export default function Interests() {
  const interests = config.interests ?? {};
  const items = filled(interests.items).filter(
    (item) => !isBlank(item.label) || !isBlank(item.icon),
  );

  return (
    <Section
      id="interests"
      heading={interests.heading}
      subheading={interests.subheading}
      show={items.length > 0}
    >
      <div className="flex flex-wrap gap-3">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 60}>
            <Chip size="lg">
              {[item.icon, item.label].filter((v) => !isBlank(v)).join(" ")}
            </Chip>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
