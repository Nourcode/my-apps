"use client";

import { useState, useEffect, useRef } from "react";
import catalog, { type App } from "./catalog";
import bankCatalog from "./banks";
import changelog from "./changelog";

type PaymentPeriod = "monthly" | "annually" | "once";
type PaymentMethod = "visa" | "mastercard" | "amex" | "paypal" | "apple" | "google" | "other";
type Payment = {
  type: "free" | "paid";
  amount?: string;
  period?: PaymentPeriod;
  day?: number;
  month?: number;
  method?: PaymentMethod;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "Amex" },
  { value: "paypal", label: "PayPal" },
  { value: "apple", label: "Apple Pay" },
  { value: "google", label: "Google Pay" },
  { value: "other", label: "Other" },
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "Amex",
  paypal: "PayPal", apple: "Apple Pay", google: "Google Pay", other: "Other",
};
type Payments = Record<string, Payment>;
type BankAssignments = Record<string, string>;
type AppStatus = "active" | "trial" | "cancelled";
type Statuses = Record<string, AppStatus>;
type AppUse = "personal" | "business";
type AppUses = Record<string, AppUse>;
type AppPlatform = "desktop" | "mobile" | "both";
type DeleteTarget = { type: "all" | "category" | "selected"; tag?: string };

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "KRW", name: "South Korean Won" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "DKK", name: "Danish Krone" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "ZAR", name: "South African Rand" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "THB", name: "Thai Baht" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "ILS", name: "Israeli Shekel" },
  { code: "TWD", name: "Taiwan Dollar" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "ARS", name: "Argentine Peso" },
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ─── Icons ───────────────────────────────────────────────────────────────────

