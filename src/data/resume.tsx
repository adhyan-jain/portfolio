import type { ComponentType, ReactNode } from "react";
import { HomeIcon, FileTextIcon } from "lucide-react";
import { Icons } from "@/components/icons";
import data from "@/../config/portfolio.json";

import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
import { Kubernetes } from "@/components/ui/svgs/kubernetes";
import { Java } from "@/components/ui/svgs/java";
import { Csharp } from "@/components/ui/svgs/csharp";

/*
 * All content lives in config/portfolio.json. Icons cannot be expressed in
 * JSON, so entries name an icon and this module resolves it to a component.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIcon = ComponentType<any>;

const SKILL_ICONS: Record<string, AnyIcon> = {
  react: ReactLight,
  nextjs: NextjsIconDark,
  typescript: Typescript,
  nodejs: Nodejs,
  python: Python,
  go: Golang,
  golang: Golang,
  postgres: Postgresql,
  postgresql: Postgresql,
  docker: Docker,
  kubernetes: Kubernetes,
  java: Java,
  csharp: Csharp,
};

const SOCIAL_ICONS: Record<string, AnyIcon> = {
  github: Icons.github,
  linkedin: Icons.linkedin,
  x: Icons.x,
  youtube: Icons.youtube,
  email: Icons.email,
  globe: Icons.globe,
  notion: Icons.notion,
  whatsapp: Icons.whatsapp,
  googleDrive: Icons.googleDrive,
};

/** Falls back to a globe so an unknown or blank icon name never crashes. */
const socialIcon = (name: string): AnyIcon => SOCIAL_ICONS[name] ?? Icons.globe;

type RawSocial = {
  name: string;
  url: string;
  icon: string;
  navbar: boolean;
};

const social = Object.fromEntries(
  Object.entries(data.contact.social as Record<string, RawSocial>).map(
    ([key, value]) => [
      key,
      {
        name: value.name,
        url: value.url,
        icon: socialIcon(value.icon),
        // A link with no URL is hidden from the dock rather than rendered dead.
        navbar: value.navbar && value.url.trim() !== "",
      },
    ],
  ),
);

const navbar = [
  { href: "/", icon: HomeIcon, label: "Home" },
  ...(data.resumeUrl?.trim()
    ? [{ href: data.resumeUrl, icon: FileTextIcon, label: "Resume" }]
    : []),
];

const skills = data.skills
  .filter((skill) => skill.name.trim() !== "")
  .map((skill) => ({
    name: skill.name,
    icon: SKILL_ICONS[skill.icon.toLowerCase()],
  }));

type Hackathon = {
  title: string;
  dates: string;
  location: string;
  description: string;
  image?: string;
  links?: { title: string; href: string; icon?: ReactNode }[];
};

/** Drops entries whose every string field is still blank. */
const present = <T extends Record<string, unknown>>(items: T[]): T[] =>
  items.filter((item) =>
    Object.values(item).some(
      (value) => typeof value === "string" && value.trim() !== "",
    ),
  );

const projects = present(data.projects).map((project) => ({
  ...project,
  links: (project.links ?? [])
    .filter((link) => link.href.trim() !== "")
    .map((link) => ({
      type: link.type,
      href: link.href,
      icon: iconNode(link.icon),
    })),
}));

function iconNode(name: string): ReactNode {
  const Icon = socialIcon(name);
  return <Icon className="size-3" />;
}

export const DATA = {
  name: data.name,
  initials: data.initials,
  url: data.url,
  location: data.location,
  locationLink: data.locationLink,
  description: data.description,
  summary: data.summary,
  avatarUrl: data.avatarUrl,
  skills,
  navbar,
  contact: {
    email: data.contact.email,
    tel: data.contact.tel,
    social,
  },
  work: present(data.work),
  education: present(data.education),
  projects,
  hackathons: present((data.hackathons ?? []) as Hackathon[]),
} as const;
