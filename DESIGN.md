# Design Notes

## Branding & naming

**Current name:** Helio

**Origin:** From ancient Greek Ἥλιος (*Hēlios*), meaning "sun." Used as a prefix in modern scientific vocabulary (heliocentric, helium). Short, clean, internationally recognizable, startup-friendly.

**Why "Helio" not "Helios":** Helios is the full mythological name (more epic/formal). Helio is the prefix form — shorter, lighter, easier to brand. Feels modern rather than mythological.

**Naming conflicts:** Other companies use "Helio" (helio.im — AI workspace, helio-ai.com — recruiting). They are in different product categories so it is not a legal problem for personal use. For the SaaS phase, the plan is to append a keyword to differentiate (e.g. "Helio Hub", "HelioApp", etc.) and check trademark databases before launching publicly.

**Domain strategy:** `.com` likely taken/expensive. Preferred options when going public:
- `helio.app` — most fitting (it's literally an app hub)
- `usehelio.com` — classic startup pattern
- `getHelio.app` — also clean

**Current domain:** Vercel-assigned (`my-apps-henna.vercel.app`) — fine for v1 personal use.

**Brand color:** Amber (`amber-500` / `#F59E0B`). Chosen because amber is warm, sun-adjacent, and ties directly to the Helio metaphor. Applied to: primary action buttons (Add App, Save, Copy), stats cost chips, catalog brand badges, and category "+" button hover. Neutral dark/white reserved for navigation elements (filter pills, cancel buttons) so the brand color stays meaningful.

---

## Responsive / mobile
The app must work well on mobile screens. Key rules:
- Padding shrinks on small screens (`px-4 sm:px-10`, `py-8 sm:py-12`)
- Search bar goes full-width on mobile
- All modals use `w-full max-w-xs/sm mx-4` so they don't overflow small screens
- Category filter pills wrap naturally (`flex-wrap`)
- Card grid is always responsive: `grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8`
- Header buttons wrap on very small viewports (`flex-wrap`)

## Visual style
- **Modern minimalist** — clean, uncluttered, lots of breathing room
- **Light mode** (default): warm off-white background (`#f7f6f3`), white cards, dark charcoal text
- **Dark mode**: near-black background (`#0d0d0d`), glassmorphism cards (`bg-white/5`, subtle white border), light gray text
- **Cards**: icon on top, name below, scale-up on hover — app launcher style grid
- **Toggle**: sun/moon icon in the top-right corner, preference saved in localStorage

## Technical note on theming
CSS variables + `html.dark` class caused hydration conflicts with Next.js App Router and Tailwind v4.
Solution: theme is driven entirely by React state (`isDark`) using conditional Tailwind class names — no CSS cascade involved.

---

## What counts as an "app"

An **app** in this hub is anything you use or connect to — a website, an online account, a desktop app, or a service. If you interact with it regularly, it belongs here.

The same brand can appear as multiple entries if you use more than one of their products. For example:
- **GitHub** → the website (github.com) for browsing repos
- **GitHub Desktop** → the native app for managing Git locally

Both are separate cards because they serve different purposes, even though they come from the same company.

---

## File location rule
All project notes, design docs, and memory files must be created **inside this project folder** so they are tracked by Git and pushed to GitHub.
Do not save project context to `~/.claude/` — those files are local only and won't sync.

## Changelog rule
Whenever new code is pushed or a feature is completed, update `changelog.ts` with a new version entry (CalVer format: `YYYY.MM.DD`, or `YYYY.MM.DD.N` for multiple releases in the same day).
Each entry needs: version, date, label (short name for the release), and grouped changes under New / Improved / Fixed.
The version chip in the header auto-reads `changelog[0].version`, so the UI always reflects the latest entry.
