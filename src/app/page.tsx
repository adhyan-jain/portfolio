import Site, { type SiteData } from "@/components/site";
import { DATA } from "@/data/resume";

const clean = (s: string) => s.replace(/\*\*/g, "").replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, "").trim();

const GROUPS: [string, RegExp][] = [
  ["Languages", /^(Python|Go$|JavaScript|C\+\+|Java$|C#)/],
  ["AI & LLM", /LangChain|LangGraph|MCP|RAG|LLM|Ollama/],
  ["ML", /TensorFlow|PyTorch|scikit/],
  ["Data", /Qdrant|FAISS|Pinecone|PostgreSQL|MongoDB|Redis|Firebase/],
  ["Web", /React|Next|Node|Express|Flask/],
  ["Infra", /Docker|AWS|gRPC|GitHub|CI\/CD/],
];

export default function Page() {
  const names = DATA.skills.map((s) => s.name);
  const skills = GROUPS.map(([title, re]) => ({ title, items: names.filter((n) => re.test(n)) })).filter((g) => g.items.length);

  const data: SiteData = {
    name: DATA.name,
    tagline: clean(DATA.description),
    location: DATA.location,
    about: {
      summary: clean(DATA.about.summary),
      highlights: DATA.about.highlights.map((h) => clean(h.text)),
      whatIDo: DATA.about.whatIDo.map(clean),
      favorites: [...DATA.about.favoriteTechnologies],
      beyond: clean(DATA.about.beyondTech.text),
    },
    work: DATA.work.map((w) => ({
      company: w.company, title: w.title, start: w.start, end: w.end, location: w.location,
      description: clean(w.description), logo: w.logoUrl,
    })),
    education: DATA.education.map((e) => ({ school: e.school, degree: e.degree, start: e.start, end: e.end })),
    hackathons: DATA.hackathons.map((h) => ({ title: h.title, dates: h.dates, location: h.location, description: clean(h.description) })),
    projects: DATA.projects
      .filter((p) => p.active)
      .map((p) => ({
        title: p.title,
        description: clean(p.description),
        tech: [...p.technologies],
        links: p.links.map((l) => ({ type: l.type, href: l.href })),
        image: p.image || "",
        status: p.status,
        specs: p.specs.map((s) => ({ label: s.label, value: s.value })),
      })),
    skills,
    email: DATA.contact.email,
    github: DATA.contact.social.GitHub?.url ?? "",
    linkedin: DATA.contact.social.LinkedIn?.url ?? "",
    resume: DATA.navbar.find((n) => n.label === "Resume")?.href ?? "",
  };
  return <Site data={data} />;
}
