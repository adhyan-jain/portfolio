import gsap from "gsap";

/**
 * Cursor agents: a swarm of pointers with real momentum (each one is an underdamped
 * spring chasing its own orbiting target), plus the hard-reload "build" sequence where
 * the agents scan, scatter, drag selection boxes over the page and fill them in.
 * After that the agents keep building: sections are boxed + rendered as they scroll
 * into view.
 */

type Fx = "fade" | "type" | "tag" | "wipe" | "pixel" | "plot";
type Drag = { b: HTMLElement; L: number; T: number; W: number; H: number };
/** a live element the agent's target tracks while the page scrolls (scroll builds) */
type Anchor = { el: HTMLElement; pad: number; p?: number; onDrag?: () => void; layer?: HTMLElement };
type Agent = {
  el: HTMLDivElement;
  arw: SVGSVGElement;
  x: number; y: number; vx: number; vy: number; rot: number;
  mode: "orbit" | "seek";
  /** away from the swarm on a scroll-build job */
  busy?: boolean;
  tx: number; ty: number; sk: number;
  rs: number; rf: number; th: number; w: number; ph: number; k: number; z: number;
  drag?: Drag;
  anchor?: Anchor;
  arrive?: () => void;
};

export type SwarmOpts = {
  root: HTMLElement;
  agentsLayer: HTMLElement;
  boxLayer: HTMLElement;
  overlay: HTMLElement;
  status: HTMLElement;
  bg: HTMLElement | null;
  build: boolean;
  fine: boolean;
  /** keep building [data-reveal] blocks as they scroll into view */
  scrollBuild?: boolean;
  /** called when the boxes clear and the page is "live" (scene burst etc.) */
  onClear?: () => void;
  /** called once the build ends, naturally or skipped */
  onDone?: () => void;
};

