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
