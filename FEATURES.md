# Helio — Feature List

A running record of every feature implemented in the app. Update this file whenever a new feature is added.

---

## App Management

- **App catalog** — curated list of popular apps with names, logos, descriptions, brands, and tags
- **Add apps** — add any app from the catalog via the "+ Add App" button or the per-category "+ Add" button
- **Remove apps** — remove a single app via its detail modal ("Remove from hub")
- **Bulk delete** — select multiple apps in Select Mode and delete them together
- **Delete by category** — delete all apps in a given category at once
- **Delete all** — wipe the entire hub (requires typing "DELETE" to confirm)
- **Select mode** — toggle a multi-select mode to pick multiple apps; confirmed selections shown with a checkmark badge

## Organization & Navigation

- **Pinned apps** — star any app in its detail modal to pin it; pinned apps appear in a dedicated "Pinned" row above all categories with an amber pin badge; pin state persists in localStorage and exports/imports with your hub data
- **Personal / Business tagging** — mark any app as Personal (default) or Business via the Use selector in its detail modal; Business apps show an indigo "Business" chip on their card and in the tooltip; filter the hub by Personal or Business using toolbar chips (visible once at least one app is set to Business)
- **Platform tagging** — mark any app as Desktop (default), Mobile, or Both via the Platform selector in its detail modal; Mobile apps show a violet "Mobile" chip, Both apps show a teal "Mobile + Desktop" chip; filter by platform in the toolbar (chips appear once at least one app is set to Mobile or Both)
- **Category grouping** — apps automatically grouped by their tags (e.g. Productivity, Design, Dev Tools); multi-tag apps appear only once (under their first tag) to avoid duplication
- **Category filter** — click a tag pill in the toolbar to view only apps in that category
- **Search** — real-time search by app name, filters the visible grid
- **Keyboard shortcuts** — press `/` or `⌘K` (Mac) / `Ctrl+K` (Windows) to jump to search; `Escape` clears and blurs
- **Search hint** — the search bar shows the correct shortcut hint based on the user's OS (Mac vs Windows)

## Data Portability

- **Export JSON** — download all hub data as a JSON file
- **Import JSON** — restore or transfer your hub from a previously exported file
- **Export calendar (.ics)** — downloads a billing calendar file; each active paid app with a billing date becomes a recurring calendar event (monthly → `RRULE:FREQ=MONTHLY`, annual → `RRULE:FREQ=YEARLY`, one-time → single event). Import into Apple Calendar, Google Calendar, or Outlook — no server needed
- **Share** — generate a read-only link to share your app list (apps and URLs only, no private data)

## App Details & Customization

- **Custom URL** — override the default link for any app with a custom URL
- **Account email** — optionally record which email you use for each app; shown in the hover tooltip in sky blue; stored locally, never sent to any server
- **Notes** — add freeform notes to any app; displayed in the card tooltip on hover (amber italic text)
- **App status** — set each app to Active, Trial, or Cancelled:
  - Active: default, no badge
  - Trial: violet "Trial" badge on the card
  - Cancelled: card dimmed to 50% opacity with a gray "Cancelled" chip

## Bank Tracking

- **Bank catalog** — curated list of top US banks (Chase, Bank of America, Wells Fargo, Citibank, Capital One) with name, logo, description, and country
- **Bank assignment** — optionally link any app to a bank via the app detail modal; displayed as a selectable list of mini-cards (logo, name, description, country flag)
- **Bank on app card** — the assigned bank's favicon appears in the bottom-left corner of the card
- **Filter by bank** — bank chips appear in the filter bar once any app has a bank assigned; click to show only apps linked to that bank

## Payment Tracking

- **Payment type** — mark each app as Free or Paid
- **Paid details** — enter amount, billing period (Monthly / Annual / Once), and optional billing date (day, and month for annual)
- **Payment method** — optionally tag each paid app with the payment method used (Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay, Other); shown on the card, in the tooltip, and billing overview
- **Filter by payment method** — method chips appear in the filter bar once any app has a method set; click to show only apps using that method
- **Payment badge** — shown on the card for active paid/free apps; hidden for trial and cancelled
- **Due date label** — shown on the card when a billing date is set
- **Billing alerts** — pulsing orange dot on the card + orange due date text when payment is due within 7 days (active apps only; trial and cancelled excluded)
- **Status-aware totals** — trial and cancelled apps are excluded from all spending stats
- **Currency selector** — choose from 30+ currencies; amounts displayed consistently throughout

## Billing Overview

- **Stats bar** — shows total app count and spending summaries (monthly, annual, one-time) for active paid apps
- **Billing overview modal** — click any spending chip in the stats bar to open a focused breakdown:
  - `/mo` chip → Monthly subscriptions with per-app amounts and due dates
  - `/yr` chip → Annual subscriptions with per-app amounts, due dates, and a monthly equivalent (~X/mo)
  - One-time chip → One-time purchases with totals

## Settings Drawer

- **Settings drawer** — click the gear icon in the header to open a slide-in panel from the right; consolidates secondary/infrequent actions so the header stays uncluttered
  - **Sharing & Data** — Export JSON, Import JSON, Calendar export (.ics)
  - **Account** — Email Accounts manager, Currency picker (shows active code as a badge)
  - **Danger** — Delete all apps (requires "DELETE" confirmation)
- Header reduced from 10 interactive elements to 4: Search, Select mode, Share, Theme toggle, and the gear trigger

## Versioning & Changelog

- **Version badge** — current version shown as a small chip next to the subtitle in the header; click to open the changelog
- **Changelog modal** — "What's New" view showing all versions with release date, label, and categorized changes (New / Improved / Fixed)
- **`changelog.ts`** — structured data file tracking all versions; update it each release to keep the in-app history accurate

## Visuals & UX

- **View switcher** — toggle between Grid and List view using the grid/list icons next to the search bar; preference saved across sessions
  - **Grid view** — compact square cards in a dense grid (3 columns on mobile up to 8 on large screens); each card shows icon, name, payment badge, and pin/alert indicators; tooltip on hover shows full detail
  - **List view** — horizontal cards with icon, name, and selectable properties on the left and payment info on the right; rows stretch to uniform height so the "+ Add" card always matches adjacent cards
- **Card properties picker** — click the "Properties" button (sliders icon, next to the view toggle) to show/hide individual fields on list-mode cards; toggles: Brand, Status, Use, Platform, Payment, Method, Due date, Bank; each preference saved across sessions
- **App cards** — each app shown as a card with its logo, name, payment badge, and status chip
- **Hover tooltip** — hovering a card shows the app description, payment info, billing date, and notes (if any)
- **Dark / light mode** — toggle between themes; preference saved across sessions
- **Responsive layout** — works on mobile and desktop; grid adapts from 3 to 8 columns; header and search bar wrap on small screens

## Data Portability

- **Export** — download all app data (apps, URLs, payments, notes, statuses, currency) as a JSON file
- **Import** — import a previously exported JSON file to restore or transfer your hub
- **Share** — generate a read-only share link so others can view your app list (apps and URLs only, no private data)

---

*Last updated: 2026-07-02 (v2)*
