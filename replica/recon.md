# Recon: reference portfolio (from Reel screen-recording)

Source: one 59s phone screen-recording of an Instagram Reel filming a laptop. Low-res (480px wide, screen ~300px). Patterns only; nothing is copied.
Slice: the public portfolio page. Audience: the user's own portfolio. Size: M.

## Sources
| source | gives |
| --- | --- |
| reference video (frames in `replica/screens/`) | layout, hierarchy, motion language |
| `config/portfolio.json` | all real content (user's own) |

## Screens (single long scroll)
| ID | screen | purpose | key components | states |
| --- | --- | --- | --- | --- |
| S01 | Hero | who + first impression | outline headline, script greeting, name block, portrait card, info cards, 3 stat tiles, CTA pair | loader, idle, cursor-hover fill, mobile stack |
| S02 | Background | story + facts | section label, heading, paragraph, highlights, marquee | reveal, mobile |
| S03 | Work | flagship + roles | featured card with stat tiles, project plates, timeline cards | hover ripple, dialog open |
| S04 | Matrix | breadth | 3-col card matrix (text projects), skills chips | hover glow |
| S05 | Contact | close | big closing line, email copy, socials, footer dissolve | copied, mobile |
| Global | HUD | wayfinding | nav, section index, progress dock, cursor swarm, selection box | hidden on touch / reduced motion |

## Flows
- F01 Visitor skims: S01 → scroll → S02 → S03 → S04 → S05 (happy path: 0 clicks, 1 scroll).
- F02 Visitor opens a project: S03 plate → detail dialog → external link. 2 clicks.
- F03 Visitor reaches out: nav "Contact" or S05 → copy email / open LinkedIn. 1–2 clicks.

## Components
Outline headline · name block · portrait shader card · stat tile · info card · section label (`//0N NAME [N/5]`) · nav bar · progress dock · cursor swarm · selection box (corner handles + tag) · project plate · flagship card · matrix card · skill chip · copy-email button · detail dialog.

## Data model
None. Content is static JSON (`config/portfolio.json` → `src/data/resume.tsx`).

## Cannot / will not clone
The original's name, copy, portrait, exact red, and any code. Replaced with the user's own content and a signal-orange accent.
