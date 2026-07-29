import { config, filled, isBlank } from "@/lib/config";
import { Section, ButtonLink } from "../ui";
import { SocialIcon, MailIcon } from "../icons";
import Reveal from "../Reveal";

export default function Contact() {
  const contact = config.contact ?? {};
  const links = filled(config.socials).filter(
    (social) => !isBlank(social.href) && !isBlank(social.label),
  );
  const hasEmail = !isBlank(contact.email);

  return (
    <Section
      id="contact"
      heading={contact.heading}
      subheading={contact.subheading}
      show={hasEmail || links.length > 0}
      centered
    >
      {hasEmail && (
        <Reveal>
          <ButtonLink href={`mailto:${contact.email}`} variant="primary" size="lg">
            <MailIcon />
            {isBlank(contact.ctaLabel) ? contact.email : contact.ctaLabel}
          </ButtonLink>
        </Reveal>
      )}

      {links.length > 0 && (
        <Reveal delay={80}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {links.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <SocialIcon name={social.icon} />
                {social.label}
              </a>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  );
}
