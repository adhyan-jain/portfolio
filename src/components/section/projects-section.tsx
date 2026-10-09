import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

type Project = (typeof DATA.projects)[number];

function ProjectGrid({
  projects,
  offset = 0,
}: {
  projects: readonly Project[];
  offset?: number;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      {projects.map((project, index) => (
        <BlurFade
          key={project.title}
          delay={BLUR_FADE_DELAY * 4 + (offset + index) * 0.04}
          className="h-full"
        >
          <ProjectCard
            href={project.href}
            title={project.title}
            description={project.description}
            dates={project.dates}
            tags={project.technologies}
            image={project.image}
            video={project.video}
            links={project.links}
          />
        </BlurFade>
      ))}
    </div>
  );
}

export default function ProjectsSection() {
  // Projects with a screenshot lead; the rest follow as text-only cards.
  const featured = DATA.projects.filter((p) => p.image || p.video);
  const more = DATA.projects.filter((p) => !p.image && !p.video);

  return (
    <section id="projects" className="flex flex-col gap-12">
      <div className="flex flex-col gap-10">
        <header className="flex max-w-2xl flex-col gap-2">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Selected work
          </h2>
          <p className="text-pretty text-muted-foreground md:text-lg">
            Production apps, research prototypes and hackathon builds.
          </p>
        </header>
        <ProjectGrid projects={featured} />
      </div>

      {more.length > 0 && (
        <div className="flex flex-col gap-6">
          <h3 className="font-display text-2xl font-semibold tracking-tight">
            More work
          </h3>
          <ProjectGrid projects={more} offset={featured.length} />
        </div>
      )}
    </section>
  );
}