// mostly white with pale pastel tints, like the reference swarm
const TINTS = ["#ffffff", "#f4f4f2", "#ffd6cf", "#d4fbe9", "#ffe6c7", "#dfe4ff"];
const ARROW = `<svg class="arw" viewBox="0 0 14 12" aria-hidden="true"><path d="M13.5 6 .5.5 3.6 6 .5 11.5z" fill="currentColor" stroke="rgb(0 0 0 / .45)" stroke-width=".7" stroke-linejoin="round"/></svg>`;
const CROSS = `<svg class="crs" viewBox="0 0 15 15" aria-hidden="true"><path d="M7.5 0v15M0 7.5h15" stroke="currentColor" stroke-width="1.6"/></svg>`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function startSwarm(o: SwarmOpts): () => void {
  const n = innerWidth < 768 ? 12 : 18;
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
  const orbit = { cx: innerWidth / 2, cy: innerHeight / 2, follow: !o.build };
  const agents: Agent[] = [];
  const tweens: (gsap.core.Tween | gsap.core.Timeline)[] = [];
  const pendings = new Set<() => void>();
  const touched = new Set<HTMLElement>();
  const slices = new Set<HTMLElement>();
  const plotted = new Set<Element>();
  const typed: [Text[], string[]][] = [];
  let building = o.build;
  let finished = !o.build;
  let dead = false;
  // scroll-build boxes stay glued to their element while the page scrolls
  const pinned = new Map<HTMLElement, HTMLElement>();

  // ---------- agents
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    el.className = "agent";
    el.dataset.look = "arrow";
    el.style.setProperty("--tint", TINTS[i % TINTS.length]);
    el.innerHTML = ARROW + CROSS;
    const tag = document.createElement("span");
    tag.className = "agent-tag";
    tag.textContent = `ag-${String(i + 1).padStart(2, "0")}`;
    el.appendChild(tag);
    o.agentsLayer.appendChild(el);
    // scan formation: packs of three riding the same orbit, a few degrees apart
    const pack = Math.floor(i / 3);
    const packs = Math.ceil(n / 3);
    const th = (pack / packs) * Math.PI * 2 + (i % 3) * 0.13 + rand(-0.05, 0.05);
    const rs = 95 + ((pack * 37) % 90) + rand(-8, 8);
    const a: Agent = {
      el,
      arw: el.querySelector("svg")!,
      x: orbit.cx + Math.cos(th) * rs * 1.6,
      y: orbit.cy + Math.sin(th) * rs * 1.6,
      vx: -Math.sin(th) * 500,
      vy: Math.cos(th) * 500,
      rot: th + Math.PI / 2,
      mode: "orbit",
      tx: 0, ty: 0, sk: 200,
      rs,
      rf: rand(14, 90),
      th,
      w: 1.6 + (pack % 3) * 0.45 + rand(-0.06, 0.06),
      ph: rand(0, 10),
      k: rand(16, 46),
      z: rand(0.34, 0.56),
    };
    if (!o.build) {
      a.x = mouse.x;
      a.y = mouse.y;
      a.vx = a.vy = 0;
    }
    agents.push(a);
  }
  if (!o.build) gsap.set(o.agentsLayer, { opacity: 0 });

  // ---------- physics
  const integrate = (a: Agent, t: number, dt: number) => {
    let gx: number, gy: number, k: number, c: number;
    if (a.mode === "orbit") {
      a.th += a.w * (orbit.follow ? 1.7 : 1) * dt;
      const r = (orbit.follow ? a.rf : a.rs) * (1 + 0.24 * Math.sin(t * 1.7 + a.ph));
      gx = orbit.cx + Math.cos(a.th) * r;
      gy = orbit.cy + Math.sin(a.th) * r;
      k = orbit.follow ? a.k : a.k * 0.9;
      c = 2 * Math.sqrt(k) * a.z;
    } else {
      gx = a.tx;
      gy = a.ty;
      k = a.sk;
      c = 2 * Math.sqrt(k) * 0.84;
    }
    let ax = k * (gx - a.x) - c * a.vx;
    let ay = k * (gy - a.y) - c * a.vy;
    if (a.mode === "orbit") {
      for (const b of agents) {
        if (b === a) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.01 && d2 < 100) {
          const d = Math.sqrt(d2);
          const f = 2400 * (1 - d / 10);
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
    }
    a.vx += ax * dt;
    a.vy += ay * dt;
    const sp = Math.hypot(a.vx, a.vy);
    if (sp > 2800) {
      a.vx *= 2800 / sp;
      a.vy *= 2800 / sp;
    }
    a.x += a.vx * dt;
    a.y += a.vy * dt;
  };

  const step = (time: number, dtMs: number) => {
    const total = Math.min(dtMs, 50) / 1000;
    const sub = total > 1 / 70 ? 2 : 1;
    const dt = total / sub;
    if (orbit.follow) {
      orbit.cx = mouse.x;
      orbit.cy = mouse.y;
    }
    for (const a of agents) {
      if (!a.anchor) continue;
      // follow the element as it scrolls: seek its corner, then drag along with it
      const r = a.anchor.el.getBoundingClientRect();
      const { pad } = a.anchor;
      const L = r.left - pad, T = r.top - pad, W = r.width + pad * 2, H = r.height + pad * 2;
      const p = a.anchor.p ?? 0;
      a.tx = L + W * p;
      a.ty = T + H * p;
      if (a.drag) {
        Object.assign(a.drag, { L, T, W, H });
        a.drag.b.style.transform = `translate3d(${L.toFixed(1)}px,${T.toFixed(1)}px,0)`;
      }
    }
    for (let s = 0; s < sub; s++) for (const a of agents) integrate(a, time, dt);
    for (const a of agents) {
      const sp = Math.hypot(a.vx, a.vy);
      if (sp > 30) {
        let d = Math.atan2(a.vy, a.vx) - a.rot;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        a.rot += d * (1 - Math.exp(-total * 14));
      }
      a.el.style.transform = `translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`;
      a.arw.style.transform = `rotate(${a.rot.toFixed(3)}rad)`;
      if (a.drag) {
        const { b, L, T, W, H } = a.drag;
        b.style.width = `${gsap.utils.clamp(0, W * 1.08, a.x - L).toFixed(1)}px`;
        b.style.height = `${gsap.utils.clamp(0, H * 1.08, a.y - T).toFixed(1)}px`;
      }
      if (a.arrive && Math.hypot(a.tx - a.x, a.ty - a.y) < 3 && sp < 90) a.arrive();
    }
    pinned.forEach((el, b) => {
      const r = el.getBoundingClientRect();
      b.style.transform = `translate3d(${(r.left - 5).toFixed(1)}px,${(r.top - 5).toFixed(1)}px,0)`;
      b.style.width = `${r.width + 10}px`;
      b.style.height = `${r.height + 10}px`;
    });
  };
  gsap.ticker.add(step);

  const onMove = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!mouse.seen) {
      mouse.seen = true;
      if (!building && o.fine) gsap.to(o.agentsLayer, { opacity: 1, duration: 0.5 });
    }
  };
  addEventListener("pointermove", onMove, { passive: true });

  // ---------- helpers (every build tween is tracked so a skip can kill it)
  const tw = (t: gsap.TweenTarget, v: gsap.TweenVars) =>
    new Promise<void>((res) => tweens.push(gsap.to(t, { ...v, onComplete: () => res() })));
  const twFrom = (t: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars) =>
    new Promise<void>((res) => tweens.push(gsap.fromTo(t, from, { ...to, onComplete: () => res() })));
  const wait = (s: number) => new Promise<void>((res) => tweens.push(gsap.delayedCall(s, res)));
  const look = (a: Agent, l: "arrow" | "cross") => (a.el.dataset.look = l);
  const tag = (a: Agent, on: boolean) => a.el.toggleAttribute("data-tag", on);
  const seek = (a: Agent, x: number, y: number, sk = 260) =>
    new Promise<void>((res) => {
      a.mode = "seek";
      a.tx = x;
      a.ty = y;
      a.sk = sk;
      const done = () => {
        if (a.arrive === done) a.arrive = undefined;
        clearTimeout(to);
        pendings.delete(done);
        res();
      };
      const to = setTimeout(done, 1100);
      a.arrive = done;
      pendings.add(done);
    });
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };

  // ---------- status bar
  const sText = o.status.querySelector<HTMLElement>("[data-status-text]");
  const sBar = o.status.querySelector<HTMLElement>("[data-status-bar]");
  const say = (s: string) => sText && (sText.textContent = s);
  const progress = (p: number, d = 0.3) => sBar && tweens.push(gsap.to(sBar, { scaleX: p, duration: d, ease: "power2.out" }));

  // ---------- boxes
  const makeBox = (label: string, x: number, y: number, bg: boolean, cls = "", layer = o.boxLayer) => {
    const b = document.createElement("div");
    b.className = `${bg ? "bbox bbox-bg" : "bbox"} ${cls}`.trim();
    b.innerHTML = "<i></i><i></i><i></i><i></i>";
    const chip = document.createElement("b");
    chip.textContent = label;
    b.appendChild(chip);
    b.style.transform = `translate3d(${x}px,${y}px,0)`;
    layer.appendChild(b);
    return b;
  };

  // construction lines: before boxing an element the agent pencils guides through its corner
  const pencil = (x: number, y: number, layer: HTMLElement) => {
    const h = document.createElement("div");
    const v = document.createElement("div");
    h.className = "guide guide-h";
    v.className = "guide guide-v";
    h.style.top = `${y}px`;
    v.style.left = `${x}px`;
    layer.append(h, v);
    tweens.push(
      gsap.timeline({ onComplete: () => { h.remove(); v.remove(); } })
        .fromTo(h, { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: "power2.out" }, 0)
        .fromTo(v, { scaleY: 0 }, { scaleY: 1, duration: 0.28, ease: "power2.out" }, 0)
        .to([h, v], { opacity: 0, duration: 0.45 }, 0.45),
    );
  };

  const draw = (a: Agent, el: HTMLElement, label: string, bg = false) => {
    const r = el.getBoundingClientRect();
    const pad = bg ? 0 : 5;
    const L = Math.max(2, r.left - pad);
    const T = Math.max(2, r.top - pad);
    return drawRect(a, L, T, Math.min(innerWidth - 2, r.right + pad) - L, Math.min(innerHeight - 2, r.bottom + pad) - T, label, bg);
  };

  const drawRect = async (
    a: Agent, L: number, T: number, W: number, H: number, label: string,
    bg = false, stop: () => boolean = () => finished, cls = "", anchor?: Anchor,
  ) => {
    look(a, "cross");
    tag(a, true);
    a.anchor = anchor;
    if (anchor) anchor.p = 0;
    await seek(a, L, T, 700);
    if (stop()) return null;
    pencil(a.anchor ? a.tx : L, a.anchor ? a.ty : T, anchor?.layer ?? o.boxLayer);
    const b = makeBox(label, a.anchor ? a.tx : L, a.anchor ? a.ty : T, bg, cls, anchor?.layer);
    anchor?.onDrag?.();
    a.drag = { b, L, T, W, H };
    a.sk = 1100;
    const p = { v: 0 };
    await tw(p, {
      v: 1,
      duration: gsap.utils.clamp(0.16, 0.34, Math.hypot(W, H) / 2400),
      ease: "power2.inOut",
      onUpdate: () => {
        if (a.anchor) a.anchor.p = p.v;
        else {
          a.tx = L + W * p.v;
          a.ty = T + H * p.v;
        }
      },
    });
    a.anchor = undefined;
    if (stop()) return null;
    ({ W, H } = a.drag);
    a.drag = undefined;
    b.style.width = `${W}px`;
    b.style.height = `${H}px`;
    b.classList.add("done");
    tag(a, false);
    a.sk = 160;
    a.tx += rand(-30, 30);
    a.ty += rand(10, 40);
    return b;
  };

  // ---------- fills
  const caretAt = (caret: HTMLElement, nodes: Text[], el: HTMLElement) => {
    const last = [...nodes].reverse().find((t) => t.data.length);
    let r: DOMRect;
    if (last) {
      const rg = document.createRange();
      rg.setStart(last, last.data.length - 1);
      rg.setEnd(last, last.data.length);
      const rs = rg.getClientRects();
      r = rs[rs.length - 1] ?? rg.getBoundingClientRect();
      caret.style.transform = `translate3d(${r.right + 1}px,${r.top}px,0)`;
    } else {
      r = el.getBoundingClientRect();
      caret.style.transform = `translate3d(${r.left + 2}px,${r.top}px,0)`;
    }
    caret.style.height = `${Math.max(12, r.height)}px`;
  };

  const typeIn = async (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    touched.add(el);
    gsap.set(el, { opacity: 1, width: r.width, height: r.height });
    const nodes: Text[] = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) if ((walk.currentNode as Text).data) nodes.push(walk.currentNode as Text);
    const orig = nodes.map((t) => t.data);
    typed.push([nodes, orig]);
    nodes.forEach((t) => (t.data = ""));
    const total = orig.reduce((s, t) => s + t.length, 0);
    const caret = document.createElement("i");
    caret.className = "caret";
    o.agentsLayer.appendChild(caret);
    caretAt(caret, nodes, el);
    const p = { i: 0 };
    await tw(p, {
      i: total,
      duration: gsap.utils.clamp(0.15, 0.5, total * 0.009),
      ease: "none",
      onUpdate: () => {
        let left = Math.round(p.i);
        nodes.forEach((t, j) => {
          const take = Math.min(left, orig[j].length);
          if (t.data.length !== take) t.data = orig[j].slice(0, take);
          left -= take;
        });
        caretAt(caret, nodes, el);
      },
    });
    caret.remove();
    gsap.set(el, { clearProps: "width,height" });
  };

  // once an element's effect finishes it is "inked": its lettering morphs from pencil (casual) to ink (linear)
  const reveal = (el: HTMLElement): Promise<void> => revealFx(el).then(() => el.setAttribute("data-inked", ""));
  const revealFx = (el: HTMLElement): Promise<void> => {
    const fx = (el.dataset.fx || "fade") as Fx;
    touched.add(el);
    if (fx === "type" || fx === "tag") return typeIn(el);
    if (fx === "plot") {
      // a pen plotter: every edge of the drawing is stroked in, then the labels appear
      gsap.set(el, { opacity: 1 });
      const shapes = [...el.querySelectorAll<SVGElement>("line, polyline, polygon")];
      const labels = [...el.querySelectorAll<SVGElement>("text, circle")];
      shapes.forEach((x) => plotted.add(x));
      labels.forEach((x) => plotted.add(x));
      return Promise.all([
        twFrom(shapes, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 }, { strokeDashoffset: 0, fillOpacity: 1, duration: 0.5, stagger: 0.012, ease: "power2.inOut" }),
        twFrom(labels, { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.05, delay: 0.45, ease: "steps(3)" }),
      ]).then(() => void gsap.set([...shapes, ...labels], { clearProps: "strokeDasharray,strokeDashoffset,fillOpacity,opacity" }));
    }
    if (fx === "wipe")
      return twFrom(el, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "steps(10)" });
    if (fx === "pixel") {
      // image glitches in black & white (horizontal slices tear sideways), then the colour snaps on
      el.querySelectorAll<HTMLElement>(".slice").forEach((s) => {
        slices.add(s);
        const tl = gsap.timeline({ onComplete: () => void gsap.set(s, { x: 0, clipPath: "inset(0% 0% 100% 0%)" }) });
        for (let k = 0; k < 6; k++) {
          const top = rand(0, 85);
          tl.set(s, { clipPath: `inset(${top}% 0% ${Math.max(0, 100 - top - rand(4, 14))}% 0%)`, x: rand(-26, 26) }).to({}, { duration: 0.07 });
        }
        tweens.push(tl);
      });
      return twFrom(
        el,
        { opacity: 1, filter: "grayscale(1) contrast(1.3) blur(14px)" },
        { filter: "grayscale(1) contrast(1.1) blur(0px)", duration: 0.3, ease: "steps(6)" },
      ).then(() => tw(el, { filter: "grayscale(0) contrast(1) blur(0px)", duration: 0.2, ease: "steps(2)" }));
    }
    return twFrom(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "steps(4)" });
  };

  // ---------- the build
  const finish = () => {
    if (finished) return;
    finished = true;
    building = false;
    tweens.forEach((t) => t.kill());
    tweens.length = 0;
    pendings.forEach((f) => f());
    typed.forEach(([nodes, orig]) => nodes.forEach((t, i) => (t.data = orig[i])));
    if (touched.size) gsap.set([...touched], { clearProps: "opacity,clipPath,filter,width,height" });
    if (slices.size) gsap.set([...slices], { x: 0, clipPath: "inset(0% 0% 100% 0%)" });
    if (plotted.size) gsap.set([...plotted], { clearProps: "strokeDasharray,strokeDashoffset,fillOpacity,opacity" });
    o.root.querySelectorAll("[data-build]").forEach((e) => e.setAttribute("data-inked", ""));
    o.root.removeAttribute("data-building");
    o.boxLayer.replaceChildren();
    o.agentsLayer.querySelectorAll(".caret").forEach((c) => c.remove());
    gsap.to(o.overlay, { autoAlpha: 0, duration: 0.2 });
    if (o.bg) gsap.to(o.bg, { opacity: 1, duration: 0.6 });
    gsap.to(o.status, { autoAlpha: 0, y: 12, duration: 0.5, delay: 0.2 });
    agents.forEach((a) => {
      a.drag = undefined;
      a.arrive = undefined;
      tag(a, false);
      look(a, "arrow");
      a.mode = "orbit";
      a.th = Math.atan2(a.y - mouse.y, a.x - mouse.x);
    });
    orbit.follow = true;
    if (!o.fine || !mouse.seen) gsap.to(o.agentsLayer, { opacity: 0, duration: 0.6 });
    removeEventListener("keydown", skip);
    removeEventListener("wheel", skip);
    removeEventListener("touchmove", skip);
    skipBtn?.removeEventListener("click", skip);
    o.onClear?.();
    o.onDone?.();
    pump();
  };
  const skip = () => finish();
  const skipBtn = o.status.querySelector<HTMLElement>("[data-skip]");

  const run = async () => {
    // 1. scan: agents orbit the empty page
    say("Plotting sheet 1…");
    progress(0.16, 1.1);
    await wait(1.2);
    if (finished) return;

    const all = [...o.root.querySelectorAll<HTMLElement>("[data-build]")].filter(visible);
    const early = all.filter((el) => !el.hasAttribute("data-late"));
    const late = all.filter((el) => el.hasAttribute("data-late"));
    const bgs = [...o.root.querySelectorAll<HTMLElement>("[data-build-bg]")].filter(visible);

    // 2. scatter into crosshairs: agents with a job burst straight toward its corner,
    // the rest spread out over the page
    const corner = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return [Math.max(2, r.left - 5), Math.max(2, r.top - 5)] as const;
    };
    tweens.push(gsap.to(o.overlay, { autoAlpha: 0, duration: 0.35 }));
    agents.forEach((a, i) => {
      look(a, "cross");
      const ang = Math.atan2(a.y - orbit.cy, a.x - orbit.cx);
      a.vx += Math.cos(ang) * 1300;
      a.vy += Math.sin(ang) * 1300;
      const job = i < early.length ? early[i] : n - 1 - i < bgs.length ? bgs[n - 1 - i] : null;
      const [x, y] = job ? corner(job) : [rand(40, innerWidth - 40), rand(60, innerHeight - 60)];
      void seek(a, x, y, job ? 150 : 70);
    });
    const total = all.length + bgs.length;
    let done = 0;
    const tick = () => {
      done++;
      say(`${n} agents drafting, ${done} of ${total} layers`);
      progress(0.16 + (done / total) * 0.84);
    };
    say(`${n} agents drafting, 0 of ${total} layers`);
    const boxes: HTMLElement[] = [];
    const keep = (b: HTMLElement | null) => b && boxes.push(b);

    // 3+4+5. agents grab elements and drag boxes over them; a moment later the big
    // section boxes start stacking up into grey while the small ones are still landing.
    // Each layer starts rendering as soon as its own box lands (big headline/media
    // reveals wait for the grey), so drawing and filling overlap like the reference.
    const lists = agents.map(() => [] as HTMLElement[]);
    early.forEach((el, i) => lists[i % n].push(el));
    const big = Promise.all(
      bgs.map(async (el, i) => {
        await wait(0.2 + i * 0.05);
        keep(await draw(agents[n - 1 - (i % n)], el, el.dataset.buildBg || "SECTION", true));
        if (!finished) tick();
      }),
    );
    const renders: Promise<void>[] = [];
    const small = Promise.all(
      lists.map(async (list, i) => {
        await wait(i * 0.02);
        for (const el of list) {
          keep(await draw(agents[i], el, el.dataset.build || "LAYER"));
          if (finished) return;
          tick();
          const fx = el.dataset.fx;
          renders.push((fx === "wipe" || fx === "pixel" ? big : wait(0.05)).then(() => reveal(el)));
        }
      }),
    );
    await Promise.all([small, big]);
    if (finished) return;
    say("Inking…");
    // late agents head for their corners while the fills render, so they're in place at the clear
    late.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      look(agents[(i * 3 + 1) % n], "cross");
      void seek(agents[(i * 3 + 1) % n], r.left - 5, r.top - 5, 120);
      if (el.dataset.fx === "pixel") {
        look(agents[(i * 3 + 8) % n], "cross");
        void seek(agents[(i * 3 + 8) % n], r.left + r.width * 0.07, r.top + r.height * 0.09, 120);
      }
    });
    await Promise.all(renders);
    await wait(0);
    if (finished) return;

    // 6. grey drops away, scene comes alive
    tweens.push(gsap.to(boxes, { backgroundColor: "rgba(0,0,0,0)", duration: 0.12, ease: "steps(2)" }));
    tweens.push(gsap.to(boxes, { opacity: 0, duration: 0.4, delay: 0.15, stagger: 0.01 }));
    if (o.bg) tweens.push(gsap.to(o.bg, { opacity: 1, duration: 1.2 }));
    o.onClear?.();
    o.onClear = undefined;

    // 7. late layers get their own box + render
    await Promise.all(
      late.map(async (el, i) => {
        await wait(0.05 + i * 0.08);
        const a = agents[(i * 3 + 1) % n];
        const b = await draw(a, el, el.dataset.build || "LAYER");
        if (finished) return;
        tick();
        const extra: (HTMLElement | null)[] = [];
        if (el.dataset.fx === "pixel") {
          // media slot: a second agent frames the image area, a placeholder sits in it
          // and a few arrow cursors poke around before the image lands
          const r = el.getBoundingClientRect();
          const helper = agents[(i * 3 + 8) % n];
          const L = r.left + r.width * 0.07;
          const T = r.top + r.height * 0.09;
          const inner = await drawRect(helper, L, T, r.right - r.width * 0.03 - L, r.bottom - r.height * 0.03 - T, "IMAGE");
          if (finished) return;
          inner?.classList.add("bbox-ph");
          extra.push(inner);
          const crew = [a, helper, agents[(i * 3 + 13) % n]];
          crew.forEach((c) => {
            look(c, "arrow");
            void seek(c, rand(L + 20, r.right - 30), rand(T + 20, r.bottom - 30), 60);
          });
          await wait(0.4);
          if (finished) return;
          inner?.classList.remove("bbox-ph");
        }
        await reveal(el);
        tweens.push(gsap.to([b, ...extra].filter(Boolean), { opacity: 0, duration: 0.45 }));
      }),
    );
    if (finished) return;
    say("Sheet issued");
    progress(1);
    // free agents drift back toward the pointer before the build wraps up
    await wait(0.3);
    finish();
  };

  // ---------- keep building as sections scroll into view
  const queue: HTMLElement[] = [];
  let working = 0;
  // all but a few agents can be out building at once; the rest stay with the pointer
  const MAX_JOBS = n - 4;
  const scrollJob = async (a: Agent, el: HTMLElement) => {
    a.busy = true;
    const show = () => el.setAttribute("data-built", "");
    // the same effects as the hero build: headings wipe in, images glitch in
    // black & white then snap to colour, text types in on top of a grey box
    const heading = el.matches("h2") ? el : el.querySelector<HTMLElement>("h2");
    const fx = el.dataset.fx || (el.querySelector("img") ? "media" : heading ? "head" : "type");
    const render = async () => {
      show();
      if (fx === "head" && heading) {
        touched.add(el);
        gsap.set(el, { opacity: 1 });
        const rest = [...el.children].filter((c) => c !== heading && !c.contains(heading)) as HTMLElement[];
        await Promise.all([
          twFrom(heading, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "steps(10)" }),
          ...rest.map((c) => typeIn(c)),
        ]);
        gsap.set(heading, { clearProps: "clipPath" });
      } else if (fx === "media") {
        // the screenshot prints as a cyanotype first, then develops into colour (CSS transition)
        // card text types in while the screenshot develops
        await Promise.all([typeIn(el), wait(0.3).then(() => el.setAttribute("data-developed", ""))]);
      } else if (fx === "type") {
        await typeIn(el);
      } else {
        await twFrom(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "steps(4)" });
      }
    };
    // triggered a little before the block enters: park the agent at the bottom edge where it will
    // come in, and start drawing the moment it is actually on screen
    look(a, "cross");
    let r = el.getBoundingClientRect();
    while (!dead && r.top >= innerHeight - 4 && r.top <= innerHeight * 1.6) {
      a.mode = "seek";
      a.sk = 140;
      a.tx = Math.min(innerWidth - 12, Math.max(12, r.left));
      a.ty = innerHeight - 14;
      await wait(0.05);
      r = el.getBoundingClientRect();
    }
    if (dead) return;
    if (r.top > innerHeight * 1.6) {
      // scrolled back up before it arrived: free the agent and wait for the block's next approach
      a.busy = false;
      look(a, "arrow");
      a.mode = "orbit";
      io?.observe(el);
      return;
    }
    if (r.bottom < 0) {
      // already scrolled past above: no point drawing it off screen
      show();
      el.setAttribute("data-inked", "");
      el.setAttribute("data-developed", "");
    } else {
      const r = el.getBoundingClientRect();
      const label = el.dataset.hud || (heading === el || fx === "head" ? "HEADING" : fx === "media" ? "MEDIA" : "TEXT");
      // content starts rendering as soon as the block is on screen; the agent drags its box around it
      const rendering = render();
      const b = await drawRect(a, r.left - 5, r.top - 5, r.width + 10, r.height + 10, label, false, () => dead, "bbox-scroll", {
        el,
        pad: 5,
        layer: scrollLayer,
      });
      if (dead) return;
      if (b) pinned.set(b, el);
      tag(a, false);
      a.sk = 120;
      void seek(a, Math.min(innerWidth - 20, r.right + rand(-40, 10)), Math.min(innerHeight - 20, r.top + rand(10, 60)), 120);
      await rendering;
      if (dead) return;
      el.setAttribute("data-inked", "");
      if (b) {
        // grey drops away, then the outline fades, like the hero clear
        tweens.push(gsap.to(b, { backgroundColor: "rgba(0,0,0,0)", duration: 0.12, ease: "steps(2)" }));
        tweens.push(
          gsap.to(b, {
            opacity: 0,
            duration: 0.45,
            delay: 0.2,
            onComplete: () => {
              pinned.delete(b);
              b.remove();
            },
          }),
        );
      }
    }
    // back into the swarm
    a.busy = false;
    look(a, "arrow");
    a.mode = "orbit";
    a.th = Math.atan2(a.y - mouse.y, a.x - mouse.x);
  };
  const pump = () => {
    if (building || dead) return;
    while (working < MAX_JOBS && queue.length) {
      const el = queue.shift()!;
      const r = el.getBoundingClientRect();
      const free = agents.filter((a) => !a.busy);
      if (!free.length) {
        queue.unshift(el);
        return;
      }
      const a = free.reduce((p, q) => (Math.hypot(q.x - r.left, q.y - r.top) < Math.hypot(p.x - r.left, p.y - r.top) ? q : p));
      working++;
      void scrollJob(a, el).finally(() => {
        working--;
        pump();
      });
    }
  };
  let io: IntersectionObserver | null = null;
  // scroll-build boxes sit above the page content (cards have opaque backgrounds that would
  // hide a box underneath) but below the fixed header
  const scrollLayer = document.createElement("div");
  scrollLayer.setAttribute("aria-hidden", "true");
  Object.assign(scrollLayer.style, { position: "fixed", inset: "0", zIndex: "45", pointerEvents: "none" });
  if (o.scrollBuild) {
    o.root.appendChild(scrollLayer);
    o.root.setAttribute("data-scrollbuild", "");
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io?.unobserve(e.target);
          queue.push(e.target as HTMLElement);
        }
        queue.sort((p, q) => p.getBoundingClientRect().top - q.getBoundingClientRect().top);
        pump();
      },
      { threshold: 0, rootMargin: "0px 0px 20% 0px" },
    );
    o.root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => io!.observe(el));
  }

  if (o.build) {
    addEventListener("keydown", skip);
    addEventListener("wheel", skip, { passive: true });
    addEventListener("touchmove", skip, { passive: true });
    skipBtn?.addEventListener("click", skip);
    if (o.bg) gsap.set(o.bg, { opacity: 0 });
    void run();
  }

  return () => {
    finish();
    dead = true;
    io?.disconnect();
    tweens.forEach((t) => t.kill());
    pinned.clear();
    scrollLayer.remove();
    o.root.removeAttribute("data-scrollbuild");
    o.root.querySelectorAll("[data-built]").forEach((el) => el.removeAttribute("data-built"));
    gsap.ticker.remove(step);
    removeEventListener("pointermove", onMove);
    o.agentsLayer.replaceChildren();
  };
}
