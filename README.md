# Portfolio

Config-driven personal portfolio. Next.js App Router, Tailwind CSS, TypeScript. Frontend only — no backend, no CMS.

All content lives in one JSON file. Edit it and the page updates; you never touch a component to change your own details.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Fill it in

Everything person-specific lives in [config/portfolio.json](config/portfolio.json), currently blank.

Blank fields disappear rather than rendering empty shells:

- an empty string hides that line
- an empty array hides that list
- a section whose entries are all empty is **not rendered at all** — no heading, no divider — and its nav entry is dropped too

So a half-filled config still looks deliberate. Fill in what you have; add the rest later.

### Config map

| Key | Drives |
| --- | --- |
| `meta` | Page title, description, emoji favicon, canonical URL, OG image |
| `profile` | Nav initials, name, greeting, headline, tagline, quote, avatar, location, availability |
| `nav` | Menu entries; each `href` points at a section id |
| `hero` | The two hero buttons |
| `about` | Paragraphs plus the label/value highlight cards |
| `technologies` | Grouped tool chips (`category` + `items`) |
| `skills` | "What I do" cards; `icon` is any emoji |
| `experience` | Timeline: role, company, dates, bullets, tech chips |
| `education` | Timeline: degree, institution, dates, score |
| `projects` | Cards; `featured: true` spans two columns |
| `interests` | Emoji + label chips |
| `contact` | Heading, blurb, mailto button |
| `socials` | Resume / GitHub / LinkedIn / X — rendered in hero and contact |
| `footer` | Note line; `copyright` auto-generates from name + year if blank |

Array entries can be added or removed freely — lists render from whatever is present.

If you add a config field, update the matching type in [lib/types.ts](lib/types.ts).

## Design system

shadcn/ui token conventions on Tailwind v4. Colors are stored as bare HSL channels in [app/globals.css](app/globals.css) so utilities can layer opacity on them. `:root` is light, `.dark` is dark; `@theme inline` exposes both to Tailwind.

To restyle, edit the token values — components reference semantic names (`bg-card`, `text-muted-foreground`, `border-border`), never raw colors.

The theme toggle sits in the nav and persists to `localStorage`; first visit follows the OS preference. An inline script in [app/layout.tsx](app/layout.tsx) applies the stored theme before first paint to avoid a white flash.

## Structure

```
app/
  layout.tsx      fonts, metadata from config, no-flash theme script
  page.tsx        composes the sections in order
  globals.css     design tokens
components/
  Nav.tsx         fixed header, scroll-spy, mobile menu
  ThemeToggle.tsx
  Reveal.tsx      scroll-triggered entrance
  ui.tsx          Container, Section, Card, Chip, ButtonLink
  icons.tsx       inline SVGs
  Footer.tsx
  sections/       Hero, About, Technologies, Skills, Experience,
                  Education, Projects, Interests, Contact, Timeline
config/
  portfolio.json  all content
lib/
  types.ts        config shape
  config.ts       loader + blank-handling helpers
```

Experience and Education share [Timeline.tsx](components/sections/Timeline.tsx).

## Deploying

Static-friendly. Vercel needs no configuration. For a plain static host, add `output: "export"` to [next.config.ts](next.config.ts) and serve `out/`.

## Notes

Images use plain `<img>` rather than `next/image` because paths come from user config and may be remote; `images.unoptimized` is set for the same reason.
