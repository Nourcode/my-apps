# Design Notes

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
