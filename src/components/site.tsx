"use client";
/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { signal } from "@/lib/signal";

const Scene = dynamic(() => import("./scene"), { ssr: false });

type Link = { type: string; href: string };
type Project = { title: string; description: string; tech: string[]; links: Link[]; image: string };
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

const SECTIONS: [string, string][] = [
  ["top", "Intro"],
  ["about", "About"],
  ["work", "Work"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["contact", "Contact"],
];

function Head({ n, label, title }: { n: string; label: string; title: string }) {
  return (
    <div className="mb-12 md:mb-16" data-reveal>
      <p className="label mb-4">
        {"//"}{n} {label}
      </p>
      <h2 className="display text-[clamp(2.8rem,8vw,7rem)]">{title}</h2>
    </div>
  );
}

export default function Site({ data }: { data: SiteData }) {
  const root = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [active, setActive] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const [clock, setClock] = useState("");
  const [open, setOpen] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  const [first, ...rest] = data.name.toUpperCase().split(" ");
  const [tagRole, tagBody] = data.tagline.split(/ (?=building)/);
  const tagRest = tagBody ? tagBody[0].toUpperCase() + tagBody.slice(1) : data.tagline;
  const flagship = data.projects.find((p) => p.title === "Shadow-Code") ?? data.projects.find((p) => p.image);
  const plates = data.projects.filter((p) => p.image && p !== flagship);
  const matrix = data.projects.filter((p) => !p.image);
  const award = flagship ? data.hackathons.find((h) => h.description.includes(flagship.title)) : undefined;

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: 0 });
    else el.scrollIntoView();
  };

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      const c = document.createElement("canvas");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check needs the browser; SSR renders without it
      setWebgl(!reduce && !!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      /* no WebGL: CSS background only */
    }
    const tick = () =>
      setClock(new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

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
      // ---- smooth scroll, synced with ScrollTrigger
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

      // ---- scroll -> scene + progress + active section
      const bar = root.current!.querySelector<HTMLElement>("[data-bar]")!;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (s) => {
          signal.scroll = s.progress;
          signal.burst = s.progress > 0.975 ? 0.9 : signal.burst > 0.5 ? signal.burst : 0;
          bar.style.transform = `scaleX(${s.progress})`;
        },
      });
      SECTIONS.forEach(([id], i) =>
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (s) => s.isActive && setActive(i),
        }),
      );
      ScrollTrigger.create({
        trigger: "#contact",
        start: "top 70%",
        onToggle: (s) => (signal.mix = s.isActive ? 1 : 0),
      });

      // ---- reveals
      if (!reduce) {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
          gsap.from(el, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }),
        );
        gsap.to(".marquee-track", { xPercent: -50, repeat: -1, ease: "none", duration: 32 });
      }

      // ---- loader -> hero intro
      const loader = loaderRef.current!;
      const intro = () => {
        gsap.from("[data-hero]", { y: 70, opacity: 0, stagger: 0.09, duration: 1.2, ease: "power4.out" });
        gsap.to(signal, { burst: 0, duration: 2.4, ease: "power3.out" });
      };
      if (reduce || sessionStorage.getItem("sig")) {
        gsap.set(loader, { display: "none" });
        signal.burst = 0;
      } else {
        signal.burst = 1;
        const o = { v: 0 };
        gsap.to(o, {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(o.v)).padStart(3, "0");
          },
          onComplete: () => {
            sessionStorage.setItem("sig", "1");
            intro();
            gsap.to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: () => gsap.set(loader, { display: "none" }) });
          },
        });
      }

      // ---- portrait glitch slices
      if (!reduce) {
        gsap.utils.toArray<HTMLElement>(".slice").forEach((s, i) => {
          gsap.set(s, { clipPath: "inset(0% 0% 100% 0%)" });
          const loop = () => {
            const top = Math.random() * 80;
            const h = 6 + Math.random() * 16;
            gsap.set(s, { clipPath: `inset(${top}% 0% ${100 - top - h}% 0%)` });
            gsap.to(s, {
              x: (Math.random() - 0.5) * 46,
              duration: 0.12,
              yoyo: true,
              repeat: 3,
              onComplete: () => {
                gsap.set(s, { x: 0, clipPath: "inset(0% 0% 100% 0%)" });
                gsap.delayedCall(1 + Math.random() * 2.5, loop);
              },
            });
          };
          gsap.delayedCall(1.8 + i * 0.5, loop);
        });
      }

      // ---- pointer: scene repel + headline fill
      const onMove = (e: PointerEvent) => {
        signal.px = (e.clientX / innerWidth) * 2 - 1;
        signal.py = -((e.clientY / innerHeight) * 2 - 1);
        const t = titleRef.current;
        if (t) {
          const r = t.getBoundingClientRect();
          t.style.setProperty("--mx", `${e.clientX - r.left}px`);
          t.style.setProperty("--my", `${e.clientY - r.top}px`);
        }
      };
      addEventListener("pointermove", onMove);
      cleanups.push(() => removeEventListener("pointermove", onMove));

      if (fine && !reduce) {
        // ---- cursor swarm
        const arrows = gsap.utils.toArray<HTMLElement>("[data-arrow]");
        const target = { x: innerWidth / 2, y: innerHeight / 2 };
        const st = arrows.map(() => ({ x: target.x, y: target.y }));
        gsap.set(arrows, { opacity: 0 });
        const move = (e: PointerEvent) => {
          target.x = e.clientX;
          target.y = e.clientY;
          gsap.to(arrows, { opacity: (i: number) => 1 - i * 0.13, duration: 0.4, overwrite: "auto" });
        };
        addEventListener("pointermove", move);
        const follow = () =>
          arrows.forEach((a, i) => {
            const f = 0.34 - i * 0.04;
            st[i].x += (target.x - st[i].x) * f;
            st[i].y += (target.y - st[i].y) * f;
            gsap.set(a, { x: st[i].x + i * 9, y: st[i].y + i * 6 });
          });
        gsap.ticker.add(follow);
        cleanups.push(() => {
          removeEventListener("pointermove", move);
          gsap.ticker.remove(follow);
        });

        // ---- selection HUD that snaps to [data-hud] elements
        const box = boxRef.current!;
        let cur: HTMLElement | null = null;
        const place = (animate: boolean) => {
          if (!cur) return;
          const r = cur.getBoundingClientRect();
          gsap.to(box, { x: r.left - 6, y: r.top - 6, width: r.width + 12, height: r.height + 12, duration: animate ? 0.35 : 0, ease: "power3.out", overwrite: "auto" });
        };
        const over = (e: PointerEvent) => {
          const el = (e.target as HTMLElement).closest?.("[data-hud]") as HTMLElement | null;
          if (el && el !== cur) {
            cur = el;
            if (tagRef.current) tagRef.current.textContent = el.dataset.hud || "ITEM";
            gsap.to(box, { opacity: 1, duration: 0.2 });
            place(true);
          }
        };
        const out = (e: PointerEvent) => {
          const to = (e.relatedTarget as HTMLElement | null)?.closest?.("[data-hud]");
          if (!to) {
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

  const label = SECTIONS[active][1];

  return (
    <div ref={root}>
      {/* loader */}
      <div id="loader" ref={loaderRef} className="fixed inset-0 z-[100] grid place-items-center bg-bg">
        <div className="relative px-10 py-6 text-center">
          <span ref={countRef} className="display block text-[24vw] leading-none text-accent md:text-[16vw]">000</span>
          <p className="label mt-2">initialising signal</p>
          {["-left-1 -top-1 border-l border-t", "-right-1 -top-1 border-r border-t", "-bottom-1 -left-1 border-b border-l", "-bottom-1 -right-1 border-b border-r"].map((c) => (
            <i key={c} className={`absolute size-4 border-hud ${c}`} />
          ))}
        </div>
      </div>
      <noscript>
        <style>{`#loader{display:none}`}</style>
      </noscript>

      {/* fixed layers */}
      <div aria-hidden className="fixed inset-0 z-0 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(255,74,28,.12),transparent),radial-gradient(40%_40%_at_10%_90%,rgba(90,215,255,.06),transparent)]">
        {webgl && <Scene />}
      </div>
      <div data-bar aria-hidden className="fixed left-0 top-0 z-[70] h-[2px] w-full origin-left scale-x-0 bg-accent" />

      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-bg via-bg/70 to-transparent px-5 pb-8 pt-4 md:px-12">
        <button onClick={() => go("top")} aria-label="Back to top" data-hud="HOME" className="display grid size-9 place-items-center bg-accent text-lg text-bg">
          AJ
        </button>
        <nav aria-label="Primary" className="mono hidden gap-8 text-[11px] uppercase tracking-[.18em] text-muted md:flex">
          {SECTIONS.slice(1).map(([id, l]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                go(id);
              }}
              className="transition-colors hover:text-text"
            >
              {l}
            </a>
          ))}
        </nav>
        <span className="mono text-[11px] uppercase tracking-[.14em] text-muted">
          <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-accent" />
          Vellore · {clock || "--:--"} IST
        </span>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section id="top" className="relative flex min-h-screen items-center px-5 pb-28 pt-28 md:px-12">
          <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p data-hero className="font-script -rotate-3 text-4xl text-text md:text-5xl">Hello, I&apos;m</p>
              <h1 ref={titleRef} aria-label={data.name} data-hero className="display relative mt-2 text-[clamp(5rem,19.5vw,19rem)]">
                <span aria-hidden className="outline-text block">
                  {first}
                  <br />
                  {rest.join(" ")}
                </span>
                <span aria-hidden className="fill-text">
                  {first}
                  <br />
                  {rest.join(" ")}
                </span>
              </h1>
              <p data-hero className="display mt-6 inline-block bg-accent px-4 py-1 text-2xl text-bg md:text-3xl">
                {tagRole}
              </p>
              <p data-hero className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{tagRest}.</p>
              <div data-hero className="mt-8 flex flex-wrap gap-3">
                <a href="#projects" onClick={(e) => { e.preventDefault(); go("projects"); }} data-hud="WORK" className="mono bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[.16em] text-bg transition-transform hover:-translate-y-0.5">
                  See the work →
                </a>
                {data.resume && (
                  <a href={data.resume} target="_blank" rel="noreferrer" data-hud="RESUME" className="mono border border-line px-6 py-3 text-xs uppercase tracking-[.16em] transition-colors hover:border-accent hover:text-accent">
                    Resume
                  </a>
                )}
              </div>
            </div>

            <div data-hero className="lg:col-span-4">
              <div data-hud="PORTRAIT" className="portrait mx-auto aspect-[4/5] w-full max-w-sm">
                <span className="mono-text" role="img" aria-label={`${data.name} monogram`}>{first[0]}{rest[0]?.[0]}</span>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="slice" aria-hidden>{first[0]}{rest[0]?.[0]}</span>
                ))}
                <span className="mono absolute bottom-3 left-3 z-10 bg-bg px-2 py-1 text-[10px] uppercase tracking-[.16em] text-accent">● {data.location.split(",")[0]}</span>
              </div>
              <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2">
                {[
                  [data.projects.length, "Projects"],
                  [data.work.length, "Roles"],
                  [data.hackathons.length, "Hackathons"],
                ].map(([n, l]) => (
                  <div key={l} data-hud={String(l).toUpperCase()} className="card px-3 py-3 text-center">
                    <p className="display text-3xl text-accent">{n}</p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[.14em] text-muted">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="px-5 py-28 md:px-12 md:py-40">
          <div className="mx-auto max-w-[1400px]">
            <Head n="01" label="About" title="Built end to end." />
            <div className="grid gap-12 lg:grid-cols-12">
              <p data-reveal className="text-2xl leading-snug md:text-3xl lg:col-span-7">{data.about.summary}</p>
              <div className="space-y-3 lg:col-span-5">
                {data.about.highlights.map((h) => (
                  <p key={h} data-reveal data-hud="FACT" className="card p-5 text-sm leading-relaxed text-muted">{h}</p>
                ))}
              </div>
            </div>
            <ol className="mt-16 grid gap-px border border-line bg-line md:grid-cols-2">
              {data.about.whatIDo.map((w, i) => (
                <li key={w} data-reveal className="flex gap-5 bg-bg/90 p-6">
                  <span className="mono text-xs text-accent">0{i + 1}</span>
                  <span className="text-muted">{w}</span>
                </li>
              ))}
            </ol>
            <div className="mt-16 overflow-hidden border-y border-line py-5" aria-hidden>
              <div className="marquee-track display flex w-max gap-12 text-4xl text-text/80 md:text-6xl">
                {[...data.about.favorites, ...data.about.favorites].map((f, i) => (
                  <span key={i} className={i % 2 ? "outline-text" : ""}>{f} <span className="text-accent">/</span></span>
                ))}
              </div>
            </div>
            <p className="mono mt-8 text-sm text-muted"><span className="text-accent">&gt;</span> {data.about.beyond}<span className="ml-1 animate-pulse text-accent">_</span></p>
          </div>
        </section>

        {/* WORK */}
        <section id="work" className="px-5 py-28 md:px-12 md:py-40">
          <div className="mx-auto max-w-[1400px]">
            <Head n="02" label="Work" title="Where I've shipped." />
            <div className="space-y-4">
              {data.work.map((w) => (
                <article key={w.company} data-reveal data-hud={w.company.toUpperCase()} className="card grid gap-6 p-6 md:grid-cols-12 md:p-8">
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-3">
                      {w.logo && <img src={w.logo} alt="" className="size-9 rounded bg-white/90 object-contain p-1" />}
                      <h3 className="display text-3xl">{w.company}</h3>
                    </div>
                    <p className="mt-3 text-text">{w.title}</p>
                    <p className="mono mt-1 text-xs text-muted">{w.start} — {w.end} · {w.location}</p>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted md:col-span-8">{w.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {data.education.map((e) => (
                <div key={e.school} data-reveal data-hud="EDUCATION" className="card p-6">
                  <p className="label mb-3">Education</p>
                  <p className="text-lg">{e.school}</p>
                  <p className="mt-1 text-sm text-muted">{e.degree}</p>
                  <p className="mono mt-3 text-xs text-muted">{e.start} — {e.end}</p>
                </div>
              ))}
              {data.hackathons.map((h) => (
                <div key={h.title} data-reveal data-hud="HACKATHON" className="card p-6">
                  <p className="label mb-3">{h.dates}</p>
                  <p className="text-lg">{h.title}</p>
                  <p className="mt-1 text-sm text-muted">{h.location}</p>
                  <p className="mt-3 text-sm text-muted">{h.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="px-5 py-28 md:px-12 md:py-40">
          <div className="mx-auto max-w-[1400px]">
            <Head n="03" label="Projects" title="Selected work." />

            {flagship && (
              <button onClick={() => setOpen(flagship)} data-reveal data-hud="FLAGSHIP" className="plate card relative mb-6 grid w-full overflow-hidden text-left lg:grid-cols-12">
                <div className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto">
                  <img src={flagship.image} alt={`${flagship.title} screenshot`} className="size-full object-cover object-top" />
                </div>
                <div className="flex flex-col justify-between gap-8 p-6 md:p-10 lg:col-span-5">
                  <div>
                    <p className="label mb-3">Flagship</p>
                    <h3 className="display text-5xl md:text-6xl">{flagship.title}</h3>
                    <p className="mt-4 line-clamp-5 text-muted">{flagship.description}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Award", award?.title ?? "—"],
                      ["Scale", award?.location.match(/[\d,]+\+? participants/)?.[0] ?? "—"],
                      ["Stack", `${flagship.tech.length} tools`],
                    ].map(([k, v]) => (
                      <div key={k} className="border border-line p-3">
                        <p className="mono text-[10px] uppercase tracking-[.14em] text-accent">{k}</p>
                        <p className="mt-1 text-sm leading-tight">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            )}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plates.map((p) => (
                <button key={p.title} onClick={() => setOpen(p)} data-reveal data-hud={p.title.toUpperCase()} className="plate card relative overflow-hidden text-left">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={p.image} alt={`${p.title} screenshot`} className="size-full object-cover object-top" />
                  </div>
                  <div className="p-5">
                    <h3 className="display text-3xl">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{p.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">{p.tech.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}</div>
                  </div>
                </button>
              ))}
            </div>

            <p className="label mb-5 mt-20" data-reveal>{"//"} more work</p>
            <div className="grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
              {matrix.map((p, i) => (
                <button key={p.title} onClick={() => setOpen(p)} data-reveal data-hud={p.title.toUpperCase()} className="group bg-bg/90 p-6 text-left transition-colors hover:bg-surface">
                  <span className="mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="display mt-3 text-3xl transition-colors group-hover:text-accent">{p.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm text-muted">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">{p.tech.slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="px-5 py-28 md:px-12 md:py-40">
          <div className="mx-auto max-w-[1400px]">
            <Head n="04" label="Skills" title="The toolkit." />
            <div className="grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
              {data.skills.map((g) => (
                <div key={g.title} data-reveal data-hud={g.title.toUpperCase()} className="bg-bg/90 p-6">
                  <p className="label mb-5">{g.title}</p>
                  <div className="flex flex-wrap gap-2">{g.items.map((s) => <span key={s} className="chip text-xs">{s}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="flex min-h-screen flex-col justify-center px-5 py-32 md:px-12">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="label mb-6" data-reveal>{"//"}05 Contact</p>
            <h2 data-reveal className="display outline-text text-[clamp(4rem,15vw,14rem)]">
              Let&apos;s build<br />something.
            </h2>
            <div data-reveal className="mt-12 flex flex-wrap items-center gap-3">
              <button onClick={copy} data-hud="EMAIL" className="mono bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[.16em] text-bg">
                {copied ? "Copied ✓" : data.email}
              </button>
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" data-hud="LINKEDIN" className="mono border border-line px-6 py-3 text-xs uppercase tracking-[.16em] hover:border-accent hover:text-accent">LinkedIn</a>}
              {data.github && <a href={data.github} target="_blank" rel="noreferrer" data-hud="GITHUB" className="mono border border-line px-6 py-3 text-xs uppercase tracking-[.16em] hover:border-accent hover:text-accent">GitHub</a>}
            </div>
            <p className="mono mt-24 text-[11px] uppercase tracking-[.16em] text-muted">© {new Date().getFullYear()} {data.name} · {data.location}</p>
          </div>
        </section>
      </main>

      {/* HUD */}
      <nav aria-label="Sections" className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 gap-2 border border-line bg-bg/70 px-3 py-2.5 backdrop-blur">
        {SECTIONS.map(([id, l], i) => (
          <button key={id} onClick={() => go(id)} aria-label={l} aria-current={active === i} className={`h-1.5 transition-all duration-300 ${active === i ? "w-10 bg-accent" : "w-4 bg-white/25 hover:bg-white/60"}`} />
        ))}
      </nav>
      <p aria-hidden className="mono fixed bottom-6 left-5 z-50 hidden text-[11px] uppercase tracking-[.14em] text-hud md:left-12 md:block">
        {"//"}0{active + 1}.00 SEC_{label} INDEX [0{active + 1}/0{SECTIONS.length}]
      </p>

      <div ref={boxRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[55] border border-hud/70 opacity-0" style={{ width: 0, height: 0 }}>
        {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((c) => (
          <i key={c} className={`absolute size-2 border border-hud bg-bg ${c}`} />
        ))}
        <span ref={tagRef} className="mono absolute -top-6 left-0 bg-hud px-1.5 py-0.5 text-[10px] font-semibold text-bg" />
      </div>

      <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] hidden [@media(pointer:fine)]:block">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <svg key={i} data-arrow width="14" height="14" viewBox="0 0 24 24" className={`absolute left-0 top-0 ${i === 0 ? "text-hud" : "text-accent"}`}>
            <path d="M3 2l17 8-7 2-3 8z" fill="currentColor" />
          </svg>
        ))}
      </div>

      {/* project detail */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        aria-label={open?.title}
        className="m-auto max-h-[88vh] w-[min(920px,92vw)] overflow-auto border border-line bg-surface p-0 text-text"
      >
        {open && (
          <div>
            {open.image && <img src={open.image} alt={`${open.title} screenshot`} className="aspect-[16/8] w-full object-cover object-top" />}
            <div className="space-y-6 p-6 md:p-10">
              <div className="flex items-start justify-between gap-6">
                <h3 className="display text-5xl">{open.title}</h3>
                <button onClick={() => dialogRef.current?.close()} className="mono border border-line px-3 py-1.5 text-xs uppercase hover:border-accent hover:text-accent">Close ✕</button>
              </div>
              <p className="leading-relaxed text-muted">{open.description}</p>
              <div className="flex flex-wrap gap-1.5">{open.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              <div className="flex flex-wrap gap-3">
                {open.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="mono bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[.14em] text-bg">{l.type} ↗</a>
                ))}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
