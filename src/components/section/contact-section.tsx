import Link from "next/link";
import { DATA } from "@/data/resume";

export default function ContactSection() {
  const socialLinks = Object.entries(DATA.contact.social).filter(
    ([, social]) => social.navbar,
  );

  return (
    <div className="flex flex-col items-center gap-6 text-center py-10">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
        Get in Touch
      </h2>
      <p className="mx-auto max-w-lg text-muted-foreground text-balance">
        Want to chat? Just shoot me a dm{" "}
        <Link
          href={DATA.contact.social.LinkedIn.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          with a direct question on LinkedIn
        </Link>{" "}
        or reach out via email at{" "}
        <Link
          href={`mailto:${DATA.contact.email}`}
          className="text-blue-500 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          {DATA.contact.email}
        </Link>
      </p>
      {socialLinks.length > 0 && (
        <div className="flex items-center gap-5">
          {socialLinks.map(([name, social]) => (
            <Link
              key={name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              aria-label={social.name}
            >
              <social.icon className="size-6" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
