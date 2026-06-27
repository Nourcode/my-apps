"use client";

import { useState, useEffect, useRef } from "react";
import catalog, { type App } from "./catalog";

type PaymentPeriod = "monthly" | "annually" | "once";
type Payment = {
  type: "free" | "paid";
  amount?: string;
  period?: PaymentPeriod;
  day?: number;
  month?: number;
};
type Payments = Record<string, Payment>;
type AppStatus = "active" | "trial" | "cancelled";
type Statuses = Record<string, AppStatus>;
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

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
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
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesDraft, setNotesDraft] = useState("");
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
  const [lastEdited, setLastEdited] = useState<Record<string, string>>({});

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
      }));
    const blob = new Blob([JSON.stringify({ currency, apps: myApps }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "helio-apps.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported!");
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
        for (const item of data) {
          const catalogApp = catalog.find((a) => a.name === item.name);
          if (!catalogApp) continue;
          validNames.push(item.name);
          if (item.url && item.url !== catalogApp.url) newUrls[item.name] = item.url;
          if (item.payment) newPayments[item.name] = item.payment;
          if (item.notes) newNotes[item.name] = item.notes;
          if (item.status) newStatuses[item.name] = item.status;
          if (item.lastEdited) newLastEdited[item.name] = item.lastEdited;
        }
        if (!Array.isArray(raw) && raw.currency) changeCurrency(raw.currency);
        setMyAppNames(validNames);
        setCustomUrls(newUrls);
        setPayments(newPayments);
        setNotes(newNotes);
        setStatuses(newStatuses);
        setLastEdited(newLastEdited);
        localStorage.setItem("my-app-list", JSON.stringify(validNames));
        localStorage.setItem("custom-urls", JSON.stringify(newUrls));
        localStorage.setItem("app-payments", JSON.stringify(newPayments));
        localStorage.setItem("app-notes", JSON.stringify(newNotes));
        localStorage.setItem("app-statuses", JSON.stringify(newStatuses));
        localStorage.setItem("app-last-edited", JSON.stringify(newLastEdited));
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
      localStorage.setItem("my-app-list", JSON.stringify([]));
      localStorage.removeItem("custom-urls");
      localStorage.removeItem("app-payments");
      localStorage.removeItem("app-notes");
      localStorage.removeItem("app-statuses");
      localStorage.removeItem("app-last-edited");

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
      toDelete.forEach((n) => { delete updatedUrls[n]; delete updatedPayments[n]; delete updatedNotes[n]; delete updatedStatuses[n]; delete updatedLastEdited[n]; });
      setMyAppNames(updated);
      setCustomUrls(updatedUrls);
      setPayments(updatedPayments);
      setNotes(updatedNotes);
      setStatuses(updatedStatuses);
      setLastEdited(updatedLastEdited);
      localStorage.setItem("my-app-list", JSON.stringify(updated));
      localStorage.setItem("custom-urls", JSON.stringify(updatedUrls));
      localStorage.setItem("app-payments", JSON.stringify(updatedPayments));
      localStorage.setItem("app-notes", JSON.stringify(updatedNotes));
      localStorage.setItem("app-statuses", JSON.stringify(updatedStatuses));
      localStorage.setItem("app-last-edited", JSON.stringify(updatedLastEdited));
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
    setMyAppNames(updated);
    setCustomUrls(updatedUrls);
    setPayments(updatedPayments);
    setNotes(updatedNotes);
    setStatuses(updatedStatuses);
    setLastEdited(updatedLastEdited);
    localStorage.setItem("my-app-list", JSON.stringify(updated));
    localStorage.setItem("custom-urls", JSON.stringify(updatedUrls));
    localStorage.setItem("app-payments", JSON.stringify(updatedPayments));
    localStorage.setItem("app-notes", JSON.stringify(updatedNotes));
    localStorage.setItem("app-statuses", JSON.stringify(updatedStatuses));
    localStorage.setItem("app-last-edited", JSON.stringify(updatedLastEdited));
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
    setNotesDraft(notes[name] ?? "");
    setStatusDraft(statuses[name] ?? "active");
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
    setEditing(null);
  }

  const myApps: App[] = myAppNames
    .map((name) => catalog.find((a) => a.name === name))
    .filter((a): a is App => !!a);

  const availableTags = Array.from(new Set(myApps.flatMap((a) => a.tags))).sort();

  const filteredApps = myApps
    .filter((app) => !activeTag || app.tags.includes(activeTag))
    .filter((app) => app.name.toLowerCase().includes(search.toLowerCase()));

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
    <main className={`min-h-screen px-4 sm:px-10 py-8 sm:py-12 transition-colors duration-200 ${selectMode ? "pb-28" : ""} ${d ? "bg-[#0d0d0d] text-white" : "bg-[#f7f6f3] text-gray-900"}`}>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="text-amber-500 flex-shrink-0">
            <SunIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Helio</h1>
            <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Everything orbits here.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => openDeleteModal("all")} title="Delete all apps"
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-500 hover:bg-red-500/20 hover:text-red-400" : "bg-black/[0.06] text-gray-400 hover:bg-red-50 hover:text-red-500"}`}>
            <TrashIcon />
          </button>
          <button onClick={() => { exitSelectMode(); setSelectMode(true); }} title="Select apps"
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${selectMode ? "bg-amber-500 text-white" : d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <CheckSquareIcon />
          </button>
          <button onClick={shareApps} title="Share hub"
            className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <ShareIcon />
            <span>Share</span>
          </button>
          <button onClick={() => importInputRef.current?.click()} title="Import from JSON"
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <UploadIcon />
          </button>
          <button onClick={exportApps} title="Export as JSON"
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <DownloadIcon />
          </button>
          <input ref={importInputRef} type="file" accept=".json,application/json" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importApps(file);
              e.target.value = "";
            }}
          />
          <button onClick={toggleTheme} title={d ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            {d ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {myAppNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
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
          <div className="ml-auto relative">
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className={`text-xs pl-3 pr-6 py-1.5 rounded-full font-medium appearance-none outline-none cursor-pointer transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-black/[0.05] text-gray-500 hover:bg-black/[0.08]"}`}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
            <div className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${d ? "text-gray-500" : "text-gray-400"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative w-full sm:w-auto">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-500" : "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input ref={searchRef} type="text" placeholder="Search apps…" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && (setSearch(""), (e.target as HTMLInputElement).blur())}
            className={`pl-9 pr-16 py-2 rounded-xl text-sm outline-none border transition-colors w-full sm:w-52 ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-white border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
          />
          <kbd className={`absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-medium pointer-events-none select-none ${d ? "text-gray-600" : "text-gray-300"}`}>
            {isMac ? <><span>⌘</span><span>K</span></> : <><span>Ctrl</span><span>K</span></>}
          </kbd>
        </div>

        {availableTags.length > 0 && <div className={`hidden sm:block h-5 w-px ${d ? "bg-white/10" : "bg-black/10"}`} />}

        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === null ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
              All
            </button>
            {availableTags.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === tag ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                {tag}
              </button>
            ))}
          </div>
        )}

        <button onClick={() => openAddModal(null)}
          className="sm:ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-amber-500 text-white hover:bg-amber-600">
          <span className="text-base leading-none">+</span>
          <span>Add App</span>
        </button>
      </div>

      {/* App grid */}
      {activeTag || search ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {filteredApps.map((app) => (
            <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
              payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]} d={d}
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
          {availableTags.length === 0 ? (
            <p className={`text-sm ${d ? "text-gray-600" : "text-gray-400"}`}>
              No apps yet. Use &quot;+ Add App&quot; to get started.
            </p>
          ) : (
            availableTags.map((tag) => (
              <section key={tag}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xs font-semibold uppercase tracking-widest ${d ? "text-gray-500" : "text-gray-400"}`}>{tag}</h2>
                  <button onClick={() => openDeleteModal("category", tag)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${d ? "text-gray-600 hover:text-red-400" : "text-gray-300 hover:text-red-400"}`}>
                    <TrashIcon size={13} />
                    <span>Delete all</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                  {myApps.filter((a) => a.tags.includes(tag)).map((app) => (
                    <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
                      payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]} d={d}
                      selectMode={selectMode} isSelected={selectedApps.has(app.name)}
                      onOpen={() => openAppDetail(app.name)}
                      onToggleSelect={() => toggleSelect(app.name)}
                    />
                  ))}
                  {!selectMode && (
                    <button onClick={() => openAddModal(tag)}
                      className={`flex flex-col items-center justify-center gap-3 h-36 rounded-2xl p-4 border border-dashed hover:scale-105 transition-all duration-200 ${d ? "border-white/20 text-white/30 hover:border-amber-500/50 hover:text-amber-400" : "border-black/20 text-black/25 hover:border-amber-500/50 hover:text-amber-500"}`}>
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
              <a href={customUrls[editing!] ?? editingApp.url} target="_blank" rel="noopener noreferrer"
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12 hover:text-gray-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"}`}>
                Visit <ExternalLinkIcon />
              </a>
            </div>

            {/* URL */}
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Link</p>
            <input
              className={inputCls}
              value={urlDraft} placeholder="https://..." onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus
            />

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
                    type="number" min="0" step="0.01" placeholder="9.99" value={payAmountDraft}
                    onChange={(e) => setPayAmountDraft(e.target.value)}
                    className={inputCls}
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
                          <span className={`flex-1 text-sm ${d ? "text-gray-200" : "text-gray-800"}`}>{app.name}</span>
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
    </main>
  );
}

// ─── App card ─────────────────────────────────────────────────────────────────

function AppCard({ app, url, payment, currency, notes, status, d, selectMode, isSelected, onOpen, onToggleSelect }: {
  app: App; url: string; payment?: Payment; currency: string; notes?: string; status?: AppStatus; d: boolean;
  selectMode: boolean; isSelected: boolean;
  onOpen: () => void; onToggleSelect: () => void;
}) {
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
    showPaymentInfo && payment ? paymentLabel(payment, currency) : null,
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
          {notes && (
            <div className="mt-1.5 text-[11px] italic border-t border-white/10 pt-1.5 text-amber-400">{notes}</div>
          )}
          <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${d ? "border-t-gray-800" : "border-t-gray-900"}`} />
        </div>
      )}

      <div className={`relative flex flex-col items-center justify-center gap-2 h-36 rounded-2xl p-4 border transition-all duration-200 group-hover:scale-105 ${isCancelled ? "opacity-50" : ""} ${
        isSelected && selectMode
          ? d ? "bg-amber-500/10 border-amber-500/60" : "bg-amber-50 border-amber-400"
          : d ? "bg-white/5 border-white/10 group-hover:bg-white/10" : "bg-white border-black/[0.08] group-hover:bg-[#eeece8]"
      }`}>
        {/* Billing alert dot */}
        {dueSoon && !selectMode && (
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl" />
        <span className={`text-xs font-medium text-center leading-tight ${d ? "text-gray-300" : "text-gray-600"}`}>{app.name}</span>
        {isTrial && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"}`}>Trial</span>
        )}
        {isCancelled && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-gray-500/20 text-gray-500" : "bg-gray-100 text-gray-400"}`}>Cancelled</span>
        )}
        {!isTrial && !isCancelled && payment && <PaymentBadge payment={payment} currency={currency} d={d} />}
        {payment && paymentDueLabel(payment) && (
          <span className={`text-[10px] leading-none ${dueSoon ? "text-orange-400 font-medium" : d ? "text-gray-500" : "text-gray-400"}`}>
            {paymentDueLabel(payment)}
          </span>
        )}
      </div>

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
