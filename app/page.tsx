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

// ─── Icons ───────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
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
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTag, setAddModalTag] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "all" | "category"; tag?: string } | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const savedList = localStorage.getItem("my-app-list");
    if (savedList) setMyAppNames(JSON.parse(savedList));
    const savedUrls = localStorage.getItem("custom-urls");
    if (savedUrls) setCustomUrls(JSON.parse(savedUrls));
    const savedPayments = localStorage.getItem("app-payments");
    if (savedPayments) setPayments(JSON.parse(savedPayments));
    const savedCurrency = localStorage.getItem("app-currency");
    if (savedCurrency) setCurrency(savedCurrency);
    if (localStorage.getItem("theme") === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    document.body.style.background = isDark ? "#0d0d0d" : "#f7f6f3";
    document.body.style.transition = "background 0.2s";
  }, [isDark]);

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
        currency,
      }));
    const blob = new Blob([JSON.stringify({ currency, apps: myApps }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-apps.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported!");
  }

  function importApps(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        // support both old array format and new {currency, apps} format
        const data = Array.isArray(raw) ? raw : raw.apps;
        if (!Array.isArray(data)) throw new Error("invalid");
        const validNames: string[] = [];
        const newUrls: Record<string, string> = {};
        const newPayments: Payments = {};
        for (const item of data) {
          const catalogApp = catalog.find((a) => a.name === item.name);
          if (!catalogApp) continue;
          validNames.push(item.name);
          if (item.url && item.url !== catalogApp.url) newUrls[item.name] = item.url;
          if (item.payment) newPayments[item.name] = item.payment;
        }
        if (!Array.isArray(raw) && raw.currency) changeCurrency(raw.currency);
        setMyAppNames(validNames);
        setCustomUrls(newUrls);
        setPayments(newPayments);
        localStorage.setItem("my-app-list", JSON.stringify(validNames));
        localStorage.setItem("custom-urls", JSON.stringify(newUrls));
        localStorage.setItem("app-payments", JSON.stringify(newPayments));
        showToast(`Imported ${validNames.length} app${validNames.length !== 1 ? "s" : ""}!`);
      } catch {
        showToast("Invalid file — import failed.");
      }
    };
    reader.readAsText(file);
  }

  function openDeleteModal(type: "all" | "category", tag?: string) {
    setDeleteTarget({ type, tag });
    setDeleteInput("");
  }

  function confirmDelete() {
    if (deleteInput !== "DELETE" || !deleteTarget) return;
    if (deleteTarget.type === "all") {
      setMyAppNames([]);
      setCustomUrls({});
      setPayments({});
      localStorage.setItem("my-app-list", JSON.stringify([]));
      localStorage.removeItem("custom-urls");
      localStorage.removeItem("app-payments");
    } else if (deleteTarget.tag) {
      const toRemove = new Set(
        myApps.filter((a) => a.tags.includes(deleteTarget.tag!)).map((a) => a.name)
      );
      const updated = myAppNames.filter((n) => !toRemove.has(n));
      setMyAppNames(updated);
      localStorage.setItem("my-app-list", JSON.stringify(updated));
    }
    setDeleteTarget(null);
    setDeleteInput("");
    setEditing(null);
  }

  function openAddModal(tag: string | null) {
    setAddModalTag(tag);
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

  function removeApp(name: string) {
    if (editing === name) setEditing(null);
    const updated = myAppNames.filter((n) => n !== name);
    setMyAppNames(updated);
    localStorage.setItem("my-app-list", JSON.stringify(updated));
  }

  function startEdit(name: string) {
    const pay = payments[name];
    setEditing(name);
    setUrlDraft(customUrls[name] ?? catalog.find((a) => a.name === name)?.url ?? "");
    setPayTypeDraft(pay?.type ?? "free");
    setPayAmountDraft(pay?.amount ?? "");
    setPayPeriodDraft(pay?.period ?? "monthly");
    setPayDayDraft(pay?.day ? String(pay.day) : "");
    setPayMonthDraft(pay?.month ? String(pay.month) : "");
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
  const addModalApps = addModalTag
    ? availableToAdd.filter((a) => a.tags.includes(addModalTag))
    : availableToAdd;

  const editingApp = editing ? catalog.find((a) => a.name === editing) : null;

  // Stats
  let statsMonthly = 0;
  let statsAnnual = 0;
  let statsOnce = 0;
  for (const name of myAppNames) {
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
    <main className={`min-h-screen px-4 sm:px-10 py-8 sm:py-12 transition-colors duration-200 ${d ? "bg-[#0d0d0d] text-white" : "bg-[#f7f6f3] text-gray-900"}`}>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Helio</h1>
          <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Everything orbits here.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => openDeleteModal("all")} title="Delete all apps"
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-500 hover:bg-red-500/20 hover:text-red-400" : "bg-black/[0.06] text-gray-400 hover:bg-red-50 hover:text-red-500"}`}>
            <TrashIcon />
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
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
              {fmtCurrency(statsMonthly)}/mo
            </span>
          )}
          {statsAnnual > 0 && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
              {fmtCurrency(statsAnnual)}/yr
            </span>
          )}
          {statsOnce > 0 && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${d ? "bg-white/8 text-gray-400" : "bg-black/[0.05] text-gray-500"}`}>
              {fmtCurrency(statsOnce)} one-time
            </span>
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
          <input type="text" placeholder="Search apps..." value={search} onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 pr-4 py-2 rounded-xl text-sm outline-none border transition-colors w-full sm:w-48 ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-white border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
          />
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
              payment={payments[app.name]} currency={currency} d={d}
              onEdit={() => startEdit(app.name)} onRemove={() => removeApp(app.name)}
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
                      payment={payments[app.name]} currency={currency} d={d}
                      onEdit={() => startEdit(app.name)} onRemove={() => removeApp(app.name)}
                    />
                  ))}
                  <button onClick={() => openAddModal(tag)}
                    className={`flex flex-col items-center justify-center gap-3 h-36 rounded-2xl p-4 border border-dashed hover:scale-105 transition-all duration-200 ${d ? "border-white/20 text-white/30 hover:border-amber-500/50 hover:text-amber-400" : "border-black/20 text-black/25 hover:border-amber-500/50 hover:text-amber-500"}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-light">+</div>
                    <span className="text-xs font-medium">Add</span>
                  </button>
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 ${d ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
          {toast}
        </div>
      )}

      {/* Edit modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setEditing(null)}>
          <div className={`rounded-2xl p-6 w-full max-w-xs shadow-2xl border ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>

            {/* App identity */}
            <div className="flex items-center gap-3 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editingApp.icon} alt={editingApp.name} className="w-11 h-11 rounded-xl flex-shrink-0" />
              <div>
                <div className="font-semibold text-base">{editingApp.name}</div>
                <div className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>{editingApp.brand}</div>
              </div>
            </div>

            {/* URL */}
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Link</p>
            <input
              className={inputCls}
              value={urlDraft} placeholder="https://..." onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus
            />

            {/* Payment */}
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
                              const maxDay = [31,28,31,30,31,30,31,31,30,31,30,31][parseInt(month) - 1];
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
                        max={payPeriodDraft === "monthly" ? 31 : payMonthDraft ? [31,28,31,30,31,30,31,31,30,31,30,31][parseInt(payMonthDraft)-1] : 31}
                        placeholder="Day"
                        value={payDayDraft}
                        onChange={(e) => {
                          if (e.target.value === "") { setPayDayDraft(""); return; }
                          const maxDay = payPeriodDraft === "monthly" ? 31 : payMonthDraft ? [31,28,31,30,31,30,31,31,30,31,30,31][parseInt(payMonthDraft)-1] : 31;
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

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <button onClick={saveEdit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-amber-500 text-white hover:bg-amber-600">
                Save
              </button>
              <button onClick={() => setEditing(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${d ? "bg-white/8 text-gray-300 hover:bg-white/12" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Cancel
              </button>
            </div>
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
              {deleteTarget.type === "all" ? "Delete all apps" : `Delete all ${deleteTarget.tag} apps`}
            </h2>
            <p className={`text-sm mb-5 ${d ? "text-gray-400" : "text-gray-500"}`}>
              {deleteTarget.type === "all"
                ? "This will remove every app from your hub. This cannot be undone."
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

      {/* Add app modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowAddModal(false)}>
          <div className={`rounded-2xl p-6 w-full max-w-xs shadow-2xl border ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1">{addModalTag ? `Add to ${addModalTag}` : "Add an App"}</h2>
            <p className={`text-xs mb-4 ${d ? "text-gray-500" : "text-gray-400"}`}>
              {(() => {
                if (addModalTag) {
                  const catTotal = catalog.filter(a => a.tags.includes(addModalTag)).length;
                  const catAdded = myApps.filter(a => a.tags.includes(addModalTag)).length;
                  return addModalApps.length > 0
                    ? `${addModalApps.length} of ${catTotal} available · ${catAdded} already added`
                    : `All ${catTotal} ${addModalTag} apps already added`;
                }
                return addModalApps.length > 0
                  ? `${addModalApps.length} of ${catalog.length} apps not yet added`
                  : "All apps have been added";
              })()}
            </p>
            {addModalApps.length === 0 ? (
              <p className={`text-sm text-center py-4 ${d ? "text-gray-500" : "text-gray-400"}`}>Nothing left to add here.</p>
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

function AppCard({ app, url, payment, currency, d, onEdit, onRemove }: {
  app: App; url: string; payment?: Payment; currency: string; d: boolean;
  onEdit: () => void; onRemove: () => void;
}) {
  const tooltipMeta = [
    app.brand,
    payment ? paymentLabel(payment, currency) : null,
    payment ? paymentDueLabel(payment) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="group relative">

      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-44 text-xs rounded-xl px-3 py-2.5 leading-snug text-center pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${d ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-white"}`}>
        <div>{app.description}</div>
        {tooltipMeta && (
          <div className={`mt-1.5 text-[11px] ${d ? "text-gray-500" : "text-gray-400"}`}>{tooltipMeta}</div>
        )}
        <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${d ? "border-t-gray-800" : "border-t-gray-900"}`} />
      </div>

      <a href={url} target="_blank" rel="noopener noreferrer"
        className={`flex flex-col items-center justify-center gap-2 h-36 rounded-2xl p-4 border hover:scale-105 transition-all duration-200 ${d ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-black/[0.08] hover:bg-[#eeece8]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl" />
        <span className={`text-xs font-medium text-center leading-tight ${d ? "text-gray-300" : "text-gray-600"}`}>{app.name}</span>
        {payment && <PaymentBadge payment={payment} currency={currency} d={d} />}
        {payment && paymentDueLabel(payment) && (
          <span className={`text-[10px] leading-none ${d ? "text-gray-500" : "text-gray-400"}`}>
            {paymentDueLabel(payment)}
          </span>
        )}
      </a>

      <button onClick={onEdit} title="Edit"
        className={`absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-6 h-6 flex items-center justify-center ${d ? "bg-white/10 text-gray-500 hover:text-gray-300" : "bg-black/[0.06] text-gray-400 hover:text-gray-600"}`}>
        <PencilIcon />
      </button>
      <button onClick={onRemove} title="Remove"
        className={`absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-6 h-6 flex items-center justify-center ${d ? "bg-white/10 text-gray-500 hover:text-red-400" : "bg-black/[0.06] text-gray-400 hover:text-red-400"}`}>
        <XIcon />
      </button>
    </div>
  );
}
