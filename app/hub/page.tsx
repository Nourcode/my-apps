"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import catalog, { type App } from "../catalog";
import bankCatalog from "../banks";
import changelog from "../changelog";
import { METHOD_LABEL, type PaymentPeriod, type PaymentMethod, type Payment, type AppStatus, type AppUse, type AppPlatform, type CardProperty, type CardProps, type SpendingEntry } from "../lib/types";
import { loadHubData, loadPrefs, loadCustomApps, save, saveHubData, clearHubData } from "../lib/storage";
import { AppCard } from "../components/AppCard";
import { formatPaidLabel, paymentLabel, MONTH_SHORT, paymentDueLabel, getDaysUntilDue, formatLastEdited } from "../lib/utils";
import { SunIcon, MoonIcon, ShareIcon, DownloadIcon, TrashIcon, UploadIcon, CheckSquareIcon, CheckIcon, CalendarIcon, EnvelopeIcon, BanknoteIcon, GridViewIcon, ListViewIcon, SlidersIcon, SettingsIcon, ExternalLinkIcon, PencilIcon, BellIcon, LockIcon, EyeIcon, EyeOffIcon, PinIcon } from "../components/icons";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "Amex" },
  { value: "paypal", label: "PayPal" },
  { value: "apple", label: "Apple Pay" },
  { value: "google", label: "Google Pay" },
  { value: "other", label: "Other" },
];

type Payments = Record<string, Payment>;
type BankAssignments = Record<string, string>;
type Statuses = Record<string, AppStatus>;
type AppUses = Record<string, AppUse>;
type DeleteTarget = { type: "all" | "category" | "selected"; tag?: string };
const DEFAULT_CARD_PROPS: CardProps = { brand: true, status: true, use: true, platform: true, payment: true, method: true, dueDate: true, bank: true };

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


// --- Main page ---

