import Markdown from "react-markdown";
import { DATA } from "@/data/resume";
import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/magicui/blur-fade";

/** Renders inline Markdown (bold, links) without the block margins. */
function Inline({ children }: { children: string }) {
  return (
    <Markdown
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </Markdown>
  );
}

export default function AboutSection() {
  const { highlights, summary, favoriteTechnologies, whatIDo, beyondTech } =
    DATA.about;

  return (
    <div className="flex flex-col gap-y-6">
      {highlights.length > 0 && (
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {highlights.map((item, index) => (
            <BlurFade key={index} delay={0.02 + index * 0.06}>
              <div className="flex items-center gap-x-3">
                {item.icon && (
                  <span className="text-2xl leading-none" aria-hidden>
                    {item.icon}
                  </span>
                )}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <Inline>{item.text}</Inline>
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      )}

      {summary && (
        <BlurFade delay={0.16}>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            <Inline>{summary}</Inline>
          </p>
        </BlurFade>
      )}

      {favoriteTechnologies.length > 0 && (
        <BlurFade delay={0.2}>
          <div className="flex flex-col gap-y-3">
            <h3 className="font-semibold">⚡ Favorite Technologies:</h3>
            <div className="flex flex-wrap gap-2">
              {favoriteTechnologies.map((tech, index) => (
                <BlurFade key={tech} delay={0.22 + index * 0.03} inView>
                  <Badge variant="secondary">{tech}</Badge>
                </BlurFade>
              ))}
            </div>
          </div>
        </BlurFade>
      )}

      {whatIDo.length > 0 && (
        <BlurFade delay={0.26}>
          <div className="flex flex-col gap-y-3">
            <h3 className="font-semibold">🛠️ What I Do:</h3>
            <ul className="flex list-disc flex-col gap-y-2 pl-5 marker:text-muted-foreground">
              {whatIDo.map((item, index) => (
                <li
                  key={index}
                  className="text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-left-1"
                  style={{ animationDelay: `${0.28 + index * 0.04}s`, animationDuration: "0.3s", animationFillMode: "backwards" }}
                >
                  <Inline>{item}</Inline>
                </li>
              ))}
            </ul>
          </div>
        </BlurFade>
      )}

      {beyondTech.text && (
        <BlurFade delay={0.36}>
          <div className="rounded-r-lg border-l-2 bg-muted/50 px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {beyondTech.label && (
                <span className="font-semibold text-foreground">
                  {beyondTech.label}{" "}
                </span>
              )}
              <Inline>{beyondTech.text}</Inline>
            </p>
          </div>
        </BlurFade>
      )}
    </div>
  );
}
