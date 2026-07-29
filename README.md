# Portfolio

Personal portfolio built on the [magicuidesign/portfolio](https://github.com/magicuidesign/portfolio) template (MIT). Next.js App Router, Tailwind CSS v4, TypeScript.

The one change from upstream: all person-specific content is pulled out of `src/data/resume.tsx` and into [config/portfolio.json](config/portfolio.json), so you edit one JSON file instead of a TSX file.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Fill it in

Everything lives in [config/portfolio.json](config/portfolio.json), currently blank apart from your name.

| Key | What it is |
| --- | --- |
| `name`, `initials` | Shown in the hero and as the avatar fallback |
| `url` | Canonical site URL. **Set this** — OG tags and the OG image need it |
| `location`, `locationLink` | Hero location line |
| `description` | One-line hero tagline, also the meta description |
| `summary` | The About paragraph (supports Markdown links) |
| `avatarUrl` | e.g. `/me.png` — put the file in `public/` |
| `skills[]` | `{ name, icon }`; see icon keys below |
| `contact.email`, `contact.tel` | Contact section |
| `contact.social` | GitHub / LinkedIn / X / email. `navbar: true` puts it in the dock |
| `resumeUrl` | Adds a resume button to the dock; omit and the button disappears |
| `work[]` | company, href, badges, location, title, logoUrl, start, end, description |
| `education[]` | school, href, degree, logoUrl, start, end |
| `projects[]` | title, href, dates, active, description, technologies, links, image, video |
| `hackathons[]` | title, dates, location, description, image, links — leave `[]` to hide the section |

Entries whose fields are all blank are dropped, and social links with no URL are hidden from the dock, so a partly-filled config still renders cleanly.

### Icon keys

Icons can't be expressed in JSON, so entries name one and [src/data/resume.tsx](src/data/resume.tsx) resolves it to a component.

- **`skills[].icon`** — `react`, `nextjs`, `typescript`, `nodejs`, `python`, `go`, `postgres`, `docker`, `kubernetes`, `java`, `csharp`
- **social / project link `icon`** — `github`, `linkedin`, `x`, `youtube`, `email`, `globe`, `notion`, `whatsapp`, `googleDrive`

To add one, drop an SVG component in `src/components/ui/svgs/` and register it in the `SKILL_ICONS` map.

## Layout

A single narrow column (`max-w-2xl`) with a floating dock pinned to the bottom holding home, resume, socials, and the theme toggle. Sections: Hero → About → Work → Education → Skills → Projects → Hackathons → Contact.

## Differences from upstream

- **Blog removed** — routes, MDX pipeline, and content-collections dependency all dropped.
- **Content moved to JSON** as described above.
- **Blank-safe guards** — `metadataBase` and the OG image skip `new URL()` when `url` is unset, which would otherwise throw at build time.

## Attribution

Template © 2024 Dillion Verma, MIT licensed — see [LICENSE](LICENSE). Company logos and the author's photo from the upstream `public/` folder are deliberately not included; only the two fonts the OG image route needs were kept.
