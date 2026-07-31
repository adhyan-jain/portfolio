/* eslint-disable @next/next/no-img-element */
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Link from "next/link";
import AboutSection from "@/components/section/about-section";
import ContactSection from "@/components/section/contact-section";
import ProjectsSection from "@/components/section/projects-section";
import WorkSection from "@/components/section/work-section";
import HackathonsSection from "@/components/section/hackathons-section";
import TabbedSections, { type TabItem } from "@/components/tabbed-sections";
import { SkillBadge } from "@/components/skill-badge";
import { ArrowUpRight } from "lucide-react";

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
    .map(({ value, label, content }) => ({ value, label, content }));

  return (
    <main className="relative flex min-h-dvh flex-col gap-10">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="flex flex-col justify-between gap-2 gap-y-6 md:flex-row">
            <div className="order-2 flex flex-col gap-2 md:order-1">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-semibold tracking-tighter sm:text-4xl lg:text-5xl"
                yOffset={8}
                text={`Hi, I'm ${DATA.name.split(" ")[0]} 👋`}
              />
              <BlurFadeText
                className="max-w-[600px] text-muted-foreground md:text-lg lg:text-xl"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
              {DATA.quote && (
                <BlurFade delay={BLUR_FADE_DELAY * 2}>
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    &ldquo;{DATA.quote}&rdquo;
                  </p>
                </BlurFade>
              )}
            </div>
            <BlurFade delay={BLUR_FADE_DELAY} className="order-1 md:order-2">
              <Avatar className="size-24 rounded-full border shadow-lg ring-4 ring-muted md:size-32">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>

      <BlurFade delay={BLUR_FADE_DELAY * 3}>
        <TabbedSections tabs={tabs} />
      </BlurFade>
    </main>
  );
}
