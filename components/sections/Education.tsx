import { config, dateRange, filled } from "@/lib/config";
import { Section } from "../ui";
import Timeline from "./Timeline";

export default function Education() {
  const education = config.education ?? {};
  const items = filled(education.items);

  return (
    <Section
      id="education"
      heading={education.heading}
      subheading={education.subheading}
      show={items.length > 0}
    >
      <Timeline
        entries={items.map((item) => ({
          title: item.degree,
          org: item.institution,
          orgUrl: item.institutionUrl,
          date: dateRange(item.start, item.end),
          location: item.location,
          meta: item.score,
          description: item.details,
        }))}
      />
    </Section>
  );
}
