"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { startSwarm } from "@/lib/swarm";

type Link = { type: string; href: string };
type Spec = { label: string; value: string };
type Project = { title: string; description: string; tech: string[]; links: Link[]; image: string; status: string; specs: Spec[] };
export type SiteData = {
  name: string;
  tagline: string;
  location: string;
  about: { summary: string; highlights: string[]; whatIDo: string[]; favorites: string[]; beyond: string };
  work: { company: string; title: string; start: string; end: string; location: string; description: string; logo: string }[];
  education: { school: string; degree: string; start: string; end: string }[];
  hackathons: { title: string; dates: string; location: string; description: string }[];
  projects: Project[];
  skills: { title: string; items: string[] }[];
  email: string;
  github: string;
  linkedin: string;
  resume: string;
};

/** The drawing set: one sheet per section, numbered in reading order. */
const SHEETS: [id: string, title: string][] = [
  ["top", "General arrangement"],
  ["notes", "General notes"],
  ["drawings", "Detail drawings"],
  ["revisions", "Revision history"],
  ["parts", "Bill of materials"],
  ["signoff", "Sign-off"],
];
const AGENTS = ["ag-07", "ag-03", "ag-11", "ag-05", "ag-14", "ag-09"];
const dwg = (i: number) => `DWG-${String(i + 1).padStart(3, "0")}`;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const when = (s: string) => {
  const [m, y] = s.toLowerCase().split(" ");
  return Number(y) * 12 + MONTHS.indexOf(m.slice(0, 3));
};

function Zones() {
  const cols = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const rows = ["A", "B", "C", "D", "E", "F"];
  return (
    <>
      {(["top", "bottom"] as const).map((p) => (
        <div key={p} aria-hidden className={`zones zones-x ${p}`}>{cols.map((c) => <span key={c}>{c}</span>)}</div>
      ))}
      {(["left", "right"] as const).map((p) => (
        <div key={p} aria-hidden className={`zones zones-y ${p}`}>{rows.map((r) => <span key={r}>{r}</span>)}</div>
      ))}
    </>
  );
}