export default function Home() {
  const [myAppNames, setMyAppNames] = useState<string[]>([]);
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<Payments>({});
  const [currency, setCurrency] = useState("USD");
  const [editing, setEditing] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [payTypeDraft, setPayTypeDraft] = useState<"free" | "paid">("free");
  const [amountError, setAmountError] = useState(false);
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
  const [hints, setHints] = useState<Record<string, string>>({});
  const [hintDraft, setHintDraft] = useState("");
  const [phones, setPhones] = useState<Record<string, string>>({});
  const [phoneDraft, setPhoneDraft] = useState("");
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [nameEditMode, setNameEditMode] = useState(false);
  const [hiddenApps, setHiddenApps] = useState<Set<string>>(new Set());
  const [blurAmounts, setBlurAmounts] = useState(false);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editEmailDraft, setEditEmailDraft] = useState("");
  const [confirmRemoveEmail, setConfirmRemoveEmail] = useState<string | null>(null);
  const [confirmDeleteEntryId, setConfirmDeleteEntryId] = useState<string | null>(null);
  const [confirmRemoveApp, setConfirmRemoveApp] = useState(false);
  const [activeEmailFilter, setActiveEmailFilter] = useState<string | null>(null);
  const [activePhone, setActivePhone] = useState(false);
  const [statuses, setStatuses] = useState<Statuses>({});
  const [statusDraft, setStatusDraft] = useState<AppStatus>("active");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const importInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
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
  const [statsUseFilter, setStatsUseFilter] = useState<"all" | "personal" | "business">("all");
  const [showChangelog, setShowChangelog] = useState(false);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cardProps, setCardProps] = useState<CardProps>(DEFAULT_CARD_PROPS);
  const [showPropsDropdown, setShowPropsDropdown] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [lastEdited, setLastEdited] = useState<Record<string, string>>({});
  const [addedAt, setAddedAt] = useState<Record<string, string>>({});
  const [pinnedApps, setPinnedApps] = useState<Set<string>>(new Set());
  const [spendingLog, setSpendingLog] = useState<Record<string, SpendingEntry[]>>({});
  const [newEntryDate, setNewEntryDate] = useState<string>("");
  const [newEntryAmount, setNewEntryAmount] = useState<string>("");
  const [newEntryNote, setNewEntryNote] = useState<string>("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntryDate, setEditEntryDate] = useState<string>("");
  const [editEntryAmount, setEditEntryAmount] = useState<string>("");
  const [editEntryNote, setEditEntryNote] = useState<string>("");
  const [modalTab, setModalTab] = useState<"details" | "payment" | "notes">("details");
  const [customApps, setCustomApps] = useState<App[]>([]);
  const [showCustomAppForm, setShowCustomAppForm] = useState(false);
  const [customDraft, setCustomDraft] = useState({ name: "", url: "", icon: "", description: "", tag: "Productivity" });
  const [customDraftError, setCustomDraftError] = useState("");

  useLayoutEffect(() => {
    const dark = localStorage.getItem("theme") === "dark";
    if (dark) setIsDark(true);
    document.documentElement.classList.toggle("dark", dark);
    document.body.style.background = dark ? "#0d0d0d" : "#f7f6f3";
  }, []);

  useEffect(() => {
    const hub = loadHubData();
    if (hub.appList.length)           setMyAppNames(hub.appList);
    if (Object.keys(hub.customUrls).length) setCustomUrls(hub.customUrls);
    if (Object.keys(hub.payments).length)   setPayments(hub.payments);
    if (Object.keys(hub.notes).length)      setNotes(hub.notes);
    if (Object.keys(hub.statuses).length)   setStatuses(hub.statuses);
    if (Object.keys(hub.lastEdited).length) setLastEdited(hub.lastEdited);
    if (Object.keys(hub.addedAt).length)    setAddedAt(hub.addedAt);
    if (Object.keys(hub.banks).length)      setBankAssignments(hub.banks);
    if (hub.pinned.length)            setPinnedApps(new Set(hub.pinned));
    if (Object.keys(hub.uses).length) setUses(hub.uses);
    if (Object.keys(hub.emails).length)     setEmails(hub.emails);
    if (Object.keys(hub.hints).length)      setHints(hub.hints);
    if (Object.keys(hub.phones).length)     setPhones(hub.phones);
    if (Object.keys(hub.nicknames).length)  setNicknames(hub.nicknames);
    if (hub.hidden.length)            setHiddenApps(new Set(hub.hidden));
    if (hub.emailList.length)         setEmailList(hub.emailList);
    if (Object.keys(hub.platforms).length)   setPlatforms(hub.platforms);
    if (Object.keys(hub.spendingLog).length) setSpendingLog(hub.spendingLog);
    const stored = loadCustomApps();
    if (stored.length) setCustomApps(stored);
    const prefs = loadPrefs();
    if (prefs.theme)    setIsDark(true);
    if (localStorage.getItem("app-currency")) setCurrency(prefs.currency);
    if (localStorage.getItem("app-view"))     setViewMode(prefs.view);
    if (localStorage.getItem("app-card-props")) setCardProps((p) => ({ ...p, ...prefs.cardProps }));
  }, []);

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

  function pickLucky() {
    const available = allApps.filter(a => !myAppNames.includes(a.name));
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    setAddSearch(pick.name);
    setShowAddDropdown(true);
    addInputRef.current?.focus();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    save.theme(next);
    document.documentElement.classList.toggle("dark", next);
    document.body.style.background = next ? "#0d0d0d" : "#f7f6f3";
  }

  function changeCurrency(code: string) {
    setCurrency(code);
    save.currency(code);
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
      .map((name) => allApps.find((a) => a.name === name))
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
        addedAt: addedAt[app.name] ?? null,
        bank: bankAssignments[app.name] ?? null,
        pinned: pinnedApps.has(app.name),
        use: uses[app.name] ?? "personal",
        email: emails[app.name] ?? null,
        platform: platforms[app.name] ?? "desktop",
        hint: hints[app.name] ?? null,
        phone: phones[app.name] ?? null,
        nickname: nicknames[app.name] ?? null,
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
        const newAddedAt: Record<string, string> = {};
        const newBankAssignments: BankAssignments = {};
        const newPinned = new Set<string>();
        const newUsesImp: AppUses = {};
        const newEmailsImp: Record<string, string> = {};
        const newPlatformsImp: Record<string, AppPlatform> = {};
        const newHintsImp: Record<string, string> = {};
        const newPhonesImp: Record<string, string> = {};
        const newNicknamesImp: Record<string, string> = {};
        for (const item of data) {
          const catalogApp = allApps.find((a) => a.name === item.name);
          if (!catalogApp) continue;
          validNames.push(item.name);
          if (item.url && item.url !== catalogApp.url) newUrls[item.name] = item.url;
          if (item.payment) newPayments[item.name] = item.payment;
          if (item.notes) newNotes[item.name] = item.notes;
          if (item.status) newStatuses[item.name] = item.status;
          if (item.lastEdited) newLastEdited[item.name] = item.lastEdited;
          if (item.addedAt) newAddedAt[item.name] = item.addedAt;
          if (item.bank) newBankAssignments[item.name] = item.bank;
          if (item.pinned) newPinned.add(item.name);
          if (item.use === "business") newUsesImp[item.name] = "business";
          if (item.email) newEmailsImp[item.name] = item.email;
          if (item.platform === "mobile" || item.platform === "both") newPlatformsImp[item.name] = item.platform;
          if (item.hint) newHintsImp[item.name] = item.hint;
          if (item.phone) newPhonesImp[item.name] = item.phone;
          if (item.nickname) newNicknamesImp[item.name] = item.nickname;
        }
        if (!Array.isArray(raw) && raw.currency) changeCurrency(raw.currency);
        if (!Array.isArray(raw) && Array.isArray(raw.emailList)) {
          setEmailList(raw.emailList);
          save.emailList(raw.emailList);
        }
        setMyAppNames(validNames);
        setCustomUrls(newUrls);
        setPayments(newPayments);
        setNotes(newNotes);
        setStatuses(newStatuses);
        setLastEdited(newLastEdited);
        setAddedAt(newAddedAt);
        setBankAssignments(newBankAssignments);
        setPinnedApps(newPinned);
        setUses(newUsesImp);
        setEmails(newEmailsImp);
        setPlatforms(newPlatformsImp);
        setHints(newHintsImp);
        setPhones(newPhonesImp);
        setNicknames(newNicknamesImp);
        saveHubData({ appList: validNames, customUrls: newUrls, payments: newPayments, notes: newNotes, statuses: newStatuses, lastEdited: newLastEdited, addedAt: newAddedAt, banks: newBankAssignments, pinned: [...newPinned], uses: newUsesImp, emails: newEmailsImp, platforms: newPlatformsImp, hints: newHintsImp, phones: newPhonesImp, nicknames: newNicknamesImp });
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
      setAddedAt({});
      setBankAssignments({});
      setPinnedApps(new Set());
      setUses({});
      setEmails({});
      setPlatforms({});
      setHints({});
      setNicknames({});
      clearHubData();

    } else if (deleteTarget.type === "category" && deleteTarget.tag) {
      const toRemove = new Set(
        myApps.filter((a) => a.tags.includes(deleteTarget.tag!)).map((a) => a.name)
      );
      const updated = myAppNames.filter((n) => !toRemove.has(n));
      setMyAppNames(updated);
      save.appList(updated);

    } else if (deleteTarget.type === "selected") {
      const toDelete = selectedApps;
      const updated = myAppNames.filter((n) => !toDelete.has(n));
      const updatedUrls = { ...customUrls };
      const updatedPayments = { ...payments };
      const updatedNotes = { ...notes };
      const updatedStatuses = { ...statuses };
      const updatedLastEdited = { ...lastEdited };
      const updatedAddedAtSel = { ...addedAt };
      const updatedBankAssignments = { ...bankAssignments };
      const updatedPinnedSel = new Set(pinnedApps);
      const updatedUsesSel = { ...uses };
      const updatedEmailsSel = { ...emails };
      const updatedPlatformsSel = { ...platforms };
      const updatedHintsSel = { ...hints };
      const updatedPhonesSel = { ...phones };
      const updatedNicknamesSel = { ...nicknames };
      toDelete.forEach((n) => { delete updatedUrls[n]; delete updatedPayments[n]; delete updatedNotes[n]; delete updatedStatuses[n]; delete updatedLastEdited[n]; delete updatedAddedAtSel[n]; delete updatedBankAssignments[n]; updatedPinnedSel.delete(n); delete updatedUsesSel[n]; delete updatedEmailsSel[n]; delete updatedPlatformsSel[n]; delete updatedHintsSel[n]; delete updatedPhonesSel[n]; delete updatedNicknamesSel[n]; });
      setMyAppNames(updated);
      setCustomUrls(updatedUrls);
      setPayments(updatedPayments);
      setNotes(updatedNotes);
      setStatuses(updatedStatuses);
      setLastEdited(updatedLastEdited);
      setAddedAt(updatedAddedAtSel);
      setBankAssignments(updatedBankAssignments);
      setPinnedApps(updatedPinnedSel);
      setUses(updatedUsesSel);
      setEmails(updatedEmailsSel);
      setPlatforms(updatedPlatformsSel);
      setHints(updatedHintsSel);
      setPhones(updatedPhonesSel);
      setNicknames(updatedNicknamesSel);
      saveHubData({ appList: updated, customUrls: updatedUrls, payments: updatedPayments, notes: updatedNotes, statuses: updatedStatuses, lastEdited: updatedLastEdited, addedAt: updatedAddedAtSel, banks: updatedBankAssignments, pinned: [...updatedPinnedSel], uses: updatedUsesSel, emails: updatedEmailsSel, platforms: updatedPlatformsSel, hints: updatedHintsSel, phones: updatedPhonesSel, nicknames: updatedNicknamesSel });
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
    if (myAppNames.includes(name)) return;
    const updated = [...myAppNames, name];
    setMyAppNames(updated);
    save.appList(updated);
    const updatedPayments = { ...payments, [name]: { type: "free" as const } };
    setPayments(updatedPayments);
    save.payments(updatedPayments);
    if (!addedAt[name]) {
      const updatedAddedAt = { ...addedAt, [name]: new Date().toISOString() };
      setAddedAt(updatedAddedAt);
      save.addedAt(updatedAddedAt);
    }
  }

  function openCustomAppForm(prefill = "") {
    setCustomDraft({ name: prefill, url: "", icon: "", description: "", tag: "Productivity" });
    setCustomDraftError("");
    setShowCustomAppForm(true);
  }

  function submitCustomApp() {
    const name = customDraft.name.trim();
    const url = customDraft.url.trim();
    if (!name) { setCustomDraftError("App name is required."); return; }
    if (!url) { setCustomDraftError("Website URL is required."); return; }
    if (allApps.some(a => a.name.toLowerCase() === name.toLowerCase())) {
      setCustomDraftError(`"${name}" already exists in the catalog.`); return;
    }
    let icon = customDraft.icon.trim();
    if (!icon) {
      try { icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch { icon = ""; }
    }
    const newApp: App = {
      name,
      url,
      icon,
      tags: [customDraft.tag],
      description: customDraft.description.trim(),
      brand: name,
    };
    const updatedCustom = [...customApps, newApp];
    setCustomApps(updatedCustom);
    save.customApps(updatedCustom);
    addApp(name);
    setShowCustomAppForm(false);
    setAddSearch("");
    setShowAddDropdown(false);
    showToast(`${name} added!`);
  }

  function deleteCustomApp(name: string) {
    const updatedCustom = customApps.filter(a => a.name !== name);
    setCustomApps(updatedCustom);
    save.customApps(updatedCustom);
    deleteApp(name);
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
    const updatedHintsDel = { ...hints };
    delete updatedHintsDel[name];
    const updatedPhonesDel = { ...phones };
    delete updatedPhonesDel[name];
    const updatedNicknamesDel = { ...nicknames };
    delete updatedNicknamesDel[name];
    const updatedAddedAtDel = { ...addedAt };
    delete updatedAddedAtDel[name];
    setMyAppNames(updated);
    setCustomUrls(updatedUrls);
    setPayments(updatedPayments);
    setNotes(updatedNotes);
    setStatuses(updatedStatuses);
    setLastEdited(updatedLastEdited);
    setAddedAt(updatedAddedAtDel);
    setBankAssignments(updatedBankAssignments);
    setPinnedApps(updatedPinned);
    setUses(updatedUsesDel);
    setEmails(updatedEmailsDel);
    setPlatforms(updatedPlatformsDel);
    setHints(updatedHintsDel);
    setPhones(updatedPhonesDel);
    setNicknames(updatedNicknamesDel);
    saveHubData({ appList: updated, customUrls: updatedUrls, payments: updatedPayments, notes: updatedNotes, statuses: updatedStatuses, lastEdited: updatedLastEdited, addedAt: updatedAddedAtDel, banks: updatedBankAssignments, pinned: [...updatedPinned], uses: updatedUsesDel, emails: updatedEmailsDel, platforms: updatedPlatformsDel, hints: updatedHintsDel, phones: updatedPhonesDel, nicknames: updatedNicknamesDel });
    setEditing(null);
  }

  function openAppDetail(name: string) {
    const pay = payments[name];
    setEditing(name);
    setModalTab("details");
    setUrlDraft(customUrls[name] ?? allApps.find((a) => a.name === name)?.url ?? "");
    setPayTypeDraft(pay?.type ?? "free");
    setPayAmountDraft(pay?.amount ?? "");
    setAmountError(false);
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
    setHintDraft(hints[name] ?? "");
    setPhoneDraft(phones[name] ?? "");
    const originalName = allApps.find((a) => a.name === name)?.name ?? name;
    setNicknameDraft(nicknames[name] ?? originalName);
    setNameEditMode(false);
    setStatusDraft(statuses[name] ?? "active");
    setUseDraft(uses[name] ?? "personal");
    setPlatformDraft(platforms[name] ?? "desktop");
    setNewEmailInput("");
    setNewEntryDate(new Date().toISOString().split("T")[0]);
    setNewEntryAmount("");
    setNewEntryNote("");
    setEditingEntryId(null);
    setConfirmDeleteEntryId(null);
    setConfirmRemoveApp(false);
  }

  function addEmailToList() {
    const trimmed = newEmailInput.trim();
    if (!trimmed || emailList.includes(trimmed)) { setNewEmailInput(""); return; }
    const updated = [...emailList, trimmed];
    setEmailList(updated);
    save.emailList(updated);
    setNewEmailInput("");
  }

  function removeEmailFromList(email: string) {
    const updated = emailList.filter((e) => e !== email);
    setEmailList(updated);
    save.emailList(updated);
    const updatedEmails = Object.fromEntries(Object.entries(emails).filter(([, v]) => v !== email));
    setEmails(updatedEmails);
    save.emails(updatedEmails);
    if (emailDraft === email) setEmailDraft("");
  }

  function renameEmail(oldEmail: string, newEmail: string) {
    const trimmed = newEmail.trim();
    if (!trimmed || trimmed === oldEmail || emailList.includes(trimmed)) return;
    const updatedList = emailList.map((e) => (e === oldEmail ? trimmed : e));
    setEmailList(updatedList);
    save.emailList(updatedList);
    const updatedEmails = Object.fromEntries(
      Object.entries(emails).map(([app, e]) => [app, e === oldEmail ? trimmed : e])
    );
    setEmails(updatedEmails);
    save.emails(updatedEmails);
    if (emailDraft === oldEmail) setEmailDraft(trimmed);
    setEditingEmail(null);
  }

  function togglePin(name: string) {
    const updated = new Set(pinnedApps);
    if (updated.has(name)) updated.delete(name); else updated.add(name);
    setPinnedApps(updated);
    save.pinned([...updated]);
  }

  function toggleHideApp(name: string) {
    const next = new Set(hiddenApps);
    if (next.has(name)) next.delete(name); else next.add(name);
    setHiddenApps(next);
    save.hidden([...next]);
  }

  function addSpendingEntry() {
    const n = parseFloat(newEntryAmount.replace(",", "."));
    if (!editing || isNaN(n) || n <= 0) return;
    const entry: SpendingEntry = {
      id: Date.now().toString(36),
      date: newEntryDate || new Date().toISOString().split("T")[0],
      amount: n,
      ...(newEntryNote.trim() ? { note: newEntryNote.trim() } : {}),
    };
    const updated = { ...spendingLog, [editing]: [...(spendingLog[editing] ?? []), entry] };
    setSpendingLog(updated);
    save.spendingLog(updated);
    setNewEntryAmount("");
    setNewEntryNote("");
    setNewEntryDate(new Date().toISOString().split("T")[0]);
  }

  function deleteSpendingEntry(entryId: string) {
    if (!editing) return;
    const updated = { ...spendingLog, [editing]: (spendingLog[editing] ?? []).filter((e) => e.id !== entryId) };
    setSpendingLog(updated);
    save.spendingLog(updated);
  }

  function startEditEntry(entry: SpendingEntry) {
    setEditingEntryId(entry.id);
    setEditEntryDate(entry.date);
    setEditEntryAmount(String(entry.amount));
    setEditEntryNote(entry.note ?? "");
  }

  function saveEditEntry() {
    const n = parseFloat(editEntryAmount.replace(",", "."));
    if (!editing || !editingEntryId || isNaN(n) || n <= 0) return;
    const updated = {
      ...spendingLog,
      [editing]: (spendingLog[editing] ?? []).map((e) =>
        e.id === editingEntryId
          ? { ...e, date: editEntryDate, amount: n, note: editEntryNote.trim() || undefined }
          : e
      ),
    };
    setSpendingLog(updated);
    save.spendingLog(updated);
    setEditingEntryId(null);
  }

  function saveEdit() {
    if (!editing) return;
    if (payTypeDraft === "paid" && !payAmountDraft.trim()) {
      setAmountError(true);
      showToast("Enter a payment amount before saving.");
      document.getElementById("pay-amount-input")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const updatedUrls = { ...customUrls, [editing]: urlDraft };
    setCustomUrls(updatedUrls);
    save.customUrls(updatedUrls);
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
    save.payments(updatedPayments);
    const updatedNotes = { ...notes };
    if (notesDraft.trim()) {
      updatedNotes[editing] = notesDraft.trim();
    } else {
      delete updatedNotes[editing];
    }
    setNotes(updatedNotes);
    save.notes(updatedNotes);
    const updatedEmails = { ...emails };
    if (emailDraft.trim()) {
      updatedEmails[editing] = emailDraft.trim();
    } else {
      delete updatedEmails[editing];
    }
    setEmails(updatedEmails);
    save.emails(updatedEmails);
    const updatedHints = { ...hints };
    if (hintDraft.trim()) {
      updatedHints[editing] = hintDraft.trim();
    } else {
      delete updatedHints[editing];
    }
    setHints(updatedHints);
    save.hints(updatedHints);
    const updatedPhones = { ...phones };
    if (phoneDraft.trim()) {
      updatedPhones[editing] = phoneDraft.trim();
    } else {
      delete updatedPhones[editing];
    }
    setPhones(updatedPhones);
    save.phones(updatedPhones);
    const updatedNicknames = { ...nicknames };
    const trimmedNick = nicknameDraft.trim();
    if (trimmedNick && trimmedNick !== editing) {
      updatedNicknames[editing] = trimmedNick;
    } else {
      delete updatedNicknames[editing];
    }
    setNicknames(updatedNicknames);
    save.nicknames(updatedNicknames);
    const updatedStatuses = { ...statuses };
    if (statusDraft === "active") {
      delete updatedStatuses[editing];
    } else {
      updatedStatuses[editing] = statusDraft;
    }
    setStatuses(updatedStatuses);
    save.statuses(updatedStatuses);
    const updatedLastEdited = { ...lastEdited, [editing]: new Date().toISOString() };
    setLastEdited(updatedLastEdited);
    save.lastEdited(updatedLastEdited);
    const updatedBankAssignments = { ...bankAssignments };
    if (bankDraft && payTypeDraft === "paid") {
      updatedBankAssignments[editing] = bankDraft;
    } else {
      delete updatedBankAssignments[editing];
    }
    setBankAssignments(updatedBankAssignments);
    save.banks(updatedBankAssignments);
    const updatedUses = { ...uses };
    if (useDraft === "personal") {
      delete updatedUses[editing];
    } else {
      updatedUses[editing] = useDraft;
    }
    setUses(updatedUses);
    save.uses(updatedUses);
    const updatedPlatforms = { ...platforms };
    if (platformDraft === "desktop") {
      delete updatedPlatforms[editing];
    } else {
      updatedPlatforms[editing] = platformDraft;
    }
    setPlatforms(updatedPlatforms);
    save.platforms(updatedPlatforms);
    setEditing(null);
  }

  const allApps = [...catalog, ...customApps];

  const myApps: App[] = myAppNames
    .map((name) => allApps.find((a) => a.name === name))
    .filter((a): a is App => !!a);

  const availableTags = Array.from(new Set(myApps.flatMap((a) => a.tags))).sort();

  const filteredApps = myApps
    .filter((app) => !activeTag || app.tags.includes(activeTag))
    .filter((app) => !activeBank || bankAssignments[app.name] === activeBank)
    .filter((app) => !activePayMethod || payments[app.name]?.method === activePayMethod)
    .filter((app) => !activeUse || (uses[app.name] ?? "personal") === activeUse)
    .filter((app) => !activePlatform || (platforms[app.name] ?? "desktop") === activePlatform)
    .filter((app) => !activeEmailFilter || emails[app.name] === activeEmailFilter)
    .filter((app) => !activePhone || !!phones[app.name])
    .filter((app) => app.name.toLowerCase().includes(search.toLowerCase()));
  const hasBusinessApp = myAppNames.some((n) => uses[n] === "business");
  const hasNonDesktopApp = myAppNames.some((n) => platforms[n] === "mobile" || platforms[n] === "both");

  const usedBanks = Array.from(new Set(myAppNames.map((n) => bankAssignments[n]).filter(Boolean))).sort() as string[];
  const usedPayMethods = Array.from(new Set(myAppNames.map((n) => payments[n]?.method).filter((m): m is PaymentMethod => !!m))).sort();
  const usedEmailFilters = Array.from(new Set(myAppNames.map((n) => emails[n]).filter(Boolean))).sort() as string[];
  const hasPhoneApp = myAppNames.some((n) => !!phones[n]);

  // Each app is shown only once in the category grid — under its first matching tag.
  // Multi-tag apps (e.g. Unity: Dev + Gaming) are still discoverable via the filter chips.
  const primaryTagForApp = new Map<string, string>();
  for (const app of myApps) {
    const primary = availableTags.find((t) => app.tags.includes(t));
    if (primary) primaryTagForApp.set(app.name, primary);
  }

  const availableToAdd = allApps.filter((a) => !myAppNames.includes(a.name));
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
    ? allApps
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

  const editingApp = editing ? allApps.find((a) => a.name === editing) : null;

  const hasBusinessApps = myAppNames.some((n) => uses[n] === "business");

  const upcomingAnnual = myAppNames.filter((name) => {
    const pay = payments[name];
    const st = statuses[name];
    if (!pay || pay.type !== "paid" || pay.period !== "annually") return false;
    if (st === "trial" || st === "cancelled") return false;
    const days = getDaysUntilDue(pay);
    return days !== null && days >= 0 && days <= 30;
  });

  const thisMonthKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();

  // Stats — only active apps count (trial = not paying yet, cancelled = no longer paying)
  let statsMonthly = 0;
  let statsAnnual = 0;
  let statsOnce = 0;
  let statsVariable = 0;
  for (const name of myAppNames) {
    const st = statuses[name];
    if (st === "trial" || st === "cancelled") continue;
    if (statsUseFilter !== "all" && (uses[name] ?? "personal") !== statsUseFilter) continue;
    const pay = payments[name];
    if (pay?.type === "paid" && pay.amount) {
      const amt = parseFloat(pay.amount);
      if (!isNaN(amt)) {
        if (pay.period === "monthly") statsMonthly += amt;
        else if (pay.period === "annually") statsAnnual += amt;
        else if (pay.period === "once") statsOnce += amt;
      }
    }
    statsVariable += (spendingLog[name] ?? [])
      .filter((e) => e.date.startsWith(thisMonthKey))
      .reduce((s, e) => s + e.amount, 0);
  }

  function fmtCurrency(amount: number) {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  }

  const d = isDark;

  const gridCls = viewMode === "grid"
    ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3";

  const inputCls = `w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`;
  const selectCls = `w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors appearance-none ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`;

  return (
    <main className={`page-in min-h-screen px-4 sm:px-10 pt-0 pb-8 sm:pb-12 transition-colors duration-200 ${selectMode ? "pb-28" : ""} ${d ? "bg-[#0d0d0d] text-white" : "bg-[#f7f6f3] text-gray-900"}`}>

      {/* Header */}
      <div className={`-mx-4 sm:-mx-10 px-4 sm:px-10 py-3 border-b ${d ? "border-white/[0.08]" : "border-black/[0.07]"}`}>
      <div className="flex flex-wrap items-center gap-y-2">
        {/* Logo + username — row 1 left on both mobile and desktop */}
        <div className="flex items-center gap-2.5 order-1">
          <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-amber-500 ${d ? "bg-amber-500/10" : "bg-amber-50"}`}>
            <SunIcon size={15} />
          </div>
          <span className={`text-sm font-medium ${d ? "text-gray-300" : "text-gray-700"}`}>testuser</span>
          <button onClick={() => setShowChangelog(true)}
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${d ? "bg-white/8 text-gray-500 hover:bg-white/12 hover:text-gray-300" : "bg-black/[0.06] text-gray-400 hover:bg-black/10 hover:text-gray-600"}`}>
            {changelog[0].version}
          </button>
        </div>
        {/* Action buttons — row 1 right on mobile (order-2), row 1 right on desktop (order-3) */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto order-2 sm:order-3">
          <button onClick={() => setBlurAmounts((v) => !v)} title={blurAmounts ? "Show amounts" : "Hide amounts"}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${blurAmounts ? d ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-600" : d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            {blurAmounts ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          <button onClick={shareApps} title="Share hub"
            className={`flex items-center justify-center gap-1.5 w-9 sm:w-auto sm:px-3 h-9 rounded-full text-sm font-medium transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <ShareIcon />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button onClick={toggleTheme} title={d ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            {d ? <SunIcon /> : <MoonIcon />}
          </button>
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
        {/* Nav — row 2 full-width centered on mobile (order-3), centered middle column on desktop (order-2) */}
        <div className="order-3 sm:order-2 basis-full sm:basis-0 sm:flex-1 flex justify-center py-0.5 sm:py-0">
          <nav className={`flex items-center gap-0.5 p-1 rounded-xl ${d ? "bg-white/[0.06]" : "bg-black/[0.05]"}`}>
            <span className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${d ? "bg-white/10 text-white" : "bg-white text-gray-900 shadow-sm"}`}>Hub</span>
            <Link href="/dashboard" className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-gray-200 hover:bg-white/8" : "text-gray-400 hover:text-gray-700 hover:bg-black/[0.04]"}`}>Dashboard</Link>
          </nav>
        </div>
      </div>
      </div>

      {/* Add-app search strip */}
      <div className={`-mx-4 sm:-mx-10 px-4 sm:px-10 py-3 mb-5 border-b ${d ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
        <div className="max-w-xl mx-auto">
        <div className="relative">
          <input
            ref={addInputRef}
            type="text"
            placeholder="Add an app…"
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            onFocus={() => setShowAddDropdown(true)}
            onBlur={() => setTimeout(() => setShowAddDropdown(false), 150)}
            onKeyDown={(e) => e.key === "Escape" && (setAddSearch(""), setShowAddDropdown(false), (e.target as HTMLInputElement).blur())}
            className={`pl-4 py-2 rounded-xl text-sm outline-none border transition-colors w-full ${addSearch ? "pr-8" : "pr-3"} ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-white border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
          />
          {addSearch && (
            <button onClick={() => setAddSearch("")} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
          {showAddDropdown && (
            <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl overflow-hidden z-50 ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`}>
              {!addSearch.trim() ? (<>
                <button
                  onMouseDown={() => { setShowAddDropdown(false); openAddModal(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${d ? "hover:bg-white/6" : "hover:bg-gray-50"}`}>
                  <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-lg ${d ? "bg-white/8" : "bg-gray-100"}`}>✦</div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium ${d ? "text-gray-100" : "text-gray-800"}`}>Browse all {allApps.length} apps</div>
                    <div className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>{myAppNames.length} in your hub · {allApps.length - myAppNames.length} available to add</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${d ? "text-gray-600" : "text-gray-300"}`}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <div className={`mx-3 my-0.5 border-t ${d ? "border-white/[0.06]" : "border-black/[0.05]"}`} />
                <button
                  onMouseDown={() => { setShowAddDropdown(false); openCustomAppForm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${d ? "hover:bg-white/6" : "hover:bg-gray-50"}`}>
                  <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${d ? "bg-white/8 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium ${d ? "text-gray-100" : "text-gray-800"}`}>Add a custom app</div>
                    <div className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Your own tool, internal app, or anything else</div>
                  </div>
                </button>
              </>) : addDropdownApps.length === 0 ? (
                <div className="py-3 px-3">
                  <p className={`text-xs text-center pb-3 ${d ? "text-gray-500" : "text-gray-400"}`}>No results for &ldquo;{addSearch}&rdquo;</p>
                  <button
                    onMouseDown={() => { setShowAddDropdown(false); openCustomAppForm(addSearch); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors border ${d ? "border-white/10 hover:bg-white/6 text-gray-300" : "border-black/[0.08] hover:bg-gray-50 text-gray-700"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span className="text-sm">Add &ldquo;{addSearch}&rdquo; as a custom app</span>
                  </button>
                </div>
              ) : (<>
                {addDropdownApps.map((app) => {
                  const alreadyAdded = myAppNames.includes(app.name);
                  const isCustom = customApps.some(c => c.name === app.name);
                  return (
                    <button key={app.name}
                      onMouseDown={() => { if (!alreadyAdded) { addApp(app.name); setAddSearch(""); setShowAddDropdown(false); showToast(`${app.name} added!`); } }}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${alreadyAdded ? "cursor-default opacity-50" : d ? "hover:bg-white/6" : "hover:bg-gray-50"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={app.icon} alt={app.name} className="w-9 h-9 rounded-xl flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-medium ${d ? "text-gray-100" : "text-gray-800"}`}>{app.name}</span>
                          {isCustom && <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"}`}>Custom</span>}
                          {alreadyAdded && (
                            <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${d ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"}`}>In hub</span>
                          )}
                        </div>
                        <div className={`text-xs leading-snug mt-0.5 line-clamp-2 ${d ? "text-gray-400" : "text-gray-500"}`}>{app.description}</div>
                        <div className={`text-[11px] mt-1 ${d ? "text-gray-600" : "text-gray-400"}`}>{app.tags.join(" · ")}</div>
                      </div>
                    </button>
                  );
                })}
                <div className={`border-t mx-3 my-0.5 ${d ? "border-white/[0.06]" : "border-black/[0.05]"}`} />
                <button
                  onMouseDown={() => { setShowAddDropdown(false); openCustomAppForm(addSearch); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${d ? "hover:bg-white/6 text-gray-500 hover:text-gray-300" : "hover:bg-gray-50 text-gray-400 hover:text-gray-600"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span className="text-xs">Add custom app</span>
                </button>
              </>)}
            </div>
          )}
        </div>
        {/* Feeling lucky */}
        <div className="flex justify-center mt-2">
          <button
            onClick={pickLucky}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors px-3 py-1.5 rounded-full border ${d ? "text-amber-400 border-amber-500/30 bg-amber-500/8 hover:bg-amber-500/15 hover:border-amber-500/50" : "text-amber-600 border-amber-400/40 bg-amber-50 hover:bg-amber-100 hover:border-amber-400/70"}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Feeling lucky
          </button>
        </div>
        </div>
      </div>

      {/* Controls row — app count lives here now */}
      <div className="flex items-center justify-end gap-4 mb-5">
        <div className="flex items-center gap-2 flex-shrink-0">
          {myAppNames.length > 0 && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 ${d ? "bg-white/8 text-gray-400" : "bg-black/[0.05] text-gray-500"}`}>
              {myAppNames.length} app{myAppNames.length !== 1 ? "s" : ""}
            </span>
          )}
          {/* Filter search */}
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-500" : "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input ref={searchRef} type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (setSearch(""), (e.target as HTMLInputElement).blur())}
              className={`pl-8 pr-12 py-1.5 rounded-xl text-sm outline-none border transition-colors w-40 ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-white border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
            />
            {search ? (
              <button onClick={() => setSearch("")} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            ) : (
              <kbd className={`absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-medium pointer-events-none select-none ${d ? "text-gray-600" : "text-gray-300"}`}>
                {isMac ? <><span>⌘</span><span>K</span></> : <><span>Ctrl</span><span>K</span></>}
              </kbd>
            )}
          </div>
          {/* Select mode */}
          <button onClick={() => { exitSelectMode(); setSelectMode(true); }} title="Select apps"
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0 ${selectMode ? "bg-amber-500 text-white" : d ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-black/[0.06] text-gray-600 hover:bg-black/10"}`}>
            <CheckSquareIcon />
          </button>
          {/* View toggle */}
          <div className={`flex items-center rounded-lg overflow-hidden border ${d ? "border-white/10" : "border-black/[0.08]"}`}>
            <button onClick={() => { setViewMode("grid"); save.view("grid"); }} title="Grid view"
              className={`flex items-center justify-center w-8 h-8 transition-colors ${viewMode === "grid" ? d ? "bg-white/15 text-white" : "bg-black/[0.08] text-gray-800" : d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
              <GridViewIcon />
            </button>
            <button onClick={() => { setViewMode("list"); save.view("list"); }} title="List view"
              className={`flex items-center justify-center w-8 h-8 transition-colors ${viewMode === "list" ? d ? "bg-white/15 text-white" : "bg-black/[0.08] text-gray-800" : d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
              <ListViewIcon />
            </button>
          </div>
          {/* Properties */}
          <div className="relative">
            <button onClick={() => setShowPropsDropdown((v) => !v)} title="Card properties"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-colors border ${showPropsDropdown ? d ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.08] border-black/[0.12] text-gray-800" : d ? "bg-white/8 border-white/10 text-gray-300 hover:bg-white/12 hover:text-white" : "bg-black/[0.05] border-black/[0.08] text-gray-600 hover:bg-black/[0.08] hover:text-gray-800"}`}>
              <SlidersIcon />
              <span>Properties</span>
              {Object.values(cardProps).some((v) => !v) && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
            </button>
            {showPropsDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPropsDropdown(false)} />
                <div className={`absolute top-full right-0 mt-1.5 w-64 rounded-2xl border shadow-2xl p-3 z-50 ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${d ? "text-gray-500" : "text-gray-400"}`}>Card properties</p>
                    <button
                      onClick={() => {
                        const allOn = Object.values(cardProps).every((v) => v);
                        const next = Object.fromEntries(Object.keys(cardProps).map((k) => [k, !allOn])) as CardProps;
                        setCardProps(next);
                        save.cardProps(next);
                      }}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors ${d ? "text-gray-400 hover:bg-white/8 hover:text-gray-200" : "text-gray-500 hover:bg-black/[0.05] hover:text-gray-700"}`}>
                      {Object.values(cardProps).every((v) => v) ? "Hide all" : "Show all"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {([
                      ["brand", "Brand"], ["payment", "Payment"],
                      ["status", "Status"], ["method", "Method"],
                      ["use", "Use"], ["dueDate", "Due date"],
                      ["platform", "Platform"], ["bank", "Bank"],
                    ] as [CardProperty, string][]).map(([prop, label]) => (
                      <button key={prop}
                        onClick={() => setCardProps((prev) => {
                          const next = { ...prev, [prop]: !prev[prop] };
                          save.cardProps(next);
                          return next;
                        })}
                        className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${d ? "hover:bg-white/6" : "hover:bg-black/[0.04]"}`}>
                        <span className={cardProps[prop] ? d ? "text-gray-200" : "text-gray-700" : d ? "text-gray-500" : "text-gray-400"}>{label}</span>
                        <div className={`w-7 h-4 rounded-full flex items-center transition-colors flex-shrink-0 ${cardProps[prop] ? "bg-amber-500" : d ? "bg-white/15" : "bg-black/15"}`}>
                          <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${cardProps[prop] ? "translate-x-3.5" : "translate-x-0.5"}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spending section */}
      {myAppNames.length > 0 && (statsMonthly > 0 || statsAnnual > 0 || statsOnce > 0 || statsVariable > 0 || hasBusinessApps) && (
        <div className="mb-5">
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${d ? "text-gray-600" : "text-gray-400"}`}>Spending</p>
          <div className="flex flex-wrap items-center gap-2">
            {hasBusinessApps && (
              <div className={`flex items-center rounded-lg overflow-hidden border text-xs font-medium ${d ? "border-white/10" : "border-black/[0.08]"}`}>
                {(["all", "personal", "business"] as const).map((f) => (
                  <button key={f} onClick={() => setStatsUseFilter(f)}
                    className={`px-2.5 py-1.5 transition-colors capitalize ${statsUseFilter === f ? d ? "bg-white/15 text-white" : "bg-black/[0.08] text-gray-800" : d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                    {f}
                  </button>
                ))}
              </div>
            )}
            {statsMonthly > 0 && (
              <button onClick={() => setBillingView("monthly")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${d ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                <span className={blurAmounts ? "blur-sm select-none" : ""}>{fmtCurrency(statsMonthly)}</span>/mo
              </button>
            )}
            {statsAnnual > 0 && (
              <button onClick={() => setBillingView("annually")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${d ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                <span className={blurAmounts ? "blur-sm select-none" : ""}>{fmtCurrency(statsAnnual)}</span>/yr
              </button>
            )}
            {statsOnce > 0 && (
              <button onClick={() => setBillingView("once")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-black/[0.05] text-gray-500 hover:bg-black/[0.08]"}`}>
                <span className={blurAmounts ? "blur-sm select-none" : ""}>{fmtCurrency(statsOnce)}</span> one-time
              </button>
            )}
            {statsVariable > 0 && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${d ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600"}`}>
                <span className={blurAmounts ? "blur-sm select-none" : ""}>{fmtCurrency(statsVariable)}</span> this month
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-8">
        {(availableTags.length > 0 || usedBanks.length > 0 || usedPayMethods.length > 0 || usedEmailFilters.length > 0) && (
          <>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${d ? "text-gray-600" : "text-gray-400"}`}>Display</p>
          <div className="flex flex-wrap gap-2">
            {/* All — clears every filter */}
            <button onClick={() => { setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); setActivePhone(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === null && activeBank === null && activePayMethod === null && activeUse === null && activePlatform === null && activeEmailFilter === null && !activePhone ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
              All
            </button>

            {/* Category chips */}
            {availableTags.map((tag) => (
              <button key={tag} onClick={() => { setActiveTag(activeTag === tag ? null : tag); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); setActivePhone(false); }}
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
                <button key={bank} onClick={() => { setActiveBank(activeBank === bank ? null : bank); setActiveTag(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); setActivePhone(false); }}
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
              <button key={method} onClick={() => { setActivePayMethod(activePayMethod === method ? null : method); setActiveTag(null); setActiveBank(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); setActivePhone(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activePayMethod === method ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                {METHOD_LABEL[method]}
              </button>
            ))}

            {/* Use filter chips — shown once at least one app is set to Business */}
            {hasBusinessApp && (
              <>
                <div className={`w-px h-4 self-center ${d ? "bg-white/10" : "bg-black/10"}`} />
                {(["personal", "business"] as AppUse[]).map((u) => (
                  <button key={u} onClick={() => { setActiveUse(activeUse === u ? null : u); setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActivePlatform(null); setActiveEmailFilter(null); setActivePhone(false); }}
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
                  <button key={p} onClick={() => { setActivePlatform(activePlatform === p ? null : p); setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActiveEmailFilter(null); setActivePhone(false); }}
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
                  <button key={email} onClick={() => { setActiveEmailFilter(activeEmailFilter === email ? null : email); setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActivePhone(false); }}
                    title={email}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors max-w-[160px] truncate ${activeEmailFilter === email ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                    {email}
                  </button>
                ))}
              </>
            )}
            {/* Phone filter chip — shown once at least one app has a phone number */}
            {hasPhoneApp && (
              <>
                <div className={`w-px h-4 self-center ${d ? "bg-white/10" : "bg-black/10"}`} />
                <button onClick={() => { setActivePhone(!activePhone); setActiveTag(null); setActiveBank(null); setActivePayMethod(null); setActiveUse(null); setActivePlatform(null); setActiveEmailFilter(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activePhone ? (d ? "bg-white text-black" : "bg-gray-900 text-white") : (d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-white border border-black/[0.08] text-gray-500 hover:bg-gray-50")}`}>
                  Phone linked
                </button>
              </>
            )}
          </div>
          </>
        )}
      </div>

      {/* App grid */}
      {activeTag || activeBank || activePayMethod || activeUse || activePlatform || activeEmailFilter || activePhone || search ? (
        <div className={gridCls}>
          {filteredApps.map((app) => (
            <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
              payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]}
              bank={bankAssignments[app.name]} use={uses[app.name]} platform={platforms[app.name]} email={emails[app.name]} hint={hints[app.name]} nickname={nicknames[app.name]} d={d}
              selectMode={selectMode} isSelected={selectedApps.has(app.name)} viewMode={viewMode} cardProps={cardProps}
              blurAmounts={blurAmounts} isLocked={hiddenApps.has(app.name)}
              monthlyVariableSpend={(spendingLog[app.name] ?? []).filter(e => e.date.startsWith(thisMonthKey)).reduce((s, e) => s + e.amount, 0) || undefined}
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
          {/* Upcoming annual payments — shown when any annual subscription is due within 30 days */}
          {upcomingAnnual.length > 0 && !selectMode && (
            <section>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-orange-400"><BellIcon size={12} /></span>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-orange-400">Due within 30 days</h2>
              </div>
              <div className={gridCls}>
                {upcomingAnnual.map((name) => {
                  const app = myApps.find((a) => a.name === name);
                  if (!app) return null;
                  return (
                    <AppCard key={name} app={app} url={customUrls[name] ?? app.url}
                      payment={payments[name]} currency={currency} notes={notes[name]} status={statuses[name]}
                      bank={bankAssignments[name]} use={uses[name]} platform={platforms[name]} email={emails[name]} hint={hints[name]} nickname={nicknames[name]} d={d}
                      selectMode={false} isSelected={false} viewMode={viewMode} cardProps={cardProps}
                      blurAmounts={blurAmounts} isLocked={hiddenApps.has(name)}
                      monthlyVariableSpend={(spendingLog[name] ?? []).filter(e => e.date.startsWith(thisMonthKey)).reduce((s, e) => s + e.amount, 0) || undefined}
                      onOpen={() => openAppDetail(name)}
                      onToggleSelect={() => {}}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Pinned section — shown before categories when at least one hub app is pinned */}
          {myApps.some((a) => pinnedApps.has(a.name)) && (
            <section>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-amber-500"><PinIcon size={12} filled /></span>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-500">Pinned</h2>
              </div>
              <div className={gridCls}>
                {myApps.filter((a) => pinnedApps.has(a.name)).map((app) => (
                  <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
                    payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]}
                    bank={bankAssignments[app.name]} use={uses[app.name]} platform={platforms[app.name]} email={emails[app.name]} hint={hints[app.name]} pinned d={d}
                    selectMode={selectMode} isSelected={selectedApps.has(app.name)} viewMode={viewMode} cardProps={cardProps}
                    blurAmounts={blurAmounts} isLocked={hiddenApps.has(app.name)}
                    monthlyVariableSpend={(spendingLog[app.name] ?? []).filter(e => e.date.startsWith(thisMonthKey)).reduce((s, e) => s + e.amount, 0) || undefined}
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
                <div className={gridCls}>
                  {myApps.filter((a) => primaryTagForApp.get(a.name) === tag).map((app) => (
                    <AppCard key={app.name} app={app} url={customUrls[app.name] ?? app.url}
                      payment={payments[app.name]} currency={currency} notes={notes[app.name]} status={statuses[app.name]}
                      bank={bankAssignments[app.name]} use={uses[app.name]} platform={platforms[app.name]} email={emails[app.name]} hint={hints[app.name]} nickname={nicknames[app.name]} d={d}
                      selectMode={selectMode} isSelected={selectedApps.has(app.name)} viewMode={viewMode} cardProps={cardProps}
                      blurAmounts={blurAmounts} isLocked={hiddenApps.has(app.name)}
                      monthlyVariableSpend={(spendingLog[app.name] ?? []).filter(e => e.date.startsWith(thisMonthKey)).reduce((s, e) => s + e.amount, 0) || undefined}
                      onOpen={() => openAppDetail(app.name)}
                      onToggleSelect={() => toggleSelect(app.name)}
                    />
                  ))}
                  {!selectMode && (
                    viewMode === "grid" ? (
                      <button onClick={() => openAddModal(tag)}
                        className={`flex flex-col items-center justify-center gap-1 min-h-[6.5rem] rounded-2xl border border-dashed transition-all duration-200 ${d ? "border-white/20 text-white/30 hover:border-amber-500/50 hover:text-amber-400" : "border-black/20 text-black/25 hover:border-amber-500/50 hover:text-amber-500"}`}>
                        <span className="text-xl font-light leading-none">+</span>
                        <span className="text-[10px] font-medium">Add</span>
                      </button>
                    ) : (
                      <button onClick={() => openAddModal(tag)}
                        className={`flex items-center justify-center gap-2 h-full min-h-[4.5rem] rounded-2xl px-4 border border-dashed transition-all duration-200 ${d ? "border-white/20 text-white/30 hover:border-amber-500/50 hover:text-amber-400" : "border-black/20 text-black/25 hover:border-amber-500/50 hover:text-amber-500"}`}>
                        <span className="text-lg font-light leading-none">+</span>
                        <span className="text-xs font-medium">Add</span>
                      </button>
                    )
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
          <div className={`rounded-2xl w-full max-w-xs shadow-2xl border max-h-[90vh] flex flex-col ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>

            {/* Header - never scrolls */}
            <div className="p-6 pb-0 flex-shrink-0">
            {/* App identity */}
            <div className="flex items-start gap-3 mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editingApp.icon} alt={editingApp.name} className="w-11 h-11 rounded-xl flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {/* Name row — full width */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {nameEditMode ? (
                    <input
                      autoFocus
                      value={nicknameDraft}
                      onChange={(e) => setNicknameDraft(e.target.value)}
                      onBlur={() => setNameEditMode(false)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setNameEditMode(false); }}
                      className={`font-semibold text-base bg-transparent outline-none border-b border-current flex-1 min-w-0 ${d ? "text-white" : "text-gray-900"}`}
                    />
                  ) : (
                    <span className={`font-semibold text-base truncate flex-1 min-w-0 ${d ? "text-white" : "text-gray-900"}`}>{nicknameDraft}</span>
                  )}
                  <button
                    onClick={() => setNameEditMode(true)}
                    title="Edit name"
                    className={`flex-shrink-0 transition-colors ${d ? "text-gray-600 hover:text-gray-400" : "text-gray-300 hover:text-gray-500"}`}
                  >
                    <PencilIcon size={11} />
                  </button>
                  {nicknameDraft !== editingApp.name && (
                    <button onClick={() => setNicknameDraft(editingApp.name)}
                      title="Reset to original name"
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 transition-colors ${d ? "bg-white/10 text-gray-400 hover:text-gray-200" : "bg-gray-100 text-gray-400 hover:text-gray-600"}`}>
                      Reset
                    </button>
                  )}
                </div>
                {hiddenApps.has(editing!) && (
                  <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${d ? "text-amber-400" : "text-amber-600"}`}>
                    <LockIcon size={10} />
                    <span>Locked — hidden from hub</span>
                  </div>
                )}
                {/* Meta + action row */}
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <div className="min-w-0">
                    <div className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>{editingApp.brand}</div>
                    <div className={`text-[11px] mt-0.5 ${d ? "text-gray-600" : "text-gray-400"}`}>
                      {addedAt[editing!] && <span>Added {formatLastEdited(addedAt[editing!])}</span>}
                      {addedAt[editing!] && <span className="mx-1">·</span>}
                      <span>{lastEdited[editing!] ? `Edited ${formatLastEdited(lastEdited[editing!])}` : "Never edited"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleHideApp(editing!)}
                      title={hiddenApps.has(editing!) ? "Unlock app" : "Lock app"}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                        hiddenApps.has(editing!)
                          ? "bg-amber-500/15 text-amber-500"
                          : d ? "bg-white/8 text-gray-400 hover:bg-white/12 hover:text-gray-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                      }`}>
                      <LockIcon size={14} />
                    </button>
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
              </div>
            </div>
            </div>{/* end header */}

            {/* Tab bar - never scrolls */}
            <div className="px-6 py-3 flex-shrink-0">
              <div className={`flex p-1 rounded-xl ${d ? "bg-white/8" : "bg-gray-100"}`}>
                {(["details", "payment", "notes"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      modalTab === tab
                        ? d ? "bg-[#2a2a2a] text-white shadow-sm" : "bg-white text-gray-900 shadow-sm"
                        : d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab === "details" ? "Details" : tab === "payment" ? "Payment" : "Notes"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-2">

            {/* Details + Payment share this block */}
            {(modalTab === "details" || modalTab === "payment") && (
            <div className="pt-2">

            {/* Details-only content */}
            {modalTab === "details" && (<>

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

            {/* Phone Number */}
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>
              Phone Number <span className="normal-case font-normal opacity-60">— optional</span>
            </p>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              className={inputCls}
            />
            {phoneDraft && (
              <button onClick={() => setPhoneDraft("")} className={`mt-1.5 text-xs ${d ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                Clear
              </button>
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

            </>)}{/* end details-only */}
            {modalTab === "payment" && (<>

            {/* Payment — hidden for trial/cancelled (not relevant until active) */}
            {statusDraft === "active" && (<>
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>Payment</p>
            <div className="flex gap-2 mb-3">
              {(["free", "paid"] as const).map((t) => (
                <button key={t} onClick={() => { setPayTypeDraft(t); setAmountError(false); }}
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
                    id="pay-amount-input" type="text" inputMode="decimal" placeholder="9.99" value={payAmountDraft}
                    onChange={(e) => { setPayAmountDraft(e.target.value.replace(/[^0-9.,]/g, "")); setAmountError(false); }}
                    className={`${inputCls} pr-12 ${amountError ? "border-red-400 focus:border-red-400" : ""}`}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none ${d ? "text-gray-500" : "text-gray-400"}`}>
                    {currency}
                  </span>
                </div>
                {amountError && (
                  <p className="text-xs text-red-400 -mt-1">Enter an amount to save.</p>
                )}
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
                      <div className={`px-3 py-2 border-b flex items-center gap-2 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search banks…"
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                          className={`flex-1 text-sm outline-none bg-transparent ${d ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
                        />
                        {bankSearch && (
                          <button onClick={() => setBankSearch("")} className={`flex-shrink-0 ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        )}
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

            </>)}{/* end payment-only billing block */}
            </div>
            )}{/* end details/payment shared block */}

            {/* Notes tab */}
            {modalTab === "notes" && (
            <div className="pt-2">

            {/* Password hint */}
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Password Hint</p>
            <input
              type="text"
              value={hintDraft}
              onChange={(e) => setHintDraft(e.target.value)}
              placeholder="e.g. usual, blue2019!, work+special"
              className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
            />
            <p className={`text-[11px] mt-1 ${d ? "text-gray-600" : "text-gray-400"}`}>A personal reminder only you understand — never store the actual password.</p>

            {/* Notes */}
            <p className={`text-xs font-semibold uppercase tracking-wider mt-5 mb-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Notes</p>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add any notes about this app…"
              rows={3}
              maxLength={2000}
              className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors resize-none ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
            />
            <div className={`flex justify-end mt-0.5 text-[10px] tabular-nums ${notesDraft.length > 1800 ? (d ? "text-amber-400" : "text-amber-600") : (d ? "text-gray-600" : "text-gray-400")}`}>
              {notesDraft.length}/2000
            </div>

            </div>
            )}{/* end notes tab */}

            {/* Payment tab - spending log section */}
            {modalTab === "payment" && (
            <div className={`border-t pt-4 pb-2 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <div className={`p-3 rounded-xl mb-4 text-[11px] leading-relaxed ${d ? "bg-white/5 text-gray-500" : "bg-gray-50 text-gray-500"}`}>
                <span className={`font-semibold ${d ? "text-gray-300" : "text-gray-700"}`}>What&apos;s the Spending Log?</span>{" "}
                The billing above tracks <em>fixed</em> costs — a monthly plan, annual subscription, or one-time purchase. The Spending Log is for <em>variable</em> costs that change every month: ad spend, AI credits, pay-per-use charges, anything that doesn&apos;t fit a predictable billing cycle.
              </div>
            {(() => {
              const entries = [...(spendingLog[editing!] ?? [])].sort((a, b) => b.date.localeCompare(a.date));
              const thisMonthTotal = entries.filter((e) => e.date.startsWith(thisMonthKey)).reduce((s, e) => s + e.amount, 0);
              const allTimeTotal = entries.reduce((s, e) => s + e.amount, 0);
              // Group entries by YYYY-MM, newest month first
              const byMonth = entries.reduce<Record<string, typeof entries>>((acc, e) => {
                const key = e.date.slice(0, 7);
                (acc[key] ??= []).push(e);
                return acc;
              }, {});
              const monthKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));
              const fmtAmt = (n: number) => {
                try { return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD" }).format(n); }
                catch { return `${n} ${currency}`; }
              };
              const fmtDate = (iso: string) => {
                const [y, m, day] = iso.split("-").map(Number);
                const v = day % 100;
                const ord = day + (["th","st","nd","rd"][(v - 20) % 10] ?? ["th","st","nd","rd"][v] ?? "th");
                return `${ord} ${["January","February","March","April","May","June","July","August","September","October","November","December"][m - 1]} ${y}`;
              };
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${d ? "text-gray-500" : "text-gray-400"}`}>Spending Log</p>
                    {allTimeTotal > 0 && (
                      <div className={`flex gap-2 text-[11px] ${d ? "text-gray-500" : "text-gray-400"}`}>
                        <span>Month: <span className={d ? "text-gray-300" : "text-gray-700"}>{fmtAmt(thisMonthTotal)}</span></span>
                        <span className={d ? "text-gray-700" : "text-gray-300"}>·</span>
                        <span>Total: <span className={d ? "text-gray-300" : "text-gray-700"}>{fmtAmt(allTimeTotal)}</span></span>
                      </div>
                    )}
                  </div>
                  {monthKeys.length > 0 && (
                    <div className="mb-2 flex flex-col gap-2">
                      {monthKeys.map((mk) => {
                        const [yr, mo] = mk.split("-").map(Number);
                        const monthLabel = `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mo - 1]} ${yr}`;
                        const monthTotal = byMonth[mk].reduce((s, e) => s + e.amount, 0);
                        return (
                          <div key={mk}>
                            {/* Month header */}
                            <div className={`flex items-center justify-between px-1 mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}>
                              <span className="text-[11px] font-medium">{monthLabel}</span>
                              <span className={`text-[11px] tabular-nums ${blurAmounts ? "blur-sm select-none" : ""}`}>{fmtAmt(monthTotal)}</span>
                            </div>
                            {/* Entries for this month */}
                            <div className={`rounded-xl border divide-y ${d ? "border-white/10 divide-white/10" : "border-black/[0.08] divide-black/[0.06]"}`}>
                      {byMonth[mk].map((entry) => (
                        <div key={entry.id}>
                          {editingEntryId === entry.id ? (
                            /* Inline edit form */
                            <div className="px-3 py-2 flex flex-col gap-1.5">
                              <div className="flex gap-1.5">
                                <input
                                  type="number"
                                  min={1} max={31}
                                  value={editEntryDate ? parseInt(editEntryDate.split("-")[2], 10) : ""}
                                  onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    if (v >= 1 && v <= 31) {
                                      const p = editEntryDate.split("-");
                                      setEditEntryDate(`${p[0]}-${p[1]}-${String(v).padStart(2, "0")}`);
                                    }
                                  }}
                                  placeholder="DD"
                                  className={`w-9 text-xs rounded-lg px-1 py-1.5 outline-none border text-center flex-shrink-0 ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}
                                />
                                <select
                                  value={editEntryDate ? editEntryDate.split("-")[1] : ""}
                                  onChange={(e) => {
                                    const p = editEntryDate.split("-");
                                    setEditEntryDate(`${p[0]}-${e.target.value}-${p[2]}`);
                                  }}
                                  className={`text-xs rounded-lg px-1 py-1.5 outline-none border flex-shrink-0 ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}
                                >
                                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mn, i) => (
                                    <option key={mn} value={String(i + 1).padStart(2, "0")}>{mn}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  min={2000} max={2099}
                                  value={editEntryDate ? parseInt(editEntryDate.split("-")[0], 10) : ""}
                                  onChange={(e) => {
                                    const yr = parseInt(e.target.value, 10);
                                    if (yr >= 2000 && yr <= 2099) {
                                      const p = editEntryDate.split("-");
                                      setEditEntryDate(`${e.target.value}-${p[1]}-${p[2]}`);
                                    }
                                  }}
                                  placeholder="YYYY"
                                  className={`w-14 text-xs rounded-lg px-1 py-1.5 outline-none border flex-shrink-0 ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}
                                />
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={editEntryAmount}
                                  onChange={(e) => setEditEntryAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                                  onKeyDown={(e) => e.key === "Enter" && saveEditEntry()}
                                  className={`flex-1 text-xs rounded-lg px-2 py-1.5 outline-none border min-w-0 ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Note (optional)"
                                value={editEntryNote}
                                onChange={(e) => setEditEntryNote(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveEditEntry()}
                                className={`w-full text-xs rounded-lg px-2 py-1.5 outline-none border ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                              />
                              <div className="flex gap-1.5">
                                <button onClick={saveEditEntry} className="flex-1 py-1 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors">Save</button>
                                <button onClick={() => setEditingEntryId(null)} className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${d ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            /* Read-only row */
                            <div className="flex items-center gap-2 px-3 py-2">
                              <span className={`text-[11px] flex-shrink-0 tabular-nums ${d ? "text-gray-500" : "text-gray-400"}`}>{fmtDate(entry.date)}</span>
                              <span className={`text-sm font-medium flex-shrink-0 tabular-nums ${d ? "text-gray-200" : "text-gray-800"}`}>{fmtAmt(entry.amount)}</span>
                              {entry.note
                                ? <span className={`text-xs flex-1 truncate ${d ? "text-gray-500" : "text-gray-400"}`}>{entry.note}</span>
                                : <span className="flex-1" />}
                              <button
                                onClick={() => { startEditEntry(entry); setConfirmDeleteEntryId(null); }}
                                className={`flex-shrink-0 transition-colors ${d ? "text-gray-600 hover:text-gray-300" : "text-gray-300 hover:text-gray-600"}`}
                                title="Edit entry">
                                <PencilIcon size={11} />
                              </button>
                              {confirmDeleteEntryId === entry.id ? (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className={`text-[11px] ${d ? "text-gray-400" : "text-gray-500"}`}>Remove?</span>
                                  <button onClick={() => { deleteSpendingEntry(entry.id); setConfirmDeleteEntryId(null); }} className="text-[11px] font-medium text-red-500 hover:text-red-400 transition-colors">Yes</button>
                                  <button onClick={() => setConfirmDeleteEntryId(null)} className={`text-[11px] transition-colors ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>No</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteEntryId(entry.id)}
                                  className={`flex-shrink-0 transition-colors ${d ? "text-gray-600 hover:text-red-400" : "text-gray-300 hover:text-red-400"}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                            </div>
                          </div>
                        );
                      })}
                      {allTimeTotal > 0 && monthKeys.length > 1 && (
                        <div className={`flex justify-between px-1 pt-1 border-t text-[11px] font-medium ${d ? "border-white/10 text-gray-400" : "border-black/[0.08] text-gray-500"}`}>
                          <span>Total</span>
                          <span className={`tabular-nums ${blurAmounts ? "blur-sm select-none" : ""}`}>{fmtAmt(allTimeTotal)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1} max={31}
                      value={newEntryDate ? parseInt(newEntryDate.split("-")[2], 10) : ""}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (v >= 1 && v <= 31) {
                          const p = newEntryDate.split("-");
                          setNewEntryDate(`${p[0]}-${p[1]}-${String(v).padStart(2, "0")}`);
                        }
                      }}
                      placeholder="DD"
                      className={`w-10 text-xs rounded-xl px-1.5 py-2 outline-none border text-center transition-colors flex-shrink-0 ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}
                    />
                    <select
                      value={newEntryDate ? newEntryDate.split("-")[1] : ""}
                      onChange={(e) => {
                        const p = newEntryDate.split("-");
                        setNewEntryDate(`${p[0]}-${e.target.value}-${p[2]}`);
                      }}
                      className={`text-xs rounded-xl px-1.5 py-2 outline-none border transition-colors flex-shrink-0 ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}
                    >
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mn, i) => (
                        <option key={mn} value={String(i + 1).padStart(2, "0")}>{mn}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={2000} max={2099}
                      value={newEntryDate ? parseInt(newEntryDate.split("-")[0], 10) : ""}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value, 10);
                        if (yr >= 2000 && yr <= 2099) {
                          const p = newEntryDate.split("-");
                          setNewEntryDate(`${e.target.value}-${p[1]}-${p[2]}`);
                        }
                      }}
                      placeholder="YYYY"
                      className={`w-14 text-xs rounded-xl px-1.5 py-2 outline-none border transition-colors flex-shrink-0 ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={`Amount (${currency})`}
                      value={newEntryAmount}
                      onChange={(e) => setNewEntryAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && addSpendingEntry()}
                      className={`flex-1 text-xs rounded-xl px-2.5 py-2 outline-none border transition-colors min-w-0 ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                    />
                    <button
                      onClick={addSpendingEntry}
                      disabled={!newEntryAmount || isNaN(parseFloat(newEntryAmount.replace(",", ".")))}
                      className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Add
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={newEntryNote}
                    onChange={(e) => setNewEntryNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSpendingEntry()}
                    className={`mt-1.5 w-full text-xs rounded-xl px-2.5 py-2 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                  />
                </div>
              );
            })()}

            </div>
            )}{/* end payment tab spending section */}

            </div>{/* end scrollable content */}

            {/* Footer - never scrolls */}
            <div className={`px-6 pb-6 pt-4 flex-shrink-0 border-t ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <div className="flex gap-2">
                <button onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-amber-500 text-white hover:bg-amber-600">
                  Save
                </button>
                <button onClick={() => setEditing(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${d ? "bg-white/8 text-gray-300 hover:bg-white/12" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  Cancel
                </button>
              </div>

              {confirmRemoveApp ? (
                <div className={`mt-3 flex items-center justify-center gap-3 py-2 rounded-xl ${d ? "bg-red-500/8" : "bg-red-50"}`}>
                  <span className={`text-xs ${d ? "text-gray-400" : "text-gray-500"}`}>Remove from hub?</span>
                  <button onClick={() => deleteApp(editing!)} className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors">Yes, remove</button>
                  <button onClick={() => setConfirmRemoveApp(false)} className={`text-xs transition-colors ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>Cancel</button>
                </div>
              ) : (
                <div className={`mt-3 flex gap-2 ${customApps.some(a => a.name === editing) ? "flex-col" : ""}`}>
                  <button onClick={() => setConfirmRemoveApp(true)}
                    className={`w-full py-2 rounded-xl text-xs font-medium transition-colors ${d ? "text-gray-600 hover:bg-red-500/10 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-500"}`}>
                    Remove from hub
                  </button>
                  {customApps.some(a => a.name === editing) && (
                    <button onClick={() => { if (confirm(`Delete "${editing}" from your custom apps? This removes it from your catalog and hub.`)) deleteCustomApp(editing!); }}
                      className={`w-full py-2 rounded-xl text-xs font-medium transition-colors ${d ? "text-red-500/70 hover:bg-red-500/10 hover:text-red-400" : "text-red-400 hover:bg-red-50 hover:text-red-500"}`}>
                      Delete custom app
                    </button>
                  )}
                </div>
              )}
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
            if (st === "trial" || st === "cancelled") return false;
            if (statsUseFilter !== "all" && (uses[name] ?? "personal") !== statsUseFilter) return false;
            return true;
          })
          .map((name) => {
            const app = allApps.find((a) => a.name === name);
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
                  <span className={`text-sm font-semibold ${d ? "text-gray-300" : "text-gray-700"}`}><span className={blurAmounts ? "blur-sm select-none" : ""}>{totalLabels[billingView]}</span></span>
                )}
              </div>
              <p className={`text-xs mb-5 ${d ? "text-gray-500" : "text-gray-400"}`}>
                Active only · Trial &amp; cancelled excluded{statsUseFilter !== "all" ? ` · ${statsUseFilter === "personal" ? "Personal" : "Business"} apps only` : ""}
              </p>

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
                            <div className={`text-sm font-medium ${d ? "text-gray-200" : "text-gray-800"}`}><span className={blurAmounts ? "blur-sm select-none" : ""}>{fmtCurrency(parseFloat(pay.amount!))}</span></div>
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
                          ~<span className={blurAmounts ? "blur-sm select-none" : ""}>{fmtCurrency(total / 12)}</span><span className="text-xs font-normal">/mo</span>
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
                  const catTotal = allApps.filter(a => a.tags.includes(addModalTag)).length;
                  const catAdded = myApps.filter(a => a.tags.includes(addModalTag)).length;
                  return addModalBaseApps.length > 0
                    ? `${addModalBaseApps.length} of ${catTotal} available · ${catAdded} already added`
                    : `All ${catTotal} ${addModalTag} apps already added`;
                }
                return addModalBaseApps.length > 0
                  ? `${addModalBaseApps.length} of ${allApps.length} apps not yet added`
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
                  className={`pl-8 py-2 w-full rounded-xl text-sm outline-none border transition-colors ${addModalSearch ? "pr-8" : "pr-3"} ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                />
                {addModalSearch && (
                  <button onClick={() => setAddModalSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
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
            <div className={`px-3 py-2 border-b flex-shrink-0 flex items-center gap-2 ${d ? "border-white/10" : "border-black/[0.06]"}`}>
              <input
                type="text"
                autoFocus
                placeholder="Search currencies…"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                className={`flex-1 text-sm outline-none bg-transparent ${d ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
              {currencySearch && (
                <button onClick={() => setCurrencySearch("")} className={`flex-shrink-0 ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
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
                  <div key={email} className={`rounded-xl overflow-hidden ${d ? "bg-white/5" : "bg-gray-50"}`}>
                    {editingEmail === email ? (
                      <div className="flex items-center gap-2 px-3 py-2">
                        <input
                          type="email"
                          autoFocus
                          value={editEmailDraft}
                          onChange={(e) => setEditEmailDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameEmail(email, editEmailDraft);
                            if (e.key === "Escape") setEditingEmail(null);
                          }}
                          className={`flex-1 text-xs bg-transparent outline-none ${d ? "text-white" : "text-gray-900"}`}
                        />
                        <button onClick={() => renameEmail(email, editEmailDraft)}
                          className={`text-[11px] flex-shrink-0 font-medium transition-colors ${d ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-700"}`}>
                          Save
                        </button>
                        <button onClick={() => setEditingEmail(null)}
                          className={`text-[11px] flex-shrink-0 transition-colors ${d ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <span className={`text-xs truncate flex-1 ${d ? "text-gray-300" : "text-gray-700"}`}>{email}</span>
                        <button
                          onClick={() => { setEditingEmail(email); setEditEmailDraft(email); setConfirmRemoveEmail(null); }}
                          title="Edit email"
                          className={`flex-shrink-0 transition-colors ${d ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                          <PencilIcon size={11} />
                        </button>
                        {confirmRemoveEmail === email ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[11px] ${d ? "text-gray-400" : "text-gray-500"}`}>Remove?</span>
                            <button onClick={() => { removeEmailFromList(email); setConfirmRemoveEmail(null); }} className="text-[11px] font-medium text-red-500 hover:text-red-400 transition-colors">Yes</button>
                            <button onClick={() => setConfirmRemoveEmail(null)} className={`text-[11px] transition-colors ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmRemoveEmail(email)}
                            className={`text-[11px] flex-shrink-0 transition-colors ${d ? "text-gray-600 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}>
                            Remove
                          </button>
                        )}
                      </div>
                    )}
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
      {/* Custom app form modal */}
      {showCustomAppForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowCustomAppForm(false)}>
          <div className={`rounded-2xl p-6 w-full max-w-xs shadow-2xl border ${d ? "bg-[#1c1c1c] border-white/10" : "bg-white border-black/[0.08]"}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-0.5">Add custom app</h2>
            <p className={`text-xs mb-5 ${d ? "text-gray-500" : "text-gray-400"}`}>Your own tool, internal app, or anything not in the catalog</p>

            <div className="flex flex-col gap-3">
              <div>
                <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>App name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. My Internal Tool"
                  value={customDraft.name}
                  onChange={(e) => { setCustomDraft(p => ({ ...p, name: e.target.value })); setCustomDraftError(""); }}
                  autoFocus
                  className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                />
              </div>

              <div>
                <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>Website URL <span className="text-red-400">*</span></label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={customDraft.url}
                  onChange={(e) => { setCustomDraft(p => ({ ...p, url: e.target.value })); setCustomDraftError(""); }}
                  className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                />
              </div>

              <div>
                <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>Category</label>
                <select
                  value={customDraft.tag}
                  onChange={(e) => setCustomDraft(p => ({ ...p, tag: e.target.value }))}
                  className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors appearance-none ${d ? "bg-white/5 border-white/10 text-white focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 focus:border-black/20"}`}>
                  {["AI","Automation","Design","Dev","Entertainment","Finance","Food","GameDev","Gaming","Health","Learning","Marketing","Productivity","Security","Shopping","Social","Storage","Telecom","Travel"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>Description <span className={`font-normal ${d ? "text-gray-600" : "text-gray-400"}`}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="What does this app do?"
                  value={customDraft.description}
                  onChange={(e) => setCustomDraft(p => ({ ...p, description: e.target.value }))}
                  className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                />
              </div>

              <div>
                <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>Icon URL <span className={`font-normal ${d ? "text-gray-600" : "text-gray-400"}`}>(optional — auto from URL if empty)</span></label>
                <input
                  type="url"
                  placeholder="https://example.com/icon.png"
                  value={customDraft.icon}
                  onChange={(e) => setCustomDraft(p => ({ ...p, icon: e.target.value }))}
                  className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25" : "bg-gray-50 border-black/[0.08] text-gray-900 placeholder-gray-400 focus:border-black/20"}`}
                />
              </div>

              {customDraftError && (
                <p className="text-xs text-red-500">{customDraftError}</p>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={submitCustomApp}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-amber-500 text-white hover:bg-amber-600">
                Add to hub
              </button>
              <button
                onClick={() => setShowCustomAppForm(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${d ? "bg-white/8 text-gray-300 hover:bg-white/12" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
