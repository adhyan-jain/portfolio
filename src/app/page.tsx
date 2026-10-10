/* eslint-disable @next/next/no-img-element */
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { DATA } from "@/data/resume";
import Link from "next/link";
import AboutSection from "@/components/section/about-section";
import ContactSection from "@/components/section/contact-section";
import ProjectsSection from "@/components/section/projects-section";
import WorkSection from "@/components/section/work-section";
import HackathonsSection from "@/components/section/hackathons-section";
import TabbedSections, { type TabItem } from "@/components/tabbed-sections";
import { SkillBadge } from "@/components/skill-badge";
import { ArrowUpRight, Briefcase, MapPin } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

function EducationSection() {
  return (
    <div className="flex flex-col gap-8">
      {DATA.education.map((education, index) => (
        <BlurFade key={education.school} delay={BLUR_FADE_DELAY + index * 0.05}>
          <Link
            href={education.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-x-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-x-3">
              {education.logoUrl ? (
                <img
                  src={education.logoUrl}
                  alt={education.school}
                  className="size-8 flex-none overflow-hidden rounded-full border object-contain p-1 shadow ring-2 ring-border md:size-10 bg-white"
                />
              ) : (
                <div className="size-8 flex-none rounded-full border bg-muted p-1 shadow ring-2 ring-border md:size-10" />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2 font-semibold leading-none">
                  {education.school}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 -translate-x-2 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <div className="font-sans text-sm text-muted-foreground">
                  {education.degree}
                </div>
              </div>
            </div>
            <div className="flex flex-none items-center gap-1 text-right text-xs tabular-nums text-muted-foreground">
              <span>
                {education.start} - {education.end}
              </span>
            </div>
          </Link>
        </BlurFade>
      ))}
    </div>
  );
}

function SkillsSection() {
  return (
    <div className="flex flex-wrap gap-2">
      {DATA.skills.map((skill, index) => (
        <SkillBadge key={skill.name} delay={index * 0.015}>
          {skill.icon && (
            <skill.icon className="size-4 overflow-hidden rounded object-contain" />
          )}
          <span className="text-sm font-medium text-foreground">
            {skill.name}
          </span>
        </SkillBadge>
      ))}
    </div>
  );
}

export default function Page() {
  // Tabs with nothing behind them are dropped rather than shown empty.
  const tabs: TabItem[] = [
    { value: "about", label: "About", content: <AboutSection />, show: true },
    {
      value: "experience",
      label: "Experience",
      content: (
        <div className="flex flex-col gap-12">
          <WorkSection />
          {DATA.hackathons.length > 0 && <HackathonsSection />}
        </div>
      ),
      show: DATA.work.length > 0,
    },
    {
      value: "education",
      label: "Education",
      content: <EducationSection />,
      show: DATA.education.length > 0,
    },
    {
      value: "skills",
      label: "Skills",
      content: <SkillsSection />,
      show: DATA.skills.length > 0,
    },
    {
      value: "projects",
      label: "Projects",
      content: <ProjectsSection />,
      wide: true,
      show: DATA.projects.length > 0,
    },
    {
      value: "contact",
      label: "Contact",
      content: <ContactSection />,
      show: true,
    },
  ]
    .filter((tab) => tab.show)
    .map(({ value, label, content, wide }) => ({ value, label, content, wide }));

  // Display-only: the description carries a trailing emoji in the data file.
  const tagline = DATA.description.replace(/\p{Extended_Pictographic}/gu, "").trim();
  const currentRole = DATA.work.find((job) => job.end === "Present");

  return (
    <main className="relative flex min-h-dvh flex-col gap-14">
      <section id="hero">
        <div className="flex justify-center">
          <div className="flex max-w-2xl flex-col items-center gap-5 text-center">
            <BlurFadeText
              delay={BLUR_FADE_DELAY}
              className="font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
              yOffset={8}
              text={DATA.name}
            />
            <BlurFadeText
              className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl"
              delay={BLUR_FADE_DELAY * 2}
              text={tagline}
            />
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden />
                  {DATA.location}
                </li>
                {currentRole && (
                  <li className="flex items-center gap-1.5">
                    <Briefcase className="size-4" aria-hidden />
                    {currentRole.title} at {currentRole.company.replace(/\s*\(.*\)$/, "")}
                  </li>
                )}
              </ul>
            </BlurFade>
          </div>
        </div>
      </section>

      <BlurFade delay={BLUR_FADE_DELAY * 4}>
        <TabbedSections tabs={tabs} />
      </BlurFade>
    </main>
  );
}
