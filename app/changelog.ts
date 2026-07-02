export type ChangeCategory = "New" | "Improved" | "Fixed";

export type ChangeGroup = {
  category: ChangeCategory;
  items: string[];
};

export type Version = {
  version: string; // CalVer: YYYY.MM.DD or YYYY.MM.DD.N for multiple releases per day
  date: string;    // ISO date, used for display formatting
  label: string;
  groups: ChangeGroup[];
};

const changelog: Version[] = [
  {
    version: "2026.07.02.3",
    date: "2026-07-02",
    label: "Finance Category & Settings Polish",
    groups: [
      {
        category: "New",
        items: [
          "Finance category — all 20 banks from the bank catalog are now also available as apps (Airwallex, Bank of America, Bluevine, BNP Paribas, Boursobank, Capital One, Chase, Citibank, HSBC, Mercury, N26 Personal, Payoneer, Qonto, Relay, Revolut Business, Revolut Personal, SHINE, Wells Fargo, Wise Business, Wise Personal)",
        ],
      },
      {
        category: "Improved",
        items: [
          "Settings drawer — Account section now appears before Sharing & Data for a more natural top-to-bottom flow",
        ],
      },
    ],
  },
  {
    version: "2026.07.02.2",
    date: "2026-07-02",
    label: "Spending Filter & Properties UX",
    groups: [
      {
        category: "New",
        items: [
          "Spending filter — when at least one app is tagged Business, All / Personal / Business pills appear in the stats bar; switching filters the monthly, annual, and one-time totals (and the billing breakdown modal) to show only that segment's costs",
          "Properties toggle-all — 'Hide all' / 'Show all' button at the top of the Properties dropdown to enable or disable every card property in one click",
        ],
      },
    ],
  },
  {
    version: "2026.07.02.1",
    date: "2026-07-02",
    label: "Properties & Catalog Polish",
    groups: [
      {
        category: "New",
        items: [
          "4 new apps: Airtable and ClickUp (Productivity), GoHighLevel and Kickstarter (Marketing)",
        ],
      },
      {
        category: "Improved",
        items: [
          "Card properties now affect Grid view too — Brand subtitle, Status chip, Business chip, and Mobile/Desktop+Mobile chip all respond to property toggles in grid mode",
          "Properties button is now visibly styled (filled background) and shows an amber dot when any property is hidden",
          "List-mode '+ Add' card now fills the full row height to match adjacent app cards",
        ],
      },
    ],
  },
  {
    version: "2026.07.02",
    date: "2026-07-02",
    label: "Grid / List View Switcher & Card Properties",
    groups: [
      {
        category: "New",
        items: [
          "View switcher — toggle between Grid (compact square cards, 3–8 columns) and List (horizontal cards with full detail) using the grid/list icons next to the search bar; preference saved across sessions",
          "Card properties picker — click 'Properties' next to the view toggle to show/hide individual fields on list-mode cards (Brand, Status, Use, Platform, Payment, Method, Due date, Bank); preference saved across sessions",
        ],
      },
      {
        category: "Improved",
        items: [
          "Grid cards are simplified: icon, name, payment badge, and pin/alert indicators only — hover tooltip still shows full detail",
          "Per-category '+ Add' card adapts to the active view (square in grid, horizontal in list)",
          "List-mode cards now stretch to a uniform row height so the '+ Add' card always matches adjacent app cards",
        ],
      },
    ],
  },
  {
    version: "2026.06.30.1",
    date: "2026-06-30",
    label: "Catalog Expansion",
    groups: [
      {
        category: "New",
        items: [
          "7 new apps: OBS Studio (Design), WordPress and Shopify (Dev / Marketing), Carrefour (Shopping), Uber Eats and Deliveroo (new Food category), ADA (new Travel category)",
        ],
      },
    ],
  },
  {
    version: "2026.06.30",
    date: "2026-06-30",
    label: "Settings Drawer",
    groups: [
      {
        category: "New",
        items: [
          "Settings drawer — a slide-in panel (gear icon in the header) consolidates secondary actions: Export JSON, Import JSON, Calendar export, Email Accounts, Currency, and Delete all apps",
        ],
      },
      {
        category: "Improved",
        items: [
          "Header trimmed from 10 interactive elements to 4 — only Search, Select, Share, and Theme toggle remain visible at a glance",
        ],
      },
    ],
  },
  {
    version: "2026.06.29.3",
    date: "2026-06-29",
    label: "Email Manager, Search in Header & Layout Polish",
    groups: [
      {
        category: "New",
        items: [
          "Email Accounts manager — dedicated window (envelope icon in header) to add and remove your emails; assign one to each app from its detail modal",
        ],
      },
      {
        category: "Improved",
        items: [
          "Search bar moved into the header — always visible regardless of how many apps you have",
          "Add App button moved above the filter chips for a clearer hierarchy",
          "Per-category Add card now matches the full height of app cards",
        ],
      },
    ],
  },
  {
    version: "2026.06.29.2",
    date: "2026-06-29",
    label: "Email List, Platform Chips & Catalog",
    groups: [
      {
        category: "New",
        items: [
          "Email address book — add your emails once, then assign one per app; filter by email in the toolbar",
          "6 new apps: Baselang, italki (new Learning category), Tinder (Social), Steam (Gaming), Godot, Unreal Engine (Game Dev)",
          "Tardigrada corrected — real US phone numbers on demand (carrier-backed SIM, SMS inbound, REST API)",
        ],
      },
      {
        category: "Improved",
        items: [
          "Desktop platform chip now shows on all cards (was hidden before); 'Both' renamed to 'Desktop and Mobile' throughout",
          "Platform filter chip labels updated: Desktop / Mobile / Desktop and Mobile",
        ],
      },
    ],
  },
  {
    version: "2026.06.29.1",
    date: "2026-06-29",
    label: "Header, Card Layout & Catalog Refinements",
    groups: [
      {
        category: "New",
        items: [
          "8 new apps: Baselang and italki (new Learning category), Tinder (Social), Steam (Gaming), Godot and Unreal Engine (Game Dev), plus Tardigrada moved to Dev with corrected description (real US phone numbers on demand)",
        ],
      },
      {
        category: "Improved",
        items: [
          "Header now has a full-width separator line distinguishing it from page content",
          "App card chips (Personal, Paid, Mastercard, Mobile…) now flow in a compact flex-wrap row instead of stacking one per line",
          "Payment method chip is now in the chip cluster on the card, matching the style of all other tags",
          "App cards are taller (176px min) to comfortably fit multiple chips",
          "Sun icon in a rounded amber container; title larger; version chip moved alongside subtitle",
          "'Game Dev' category for game engines (Unity, Unreal Engine, Godot); 'Gaming' reserved for game players (Steam, DeSmuME)",
        ],
      },
    ],
  },
  {
    version: "2026.06.29",
    date: "2026-06-29",
    label: "Platform Tags, Payment Method Chip & Catalog",
    groups: [
      {
        category: "New",
        items: [
          "Platform tag per app — mark apps as Desktop (default), Mobile, or Both; Mobile and Both show a colored chip on the card; filter by platform in the toolbar",
          "11 new apps: Bolt, Pinecone, Rider, Webhook.site (Dev), ClickFunnels, Leadmagic, Leadsie, Skool, Tardigrada (Marketing), Presentify (Productivity), Botpress (AI)",
        ],
      },
      {
        category: "Improved",
        items: [
          "Payment method label on app cards is now a styled chip instead of plain text",
          "Unity moved to Gaming only (was also listed under Dev — caused an empty section)",
        ],
      },
      {
        category: "Fixed",
        items: [
          "Empty category sections no longer appear when a multi-tag app's secondary tag has no other apps",
        ],
      },
    ],
  },
  {
    version: "2026.06.27.3",
    date: "2026-06-27",
    label: "Account Email, Calendar Export & Catalog",
    groups: [
      {
        category: "New",
        items: [
          "Account email field per app — optional, stored locally, shown in the hover tooltip",
          "Calendar export — downloads a .ics file with billing reminders for all active paid apps; monthly/annual subscriptions use recurring rules so your calendar handles the repetition",
          "6 new Design apps: Adobe Photoshop, Adobe After Effects, Affinity, Aseprite, Blender, Canva",
          "5 new banks: Bluevine 🇺🇸, HSBC 🇬🇧, N26 Personal 🇩🇪, Qonto 🇫🇷, SHINE 🇫🇷",
        ],
      },
    ],
  },
  {
    version: "2026.06.27.2",
    date: "2026-06-27",
    label: "Personal / Business & Catalog Expansion",
    groups: [
      {
        category: "New",
        items: [
          "Personal / Business tag per app — set in the modal under Status; defaults to Personal",
          "Business apps show an indigo 'Business' chip on their card and in the tooltip",
          "Filter by Personal or Business from the toolbar (chips appear once any app is set to Business)",
          "5 new apps in the catalog: Instagram, TikTok, X, Snapchat (Social), Supabase (Dev)",
          "2 new French banks: BNP Paribas and Boursobank",
        ],
      },
    ],
  },
  {
    version: "2026.06.27.1",
    date: "2026-06-27",
    label: "Pinned Apps & Input Polish",
    groups: [
      {
        category: "New",
        items: [
          "Pinned section — star any app in its modal to pin it to a dedicated row at the top of your hub",
          "Pin state persists across sessions and is included in export/import",
        ],
      },
      {
        category: "Fixed",
        items: [
          "Payment amount field now rejects non-numeric characters (only digits, dot, and comma allowed)",
          "Currency label no longer overlaps the browser spinner arrows (input changed to text mode)",
          "Multi-tag apps (e.g. Unity) now appear only once in the category view — under their first tag",
        ],
      },
    ],
  },
  {
    version: "2026.06.27",
    date: "2026-06-27",
    label: "Catalog & Bank Expansions",
    groups: [
      {
        category: "New",
        items: [
          "8 new apps in the catalog: CapCut, Doola, Upwork, Deel, OneDrive, Uber, Unity, Google Workspace",
          "4 new banks: Revolut Personal, Wise Personal, plus updated bank picker",
          "In-app changelog — version chip next to the app name opens this view",
          "CalVer versioning (YYYY.MM.DD) — scales to daily releases without inflating numbers",
        ],
      },
      {
        category: "Improved",
        items: [
          "Bank picker is now searchable and sorted alphabetically",
          "Bank country flags are now stored per-bank (UK and Australian banks show 🇬🇧 / 🇦🇺)",
        ],
      },
    ],
  },
  {
    version: "2026.06.26",
    date: "2026-06-26",
    label: "Bank & Payment Methods",
    groups: [
      {
        category: "New",
        items: [
          "Bank catalog with 11 banks (US traditional, US business fintech, global fintech)",
          "Assign a bank to any paid app via the app detail modal",
          "Searchable bank picker with country flags",
          "Payment method tracking (Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay, Other)",
          "Filter by bank or payment method in the toolbar",
          "Bank favicon and payment method label visible on app cards",
        ],
      },
      {
        category: "Improved",
        items: [
          "Bank and payment method shown in hover tooltip and billing overview",
          "Billing alert dot and bank icon on cards are larger and more visible",
          "Bank section hidden for free apps — only shown when payment type is Paid",
        ],
      },
    ],
  },
  {
    version: "2026.06.25",
    date: "2026-06-25",
    label: "Billing & Status",
    groups: [
      {
        category: "New",
        items: [
          "App status: Active, Trial, or Cancelled with visual badges on cards",
          "Billing overview modal — click any spending chip to see a focused breakdown",
          "Monthly equivalent (~X/mo) shown in the annual billing view",
          "Last edited timestamp in the app detail modal",
          "Sun icon favicon (Helio branding) in the browser tab",
        ],
      },
      {
        category: "Improved",
        items: [
          "Trial and cancelled apps excluded from all spending stats and billing alerts",
          "Payment section hidden when status is Trial or Cancelled",
          "Payment info hidden from card tooltip for Trial and Cancelled apps",
          "Windows keyboard shortcut support (Ctrl+K alongside ⌘K)",
          "OS-aware shortcut hint in the search bar",
        ],
      },
      {
        category: "Fixed",
        items: [
          "Notes and status badges now correctly appear on app cards in category view",
          "Hydration error caused by server/client navigator mismatch",
        ],
      },
    ],
  },
  {
    version: "2026.06.24",
    date: "2026-06-24",
    label: "Helio Branding",
    groups: [
      {
        category: "New",
        items: [
          "App named Helio — your personal app hub",
          "Sun icon in the page header",
          "Dark / light mode toggle with preference saved across sessions",
          "30+ currency selector",
        ],
      },
      {
        category: "Improved",
        items: [
          "Responsive layout for mobile — grid adapts from 3 to 8 columns",
          "Header and search bar wrap cleanly on small screens",
        ],
      },
    ],
  },
  {
    version: "2026.06.23",
    date: "2026-06-23",
    label: "Sharing & Stats",
    groups: [
      {
        category: "New",
        items: [
          "Stats bar showing total apps and monthly / annual / one-time spending",
          "Share hub — generate a read-only link to share your app list",
          "Export hub data as a JSON file",
          "Import a previously exported JSON file",
          "Billing alerts — pulsing dot and orange due date when payment is due within 7 days",
        ],
      },
    ],
  },
  {
    version: "2026.06.22",
    date: "2026-06-22",
    label: "Payment Tracking",
    groups: [
      {
        category: "New",
        items: [
          "Mark each app as Free or Paid with amount, billing period, and optional billing date",
          "Payment badge on app cards",
          "Due date label on cards",
          "Notes — add freeform text to any app; shown in the hover tooltip",
          "Custom URL override per app",
          "Select mode with bulk delete",
          "Delete by category or delete all (with confirmation)",
        ],
      },
    ],
  },
  {
    version: "2026.06.21",
    date: "2026-06-21",
    label: "Foundation",
    groups: [
      {
        category: "New",
        items: [
          "App catalog with curated list of popular tools across AI, Dev, Design, Marketing, Productivity, and more",
          "Add and remove apps from your hub",
          "Apps grouped by category with per-category add/delete buttons",
          "Real-time search by app name",
          "Keyboard shortcut (/) to jump to search",
          "Hover tooltip showing app description, brand, and payment info",
        ],
      },
    ],
  },
];

export default changelog;