function TitleBlock({ n, rev, print, extra, build }: { n: number; rev: string; print: string; extra?: [string, string]; build?: boolean }) {
  const fields: [string, string, boolean?][] = [
    ["Drawing", SHEETS[n][1], true],
    ["Sheet", `${n + 1} of ${SHEETS.length}`],
    ["Scale", "1 : 1"],
    ["Drawn", AGENTS[n]],
    ["Checked", "A. Jain"],
    ["Rev", rev],
    extra ?? ["Print", print === "diazo" ? "Diazo" : "Cyanotype"],
  ];
  return (
    <dl {...(build ? { "data-build": "TITLE BLOCK", "data-late": "" } : { "data-reveal": "", "data-hud": "TITLE BLOCK" })} className="tblock ml-auto w-full max-w-[560px]">
      {fields.map(([k, v, wide]) => (
        <div key={k} className={wide ? "wide" : ""}>
          <dt>{k}</dt>
          <dd className="tab">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Sheet({ n, rev, print, children, head }: { n: number; rev: string; print: string; children: ReactNode; head?: ReactNode }) {
  const [id, title] = SHEETS[n];
  return (
    <section id={id} data-sheet={n} aria-labelledby={`${id}-title`} className="px-4 py-20 sm:px-5 md:px-14 md:py-28">
      <div className="sheet mx-auto max-w-[1360px] px-4 pb-6 pt-10 sm:px-5 md:px-12 md:pt-14">
        <Zones />
        {head ?? (
          <div data-reveal className="mb-12 md:mb-16">
            <h2 id={`${id}-title`} className="stencil text-[clamp(2.6rem,7vw,5.5rem)]">{title}</h2>
          </div>
        )}
        {children}
        <div className="mt-14">
          <TitleBlock n={n} rev={rev} print={print} />
        </div>
      </div>
    </section>
  );
}

/** Exploded axonometric of the stack: five isometric plates, each labelled with the projects that live on it. */
const LAYERS: [name: string, tools: string, where: string][] = [
  ["Interfaces", "Next.js, React, Tauri", "Catalyst, EchoTales, ComputeHive"],
  ["Agents and retrieval", "MCP, RAG, tool calling", "StoryTrace, OS-Tutor, Verity"],
  ["Services", "Go, gRPC, FastAPI", "ComputeHive, Cryptic Hunt, Verity"],
  ["Data", "Redis, ClickHouse, PostgreSQL", "ComputeHive, StoryTrace, Cryptic Hunt"],
  ["Infrastructure", "Docker, AWS Lambda, Prometheus", "ComputeHive, Hermes at Palni"],
];
function Axo({ labels, hot, onHot }: { labels: boolean; hot: number; onHot: (i: number) => void }) {
  const cx = 190, w = 168, h = 84, t = 14, gap = 92, top = 92;
  return (
    <svg viewBox={labels ? "0 0 640 580" : "0 0 380 580"} className="axo h-auto w-full" role="img" aria-label="Exploded drawing of the stack, five layers from interfaces down to infrastructure">
      {/* hidden-line connectors between the plates */}
      {[-w, w, 0].map((dx) => (
        <line key={dx} x1={cx + dx} y1={top + (dx === 0 ? h : 0)} x2={cx + dx} y2={top + gap * 4 + (dx === 0 ? h : 0)} stroke="var(--graphite)" strokeDasharray="5 6" strokeWidth={1} pathLength={1} />
      ))}
      {LAYERS.map(([name, tools], i) => {
        const cy = top + i * gap;
        const face = `${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`;
        const right = `${cx + w},${cy} ${cx},${cy + h} ${cx},${cy + h + t} ${cx + w},${cy + t}`;
        const left = `${cx - w},${cy} ${cx},${cy + h} ${cx},${cy + h + t} ${cx - w},${cy + t}`;
        const on = hot === i;
        return (
          <g key={name} onPointerEnter={() => onHot(i)} onPointerLeave={() => onHot(-1)} style={{ cursor: "default" }}>
            <polygon points={left} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.2} pathLength={1} />
            <polygon points={right} fill="var(--print)" stroke="var(--ink)" strokeWidth={1.2} pathLength={1} />
            <polygon points={face} fill={on ? "color-mix(in oklab, var(--hilite) 30%, var(--paper))" : "color-mix(in oklab, var(--print) 55%, var(--paper))"} stroke="var(--ink)" strokeWidth={1.4} pathLength={1} style={{ transition: "fill .3s" }} />
            {/* iso grid on the top face */}
            {[0.25, 0.5, 0.75].map((f) => (
              <g key={f} stroke="var(--graphite)" strokeWidth={0.8} opacity={0.55}>
                <line x1={cx - w * (1 - f)} y1={cy - h * f} x2={cx + w * f} y2={cy + h * (1 - f)} pathLength={1} />
                <line x1={cx + w * (1 - f)} y1={cy - h * f} x2={cx - w * f} y2={cy + h * (1 - f)} pathLength={1} />
              </g>
            ))}
            {labels && (
              <>
                <polyline points={`${cx + w},${cy} ${cx + w + 34},${cy - 26} 404,${cy - 26}`} fill="none" stroke={on ? "var(--hilite)" : "var(--graphite)"} strokeWidth={1} pathLength={1} />
                <circle cx={cx + w} cy={cy} r={3} fill="var(--ink)" />
                <text x={412} y={cy - 30} fill="var(--ink)" fontSize={17} style={{ fontVariationSettings: '"CASL" 0' }}>{name}</text>
                <text x={412} y={cy - 10} fill="var(--graphite)" fontSize={12.5} style={{ fontVariationSettings: '"MONO" 1' }}>{tools}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function Site({ data }: { data: SiteData }) {
  const root = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const agentsRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [hot, setHot] = useState(-1);
  const [signer, setSigner] = useState("");
  const [print, setPrint] = useState<"cyanotype" | "diazo">("cyanotype");

  const [first, ...rest] = data.name.toUpperCase().split(" ");
  const [tagRole, tagBody] = data.tagline.split(/ (?=building)/);
  const tagRest = tagBody ? tagBody[0].toUpperCase() + tagBody.slice(1) : data.tagline;
  const projects = data.projects;
  const awardFor = (p: Project) => data.hackathons.find((h) => h.description.includes(p.title));
  const internships = data.work.filter((w) => /intern/i.test(w.title)).length;
  // "B.Tech in Computer Science and Engineering (CGPA: 8.83)" at "Vellore Institute of Technology (VIT)" -> "B.Tech CSE, VIT, CGPA 8.83"
  const edu = data.education[0];
  const degreeLine = edu
    ? [
        edu.degree.replace(/ in Computer Science and Engineering/, " CSE").replace(/\s*\(CGPA:.*\)/, ""),
        edu.school.match(/\((\w+)\)/)?.[1] ?? edu.school,
        edu.degree.match(/CGPA:\s*([\d.]+)/)?.[1] ? `CGPA ${edu.degree.match(/CGPA:\s*([\d.]+)/)?.[1]}` : "",
      ].filter(Boolean).join(", ")
    : "";

  // revision history: roles, awards and education, oldest = rev A
  const revisions = useMemo(() => {
    const rows = [
      ...data.work.map((w) => ({ kind: "Role", date: `${w.start} to ${w.end}`, at: when(w.start), title: w.title, org: w.company, body: w.description, award: false })),
      ...data.hackathons.map((h) => ({ kind: "Award", date: h.dates, at: when(h.dates), title: h.title, org: h.location, body: h.description, award: true })),
      ...data.education.map((e) => ({ kind: "Education", date: `${e.start} to ${e.end}`, at: when(e.start), title: e.degree, org: e.school, body: "", award: false })),
    ].sort((a, b) => a.at - b.at);
    return rows.map((r, i) => ({ ...r, rev: String.fromCharCode(65 + i) })).reverse();
  }, [data]);
  const latestRev = revisions[0]?.rev ?? "A";

  // bill of materials: every tool on a drawing, with how many drawings use it
  const bom = useMemo(() => {
    const m = new Map<string, number[]>();
    projects.forEach((p, i) => p.tech.forEach((t) => m.set(t, [...(m.get(t) ?? []), i])));
    const rows = [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    const used = new Set(m.keys());
    const stock = [...new Set(data.skills.flatMap((g) => g.items))].filter((s) => ![...used].some((u) => u.toLowerCase() === s.toLowerCase()));
    return { multi: rows.filter(([, v]) => v.length > 1), single: rows.filter(([, v]) => v.length === 1), stock };
  }, [projects, data.skills]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: 0 });
    else el.scrollIntoView();
  };
  const openProject = (i: number) => setOpen(projects[i]);
  const usedOn = (on: number[]) =>
    on.map((j) => (
      <button key={j} type="button" onClick={() => openProject(j)} className="tab whitespace-nowrap text-[13px] text-muted underline decoration-dotted underline-offset-4 hover:text-hud">{dwg(j)}</button>
    ));

  // print (theme): cyanotype by default, diazo on request; remembered per browser
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("print");
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved print is only readable in the browser
    if (saved === "diazo") setPrint("diazo");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = print;
    try {
      localStorage.setItem("print", print);
    } catch {}
  }, [print]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
      lenisRef.current?.stop();
    } else {
      if (d.open) d.close();
      lenisRef.current?.start();
    }
  }, [open]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    gsap.registerPlugin(ScrollTrigger);
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      if (!reduce) {
        const lenis = new Lenis({ lerp: 0.1 });
        lenisRef.current = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        cleanups.push(() => {
          gsap.ticker.remove(raf);
          lenis.destroy();
          lenisRef.current = null;
        });
      }

      const bar = root.current!.querySelector<HTMLElement>("[data-bar]")!;
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => (bar.style.transform = `scaleX(${s.progress})`) });
      SHEETS.forEach(([id], i) =>
        ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setActive(i) }),
      );

      // without a mouse there are no visible agents: sheets simply fade up
      if (!reduce && !fine) {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
          gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }),
        );
      }

      // cursor agents + the hard-reload build
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const build = !reduce && nav?.type !== "back_forward";
      if (!build) {
        root.current!.removeAttribute("data-building");
        gsap.set([overlayRef.current, statusRef.current], { autoAlpha: 0 });
      } else {
        history.scrollRestoration = "manual";
        scrollTo(0, 0);
        lenisRef.current?.scrollTo(0, { immediate: true });
        lenisRef.current?.stop();
      }
      if (!reduce) {
        cleanups.push(
          startSwarm({
            root: root.current!,
            agentsLayer: agentsRef.current!,
            boxLayer: boxesRef.current!,
            overlay: overlayRef.current!,
            status: statusRef.current!,
            bg: null,
            build,
            fine,
            scrollBuild: fine,
            onDone: () => lenisRef.current?.start(),
          }),
        );
      }

      // pointer: zone readout (sheet + grid square under the cursor) and a gentle tilt of the hero drawing
      let raf = 0;
      let px = -1, py = -1;
      const onScrollReadout = () => px >= 0 && onMove({ clientX: px, clientY: py } as PointerEvent);
      const onMove = (e: PointerEvent) => {
        px = e.clientX;
        py = e.clientY;
        if (raf) return;
        const { clientX: x, clientY: y } = e;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const sheet = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>("[data-sheet]");
          if (coordRef.current) {
            if (sheet) {
              const r = sheet.getBoundingClientRect();
              const col = Math.min(8, Math.max(1, Math.ceil(((x - r.left) / r.width) * 8)));
              const row = "ABCDEF"[Math.min(5, Math.max(0, Math.floor(((y - r.top) / r.height) * 6)))];
              coordRef.current.textContent = `Sheet ${Number(sheet.dataset.sheet) + 1}, zone ${row}${col}`;
            } else coordRef.current.textContent = "Off sheet";
          }
          if (tiltRef.current && !reduce) {
            const nx = x / innerWidth - 0.5;
            const ny = y / innerHeight - 0.5;
            tiltRef.current.style.transform = `perspective(1400px) rotateX(${(-ny * 6).toFixed(2)}deg) rotateY(${(nx * 9).toFixed(2)}deg)`;
          }
        });
      };
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("scroll", onScrollReadout, { passive: true });
      cleanups.push(() => {
        removeEventListener("pointermove", onMove);
        removeEventListener("scroll", onScrollReadout);
      });

      if (fine && !reduce) {
        // redline measurement that snaps to whatever [data-hud] element is under the cursor
        const box = boxRef.current!;
        let cur: HTMLElement | null = null;
        const mm = (px: number) => Math.round(px * 0.2646);
        const place = (animate: boolean) => {
          if (!cur) return;
          const r = cur.getBoundingClientRect();
          if (tagRef.current) tagRef.current.textContent = `${cur.dataset.hud || "ITEM"}  ${mm(r.width)} × ${mm(r.height)} mm`;
          gsap.to(box, { x: r.left - 6, y: r.top - 6, width: r.width + 12, height: r.height + 12, duration: animate ? 0.35 : 0, ease: "power3.out", overwrite: "auto" });
        };
        const over = (e: PointerEvent) => {
          const el = (e.target as HTMLElement).closest?.("[data-hud]") as HTMLElement | null;
          if (el && el !== cur) {
            cur = el;
            gsap.to(box, { opacity: 1, duration: 0.2 });
            place(true);
          }
        };
        const out = (e: PointerEvent) => {
          if (!(e.relatedTarget as HTMLElement | null)?.closest?.("[data-hud]")) {
            cur = null;
            gsap.to(box, { opacity: 0, duration: 0.2 });
          }
        };
        const scroll = () => place(false);
        document.addEventListener("pointerover", over);
        document.addEventListener("pointerout", out);
        addEventListener("scroll", scroll, { passive: true });
        cleanups.push(() => {
          document.removeEventListener("pointerover", over);
          document.removeEventListener("pointerout", out);
          removeEventListener("scroll", scroll);
        });
      }
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  const copy = () =>
    navigator.clipboard?.writeText(data.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  const signOff = () => {
    const who = signer.trim() || "a visitor";
    location.href = `mailto:${data.email}?subject=${encodeURIComponent(`Signed off by ${who}`)}&body=${encodeURIComponent(`Hi Adhyan,\n\nI went through the drawing set and wanted to get in touch.\n\n${who}`)}`;
  };
  const statusTone = (s: string) => (/winner|finalist/i.test(s) ? "award" : "markup");

  return (
    <div ref={root} data-building="">
      {/* build: a blank sheet the agents scan before they start drafting */}
      <div id="build" ref={overlayRef} aria-hidden className="fixed inset-0 z-[85] grid place-items-center bg-bg">
        <span className="stencil grid size-10 place-items-center border border-line-strong text-sm text-muted">AJ</span>
      </div>
      <div id="build-status" ref={statusRef} role="status" className="fixed bottom-5 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap border border-line-strong bg-bg/90 px-3 py-2 text-[11px] text-muted backdrop-blur">
        <span className="tab" data-status-text>Plotting sheet 1…</span>
        <span aria-hidden className="relative h-[3px] w-12 bg-line md:w-28">
          <i data-status-bar className="absolute inset-0 origin-left scale-x-0 bg-hud" />
        </span>
        <button data-skip type="button" className="text-text transition-colors hover:text-hud">Skip the plot</button>
      </div>
      <noscript>
        <style>{`#build,#build-status{display:none}[data-building] [data-build]{opacity:1}`}</style>
      </noscript>

      <div data-bar aria-hidden className="fixed left-0 top-0 z-[70] h-[2px] w-full origin-left scale-x-0 bg-hud" />
      <div ref={boxesRef} aria-hidden className="pointer-events-none fixed inset-0 z-[5]" />

      {/* title strip */}
      <header data-build-bg="TITLE STRIP" className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 md:px-10">
          <button onClick={() => go("top")} aria-label="Back to the first sheet" data-hud="MARK" data-build="MARK" className="stencil grid size-9 place-items-center border border-line-strong text-lg">AJ</button>
          <nav aria-label="Sheets" data-build="SHEET INDEX" className="hidden items-center gap-6 text-[13px] text-muted lg:flex">
            {SHEETS.map(([id, t], i) => (
              <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }} aria-current={active === i ? "true" : undefined} className={`transition-colors hover:text-text ${active === i ? "text-text" : ""}`}>
                <span className="tab mr-1.5 text-[11px] text-muted">{i + 1}</span>{t}
              </a>
            ))}
          </nav>
          <div data-build="READOUT" className="flex items-center gap-4 text-[12px] text-muted">
            <span ref={coordRef} aria-hidden className="tab hidden md:inline">Off sheet</span>
            <button type="button" onClick={() => setPrint((p) => (p === "cyanotype" ? "diazo" : "cyanotype"))} className="border border-line-strong px-2.5 py-1 text-text transition-colors hover:border-hud" aria-label={`Switch to the ${print === "cyanotype" ? "diazo (light)" : "cyanotype (dark)"} print`}>
              Print: {print === "cyanotype" ? "cyanotype" : "diazo"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* SHEET 1: general arrangement */}
        <section id="top" data-sheet={0} className="flex min-h-screen items-center px-5 pb-16 pt-24 md:px-14">
          <div className="sheet mx-auto w-full max-w-[1360px] px-5 pb-6 pt-10 md:px-12 md:pt-12">
            <Zones />
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div data-build-bg="ELEVATION" className="lg:col-span-6">
                <h1 data-build="NAME" data-fx="wipe" aria-label={data.name} className="stencil text-[clamp(4.6rem,13vw,10.5rem)]">
                  <span aria-hidden className="block">{first}</span>
                  <span aria-hidden className="block">{rest.join(" ")}</span>
                </h1>
                <div data-build="DIMENSIONS" className="mt-5 max-w-[520px] space-y-3">
                  <p className="dim dim-ends"><span className="tab">{degreeLine}</span></p>
                  <p className="dim dim-ends"><span className="tab">{internships} internships, {projects.length} projects, {data.hackathons.length} hackathon results</span></p>
                </div>
                <p data-build="ROLE" data-fx="type" className="mt-8 text-2xl md:text-3xl">{tagRole}</p>
                <p data-build="TAGLINE" data-fx="type" className="measure mt-3 text-lg leading-relaxed text-muted">{tagRest}.</p>
                <div data-build="ACTIONS" className="mt-8 flex flex-wrap gap-3">
                  <button onClick={() => go("drawings")} data-hud="DRAWINGS" className="bg-text px-5 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5">
                    See the drawings
                  </button>
                  {data.resume && (
                    <a href={data.resume} target="_blank" rel="noreferrer" data-hud="RESUME" className="border border-line-strong px-5 py-3 text-sm transition-colors hover:border-hud">
                      Résumé
                    </a>
                  )}
                </div>
              </div>
              <div data-build-bg="ISOMETRIC" className="lg:col-span-6">
                <div data-build="ISOMETRIC" data-fx="plot" data-late className="relative">
                  <div ref={tiltRef} className="axo-tilt">
                    <div className="hidden md:block"><Axo labels hot={hot} onHot={setHot} /></div>
                    <div className="md:hidden"><Axo labels={false} hot={hot} onHot={setHot} /></div>
                  </div>
                  <ol className="mt-4 space-y-2 text-sm md:hidden">
                    {LAYERS.map(([n, t], i) => (
                      <li key={n} className="flex gap-3"><span className="tab text-muted">{i + 1}</span><span>{n}<span className="block text-muted">{t}</span></span></li>
                    ))}
                  </ol>
                  <p className="casual mt-3 text-sm text-accent md:absolute md:bottom-2 md:right-2 md:mt-0" aria-live="polite">
                    {hot >= 0 ? `Used by ${LAYERS[hot][2]}` : "Hover a plate to see which projects sit on it"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <TitleBlock n={0} rev={latestRev} print={print} build extra={["Location", data.location.split(",")[0]]} />
            </div>
          </div>
        </section>

        {/* SHEET 2: general notes */}
        <Sheet n={1} rev={latestRev} print={print}>
          <div className="grid gap-12 lg:grid-cols-12">
            <ol className="space-y-8 lg:col-span-7">
              {[data.about.summary, ...data.about.whatIDo].map((note, i) => (
                <li key={note} data-reveal data-hud={`NOTE ${i + 1}`} className="grid grid-cols-[2.5rem_1fr] gap-2">
                  <span className="tab pt-1 text-muted">{i + 1}.</span>
                  <p className={i === 0 ? "measure text-xl leading-relaxed md:text-2xl" : "measure leading-relaxed text-muted"}>{note}</p>
                </li>
              ))}
            </ol>
            <div className="space-y-4 lg:col-span-5">
              {data.about.highlights.map((h) => (
                <p key={h} data-reveal data-hud="SPEC" className="border border-line-strong p-5 text-sm leading-relaxed">{h}</p>
              ))}
              <p data-reveal className="casual pt-4 text-lg leading-snug text-accent">
                <span aria-hidden className="mr-2">↳</span>{data.about.beyond}
              </p>
            </div>
          </div>
        </Sheet>

        {/* SHEET 3: detail drawings, in rank order */}
        <Sheet n={2} rev={latestRev} print={print}>
          <div className="grid gap-6 lg:grid-cols-2">
            {projects.map((p, i) => {
              const award = awardFor(p);
              return (
                <button key={p.title} onClick={() => openProject(i)} data-reveal data-hud={dwg(i)} className="group flex flex-col border border-line-strong bg-bg/60 text-left transition-colors hover:border-hud">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[12px] text-muted">
                    <span className="tab">{dwg(i)}</span>
                    <span className="stamp" data-tone={statusTone(p.status)}>{p.status}</span>
                  </div>
                  <div className={`relative aspect-[16/9] ${p.image ? "cyano" : "blank-plate grid place-items-center p-6"}`}>
                    {p.image ? (
                      <img src={p.image} alt={`${p.title} screenshot`} className="size-full object-cover object-top" />
                    ) : (
                      <span aria-hidden className="stencil text-center text-[clamp(2.6rem,6vw,4.4rem)] text-muted">{p.title}</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {award && <p className="mb-1 text-sm text-hud">{award.title}</p>}
                    <h3 className="stencil text-[2.1rem]">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted">{p.description}</p>
                    <dl className="mt-4 space-y-1.5 text-[13px]">
                      {p.specs.map((s) => (
                        <div key={s.label} className="flex items-baseline gap-2">
                          <dt className="text-muted">{s.label}</dt>
                          <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-line-strong" />
                          <dd className="tab text-right">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-5">{p.tech.slice(0, 5).map((t) => <span key={t} className="chip">{t}</span>)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Sheet>

        {/* SHEET 4: revision history */}
        <Sheet n={3} rev={latestRev} print={print}>
          <div className="border-t border-line-strong">
            <div className="hidden grid-cols-[4rem_10rem_1fr_7rem] gap-6 border-b border-line-strong px-3 py-2.5 text-[12px] text-muted md:grid">
              <span>Rev</span><span>Date</span><span>Change</span><span className="text-right">Type</span>
            </div>
            {revisions.map((r) => (
              <article key={r.rev} data-reveal data-hud={`REV ${r.rev}`} className="grid gap-2 border-b border-line px-3 py-6 md:grid-cols-[4rem_10rem_1fr_7rem] md:gap-6">
                <span className="stencil text-3xl">{r.rev}</span>
                <span className="tab pt-1 text-sm text-muted">{r.date}</span>
                <div>
                  <h3 className="text-lg">{r.title}</h3>
                  <p className="text-sm text-muted">{r.org}</p>
                  {r.body && <p className="measure mt-3 text-[15px] leading-relaxed text-muted">{r.body}</p>}
                </div>
                <span className="md:text-right">{r.award ? <span className="stamp" data-tone="award">Approved</span> : <span className="text-sm text-muted">{r.kind}</span>}</span>
              </article>
            ))}
          </div>
        </Sheet>

        {/* SHEET 5: bill of materials, computed from the drawings */}
        <Sheet n={4} rev={latestRev} print={print}>
          <div data-reveal data-hud="PARTS LIST" className="overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr><th className="w-14">Item</th><th>Part</th><th className="w-16">Qty</th><th className="hidden sm:table-cell">Used on</th></tr>
              </thead>
              <tbody>
                {bom.multi.map(([part, on], i) => (
                  <tr key={part}>
                    <td className="tab text-muted">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      {part}
                      {/* on phones the drawing links sit under the part instead of in their own column */}
                      <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 sm:hidden">{usedOn(on)}</span>
                    </td>
                    <td className="tab">{on.length}</td>
                    <td className="hidden sm:table-cell"><span className="flex flex-wrap gap-x-3 gap-y-1">{usedOn(on)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div data-reveal data-hud="SINGLE-USE PARTS">
              <h3 className="mb-4 text-lg">Used on one drawing</h3>
              <ul className="flex flex-wrap gap-2">
                {bom.single.map(([part, [j]]) => (
                  <li key={part}><button type="button" onClick={() => openProject(j)} className="chip hover:border-hud hover:text-text">{part} <span className="opacity-60">{dwg(j)}</span></button></li>
                ))}
              </ul>
            </div>
            <div data-reveal data-hud="STOCK">
              <h3 className="mb-4 text-lg">In stock, not on these drawings</h3>
              <ul className="flex flex-wrap gap-2">{bom.stock.map((s) => <li key={s} className="chip">{s}</li>)}</ul>
            </div>
          </div>
        </Sheet>

        {/* SHEET 6: sign-off */}
        <Sheet
          n={5}
          rev={latestRev}
          print={print}
          head={
            <div data-reveal className="mb-10">
              <h2 id="signoff-title" className="stencil text-[clamp(3.4rem,11vw,9rem)]">Sign-off</h2>
            </div>
          }
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <form data-reveal data-hud="APPROVAL" onSubmit={(e) => { e.preventDefault(); signOff(); }} className="min-w-0 border border-line-strong p-5 lg:col-span-7 md:p-8">
              <p className="measure text-lg leading-relaxed">If the set looks right to you, sign it off. It opens an email to me with your name on it.</p>
              <label htmlFor="signer" className="mt-8 block text-sm text-muted">Approved by</label>
              <input id="signer" value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="Your name" autoComplete="name" className="casual mt-2 w-full border-b border-line-strong bg-transparent py-2 text-3xl outline-none placeholder:text-muted/60 focus:border-hud" />
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="submit" className="bg-text px-5 py-3 text-sm font-medium text-bg">Sign and email</button>
                <button type="button" onClick={copy} className="tab max-w-full break-all border border-line-strong px-5 py-3 text-left text-sm hover:border-hud">{copied ? "Email copied" : data.email}</button>
              </div>
            </form>
            <ul data-reveal className="min-w-0 space-y-3 lg:col-span-5">
              {[
                ["LinkedIn", data.linkedin],
                ["GitHub", data.github],
                ["Résumé", data.resume],
              ].filter(([, h]) => h).map(([k, h]) => (
                <li key={k}>
                  <a href={h} target="_blank" rel="noreferrer" data-hud={k.toUpperCase()} className="flex items-baseline gap-3 border-b border-line py-3 text-lg hover:text-hud">
                    {k}
                    <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-line-strong" />
                    <span className="tab text-sm text-muted">{h.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}</span>
                  </a>
                </li>
              ))}
              <li className="pt-6 text-sm text-muted">© {new Date().getFullYear()} {data.name}, {data.location}</li>
            </ul>
          </div>
        </Sheet>
      </main>

      {/* redline measurement that follows the hovered element */}
      <div ref={boxRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[55] border border-accent opacity-0" style={{ width: 0, height: 0 }}>
        {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((c) => (
          <i key={c} className={`absolute size-2 border border-accent bg-bg ${c}`} />
        ))}
        <span ref={tagRef} className="tab absolute -top-6 left-0 whitespace-pre bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-bg" />
      </div>

      <div ref={agentsRef} aria-hidden className="pointer-events-none fixed inset-0 z-[90]" />

      {/* a project opened as its full drawing */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        aria-label={open?.title}
        // Lenis is stopped while the dialog is open and cancels every wheel event; this lets the dialog scroll natively
        data-lenis-prevent
        className="m-auto max-h-[88vh] w-[min(980px,94vw)] overflow-auto overscroll-contain border border-line-strong bg-bg p-0 text-text"
      >
        {open && (
          <div>
            <div className="flex items-center justify-between border-b border-line px-5 py-3 text-sm text-muted">
              <span className="tab">{dwg(projects.indexOf(open))}</span>
              <button onClick={() => dialogRef.current?.close()} className="border border-line-strong px-3 py-1 text-text hover:border-hud">Close</button>
            </div>
            {open.image && <img src={open.image} alt={`${open.title} screenshot`} className="aspect-[16/9] w-full object-cover object-top" />}
            <div className="space-y-6 p-6 md:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h3 className="stencil text-5xl md:text-6xl">{open.title}</h3>
                <span className="stamp" data-tone={statusTone(open.status)}>{open.status}</span>
              </div>
              <p className="measure leading-relaxed text-muted">{open.description}</p>
              <dl className="max-w-xl space-y-2 text-sm">
                {open.specs.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-2">
                    <dt className="text-muted">{s.label}</dt>
                    <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-line-strong" />
                    <dd className="tab">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-1.5">{open.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              {open.links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {open.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="bg-text px-5 py-2.5 text-sm font-medium text-bg">
                      {l.type === "Source" ? "View source" : "Open website"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
