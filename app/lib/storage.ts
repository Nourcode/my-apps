import type { Payment, AppStatus, AppUse, AppPlatform, CardProps } from "./types";

const KEY = {
  appList:    "my-app-list",
  customUrls: "custom-urls",
  payments:   "app-payments",
  notes:      "app-notes",
  statuses:   "app-statuses",
  lastEdited: "app-last-edited",
  addedAt:    "app-added-at",
  banks:      "app-banks",
  pinned:     "app-pinned",
  uses:       "app-uses",
  emails:     "app-emails",
  hints:      "app-hints",
  nicknames:  "app-nicknames",
  hidden:     "app-hidden",
  emailList:  "app-email-list",
  platforms:  "app-platforms",
  theme:      "theme",
  currency:   "app-currency",
  view:       "app-view",
  cardProps:  "app-card-props",
} as const;

function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// All per-app data (pinned/hidden stored as arrays — callers convert to/from Set)
export type HubData = {
  appList:    string[];
  customUrls: Record<string, string>;
  payments:   Record<string, Payment>;
  notes:      Record<string, string>;
  statuses:   Record<string, AppStatus>;
  lastEdited: Record<string, string>;
  addedAt:    Record<string, string>;
  banks:      Record<string, string>;
  pinned:     string[];
  uses:       Record<string, AppUse>;
  emails:     Record<string, string>;
  hints:      Record<string, string>;
  nicknames:  Record<string, string>;
  hidden:     string[];
  emailList:  string[];
  platforms:  Record<string, AppPlatform>;
};

export function loadHubData(): HubData {
  return {
    appList:    getJson<string[]>(KEY.appList, []),
    customUrls: getJson<Record<string, string>>(KEY.customUrls, {}),
    payments:   getJson<Record<string, Payment>>(KEY.payments, {}),
    notes:      getJson<Record<string, string>>(KEY.notes, {}),
    statuses:   getJson<Record<string, AppStatus>>(KEY.statuses, {}),
    lastEdited: getJson<Record<string, string>>(KEY.lastEdited, {}),
    addedAt:    getJson<Record<string, string>>(KEY.addedAt, {}),
    banks:      getJson<Record<string, string>>(KEY.banks, {}),
    pinned:     getJson<string[]>(KEY.pinned, []),
    uses:       getJson<Record<string, AppUse>>(KEY.uses, {}),
    emails:     getJson<Record<string, string>>(KEY.emails, {}),
    hints:      getJson<Record<string, string>>(KEY.hints, {}),
    nicknames:  getJson<Record<string, string>>(KEY.nicknames, {}),
    hidden:     getJson<string[]>(KEY.hidden, []),
    emailList:  getJson<string[]>(KEY.emailList, []),
    platforms:  getJson<Record<string, AppPlatform>>(KEY.platforms, {}),
  };
}

export function loadPrefs(): { theme: boolean; currency: string; view: "grid" | "list"; cardProps: Partial<CardProps> } {
  const savedView = localStorage.getItem(KEY.view);
  return {
    theme:     localStorage.getItem(KEY.theme) === "dark",
    currency:  localStorage.getItem(KEY.currency) ?? "USD",
    view:      savedView === "list" ? "list" : "grid",
    cardProps: getJson<Partial<CardProps>>(KEY.cardProps, {}),
  };
}

// Individual saves for single-key updates
export const save = {
  appList:    (v: string[]) => setJson(KEY.appList, v),
  customUrls: (v: Record<string, string>) => setJson(KEY.customUrls, v),
  payments:   (v: Record<string, Payment>) => setJson(KEY.payments, v),
  notes:      (v: Record<string, string>) => setJson(KEY.notes, v),
  statuses:   (v: Record<string, AppStatus>) => setJson(KEY.statuses, v),
  lastEdited: (v: Record<string, string>) => setJson(KEY.lastEdited, v),
  addedAt:    (v: Record<string, string>) => setJson(KEY.addedAt, v),
  banks:      (v: Record<string, string>) => setJson(KEY.banks, v),
  pinned:     (v: string[]) => setJson(KEY.pinned, v),
  uses:       (v: Record<string, AppUse>) => setJson(KEY.uses, v),
  emails:     (v: Record<string, string>) => setJson(KEY.emails, v),
  hints:      (v: Record<string, string>) => setJson(KEY.hints, v),
  nicknames:  (v: Record<string, string>) => setJson(KEY.nicknames, v),
  hidden:     (v: string[]) => setJson(KEY.hidden, v),
  emailList:  (v: string[]) => setJson(KEY.emailList, v),
  platforms:  (v: Record<string, AppPlatform>) => setJson(KEY.platforms, v),
  theme:      (v: boolean) => localStorage.setItem(KEY.theme, v ? "dark" : "light"),
  currency:   (v: string) => localStorage.setItem(KEY.currency, v),
  view:       (v: "grid" | "list") => localStorage.setItem(KEY.view, v),
  cardProps:  (v: Partial<CardProps>) => setJson(KEY.cardProps, v),
};

// Bulk save for atomic multi-key updates (import, deleteApp, deleteSelected)
export function saveHubData(data: Partial<HubData>): void {
  if (data.appList !== undefined)    setJson(KEY.appList, data.appList);
  if (data.customUrls !== undefined) setJson(KEY.customUrls, data.customUrls);
  if (data.payments !== undefined)   setJson(KEY.payments, data.payments);
  if (data.notes !== undefined)      setJson(KEY.notes, data.notes);
  if (data.statuses !== undefined)   setJson(KEY.statuses, data.statuses);
  if (data.lastEdited !== undefined) setJson(KEY.lastEdited, data.lastEdited);
  if (data.addedAt !== undefined)    setJson(KEY.addedAt, data.addedAt);
  if (data.banks !== undefined)      setJson(KEY.banks, data.banks);
  if (data.pinned !== undefined)     setJson(KEY.pinned, data.pinned);
  if (data.uses !== undefined)       setJson(KEY.uses, data.uses);
  if (data.emails !== undefined)     setJson(KEY.emails, data.emails);
  if (data.hints !== undefined)      setJson(KEY.hints, data.hints);
  if (data.nicknames !== undefined)  setJson(KEY.nicknames, data.nicknames);
  if (data.hidden !== undefined)     setJson(KEY.hidden, data.hidden);
  if (data.emailList !== undefined)  setJson(KEY.emailList, data.emailList);
  if (data.platforms !== undefined)  setJson(KEY.platforms, data.platforms);
}

// Clear all app data (keeps emailList and prefs intact)
export function clearHubData(): void {
  setJson(KEY.appList, []);
  localStorage.removeItem(KEY.customUrls);
  localStorage.removeItem(KEY.payments);
  localStorage.removeItem(KEY.notes);
  localStorage.removeItem(KEY.statuses);
  localStorage.removeItem(KEY.lastEdited);
  localStorage.removeItem(KEY.addedAt);
  localStorage.removeItem(KEY.banks);
  localStorage.removeItem(KEY.pinned);
  localStorage.removeItem(KEY.uses);
  localStorage.removeItem(KEY.emails);
  localStorage.removeItem(KEY.platforms);
  localStorage.removeItem(KEY.hints);
  localStorage.removeItem(KEY.nicknames);
}
