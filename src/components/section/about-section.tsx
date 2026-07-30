import Markdown from "react-markdown";
import { DATA } from "@/data/resume";
import { Badge } from "@/components/ui/badge";

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
            <div key={index} className="flex items-center gap-x-3">
              {item.icon && (
                <span className="text-2xl leading-none" aria-hidden>
                  {item.icon}
                </span>
              )}
              <p className="text-sm leading-relaxed text-muted-foreground">
                <Inline>{item.text}</Inline>
              </p>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <p className="text-pretty leading-relaxed text-muted-foreground">
          <Inline>{summary}</Inline>
        </p>
      )}

      {favoriteTechnologies.length > 0 && (
        <div className="flex flex-col gap-y-3">
          <h3 className="font-semibold">⚡ Favorite Technologies:</h3>
          <div className="flex flex-wrap gap-2">
            {favoriteTechnologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {whatIDo.length > 0 && (
        <div className="flex flex-col gap-y-3">
          <h3 className="font-semibold">🛠️ What I Do:</h3>
          <ul className="flex list-disc flex-col gap-y-2 pl-5 marker:text-muted-foreground">
            {whatIDo.map((item, index) => (
              <li
                key={index}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                <Inline>{item}</Inline>
              </li>
            ))}
          </ul>
        </div>
      )}

      {beyondTech.text && (
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
      )}
    </div>
  );
}