function SunIcon({ size = 15 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function TrashIcon({ size = 15 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function CheckSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 11 3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function BanknoteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function PinIcon({ size = 14, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="17" y2="22" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M5 17H19V16L17 10V4H7V10L5 16Z"
        fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"/>
      <path d="M9 4V1H15V4" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPaidLabel(amount: string, currency: string, period?: PaymentPeriod): string {
  if (!amount) return "Paid";
  try {
    const sym = new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD" })
      .formatToParts(parseFloat(amount))
      .find((p) => p.type === "currency")?.value ?? "";
    const suffix = period === "monthly" ? "/mo" : period === "annually" ? "/yr" : "";
    return `${sym}${amount}${suffix}`;
  } catch {
    return `${amount} ${currency}`;
  }
}

function paymentLabel(payment: Payment, currency: string): string {
  if (payment.type === "free") return "Free";
  return formatPaidLabel(payment.amount ?? "", currency, payment.period);
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function ordinal(n: number): string {
  const v = n % 100;
  return n + (["th","st","nd","rd"][(v - 20) % 10] || ["th","st","nd","rd"][v] || "th");
}

function paymentDueLabel(payment: Payment): string | null {
  if (payment.type === "free" || !payment.day) return null;
  if (payment.period === "annually" && payment.month) {
    return `due ${MONTH_SHORT[payment.month - 1]} ${ordinal(payment.day)}`;
  }
  if (payment.period === "monthly") {
    return `due ${ordinal(payment.day)}`;
  }
  return null;
}

function getDaysUntilDue(payment: Payment): number | null {
  if (payment.type !== "paid" || !payment.day) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (payment.period === "monthly") {
    let due = new Date(today.getFullYear(), today.getMonth(), payment.day);
    if (due < today) due = new Date(today.getFullYear(), today.getMonth() + 1, payment.day);
    return Math.round((due.getTime() - today.getTime()) / 86400000);
  }
  if (payment.period === "annually" && payment.month) {
    let due = new Date(today.getFullYear(), payment.month - 1, payment.day);
    if (due < today) due = new Date(today.getFullYear() + 1, payment.month - 1, payment.day);
    return Math.round((due.getTime() - today.getTime()) / 86400000);
  }
  return null;
}

// ─── Payment badge ────────────────────────────────────────────────────────────

function PaymentBadge({ payment, currency, d }: { payment: Payment; currency: string; d: boolean }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
      payment.type === "free"
        ? d ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"
        : d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"
    }`}>
      {paymentLabel(payment, currency)}
    </span>
  );
}

function formatLastEdited(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: diffDays > 365 ? "numeric" : undefined });
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [myAppNames, setMyAppNames] = useState<string[]>([]);
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<Payments>({});
  const [currency, setCurrency] = useState("USD");
  const [editing, setEditing] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [payTypeDraft, setPayTypeDraft] = useState<"free" | "paid">("free");
  const [payAmountDraft, setPayAmountDraft] = useState("");
  const [payPeriodDraft, setPayPeriodDraft] = useState<PaymentPeriod>("monthly");
  const [payDayDraft, setPayDayDraft] = useState("");
  const [payMonthDraft, setPayMonthDraft] = useState("");
  const [payMethodDraft, setPayMethodDraft] = useState<PaymentMethod | "">("");
  const [bankAssignments, setBankAssignments] = useState<BankAssignments>({});
  const [bankDraft, setBankDraft] = useState("");
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [showEmailPicker, setShowEmailPicker] = useState(false);
  const [activeBank, setActiveBank] = useState<string | null>(null);
  const [activePayMethod, setActivePayMethod] = useState<PaymentMethod | null>(null);
  const [uses, setUses] = useState<AppUses>({});
  const [useDraft, setUseDraft] = useState<AppUse>("personal");
  const [activeUse, setActiveUse] = useState<AppUse | null>(null);
  const [platforms, setPlatforms] = useState<Record<string, AppPlatform>>({});
  const [platformDraft, setPlatformDraft] = useState<AppPlatform>("desktop");
  const [activePlatform, setActivePlatform] = useState<AppPlatform | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesDraft, setNotesDraft] = useState("");
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [emailDraft, setEmailDraft] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [activeEmailFilter, setActiveEmailFilter] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Statuses>({});
  const [statusDraft, setStatusDraft] = useState<AppStatus>("active");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const importInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Macintosh|MacIntel/.test(navigator.userAgent));
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTag, setAddModalTag] = useState<string | null>(null);
  const [addModalSearch, setAddModalSearch] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [billingView, setBillingView] = useState<"monthly" | "annually" | "once" | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [lastEdited, setLastEdited] = useState<Record<string, string>>({});
  const [pinnedApps, setPinnedApps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedList = localStorage.getItem("my-app-list");
    if (savedList) setMyAppNames(JSON.parse(savedList));
    const savedUrls = localStorage.getItem("custom-urls");
    if (savedUrls) setCustomUrls(JSON.parse(savedUrls));
    const savedPayments = localStorage.getItem("app-payments");
    if (savedPayments) setPayments(JSON.parse(savedPayments));
    const savedCurrency = localStorage.getItem("app-currency");
    if (savedCurrency) setCurrency(savedCurrency);
    const savedNotes = localStorage.getItem("app-notes");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    const savedStatuses = localStorage.getItem("app-statuses");
    if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
    const savedLastEdited = localStorage.getItem("app-last-edited");
    if (savedLastEdited) setLastEdited(JSON.parse(savedLastEdited));
    const savedBanks = localStorage.getItem("app-banks");
    if (savedBanks) setBankAssignments(JSON.parse(savedBanks));
    const savedPinned = localStorage.getItem("app-pinned");
    if (savedPinned) setPinnedApps(new Set(JSON.parse(savedPinned)));
    const savedUses = localStorage.getItem("app-uses");
    if (savedUses) setUses(JSON.parse(savedUses));
    const savedEmails = localStorage.getItem("app-emails");
    if (savedEmails) setEmails(JSON.parse(savedEmails));
    const savedEmailList = localStorage.getItem("app-email-list");
    if (savedEmailList) setEmailList(JSON.parse(savedEmailList));
    const savedPlatforms = localStorage.getItem("app-platforms");
    if (savedPlatforms) setPlatforms(JSON.parse(savedPlatforms));
    if (localStorage.getItem("theme") === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    document.body.style.background = isDark ? "#0d0d0d" : "#f7f6f3";
    document.body.style.transition = "background 0.2s";
  }, [isDark]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function changeCurrency(code: string) {
    setCurrency(code);
    localStorage.setItem("app-currency", code);
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedApps(new Set());
  }

  function toggleSelect(name: string) {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  function shareApps() {
    const data = { apps: myAppNames, customUrls };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}/share?data=${encoded}`;
    setShareUrl(url);
    setCopied(false);
    setShowShareModal(true);
  }

  function copyShareUrl() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function exportApps() {
    const myApps = myAppNames
      .map((name) => catalog.find((a) => a.name === name))
      .filter((a): a is App => !!a)
      .map((app) => ({
        name: app.name,
        brand: app.brand,
        url: customUrls[app.name] ?? app.url,
        tags: app.tags,
        description: app.description,
        payment: payments[app.name] ?? null,
        notes: notes[app.name] ?? null,
        status: statuses[app.name] ?? null,
        lastEdited: lastEdited[app.name] ?? null,
        bank: bankAssignments[app.name] ?? null,
        pinned: pinnedApps.has(app.name),
        use: uses[app.name] ?? "personal",
        email: emails[app.name] ?? null,
        platform: platforms[app.name] ?? "desktop",
      }));
    const blob = new Blob([JSON.stringify({ currency, emailList, apps: myApps }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "helio-apps.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported!");
  }

  function exportCalendar() {
    const toExport = myAppNames
      .filter((name) => {
        const pay = payments[name];
        return pay?.type === "paid" && pay.day && (statuses[name] ?? "active") === "active";
      })
      .map((name) => ({ name, pay: payments[name]! }));

    if (toExport.length === 0) {
      showToast("No active paid apps with billing dates to export.");
      return;
    }

    const now = new Date();
    const stamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Helio//Billing Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    for (const { name, pay } of toExport) {
      const label = pay.amount
        ? `${name} — ${formatPaidLabel(pay.amount, currency, pay.period)}`
        : `${name} — Payment due`;

      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      const day = pay.day!;

      if (pay.period === "annually" && pay.month) {
        month = pay.month;
        if (new Date(year, month - 1, day) < now) year += 1;
      }

      const dtstart = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
      const end = new Date(year, month - 1, day + 1);
      const dtend = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}`;
      const uid = `helio-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}@helio.app`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${stamp}`);
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
      lines.push(`DTEND;VALUE=DATE:${dtend}`);
      lines.push(`SUMMARY:💳 ${label.replace(/[,;\\]/g, "\\$&")}`);
      lines.push("DESCRIPTION:Billing reminder — Helio");
      if (pay.period === "monthly") lines.push("RRULE:FREQ=MONTHLY");
      else if (pay.period === "annually") lines.push("RRULE:FREQ=YEARLY");
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "helio-billing.ics";
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${toExport.length} billing reminder${toExport.length !== 1 ? "s" : ""}!`);
  }

  function importApps(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const data = Array.isArray(raw) ? raw : raw.apps;
        if (!Array.isArray(data)) throw new Error("invalid");
        const validNames: string[] = [];
        const newUrls: Record<string, string> = {};
        const newPayments: Payments = {};
        const newNotes: Record<string, string> = {};
        const newStatuses: Statuses = {};
        const newLastEdited: Record<string, string> = {};
        const newBankAssignments: BankAssignments = {};
        const newPinned = new Set<string>();
        const newUsesImp: AppUses = {};
        const newEmailsImp: Record<string, string> = {};
        const newPlatformsImp: Record<string, AppPlatform> = {};
        for (const item of data) {
          const catalogApp = catalog.find((a) => a.name === item.name);
          if (!catalogApp) continue;
          validNames.push(item.name);
          if (item.url && item.url !== catalogApp.url) newUrls[item.name] = item.url;
          if (item.payment) newPayments[item.name] = item.payment;
          if (item.notes) newNotes[item.name] = item.notes;
          if (item.status) newStatuses[item.name] = item.status;
          if (item.lastEdited) newLastEdited[item.name] = item.lastEdited;
          if (item.bank) newBankAssignments[item.name] = item.bank;
          if (item.pinned) newPinned.add(item.name);
          if (item.use === "business") newUsesImp[item.name] = "business";
          if (item.email) newEmailsImp[item.name] = item.email;
          if (item.platform === "mobile" || item.platform === "both") newPlatformsImp[item.name] = item.platform;
        }
        if (!Array.isArray(raw) && raw.currency) changeCurrency(raw.currency);
        if (!Array.isArray(raw) && Array.isArray(raw.emailList)) {
          setEmailList(raw.emailList);
          localStorage.setItem("app-email-list", JSON.stringify(raw.emailList));
        }
        setMyAppNames(validNames);
        setCustomUrls(newUrls);
        setPayments(newPayments);
        setNotes(newNotes);
        setStatuses(newStatuses);
        setLastEdited(newLastEdited);
        setBankAssignments(newBankAssignments);
        setPinnedApps(newPinned);
        setUses(newUsesImp);
        setEmails(newEmailsImp);
        setPlatforms(newPlatformsImp);
        localStorage.setItem("my-app-list", JSON.stringify(validNames));
        localStorage.setItem("custom-urls", JSON.stringify(newUrls));
        localStorage.setItem("app-payments", JSON.stringify(newPayments));
        localStorage.setItem("app-notes", JSON.stringify(newNotes));
        localStorage.setItem("app-statuses", JSON.stringify(newStatuses));
        localStorage.setItem("app-last-edited", JSON.stringify(newLastEdited));
        localStorage.setItem("app-banks", JSON.stringify(newBankAssignments));
        localStorage.setItem("app-pinned", JSON.stringify([...newPinned]));
        localStorage.setItem("app-uses", JSON.stringify(newUsesImp));
        localStorage.setItem("app-emails", JSON.stringify(newEmailsImp));
        localStorage.setItem("app-platforms", JSON.stringify(newPlatformsImp));
        showToast(`Imported ${validNames.length} app${validNames.length !== 1 ? "s" : ""}!`);
      } catch {
        showToast("Invalid file — import failed.");
      }
    };
    reader.readAsText(file);
  }

  function openDeleteModal(type: DeleteTarget["type"], tag?: string) {
    setDeleteTarget({ type, tag });
    setDeleteInput("");
  }

  function confirmDelete() {
    if (deleteInput !== "DELETE" || !deleteTarget) return;

    if (deleteTarget.type === "all") {
      setMyAppNames([]);
      setCustomUrls({});
      setPayments({});
      setNotes({});
      setStatuses({});
      setLastEdited({});
      setBankAssignments({});
      setPinnedApps(new Set());
      setUses({});
      setEmails({});
      setPlatforms({});
      localStorage.setItem("my-app-list", JSON.stringify([]));
      localStorage.removeItem("custom-urls");
      localStorage.removeItem("app-payments");
      localStorage.removeItem("app-notes");
      localStorage.removeItem("app-statuses");
      localStorage.removeItem("app-last-edited");
      localStorage.removeItem("app-banks");
      localStorage.removeItem("app-pinned");
      localStorage.removeItem("app-uses");
      localStorage.removeItem("app-emails");
      localStorage.removeItem("app-platforms");

    } else if (deleteTarget.type === "category" && deleteTarget.tag) {
      const toRemove = new Set(
        myApps.filter((a) => a.tags.includes(deleteTarget.tag!)).map((a) => a.name)
      );
      const updated = myAppNames.filter((n) => !toRemove.has(n));
      setMyAppNames(updated);
      localStorage.setItem("my-app-list", JSON.stringify(updated));

    } else if (deleteTarget.type === "selected") {
      const toDelete = selectedApps;
      const updated = myAppNames.filter((n) => !toDelete.has(n));
      const updatedUrls = { ...customUrls };
      const updatedPayments = { ...payments };
      const updatedNotes = { ...notes };
      const updatedStatuses = { ...statuses };
      const updatedLastEdited = { ...lastEdited };
      const updatedBankAssignments = { ...bankAssignments };
      const updatedPinnedSel = new Set(pinnedApps);
      const updatedUsesSel = { ...uses };
      const updatedEmailsSel = { ...emails };
      const updatedPlatformsSel = { ...platforms };
      toDelete.forEach((n) => { delete updatedUrls[n]; delete updatedPayments[n]; delete updatedNotes[n]; delete updatedStatuses[n]; delete updatedLastEdited[n]; delete updatedBankAssignments[n]; updatedPinnedSel.delete(n); delete updatedUsesSel[n]; delete updatedEmailsSel[n]; delete updatedPlatformsSel[n]; });
      setMyAppNames(updated);
      setCustomUrls(updatedUrls);
      setPayments(updatedPayments);
      setNotes(updatedNotes);
      setStatuses(updatedStatuses);
      setLastEdited(updatedLastEdited);
      setBankAssignments(updatedBankAssignments);
      setPinnedApps(updatedPinnedSel);
      setUses(updatedUsesSel);
      setEmails(updatedEmailsSel);
      setPlatforms(updatedPlatformsSel);
      localStorage.setItem("my-app-list", JSON.stringify(updated));
      localStorage.setItem("custom-urls", JSON.stringify(updatedUrls));
      localStorage.setItem("app-payments", JSON.stringify(updatedPayments));
      localStorage.setItem("app-notes", JSON.stringify(updatedNotes));
      localStorage.setItem("app-statuses", JSON.stringify(updatedStatuses));
      localStorage.setItem("app-last-edited", JSON.stringify(updatedLastEdited));
      localStorage.setItem("app-banks", JSON.stringify(updatedBankAssignments));
      localStorage.setItem("app-pinned", JSON.stringify([...updatedPinnedSel]));
      localStorage.setItem("app-uses", JSON.stringify(updatedUsesSel));
      localStorage.setItem("app-emails", JSON.stringify(updatedEmailsSel));
      localStorage.setItem("app-platforms", JSON.stringify(updatedPlatformsSel));
      setSelectedApps(new Set());
      setSelectMode(false);
    }

    setDeleteTarget(null);
    setDeleteInput("");
    setEditing(null);
  }

  function openAddModal(tag: string | null) {
    setAddModalTag(tag);
    setAddModalSearch("");
    setShowAddModal(true);
  }

  function addApp(name: string) {
    const updated = [...myAppNames, name];
    setMyAppNames(updated);
    localStorage.setItem("my-app-list", JSON.stringify(updated));
    const updatedPayments = { ...payments, [name]: { type: "free" as const } };
    setPayments(updatedPayments);
    localStorage.setItem("app-payments", JSON.stringify(updatedPayments));
  }

  function deleteApp(name: string) {
    const updated = myAppNames.filter((n) => n !== name);
    const updatedUrls = { ...customUrls };
    const updatedPayments = { ...payments };
    const updatedNotes = { ...notes };
    const updatedStatuses = { ...statuses };
    const updatedLastEdited = { ...lastEdited };
    delete updatedUrls[name];
    delete updatedPayments[name];
    delete updatedNotes[name];
    delete updatedStatuses[name];
    delete updatedLastEdited[name];
    const updatedBankAssignments = { ...bankAssignments };
    delete updatedBankAssignments[name];
    const updatedPinned = new Set(pinnedApps);
    updatedPinned.delete(name);
    const updatedUsesDel = { ...uses };
    delete updatedUsesDel[name];
    const updatedEmailsDel = { ...emails };
    delete updatedEmailsDel[name];
    const updatedPlatformsDel = { ...platforms };
    delete updatedPlatformsDel[name];
    setMyAppNames(updated);
    setCustomUrls(updatedUrls);
    setPayments(updatedPayments);
    setNotes(updatedNotes);
    setStatuses(updatedStatuses);
    setLastEdited(updatedLastEdited);
    setBankAssignments(updatedBankAssignments);
    setPinnedApps(updatedPinned);
    setUses(updatedUsesDel);
    setEmails(updatedEmailsDel);
    setPlatforms(updatedPlatformsDel);
    localStorage.setItem("my-app-list", JSON.stringify(updated));
    localStorage.setItem("custom-urls", JSON.stringify(updatedUrls));
    localStorage.setItem("app-payments", JSON.stringify(updatedPayments));
    localStorage.setItem("app-notes", JSON.stringify(updatedNotes));
    localStorage.setItem("app-statuses", JSON.stringify(updatedStatuses));
    localStorage.setItem("app-last-edited", JSON.stringify(updatedLastEdited));
    localStorage.setItem("app-banks", JSON.stringify(updatedBankAssignments));
    localStorage.setItem("app-pinned", JSON.stringify([...updatedPinned]));
    localStorage.setItem("app-uses", JSON.stringify(updatedUsesDel));
    localStorage.setItem("app-emails", JSON.stringify(updatedEmailsDel));
    localStorage.setItem("app-platforms", JSON.stringify(updatedPlatformsDel));
    setEditing(null);
  }

  function openAppDetail(name: string) {
    const pay = payments[name];
    setEditing(name);
    setUrlDraft(customUrls[name] ?? catalog.find((a) => a.name === name)?.url ?? "");
    setPayTypeDraft(pay?.type ?? "free");
    setPayAmountDraft(pay?.amount ?? "");
    setPayPeriodDraft(pay?.period ?? "monthly");
    setPayDayDraft(pay?.day ? String(pay.day) : "");
    setPayMonthDraft(pay?.month ? String(pay.month) : "");
    setPayMethodDraft(pay?.method ?? "");
    setBankDraft(bankAssignments[name] ?? "");
    setShowBankPicker(false);
    setBankSearch("");
    setShowEmailPicker(false);
    setNotesDraft(notes[name] ?? "");
    setEmailDraft(emails[name] ?? "");
    setStatusDraft(statuses[name] ?? "active");
    setUseDraft(uses[name] ?? "personal");
    setPlatformDraft(platforms[name] ?? "desktop");
    setNewEmailInput("");
  }

  function addEmailToList() {
    const trimmed = newEmailInput.trim();
    if (!trimmed || emailList.includes(trimmed)) { setNewEmailInput(""); return; }
    const updated = [...emailList, trimmed];
    setEmailList(updated);
    localStorage.setItem("app-email-list", JSON.stringify(updated));
    setNewEmailInput("");
  }

  function removeEmailFromList(email: string) {
    const updated = emailList.filter((e) => e !== email);
    setEmailList(updated);
    localStorage.setItem("app-email-list", JSON.stringify(updated));
    const updatedEmails = Object.fromEntries(Object.entries(emails).filter(([, v]) => v !== email));
    setEmails(updatedEmails);
    localStorage.setItem("app-emails", JSON.stringify(updatedEmails));
    if (emailDraft === email) setEmailDraft("");
  }

  function togglePin(name: string) {
    const updated = new Set(pinnedApps);
    if (updated.has(name)) updated.delete(name); else updated.add(name);
    setPinnedApps(updated);
    localStorage.setItem("app-pinned", JSON.stringify([...updated]));
  }

  function saveEdit() {
    if (!editing) return;
    const updatedUrls = { ...customUrls, [editing]: urlDraft };
    setCustomUrls(updatedUrls);
    localStorage.setItem("custom-urls", JSON.stringify(updatedUrls));
    const updatedPayments: Payments = {
      ...payments,
      [editing]:
        payTypeDraft === "free"
          ? { type: "free" }
          : {
              type: "paid",
              amount: payAmountDraft,
              period: payPeriodDraft,
              ...(payDayDraft ? { day: parseInt(payDayDraft) } : {}),
              ...(payMonthDraft && payPeriodDraft === "annually" ? { month: parseInt(payMonthDraft) } : {}),
              ...(payMethodDraft ? { method: payMethodDraft as PaymentMethod } : {}),
            },
    };
    setPayments(updatedPayments);
    localStorage.setItem("app-payments", JSON.stringify(updatedPayments));
    const updatedNotes = { ...notes };
    if (notesDraft.trim()) {
      updatedNotes[editing] = notesDraft.trim();
    } else {
      delete updatedNotes[editing];
    }
    setNotes(updatedNotes);
    localStorage.setItem("app-notes", JSON.stringify(updatedNotes));
    const updatedEmails = { ...emails };
    if (emailDraft.trim()) {
      updatedEmails[editing] = emailDraft.trim();
    } else {
      delete updatedEmails[editing];
    }
    setEmails(updatedEmails);
    localStorage.setItem("app-emails", JSON.stringify(updatedEmails));
    const updatedStatuses = { ...statuses };
    if (statusDraft === "active") {
      delete updatedStatuses[editing];
    } else {
      updatedStatuses[editing] = statusDraft;
    }
    setStatuses(updatedStatuses);
    localStorage.setItem("app-statuses", JSON.stringify(updatedStatuses));
    const updatedLastEdited = { ...lastEdited, [editing]: new Date().toISOString() };
    setLastEdited(updatedLastEdited);
    localStorage.setItem("app-last-edited", JSON.stringify(updatedLastEdited));
    const updatedBankAssignments = { ...bankAssignments };
    if (bankDraft && payTypeDraft === "paid") {
      updatedBankAssignments[editing] = bankDraft;
    } else {
      delete updatedBankAssignments[editing];
    }
    setBankAssignments(updatedBankAssignments);
    localStorage.setItem("app-banks", JSON.stringify(updatedBankAssignments));
    const updatedUses = { ...uses };
    if (useDraft === "personal") {
      delete updatedUses[editing];
    } else {
      updatedUses[editing] = useDraft;
    }
    setUses(updatedUses);
    localStorage.setItem("app-uses", JSON.stringify(updatedUses));
    const updatedPlatforms = { ...platforms };
    if (platformDraft === "desktop") {
      delete updatedPlatforms[editing];
    } else {
      updatedPlatforms[editing] = platformDraft;
    }
    setPlatforms(updatedPlatforms);
    localStorage.setItem("app-platforms", JSON.stringify(updatedPlatforms));
    setEditing(null);
  }

  const myApps: App[] = myAppNames
    .map((name) => catalog.find((a) => a.name === name))
    .filter((a): a is App => !!a);

  const availableTags = Array.from(new Set(myApps.flatMap((a) => a.tags))).sort();

  const filteredApps = myApps
    .filter((app) => !activeTag || app.tags.includes(activeTag))
    .filter((app) => !activeBank || bankAssignments[app.name] === activeBank)
    .filter((app) => !activePayMethod || payments[app.name]?.method === activePayMethod)
    .filter((app) => !activeUse || (uses[app.name] ?? "personal") === activeUse)
    .filter((app) => !activePlatform || (platforms[app.name] ?? "desktop") === activePlatform)
    .filter((app) => !activeEmailFilter || emails[app.name] === activeEmailFilter)
    .filter((app) => app.name.toLowerCase().includes(search.toLowerCase()));
  const hasBusinessApp = myAppNames.some((n) => uses[n] === "business");
  const hasNonDesktopApp = myAppNames.some((n) => platforms[n] === "mobile" || platforms[n] === "both");

  const usedBanks = Array.from(new Set(myAppNames.map((n) => bankAssignments[n]).filter(Boolean))).sort() as string[];
  const usedPayMethods = Array.from(new Set(myAppNames.map((n) => payments[n]?.method).filter((m): m is PaymentMethod => !!m))).sort();
  const usedEmailFilters = Array.from(new Set(myAppNames.map((n) => emails[n]).filter(Boolean))).sort() as string[];

  // Each app is shown only once in the category grid — under its first matching tag.
  // Multi-tag apps (e.g. Unity: Dev + Gaming) are still discoverable via the filter chips.
  const primaryTagForApp = new Map<string, string>();
  for (const app of myApps) {
    const primary = availableTags.find((t) => app.tags.includes(t));
    if (primary) primaryTagForApp.set(app.name, primary);
  }

  const availableToAdd = catalog.filter((a) => !myAppNames.includes(a.name));
  const addModalBaseApps = (addModalTag
    ? availableToAdd.filter((a) => a.tags.includes(addModalTag))
    : availableToAdd
  ).sort((a, b) => a.name.localeCompare(b.name));
  const addModalApps = addModalSearch.trim()
    ? addModalBaseApps.filter((a) => {
        const q = addModalSearch.toLowerCase();
        return a.name.toLowerCase().includes(q)
          || a.brand.toLowerCase().includes(q)
          || a.tags.some((t) => t.toLowerCase().includes(q));
      })
    : addModalBaseApps;

  const addDropdownApps = addSearch.trim()
    ? catalog
        .filter((a) =>
          a.name.toLowerCase().includes(addSearch.toLowerCase()) ||
          a.brand.toLowerCase().includes(addSearch.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(addSearch.toLowerCase()))
        )
        .sort((a, b) => {
          const aAdded = myAppNames.includes(a.name);
          const bAdded = myAppNames.includes(b.name);
          if (aAdded !== bAdded) return aAdded ? 1 : -1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 8)
    : [];

  const editingApp = editing ? catalog.find((a) => a.name === editing) : null;

  // Stats — only active apps count (trial = not paying yet, cancelled = no longer paying)
  let statsMonthly = 0;
  let statsAnnual = 0;
  let statsOnce = 0;
  for (const name of myAppNames) {
    const st = statuses[name];
    if (st === "trial" || st === "cancelled") continue;
    const pay = payments[name];
    if (!pay || pay.type !== "paid" || !pay.amount) continue;
    const amt = parseFloat(pay.amount);
    if (isNaN(amt)) continue;
    if (pay.period === "monthly") statsMonthly += amt;
    else if (pay.period === "annually") statsAnnual += amt;
    else if (pay.period === "once") statsOnce += amt;
  }

  function fmtCurrency(amount: number) {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  }

  const d = isDark;
  const inputCls = `w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`;
  const selectCls = `w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors appearance-none ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`;

  return (
    <main className={`min-h-screen px-4 sm:px-10 pt-0 pb-8 sm:pb-12 transition-colors duration-200 ${selectMode ? "pb-28" : ""} ${d ? "bg-[#0d0d0d] text-white" : "bg-[#f7f6f3] text-gray-900"}`}>

      {/* Header */}
      <div className={`-mx-4 sm:-mx-10 px-4 sm:px-10 py-3 mb-6 border-b ${d ? "border-white/[0.08]" : "border-black/[0.07]"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-amber-500 ${d ? "bg-amber-500/10" : "bg-amber-50"}`}>
            <SunIcon size={15} />
          </div>
          <span className={`text-sm font-medium ${d ? "text-gray-300" : "text-gray-700"}`}>testuser</span>
          <button onClick={() => setShowChangelog(true)}
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${d ? "bg-white/8 text-gray-500 hover:bg-white/12 hover:text-gray-300" : "bg-black/[0.06] text-gray-400 hover:bg-black/10 hover:text-gray-600"}`}>
            {changelog[0].version}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Add app autocomplete search */}
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-500" : "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <input
              type="text"
              placeholder="Add an app…"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              onFocus={() => setShowAddDropdown(true)}
              onBlur={() => setTimeout(() => setShowAddDropdown(false), 150)}
              onKeyDown={(e) => e.key === "Escape" && (setAddSearch(""), setShowAddDropdown(false), (e.target as HTMLInputElement).blur())}
              className={`pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none border transition-colors w-72 ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-white border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
            />
            {showAddDropdown && addSearch.trim() && (
              <div className={`absolute top-full right-0 mt-1.5 w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`}>
                {addDropdownApps.length === 0 ? (
                  <p className={`text-xs text-center py-4 ${d ? "text-gray-500" : "text-gray-400"}`}>
                    No results for &ldquo;{addSearch}&rdquo;
                  </p>
                ) : addDropdownApps.map((app) => {
                  const alreadyAdded = myAppNames.includes(app.name);
                  return (
                    <button key={app.name}
                      onMouseDown={() => { if (!alreadyAdded) { addApp(app.name); setAddSearch(""); setShowAddDropdown(false); showToast(`${app.name} added!`); } }}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${alreadyAdded ? "cursor-default opacity-50" : d ? "hover:bg-white/6" : "hover:bg-gray-50"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={app.icon} alt={app.name} className="w-9 h-9 rounded-xl flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-medium ${d ? "text-gray-100" : "text-gray-800"}`}>{app.name}</span>
                          <span className={`text-[11px] ${d ? "text-gray-500" : "text-gray-400"}`}>{app.brand}</span>
                          {alreadyAdded && (
                            <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${d ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"}`}>
                              In hub
                            </span>
                          )}
                        </div>
                        <div className={`text-xs leading-snug mt-0.5 line-clamp-2 ${d ? "text-gray-400" : "text-gray-500"}`}>{app.description}</div>
                        <div className={`text-[11px] mt-1 ${d ? "text-gray-600" : "text-gray-400"}`}>{app.tags.join(" · ")}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Share */}
          <button onClick={shareApps} title="Share hub"
            className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <ShareIcon />
            <span>Share</span>
          </button>
          {/* Theme toggle */}
          <button onClick={toggleTheme} title={d ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            {d ? <SunIcon /> : <MoonIcon />}
          </button>
          {/* Settings drawer trigger */}
          <button onClick={() => setShowSettingsDrawer(true)} title="Settings"
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <SettingsIcon />
          </button>
          <input ref={importInputRef} type="file" accept=".json,application/json" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importApps(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      </div>

      {/* Stats bar + filter search + select mode */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {myAppNames.length > 0 && (
            <>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${d ? "bg-white/8 text-gray-400" : "bg-black/[0.05] text-gray-500"}`}>
                {myAppNames.length} app{myAppNames.length !== 1 ? "s" : ""}
              </span>
              {statsMonthly > 0 && (
                <button onClick={() => setBillingView("monthly")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${d ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                  {fmtCurrency(statsMonthly)}/mo
                </button>
              )}
              {statsAnnual > 0 && (
                <button onClick={() => setBillingView("annually")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${d ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                  {fmtCurrency(statsAnnual)}/yr
                </button>
              )}
              {statsOnce > 0 && (
                <button onClick={() => setBillingView("once")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-black/[0.05] text-gray-500 hover:bg-black/[0.08]"}`}>
                  {fmtCurrency(statsOnce)} one-time
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Filter search */}
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-500" : "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input ref={searchRef} type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (setSearch(""), (e.target as HTMLInputElement).blur())}
              className={`pl-8 pr-12 py-1.5 rounded-xl text-sm outline-none border transition-colors w-40 ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-white border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
            />
            <kbd className={`absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-medium pointer-events-none select-none ${d ? "text-gray-600" : "text-gray-300"}`}>
              {isMac ? <><span>⌘</span><span>K</span></> : <><span>Ctrl</span><span>K</span></>}
            </kbd>
          </div>
          {/* Select mode */}
          <button onClick={() => { exitSelectMode(); setSelectMode(true); }} title="Select apps"
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0 ${selectMode ? "bg-amber-500 text-white" : d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <CheckSquareIcon />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-8">
        {(availableTags.length > 0 || usedBanks.length > 0 || usedPayMethods.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {/* All — clears every filter */}
            <button onClick={() => { setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === null && activeBank === null && activePayMethod === null && activeUse === null && activePlatform === null && activeEmailFilter === null ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
              All
            </button>

            {/* Category chips */}
            {availableTags.map((tag) => (
              <button key={tag} onClick={() => { setActiveTag(activeTag === tag ? null : tag); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === tag ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                {tag}
              </button>
            ))}

            {/* Bank filter chips */}
            {usedBanks.length > 0 && availableTags.length > 0 && (
              <div className={`w-px h-4 self-center ${d ? "bg-white/10" : "bg-black/10"}`} />
            )}
            {usedBanks.map((bank) => {
              const b = bankCatalog.find((x) => x.name === bank);
              return (
                <button key={bank} onClick={() => { setActiveBank(activeBank === bank ? null : bank); setActiveTag(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeBank === bank ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                  {b && <img src={b.icon} alt={b.name} className="w-3.5 h-3.5 rounded" />}
                  {bank}
                </button>
              );
            })}

            {/* Payment method filter chips */}
            {usedPayMethods.length > 0 && (usedBanks.length > 0 || availableTags.length > 0) && (
              <div className={`w-px h-4 self-center ${d ? "bg-white/10" : "bg-black/10"}`} />
            )}
            {usedPayMethods.map((method) => (
              <button key={method} onClick={() => { setActivePayMethod(activePayMethod === method ? null : method); setActiveTag(null); setActiveBank(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activePayMethod === method ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                {METHOD_LABEL[method]}
              </button>
            ))}

            {/* Use filter chips — shown once at least one app is set to Business */}
            {hasBusinessApp && (
              <>
                <div className={`w-px h-4 self-center ${d ? "bg-white/10" : "bg-black/10"}`} />
                {(["personal", "business"] as AppUse[]).map((u) => (
                  <button key={u} onClick={() => { setActiveUse(activeUse === u ? null : u); setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActivePlatform(null); setActiveEmailFilter(null); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${activeUse === u ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                    {u}
                  </button>
                ))}
              </>
            )}
            {/* Platform filter chips — shown once at least one app is set to Mobile or Both */}
            {hasNonDesktopApp && (
              <>
                <div className={`w-px h-4 self-center ${d ? "bg-white/10" : "bg-black/10"}`} />
                {(["desktop", "mobile", "both"] as AppPlatform[]).map((p) => (
                  <button key={p} onClick={() => { setActivePlatform(activePlatform === p ? null : p); setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActiveEmailFilter(null); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activePlatform === p ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                    {p === "both" ? "Desktop and Mobile" : p === "mobile" ? "Mobile" : "Desktop"}
                  </button>
                ))}
              </>
            )}
            {/* Email filter chips — shown once at least one app has an email assigned */}
            {usedEmailFilters.length > 0 && (
              <>
                <div className={`w-px h-4 self-center ${d ? "bg-white/10" : "bg-black/10"}`} />
                {usedEmailFilters.map((email) => (
                  <button key={email} onClick={() => { setActiveEmailFilter(activeEmailFilter === email ? null : email); setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); }}
                    title={email}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors max-w-[160px] truncate ${activeEmailFilter === email ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                    {email}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* App grid */}
      {activeTag || activeBank || activePayMethod || activeUse || activePlatform || activeEmailFilter || search ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {filteredApps.map((app) => (
            <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
              payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]}
              bank={bankAssignments[app.name]} use={uses[app.name]} platform={platforms[app.name]} email={emails[app.name]} d={d}
              selectMode={selectMode} isSelected={selectedApps.has(app.name)}
              onOpen={() => openAppDetail(app.name)}
              onToggleSelect={() => toggleSelect(app.name)}
            />
          ))}
          {filteredApps.length === 0 && (
            <p className={`col-span-full text-sm ${d ? "text-gray-600" : "text-gray-400"}`}>No apps match your search.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* Pinned section — shown before categories when at least one hub app is pinned */}
          {myApps.some((a) => pinnedApps.has(a.name)) && (
            <section>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-amber-500"><PinIcon size={12} filled /></span>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-500">Pinned</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                {myApps.filter((a) => pinnedApps.has(a.name)).map((app) => (
                  <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
                    payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]}
                    bank={bankAssignments[app.name]} use={uses[app.name]} platform={platforms[app.name]} email={emails[app.name]} pinned d={d}
                    selectMode={selectMode} isSelected={selectedApps.has(app.name)}
                    onOpen={() => openAppDetail(app.name)}
                    onToggleSelect={() => toggleSelect(app.name)}
                  />
                ))}
              </div>
            </section>
          )}

          {availableTags.length === 0 ? (
            <p className={`text-sm ${d ? "text-gray-600" : "text-gray-400"}`}>
              No apps yet. Use the search bar in the header to add one.
            </p>
          ) : (
            availableTags.map((tag) => (
              <section key={tag}>
                <div className="flex items-center gap-1.5 mb-4">
                  <h2 className={`text-xs font-semibold uppercase tracking-widest ${d ? "text-gray-500" : "text-gray-400"}`}>{tag}</h2>
                  <button onClick={() => openDeleteModal("category", tag)} title={`Delete all ${tag} apps`}
                    className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${d ? "text-gray-500 hover:bg-red-500/15 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-500"}`}>
                    <TrashIcon size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                  {myApps.filter((a) => primaryTagForApp.get(a.name) === tag).map((app) => (
                    <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
                      payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]}
                      bank={bankAssignments[app.name]} use={uses[app.name]} platform={platforms[app.name]} email={emails[app.name]} d={d}
                      selectMode={selectMode} isSelected={selectedApps.has(app.name)}
                      onOpen={() => openAppDetail(app.name)}
                      onToggleSelect={() => toggleSelect(app.name)}
                    />
                  ))}
                  {!selectMode && (
                    <button onClick={() => openAddModal(tag)}
                      className={`flex flex-col items-center justify-center gap-3 min-h-[11rem] rounded-2xl p-4 border border-dashed hover:scale-105 transition-all duration-200 ${d ? "border-white/20 text-white/30 hover:border-amber-500/50 hover:text-amber-400" : "border-black/20 text-black/25 hover:border-amber-500/50 hover:text-amber-500"}`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-light">+</div>
                      <span className="text-xs font-medium">Add</span>
                    </button>
                  )}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* Select mode bottom bar */}
      {selectMode && (
        <div className={`fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between gap-4 z-40 border-t ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`}>
          <span className={`text-sm font-medium ${d ? "text-gray-300" : "text-gray-700"}`}>
            {selectedApps.size} app{selectedApps.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button onClick={exitSelectMode}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${d ? "bg-white/8 text-gray-300 hover:bg-white/12" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Cancel
            </button>
            <button
              onClick={() => selectedApps.size > 0 && openDeleteModal("selected")}
              disabled={selectedApps.size === 0}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${selectedApps.size > 0 ? "bg-red-500 text-white hover:bg-red-600" : d ? "bg-white/5 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}>
              Delete{selectedApps.size > 0 ? ` (${selectedApps.size})` : ""}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 ${d ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
          {toast}
        </div>
      )}

      {/* App detail modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setEditing(null)}>
          <div className={`rounded-2xl p-6 w-full max-w-xs shadow-2xl border max-h-[90vh] overflow-y-auto ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>

            {/* App identity + Visit */}
            <div className="flex items-center gap-3 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editingApp.icon} alt={editingApp.name} className="w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">{editingApp.name}</div>
                <div className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>{editingApp.brand}</div>
                <div className={`text-[11px] mt-1 ${d ? "text-gray-600" : "text-gray-400"}`}>
                  {lastEdited[editing!] ? `Edited ${formatLastEdited(lastEdited[editing!])}` : "Never edited"}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePin(editing!)}
                  title={pinnedApps.has(editing!) ? "Unpin" : "Pin to top"}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    pinnedApps.has(editing!)
                      ? "bg-amber-500/15 text-amber-500"
                      : d ? "bg-white/8 text-gray-400 hover:bg-white/12 hover:text-gray-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  }`}>
                  <PinIcon size={14} filled={pinnedApps.has(editing!)} />
                </button>
                <a href={customUrls[editing!] ?? editingApp.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12 hover:text-gray-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"}`}>
                  Visit <ExternalLinkIcon />
                </a>
              </div>
            </div>

            {/* URL */}
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Link</p>
            <input
              className={inputCls}
              value={urlDraft} placeholder="https://..." onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus
            />

            {/* Account Email */}
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>
              Account Email <span className="normal-case font-normal opacity-60">— optional</span>
            </p>
            {emailList.length === 0 ? (
              <p className={`text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>
                No emails saved — use the ✉ icon in the header to add some.
              </p>
            ) : (
              <>
                {/* Trigger */}
                <button onClick={() => setShowEmailPicker(!showEmailPicker)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors border ${d ? "bg-white/5 border-white/10 hover:bg-white/8" : "bg-gray-50 border-black/[0.08] hover:bg-gray-100"}`}>
                  {emailDraft ? (
                    <span className={`flex-1 truncate ${d ? "text-gray-200" : "text-gray-800"}`}>{emailDraft}</span>
                  ) : (
                    <span className={`flex-1 ${d ? "text-gray-500" : "text-gray-400"}`}>No email — tap to assign</span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-transform ${showEmailPicker ? "rotate-180" : ""} ${d ? "text-gray-500" : "text-gray-400"}`}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                {/* Dropdown */}
                {showEmailPicker && (
                  <div className={`mt-1 rounded-xl border overflow-hidden shadow-lg ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`}>
                    <div className="max-h-48 overflow-y-auto">
                      {emailList.map((email) => (
                        <button key={email}
                          onClick={() => { setEmailDraft(email === emailDraft ? "" : email); setShowEmailPicker(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${emailDraft === email ? d ? "bg-white/10" : "bg-gray-100" : d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                          <span className={`flex-1 truncate text-sm ${d ? "text-gray-200" : "text-gray-800"}`}>{email}</span>
                          {emailDraft === email && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={d ? "text-sky-400" : "text-sky-600"}>
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {emailDraft && (
                  <button onClick={() => setEmailDraft("")}
                    className={`mt-1.5 text-xs ${d ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                    Clear email
                  </button>
                )}
              </>
            )}

            {/* Status */}
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>Status</p>
            <div className="flex gap-2">
              {([
                { value: "active", label: "Active" },
                { value: "trial", label: "Trial" },
                { value: "cancelled", label: "Cancelled" },
              ] as { value: AppStatus; label: string }[]).map(({ value, label }) => (
                <button key={value} onClick={() => setStatusDraft(value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                    statusDraft === value
                      ? value === "active" ? "bg-green-500 text-white"
                        : value === "trial" ? "bg-violet-500 text-white"
                        : "bg-gray-500 text-white"
                      : d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Use */}
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>Use</p>
            <div className="flex gap-2">
              {(["personal", "business"] as AppUse[]).map((u) => (
                <button key={u} onClick={() => setUseDraft(u)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                    useDraft === u
                      ? u === "personal" ? "bg-sky-500 text-white" : "bg-indigo-500 text-white"
                      : d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {u}
                </button>
              ))}
            </div>

            {/* Platform */}
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>Platform</p>
            <div className="flex gap-2">
              {(["desktop", "mobile", "both"] as AppPlatform[]).map((p) => (
                <button key={p} onClick={() => setPlatformDraft(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                    platformDraft === p
                      ? p === "desktop" ? "bg-gray-500 text-white" : p === "mobile" ? "bg-violet-500 text-white" : "bg-teal-500 text-white"
                      : d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {p === "both" ? "Desktop and Mobile" : p === "mobile" ? "Mobile" : "Desktop"}
                </button>
              ))}
            </div>

            {/* Payment — hidden for trial/cancelled (not relevant until active) */}
            {statusDraft === "active" && (<>
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>Payment</p>
            <div className="flex gap-2 mb-3">
              {(["free", "paid"] as const).map((t) => (
                <button key={t} onClick={() => setPayTypeDraft(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                    payTypeDraft === t
                      ? t === "free" ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                      : d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {t === "free" ? "Free" : "Paid"}
                </button>
              ))}
            </div>

            {payTypeDraft === "paid" && (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="text" inputMode="decimal" placeholder="9.99" value={payAmountDraft}
                    onChange={(e) => setPayAmountDraft(e.target.value.replace(/[^0-9.,]/g, ""))}
                    className={`${inputCls} pr-12`}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none ${d ? "text-gray-500" : "text-gray-400"}`}>
                    {currency}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  {([
                    { value: "monthly", label: "Monthly" },
                    { value: "annually", label: "Annually" },
                    { value: "once", label: "Once" },
                  ] as { value: PaymentPeriod; label: string }[]).map(({ value, label }) => (
                    <button key={value} onClick={() => setPayPeriodDraft(value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                        payPeriodDraft === value
                          ? d ? "bg-white/20 text-white" : "bg-gray-900 text-white"
                          : d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Payment method */}
                <div className={`pt-3 mt-1 border-t ${d ? "border-white/10" : "border-black/[0.06]"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>
                    Payment method <span className="normal-case font-normal opacity-60">— optional</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PAYMENT_METHODS.map(({ value, label }) => (
                      <button key={value}
                        onClick={() => setPayMethodDraft(payMethodDraft === value ? "" : value)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          payMethodDraft === value
                            ? d ? "bg-white/20 text-white" : "bg-gray-900 text-white"
                            : d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {(payPeriodDraft === "monthly" || payPeriodDraft === "annually") && (
                  <div className={`pt-3 mt-1 border-t ${d ? "border-white/10" : "border-black/[0.06]"}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>
                      Billing date <span className="normal-case font-normal opacity-60">— optional</span>
                    </p>
                    <div className="flex gap-2">
                      {payPeriodDraft === "annually" && (
                        <div className="relative flex-1">
                          <select value={payMonthDraft} onChange={(e) => {
                            const month = e.target.value;
                            setPayMonthDraft(month);
                            if (month && payDayDraft) {
                              const maxDay = DAYS_IN_MONTH[parseInt(month) - 1];
                              const n = parseInt(payDayDraft);
                              if (!isNaN(n) && n > maxDay) setPayDayDraft(String(maxDay));
                            }
                          }} className={selectCls}>
                            <option value="">Month</option>
                            {MONTH_SHORT.map((m, i) => (
                              <option key={i} value={String(i + 1)}>{m}</option>
                            ))}
                          </select>
                          <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-500" : "text-gray-400"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                      )}
                      <input
                        type="number" min="1"
                        max={payPeriodDraft === "monthly" ? 31 : payMonthDraft ? DAYS_IN_MONTH[parseInt(payMonthDraft) - 1] : 31}
                        placeholder="Day"
                        value={payDayDraft}
                        onChange={(e) => {
                          if (e.target.value === "") { setPayDayDraft(""); return; }
                          const maxDay = payPeriodDraft === "monthly" ? 31 : payMonthDraft ? DAYS_IN_MONTH[parseInt(payMonthDraft) - 1] : 31;
                          const n = parseInt(e.target.value);
                          setPayDayDraft(String(Math.max(1, Math.min(maxDay, isNaN(n) ? 1 : n))));
                        }}
                        className={`${payPeriodDraft === "annually" ? "flex-1" : "w-full"} text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            </>)}

            {/* Bank — only for paid apps */}
            {payTypeDraft === "paid" && (
              <div className={`mt-5 pt-4 border-t ${d ? "border-white/10" : "border-black/[0.06]"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>
                  Bank <span className="normal-case font-normal opacity-60">— optional</span>
                </p>

                {/* Trigger field */}
                <button onClick={() => setShowBankPicker(!showBankPicker)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors border ${
                    d ? "bg-white/5 border-white/10 hover:bg-white/8" : "bg-gray-50 border-black/[0.08] hover:bg-gray-100"
                  }`}>
                  {bankDraft && bankCatalog.find((b) => b.name === bankDraft) ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bankCatalog.find((b) => b.name === bankDraft)!.icon} alt={bankDraft} className="w-6 h-6 rounded-lg flex-shrink-0" />
                      <span className={`flex-1 ${d ? "text-gray-200" : "text-gray-800"}`}>{bankDraft}</span>
                      <span className="text-base flex-shrink-0">{bankCatalog.find((b) => b.name === bankDraft)?.flag}</span>
                    </>
                  ) : (
                    <span className={`flex-1 ${d ? "text-gray-500" : "text-gray-400"}`}>No bank — tap to assign</span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-transform ${showBankPicker ? "rotate-180" : ""} ${d ? "text-gray-500" : "text-gray-400"}`}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {/* Searchable dropdown */}
                {showBankPicker && (() => {
                  const filtered = bankCatalog
                    .filter((b) =>
                      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
                      b.country.toLowerCase().includes(bankSearch.toLowerCase())
                    )
                    .sort((a, b) => a.name.localeCompare(b.name));
                  return (
                    <div className={`mt-1 rounded-xl border overflow-hidden shadow-lg ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`}>
                      {/* Search input */}
                      <div className={`px-3 py-2 border-b ${d ? "border-white/10" : "border-black/[0.06]"}`}>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search banks…"
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                          className={`w-full text-sm outline-none bg-transparent ${d ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
                        />
                      </div>
                      {/* Scrollable list */}
                      <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                          <p className={`text-xs text-center py-4 ${d ? "text-gray-500" : "text-gray-400"}`}>
                            No banks match &quot;{bankSearch}&quot;
                          </p>
                        ) : filtered.map((b) => (
                          <button key={b.name}
                            onClick={() => { setBankDraft(b.name === bankDraft ? "" : b.name); setShowBankPicker(false); setBankSearch(""); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                              bankDraft === b.name
                                ? d ? "bg-white/10" : "bg-gray-100"
                                : d ? "hover:bg-white/5" : "hover:bg-gray-50"
                            }`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={b.icon} alt={b.name} className="w-7 h-7 rounded-lg flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-medium ${d ? "text-gray-200" : "text-gray-800"}`}>{b.name}</div>
                              <div className={`text-xs mt-0.5 leading-snug ${d ? "text-gray-500" : "text-gray-400"}`}>{b.country}</div>
                            </div>
                            <span className="text-base flex-shrink-0">{b.flag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {bankDraft && (
                  <button onClick={() => setBankDraft("")}
                    className={`mt-1.5 text-xs ${d ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                    Clear bank
                  </button>
                )}
              </div>
            )}

            {/* Notes */}
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Notes</p>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add any notes about this app…"
              rows={3}
              className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors resize-none ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
            />

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button onClick={saveEdit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-amber-500 text-white hover:bg-amber-600">
                Save
              </button>
              <button onClick={() => setEditing(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${d ? "bg-white/8 text-gray-300 hover:bg-white/12" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Cancel
              </button>
            </div>

            {/* Remove */}
            <button onClick={() => deleteApp(editing!)}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-medium transition-colors ${d ? "text-gray-600 hover:bg-red-500/10 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-500"}`}>
              Remove from hub
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setDeleteTarget(null)}>
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${d ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-500"}`}>
              <TrashIcon />
            </div>
            <h2 className="font-bold text-lg mb-1">
              {deleteTarget.type === "all" ? "Delete all apps"
                : deleteTarget.type === "selected" ? `Delete ${selectedApps.size} app${selectedApps.size !== 1 ? "s" : ""}`
                : `Delete all ${deleteTarget.tag} apps`}
            </h2>
            <p className={`text-sm mb-5 ${d ? "text-gray-400" : "text-gray-500"}`}>
              {deleteTarget.type === "all"
                ? "This will remove every app from your hub. This cannot be undone."
                : deleteTarget.type === "selected"
                ? `This will remove ${selectedApps.size} selected app${selectedApps.size !== 1 ? "s" : ""} from your hub. This cannot be undone.`
                : `This will remove all apps in the ${deleteTarget.tag} category. This cannot be undone.`}
            </p>
            <p className={`text-xs font-medium mb-2 ${d ? "text-gray-400" : "text-gray-600"}`}>
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </p>
            <input
              className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border mb-4 font-mono tracking-widest ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-red-500/50" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-300 focus:border-red-400"}`}
              placeholder="DELETE" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmDelete()} autoFocus
            />
            <div className="flex gap-2">
              <button onClick={confirmDelete} disabled={deleteInput !== "DELETE"}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${deleteInput === "DELETE" ? "bg-red-500 text-white hover:bg-red-600" : d ? "bg-white/5 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}>
                Delete
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${d ? "bg-white/8 text-gray-300 hover:bg-white/12" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowShareModal(false)}>
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1">Share your hub</h2>
            <p className={`text-xs mb-5 ${d ? "text-gray-500" : "text-gray-400"}`}>
              Anyone with this link can view your apps in read-only mode.
            </p>
            <div className={`flex items-center gap-2 rounded-xl border p-1 pl-3 ${d ? "bg-white/5 border-white/10" : "bg-gray-50 border-black/[0.08]"}`}>
              <span className={`text-xs flex-1 truncate font-mono ${d ? "text-gray-400" : "text-gray-500"}`}>{shareUrl}</span>
              <button onClick={copyShareUrl}
                className={`flex-shrink-0 text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${copied ? "bg-green-500 text-white" : "bg-amber-500 text-white hover:bg-amber-600"}`}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)}
              className={`mt-4 w-full text-xs py-2 rounded-xl transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Billing overview modal */}
      {billingView !== null && (() => {
        type BillingEntry = { app: App; payment: Payment; name: string };
        const entries: BillingEntry[] = myAppNames
          .filter((name) => {
            const st = statuses[name];
            return st !== "trial" && st !== "cancelled";
          })
          .map((name) => {
            const app = catalog.find((a) => a.name === name);
            const pay = payments[name];
            if (!app || !pay || pay.type !== "paid" || !pay.amount || pay.period !== billingView) return null;
            return { app, payment: pay, name };
          })
          .filter((x): x is BillingEntry => !!x);

        const total = entries.reduce((s, x) => s + parseFloat(x.payment.amount!), 0);
        const titles = { monthly: "Monthly", annually: "Annual", once: "One-time" };
        const totalLabels = { monthly: `${fmtCurrency(total)}/mo`, annually: `${fmtCurrency(total)}/yr`, once: fmtCurrency(total) };

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setBillingView(null)}>
            <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border max-h-[85vh] overflow-y-auto ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-lg">{titles[billingView]}</h2>
                {entries.length > 0 && (
                  <span className={`text-sm font-semibold ${d ? "text-gray-300" : "text-gray-700"}`}>{totalLabels[billingView]}</span>
                )}
              </div>
              <p className={`text-xs mb-5 ${d ? "text-gray-500" : "text-gray-400"}`}>Active only · Trial &amp; cancelled excluded</p>

              {entries.length === 0 ? (
                <p className={`text-sm py-6 text-center ${d ? "text-gray-500" : "text-gray-400"}`}>No active paid apps in this category.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    {entries.map(({ app, payment: pay, name }) => {
                      const daysUntil = getDaysUntilDue(pay);
                      const alert = daysUntil !== null && daysUntil <= 7;
                      return (
                        <div key={name} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={app.icon} alt={app.name} className="w-7 h-7 rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${d ? "text-gray-200" : "text-gray-800"}`}>{app.name}</div>
                            {pay.method && (
                              <div className={`text-[11px] ${d ? "text-gray-500" : "text-gray-400"}`}>{METHOD_LABEL[pay.method]}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${d ? "text-gray-200" : "text-gray-800"}`}>{fmtCurrency(parseFloat(pay.amount!))}</div>
                            {paymentDueLabel(pay) && (
                              <div className={`text-[11px] ${alert ? "text-orange-400 font-medium" : d ? "text-gray-500" : "text-gray-400"}`}>
                                {alert ? (daysUntil === 0 ? "Due today!" : `Due in ${daysUntil}d`) : paymentDueLabel(pay)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {billingView === "annually" && total > 0 && (
                    <div className={`rounded-xl px-4 py-3 mt-4 ${d ? "bg-amber-500/10" : "bg-amber-50"}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${d ? "text-amber-400" : "text-amber-700"}`}>Monthly equivalent</span>
                        <span className={`text-base font-bold ${d ? "text-amber-400" : "text-amber-700"}`}>
                          ~{fmtCurrency(total / 12)}<span className="text-xs font-normal">/mo</span>
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${d ? "text-amber-500/70" : "text-amber-600/70"}`}>
                        Annual total averaged across 12 months
                      </p>
                    </div>
                  )}
                </>
              )}

              <button onClick={() => setBillingView(null)}
                className={`mt-4 w-full text-xs py-2 rounded-xl transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* Add app modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowAddModal(false)}>
          <div className={`rounded-2xl p-6 w-full max-w-xs shadow-2xl border ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1">{addModalTag ? `Add to ${addModalTag}` : "Add an App"}</h2>
            <p className={`text-xs mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}>
              {(() => {
                if (addModalTag) {
                  const catTotal = catalog.filter(a => a.tags.includes(addModalTag)).length;
                  const catAdded = myApps.filter(a => a.tags.includes(addModalTag)).length;
                  return addModalBaseApps.length > 0
                    ? `${addModalBaseApps.length} of ${catTotal} available · ${catAdded} already added`
                    : `All ${catTotal} ${addModalTag} apps already added`;
                }
                return addModalBaseApps.length > 0
                  ? `${addModalBaseApps.length} of ${catalog.length} apps not yet added`
                  : "All apps have been added";
              })()}
            </p>

            {addModalBaseApps.length > 0 && (
              <div className="relative mb-3">
                <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-500" : "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text" placeholder="Search apps, brands, categories…"
                  value={addModalSearch} onChange={(e) => setAddModalSearch(e.target.value)}
                  autoFocus
                  className={`pl-8 pr-3 py-2 w-full rounded-xl text-sm outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                />
              </div>
            )}

            {addModalApps.length === 0 ? (
              <p className={`text-sm text-center py-4 ${d ? "text-gray-500" : "text-gray-400"}`}>
                {addModalSearch ? `No results for "${addModalSearch}"` : "Nothing left to add here."}
              </p>
            ) : (
              <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                {addModalApps.map((app) => (
                  <button key={app.name} onClick={() => { addApp(app.name); setShowAddModal(false); }}
                    className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${d ? "hover:bg-white/8 text-gray-200" : "hover:bg-gray-50 text-gray-800"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.icon} alt={app.name} className="w-8 h-8 rounded-lg flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{app.name}</div>
                      <div className={`text-xs leading-snug mt-0.5 ${d ? "text-gray-400" : "text-gray-500"}`}>{app.description}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                          {app.brand}
                        </span>
                        {app.tags.map((tag) => (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${d ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddModal(false)}
              className={`mt-4 w-full text-xs py-2 rounded-xl transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Currency picker modal */}
      {showCurrencyPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => { setShowCurrencyPicker(false); setCurrencySearch(""); }}>
          <div className={`rounded-2xl w-full max-w-sm shadow-2xl border flex flex-col max-h-[80vh] ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-5 pt-5 pb-3 border-b flex-shrink-0 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <h2 className={`text-sm font-semibold ${d ? "text-white" : "text-gray-900"}`}>Currency</h2>
              <button onClick={() => { setShowCurrencyPicker(false); setCurrencySearch(""); }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/15" : "bg-black/[0.06] text-gray-500 hover:bg-black/[0.1]"}`}>
                ✕
              </button>
            </div>
            <div className={`px-3 py-2 border-b flex-shrink-0 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <input
                type="text"
                autoFocus
                placeholder="Search currencies…"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                className={`w-full text-sm outline-none bg-transparent ${d ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {CURRENCIES.filter((c) =>
                c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                c.name.toLowerCase().includes(currencySearch.toLowerCase())
              ).map((c) => (
                <button key={c.code}
                  onClick={() => { changeCurrency(c.code); setShowCurrencyPicker(false); setCurrencySearch(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    currency === c.code
                      ? d ? "bg-white/10" : "bg-gray-100"
                      : d ? "hover:bg-white/5" : "hover:bg-gray-50"
                  }`}>
                  <span className={`text-sm font-medium w-10 flex-shrink-0 ${d ? "text-gray-200" : "text-gray-800"}`}>{c.code}</span>
                  <span className={`text-xs flex-1 ${d ? "text-gray-500" : "text-gray-400"}`}>{c.name}</span>
                  {currency === c.code && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={d ? "text-amber-400" : "text-amber-600"}>
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email manager modal */}
      {showEmailManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowEmailManager(false)}>
          <div className={`rounded-2xl w-full max-w-sm shadow-2xl border flex flex-col max-h-[80vh] ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-5 pt-5 pb-4 border-b flex-shrink-0 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <div>
                <h2 className={`text-sm font-semibold ${d ? "text-white" : "text-gray-900"}`}>Email Accounts</h2>
                <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Add your emails here, then assign one per app.</p>
              </div>
              <button onClick={() => setShowEmailManager(false)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/15" : "bg-black/[0.06] text-gray-500 hover:bg-black/[0.1]"}`}>
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
              {emailList.length === 0 ? (
                <p className={`text-xs text-center py-6 ${d ? "text-gray-600" : "text-gray-400"}`}>No emails yet. Add one below.</p>
              ) : (
                emailList.map((email) => (
                  <div key={email} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl ${d ? "bg-white/5" : "bg-gray-50"}`}>
                    <span className={`text-xs truncate flex-1 ${d ? "text-gray-300" : "text-gray-700"}`}>{email}</span>
                    <button onClick={() => removeEmailFromList(email)}
                      className={`text-[11px] flex-shrink-0 transition-colors ${d ? "text-gray-600 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className={`px-5 pb-5 pt-3 border-t flex-shrink-0 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <div className="flex gap-2">
                <input
                  type="email"
                  className={`${inputCls} flex-1`}
                  value={newEmailInput}
                  placeholder="your@email.com"
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmailToList(); } }}
                  autoFocus
                />
                <button onClick={addEmailToList} disabled={!newEmailInput.trim()}
                  className={`px-4 rounded-xl text-xs font-medium transition-colors disabled:opacity-40 ${d ? "bg-white/8 text-gray-300 hover:bg-white/12" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings drawer */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${showSettingsDrawer ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} bg-black/30 backdrop-blur-sm`}
        onClick={() => setShowSettingsDrawer(false)}
      />
      <div className={`fixed top-0 right-0 h-full w-72 z-50 border-l shadow-2xl transform transition-transform duration-300 overflow-hidden ${showSettingsDrawer ? "translate-x-0" : "translate-x-full"} ${d ? "bg-[#1c1c1c] border-white/[0.08]" : "bg-white border-black/[0.08]"}`}>
        {/* Drawer header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${d ? "border-white/[0.08]" : "border-black/[0.07]"}`}>
          <span className={`text-sm font-semibold ${d ? "text-white" : "text-gray-900"}`}>Settings</span>
          <button onClick={() => setShowSettingsDrawer(false)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/15" : "bg-black/[0.06] text-gray-500 hover:bg-black/[0.1]"}`}>
            ✕
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-57px)]">
          {/* Sharing & Data */}
          <div className="px-3 pt-5">
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 px-2 ${d ? "text-gray-600" : "text-gray-400"}`}>Sharing &amp; Data</p>
            <button onClick={() => { exportApps(); setShowSettingsDrawer(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${d ? "text-gray-300 hover:bg-white/6" : "text-gray-700 hover:bg-gray-50"}`}>
              <DownloadIcon />
              <span className="text-sm">Export JSON</span>
            </button>
            <button onClick={() => { importInputRef.current?.click(); setShowSettingsDrawer(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${d ? "text-gray-300 hover:bg-white/6" : "text-gray-700 hover:bg-gray-50"}`}>
              <UploadIcon />
              <span className="text-sm">Import JSON</span>
            </button>
            <button onClick={() => { exportCalendar(); setShowSettingsDrawer(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${d ? "text-gray-300 hover:bg-white/6" : "text-gray-700 hover:bg-gray-50"}`}>
              <CalendarIcon />
              <span className="text-sm">Calendar export (.ics)</span>
            </button>
          </div>

          {/* Account */}
          <div className="px-3 pt-5">
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 px-2 ${d ? "text-gray-600" : "text-gray-400"}`}>Account</p>
            <button onClick={() => { setShowEmailManager(true); setShowSettingsDrawer(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${d ? "text-gray-300 hover:bg-white/6" : "text-gray-700 hover:bg-gray-50"}`}>
              <EnvelopeIcon />
              <span className="text-sm">Email Accounts</span>
            </button>
            <button onClick={() => { setShowCurrencyPicker(true); setShowSettingsDrawer(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${d ? "text-gray-300 hover:bg-white/6" : "text-gray-700 hover:bg-gray-50"}`}>
              <BanknoteIcon />
              <span className="text-sm flex-1">Currency</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d ? "bg-white/8 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{currency}</span>
            </button>
          </div>

          {/* Danger */}
          <div className="px-3 pt-5 pb-8">
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 px-2 ${d ? "text-gray-600" : "text-gray-400"}`}>Danger</p>
            <button onClick={() => { openDeleteModal("all"); setShowSettingsDrawer(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${d ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}>
              <TrashIcon />
              <span className="text-sm">Delete all apps</span>
            </button>
          </div>
        </div>
      </div>

      {/* Changelog modal */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowChangelog(false)}>
          <div className={`rounded-2xl w-full max-w-md shadow-2xl border flex flex-col max-h-[85vh] ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className={`flex items-center justify-between px-6 pt-5 pb-4 border-b flex-shrink-0 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <div>
                <h2 className="font-bold text-lg">What&apos;s New</h2>
                <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Helio release history</p>
              </div>
              <button onClick={() => setShowChangelog(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-lg leading-none transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                ×
              </button>
            </div>

            {/* Version list */}
            <div className="overflow-y-auto px-6 py-5 flex flex-col gap-8">
              {changelog.map((v) => (
                <div key={v.version}>
                  {/* Version header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                      {v.version}
                    </span>
                    <span className={`text-sm font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{v.label}</span>
                  </div>

                  {/* Change groups */}
                  <div className="flex flex-col gap-3">
                    {v.groups.map((g) => (
                      <div key={g.category}>
                        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${
                          g.category === "New"
                            ? d ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-700"
                            : g.category === "Improved"
                            ? d ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-700"
                            : d ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-700"
                        }`}>
                          {g.category}
                        </span>
                        <ul className="flex flex-col gap-1">
                          {g.items.map((item, i) => (
                            <li key={i} className={`text-xs flex gap-2 ${d ? "text-gray-400" : "text-gray-600"}`}>
                              <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-current opacity-40" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── App card ─────────────────────────────────────────────────────────────────

function AppCard({ app, url, payment, currency, notes, status, bank, pinned, use, platform, email, d, selectMode, isSelected, onOpen, onToggleSelect }: {
  app: App; url: string; payment?: Payment; currency: string; notes?: string; status?: AppStatus; bank?: string; pinned?: boolean; use?: AppUse; platform?: AppPlatform; email?: string; d: boolean;
  selectMode: boolean; isSelected: boolean;
  onOpen: () => void; onToggleSelect: () => void;
}) {
  const bankData = bank ? bankCatalog.find((b) => b.name === bank) : null;
  const daysUntilDue = payment ? getDaysUntilDue(payment) : null;
  const dueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && status !== "cancelled" && status !== "trial";
  const isCancelled = status === "cancelled";
  const isTrial = status === "trial";

  const dueSoonLabel = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7
    ? daysUntilDue === 0 ? "Due today!" : `Due in ${daysUntilDue}d`
    : null;

  const showPaymentInfo = status !== "trial" && status !== "cancelled";
  const tooltipMeta = [
    app.brand,
    use === "business" ? "Business" : "Personal",
    bankData ? bankData.name : null,
    showPaymentInfo && payment ? paymentLabel(payment, currency) : null,
    showPaymentInfo && payment?.method ? METHOD_LABEL[payment.method] : null,
    showPaymentInfo && payment ? paymentDueLabel(payment) : null,
    showPaymentInfo ? dueSoonLabel : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="group relative cursor-pointer" onClick={selectMode ? onToggleSelect : onOpen}>

      {/* Tooltip — only in normal mode */}
      {!selectMode && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-44 text-xs rounded-xl px-3 py-2.5 leading-snug text-center pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${d ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-white"}`}>
          <div>{app.description}</div>
          {tooltipMeta && (
            <div className={`mt-1.5 text-[11px] ${d ? "text-gray-500" : "text-gray-400"}`}>{tooltipMeta}</div>
          )}
          {email && (
            <div className={`mt-1.5 text-[11px] border-t border-white/10 pt-1.5 ${d ? "text-sky-400" : "text-sky-500"}`}>{email}</div>
          )}
          {notes && (
            <div className="mt-1.5 text-[11px] italic border-t border-white/10 pt-1.5 text-amber-400">{notes}</div>
          )}
          <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${d ? "border-t-gray-800" : "border-t-gray-900"}`} />
        </div>
      )}

      <div className={`relative flex flex-col items-center justify-center gap-1.5 min-h-[11rem] rounded-2xl p-3 pb-5 border transition-all duration-200 group-hover:scale-105 ${isCancelled ? "opacity-50" : ""} ${
        isSelected && selectMode
          ? d ? "bg-amber-500/10 border-amber-500/60" : "bg-amber-50 border-amber-400"
          : d ? "bg-white/5 border-white/10 group-hover:bg-white/10" : "bg-white border-black/[0.08] group-hover:bg-[#eeece8]"
      }`}>
        {/* Billing alert dot */}
        {dueSoon && !selectMode && (
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
        )}
        {/* Bank icon (bottom-left only) */}
        {bankData && !selectMode && (
          <div className="absolute bottom-2.5 left-2.5">
            <img src={bankData.icon} alt={bankData.name} className="w-5 h-5 rounded-md" title={bankData.name} />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl" />
        <span className={`text-xs font-medium text-center leading-tight ${d ? "text-gray-300" : "text-gray-600"}`}>{app.name}</span>
        {/* All chips in a flex-wrap row */}
        <div className="flex flex-wrap justify-center gap-1 w-full px-1">
          {!isTrial && !isCancelled && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
              use === "business"
                ? d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                : d ? "bg-sky-500/15 text-sky-400" : "bg-sky-50 text-sky-600"
            }`}>{use === "business" ? "Business" : "Personal"}</span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
            (platform ?? "desktop") === "mobile"
              ? d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"
              : (platform ?? "desktop") === "both"
                ? d ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600"
                : d ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
          }`}>
            {(platform ?? "desktop") === "mobile" ? "Mobile" : (platform ?? "desktop") === "both" ? "Desktop and Mobile" : "Desktop"}
          </span>
          {isTrial && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"}`}>Trial</span>
          )}
          {isCancelled && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-gray-500/20 text-gray-500" : "bg-gray-100 text-gray-400"}`}>Cancelled</span>
          )}
          {!isTrial && !isCancelled && payment && <PaymentBadge payment={payment} currency={currency} d={d} />}
          {payment?.method && !isTrial && !isCancelled && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{METHOD_LABEL[payment.method]}</span>
          )}
        </div>
        {/* Due date below chips */}
        {payment && paymentDueLabel(payment) && (
          <span className={`text-[10px] leading-none ${dueSoon ? "text-orange-400 font-medium" : d ? "text-gray-500" : "text-gray-400"}`}>
            {paymentDueLabel(payment)}
          </span>
        )}
      </div>

      {/* Pin badge (normal mode only) */}
      {!selectMode && pinned && (
        <div className="absolute top-2.5 right-2.5 text-amber-500">
          <PinIcon size={20} filled />
        </div>
      )}

      {/* Select mode indicator */}
      {selectMode && (
        <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          isSelected ? "bg-amber-500 text-white" : d ? "bg-white/15 text-transparent" : "bg-black/10 text-transparent"
        }`}>
          {isSelected && <CheckIcon />}
        </div>
      )}
    </div>
  );
}
