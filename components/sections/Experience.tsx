import { config, dateRange, filled } from "@/lib/config";
import { Section } from "../ui";
import Timeline from "./Timeline";

export default function Experience() {
  const experience = config.experience ?? {};
  const items = filled(experience.items);

  return (
    <Section
      id="experience"
      heading={experience.heading}
      subheading={experience.subheading}
      show={items.length > 0}
    >
      <Timeline
        entries={items.map((item) => ({
          title: item.role,
          org: item.company,
          orgUrl: item.companyUrl,
          date: dateRange(item.start, item.end),
          location: item.location,
          description: item.description,
          bullets: filled(item.bullets),
          tech: filled(item.tech),
        }))}
      />
    </Section>
  );
}
