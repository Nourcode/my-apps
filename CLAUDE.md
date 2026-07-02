# my-apps — Project Overview

## What this is
A personal **App Hub / App Directory** — a single web page that lists every app the owner uses (Discord, Instagram, GitHub, n8n, Gmail, Claude, etc.), displays each app's logo, and provides a clean visual reference to see everything at a glance.

**The problem it solves:** Too many apps, hard to keep track of, overwhelming. This page acts as a single source of truth.

## Current scope (v1)
- Personal use only
- One page, static list of apps
- Each app shown as a card with its logo and name
- Clean, modern design

## Future vision
- Member space with authentication (login / signup)
- Offer the solution to clients and other users as a SaaS product
- Multi-user support

## Tech stack
- **Next.js** — React-based framework (routing, future API routes, auth-ready)
- **Tailwind CSS** — Utility-first styling for fast, consistent UI
- **Deployment:** Vercel (free tier)

## Design principles
- Keep the UI simple and scannable
- Prioritize visual identity (logos, brand colors)
- Design with future auth/multi-user in mind — but do not over-engineer for it yet
- Detailed design decisions are documented in `DESIGN.md`

## File location rule
All project notes, design docs, and memory files must be created **inside this project folder** so they are tracked by Git and synced via GitHub.
Never save project context to `~/.claude/` — those files are local only and won't sync.

## Feature tracking rule
Whenever a new feature is implemented, add it to `FEATURES.md` in the correct section before ending the task.
This keeps the feature list accurate and makes it easy to present or audit the app at any time.

## Bank catalog rule
Whenever a new bank is added to `app/banks.ts`, it **must also** be added to `app/catalog.ts` under the `// Finance` section.
- Use the same `name`, `url`, `icon`, and `description` as in `banks.ts`
- Set `tags: ["Finance"]`
- Include the country flag emoji at the end of the description (e.g. `🇫🇷`)
- Set `brand` to the bank's legal/short name

Both files must stay in sync so users can add banks to their hub and use them as payment sources interchangeably.
