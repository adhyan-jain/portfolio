export type Link = {
  label: string;
  href: string;
};

export type Social = Link & {
  /** Chooses which inline SVG to render; unknown values fall back to a generic glyph. */
  icon: "resume" | "github" | "linkedin" | "x" | "email" | (string & {});
};

export type Config = {
  meta: {
    title: string;
    description: string;
    faviconEmoji: string;
    siteUrl: string;
    ogImage: string;
  };
  profile: {
    initials: string;
    name: string;
    greeting: string;
    headline: string;
    tagline: string;
    quote: { text: string; author: string };
    avatar: string;
    location: string;
    availability: string;
  };
  nav: Link[];
  hero: {
    primaryCta: Link;
    secondaryCta: Link;
  };
  about: {
    heading: string;
    subheading: string;
    paragraphs: string[];
    highlights: { label: string; value: string }[];
  };
  technologies: {
    heading: string;
    subheading: string;
    groups: { category: string; items: string[] }[];
  };
  skills: {
    heading: string;
    subheading: string;
    items: { icon: string; title: string; description: string }[];
  };
  experience: {
    heading: string;
    subheading: string;
    items: {
      role: string;
      company: string;
      companyUrl: string;
      location: string;
      start: string;
      end: string;
      description: string;
      bullets: string[];
      tech: string[];
    }[];
  };
  education: {
    heading: string;
    subheading: string;
    items: {
      degree: string;
      institution: string;
      institutionUrl: string;
      location: string;
      start: string;
      end: string;
      score: string;
      details: string;
    }[];
  };
  projects: {
    heading: string;
    subheading: string;
    items: {
      name: string;
      description: string;
      tech: string[];
      image: string;
      repoUrl: string;
      liveUrl: string;
      featured: boolean;
    }[];
  };
  interests: {
    heading: string;
    subheading: string;
    items: { icon: string; label: string }[];
  };
  contact: {
    heading: string;
    subheading: string;
    email: string;
    ctaLabel: string;
  };
  socials: Social[];
  footer: {
    note: string;
    copyright: string;
  };
};
