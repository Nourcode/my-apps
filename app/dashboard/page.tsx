"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import catalog from "../catalog";
import { METHOD_LABEL, type PaymentPeriod, type PaymentMethod, type Payment, type AppStatus, type AppUse } from "../lib/types";

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount);
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getNextRenewal(p: Payment): Date | null {
  if (!p.day) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (p.period === "monthly") {
    let d = new Date(today.getFullYear(), today.getMonth(), p.day);
    if (d < today) d = new Date(today.getFullYear(), today.getMonth() + 1, p.day);
    return d;
  }
  if (p.period === "annually" && p.month) {
    let d = new Date(today.getFullYear(), p.month - 1, p.day);
    if (d < today) d = new Date(today.getFullYear() + 1, p.month - 1, p.day);
    return d;
  }
  return null;
}

function relDate(date: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return `In ${diff} days`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Spend area chart ─────────────────────────────────────────────────────────

function SpendAreaChart({ values, d }: { values: number[]; d: boolean }) {
  if (values.length < 2) return null;
  const W = 600, H = 72;
  const max = Math.max(...values);
  if (max === 0) return null;
  const n = values.length;
  const pts = values.map((v, i) => ({
    x: (i / (n - 1)) * W,
    y: H - (v / max) * H * 0.82 - H * 0.06,
  }));

  let linePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], cur = pts[i];
    const cpX = ((prev.x + cur.x) / 2).toFixed(1);
    linePath += ` C ${cpX} ${prev.y.toFixed(1)}, ${cpX} ${cur.y.toFixed(1)}, ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
  }
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity={d ? "0.28" : "0.18"} />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spendGrad)" />
      <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Endpoint dot */}
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill="#F59E0B" />
    </svg>
  );
}

// ─── Donut chart ─────────────────────────────────────────────────────────────

type DonutSeg = { value: number; color: string };

function DonutChart({ segs, size = 120, thickness = 18, children }: {
  segs: DonutSeg[]; size?: number; thickness?: number; children?: React.ReactNode;
}) {
  const cx = size / 2, cy = size / 2;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = segs.reduce((s, x) => s + x.value, 0);
  const GAP = total > 1 ? 1.8 : 0;
  let acc = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth={thickness} />
        ) : segs.filter(s => s.value > 0).map((seg, i) => {
          const dash = (seg.value / total) * C;
          const offset = -acc;
          acc += dash;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, dash - GAP)} ${C}`}
              strokeDashoffset={offset} strokeLinecap="butt" />
          );
        })}
      </svg>
      {children && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Ring progress ────────────────────────────────────────────────────────────

function Ring({ pct, color, size = 48, thickness = 5 }: { pct: number; color: string; size?: number; thickness?: number }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const dash = (pct / 100) * C;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={thickness} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness}
        strokeDasharray={`${dash} ${C}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [appNames, setAppNames] = useState<string[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>({});
  const [uses, setUses] = useState<Record<string, AppUse>>({});
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const s = (k: string) => localStorage.getItem(k);
    const j = <T,>(v: string | null, fb: T): T => { try { return v ? JSON.parse(v) : fb; } catch { return fb; } };
    setAppNames(j(s("my-app-list"), []));
    setPayments(j(s("app-payments"), {}));
    setStatuses(j(s("app-statuses"), {}));
    setUses(j(s("app-uses"), {}));
    const c = s("app-currency"); if (c) setCurrency(c);
    if (s("theme") === "dark") setIsDark(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.background = isDark ? "#0d0d0d" : "#f7f6f3";
  }, [isDark]);

  const d = isDark;

  // ── Derived ──────────────────────────────────────────────────────────────
  const active    = appNames.filter(n => (statuses[n] ?? "active") === "active");
  const trial     = appNames.filter(n => statuses[n] === "trial");
  const cancelled = appNames.filter(n => statuses[n] === "cancelled");

  function moEq(name: string): number {
    const p = payments[name];
    if (!p || p.type !== "paid" || !p.amount) return 0;
    const a = parseFloat(p.amount); if (isNaN(a)) return 0;
    if (p.period === "monthly") return a;
    if (p.period === "annually") return a / 12;
    return 0;
  }

  let monthlyTotal = 0, annualTotal = 0, oneTimeTotal = 0;
  for (const n of active) {
    const p = payments[n]; if (!p || p.type !== "paid" || !p.amount) continue;
    const a = parseFloat(p.amount); if (isNaN(a)) continue;
    if (p.period === "monthly") monthlyTotal += a;
    else if (p.period === "annually") annualTotal += a;
    else if (p.period === "once") oneTimeTotal += a;
  }
  const effectiveMo = monthlyTotal + annualTotal / 12;
  const paidCount = active.filter(n => payments[n]?.type === "paid").length;
  const freeCount = active.filter(n => !payments[n] || payments[n]?.type === "free").length;
  const businessCount = appNames.filter(n => uses[n] === "business").length;

  // Area chart: per-app monthly-equivalent, sorted ascending
  const chartApps = active
    .map(n => ({ name: n, val: moEq(n) }))
    .filter(a => a.val > 0)
    .sort((a, b) => a.val - b.val);
  const chartValues = chartApps.map(a => a.val);

  // Category spending
  const catMap: Record<string, { count: number; mo: number }> = {};
  for (const n of active) {
    const tag = catalog.find(a => a.name === n)?.tags[0] ?? "Other";
    if (!catMap[tag]) catMap[tag] = { count: 0, mo: 0 };
    catMap[tag].count++;
    catMap[tag].mo += moEq(n);
  }
  const cats = Object.entries(catMap).sort((a, b) => b[1].mo - a[1].mo).slice(0, 7);
  const maxCatMo = Math.max(...cats.map(([, v]) => v.mo), 1);

  // Top apps by cost
  const topApps = active
    .map(n => ({ name: n, mo: moEq(n), icon: catalog.find(a => a.name === n)?.icon ?? "" }))
    .filter(x => x.mo > 0)
    .sort((a, b) => b.mo - a.mo)
    .slice(0, 6);

  // Payment methods
  const methMap: Record<string, number> = {};
  for (const n of active) {
    const p = payments[n];
    if (p?.type === "paid" && p.method) methMap[p.method] = (methMap[p.method] ?? 0) + 1;
  }
  const meths = Object.entries(methMap).sort((a, b) => b[1] - a[1]);
  const maxMeth = Math.max(...meths.map(([, v]) => v), 1);

  const METH_COLORS: Record<string, string> = {
    visa: "#3b82f6", mastercard: "#ef4444", amex: "#10b981",
    paypal: "#6366f1", apple: d ? "#e5e7eb" : "#374151", google: "#f59e0b", other: "#6b7280",
  };

  // ── Upcoming renewals (next 30 days) ──────────────────────────────────────
  const NOW = new Date(); NOW.setHours(0, 0, 0, 0);
  const IN30 = new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingRenewals = active
    .filter(n => payments[n]?.type === "paid" && payments[n]?.day)
    .flatMap(n => {
      const p = payments[n];
      const date = getNextRenewal(p);
      if (!date || date > IN30) return [];
      const rawAmt = parseFloat(p.amount ?? "0") || 0;
      return [{ name: n, date, mo: moEq(n), rawAmt, period: p.period, icon: catalog.find(a => a.name === n)?.icon ?? "" }];
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // ── Annual projection ─────────────────────────────────────────────────────
  const curMonth = new Date().getMonth();
  const monthlyProjection = MONTH_NAMES.map((_, mi) => {
    let spend = monthlyTotal;
    for (const n of active) {
      const p = payments[n];
      if (p?.type === "paid" && p.period === "annually" && p.month && p.amount) {
        if ((p.month - 1) === mi) {
          const a = parseFloat(p.amount);
          if (!isNaN(a)) spend += a;
        }
      }
    }
    return spend;
  });
  const annualProjected = monthlyProjection.reduce((s, v) => s + v, 0);
  const maxMonthSpend = Math.max(...monthlyProjection, 1);
  const hasAnnualRenewals = active.some(n => payments[n]?.period === "annually" && payments[n]?.month);

  if (!mounted) return null;

  const card = `rounded-2xl border ${d ? "bg-[#111111] border-white/[0.07]" : "bg-white border-black/[0.07]"}`;
  const muted = d ? "text-gray-500" : "text-gray-400";
  const sub   = d ? "text-gray-400" : "text-gray-500";

  return (
    <div className={d ? "text-[#e8e4dc]" : "text-[#1a1916]"} style={{ minHeight: "100vh" }}>

      {/* ── Header — matches hub layout exactly ── */}
      <div className={`border-b ${d ? "border-white/[0.08]" : "border-black/[0.07]"}`}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Left: logo + name */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${d ? "bg-amber-500/10" : "bg-amber-50"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            </div>
            <span className={`text-sm font-medium ${d ? "text-gray-300" : "text-gray-700"}`}>Helio</span>
          </div>
          {/* Center: same pill nav as hub, Dashboard active */}
          <div className="flex-1 flex justify-center">
            <nav className={`flex items-center gap-0.5 p-1 rounded-xl ${d ? "bg-white/[0.06]" : "bg-black/[0.05]"}`}>
              <Link href="/" className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-gray-200 hover:bg-white/8" : "text-gray-400 hover:text-gray-700 hover:bg-black/[0.04]"}`}>Hub</Link>
              <span className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${d ? "bg-white/10 text-white" : "bg-white text-gray-900 shadow-sm"}`}>Dashboard</span>
            </nav>
          </div>
          {/* Right: empty — keeps nav centered */}
          <div className="w-32 flex-shrink-0" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* ── Hero card ── */}
        <div className={`${card} p-6 overflow-hidden relative`}>
          {/* faint amber glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: d ? "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)" : "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="flex items-start justify-between mb-5">
            <div>
              <p className={`text-[11px] uppercase tracking-widest font-semibold mb-1 ${muted}`}>Effective monthly spend</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold" style={{ letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                  {fmt(effectiveMo, currency)}
                </span>
                {annualTotal > 0 && (
                  <span className={`text-sm ${muted}`}>/ mo</span>
                )}
              </div>
              <p className={`text-xs mt-2 ${muted}`}>
                {monthlyTotal > 0 && <span>{fmt(monthlyTotal, currency)} monthly</span>}
                {monthlyTotal > 0 && annualTotal > 0 && <span className="mx-1.5 opacity-40">·</span>}
                {annualTotal > 0 && <span>{fmt(annualTotal, currency)}/yr annual</span>}
                {oneTimeTotal > 0 && <span className="ml-1.5 opacity-60">· {fmt(oneTimeTotal, currency)} one-time</span>}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-[11px] uppercase tracking-widest mb-1 ${muted}`}>Apps tracked</div>
              <div className="text-2xl font-bold" style={{ letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{appNames.length}</div>
              <div className={`text-xs mt-1 ${muted}`}>{paidCount} paid · {freeCount} free</div>
            </div>
          </div>

          {/* Area chart */}
          <div style={{ marginLeft: -2, marginRight: -2 }}>
            <SpendAreaChart values={chartValues} d={d} />
          </div>
          {chartApps.length >= 2 && (
            <div className={`flex justify-between -mt-1 text-[10px] ${muted}`}>
              <span>{chartApps[0].name} · {fmt(chartApps[0].val, currency)}/mo</span>
              <span>{chartApps[chartApps.length - 1].name} · {fmt(chartApps[chartApps.length - 1].val, currency)}/mo</span>
            </div>
          )}
        </div>

        {/* ── Middle row: Donut + Categories ── */}
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Status donut */}
          <div className={`${card} p-5 flex flex-col items-center gap-4 sm:w-56 sm:flex-shrink-0`}>
            <p className={`text-[11px] uppercase tracking-widest font-semibold self-start ${muted}`}>App status</p>
            <DonutChart segs={[
              { value: active.length,    color: "#34d399" },
              { value: trial.length,     color: "#a78bfa" },
              { value: cancelled.length, color: d ? "#2d2d2d" : "#e5e7eb" },
            ]} size={130} thickness={20}>
              <span className="text-3xl font-bold" style={{ letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{appNames.length}</span>
              <span className={`text-[11px] mt-0.5 ${muted}`}>total</span>
            </DonutChart>
            <div className="w-full space-y-2.5">
              {([
                { label: "Active",    n: active.length,    color: "#34d399", pct: appNames.length ? Math.round(active.length / appNames.length * 100) : 0 },
                { label: "Trial",     n: trial.length,     color: "#a78bfa", pct: appNames.length ? Math.round(trial.length / appNames.length * 100) : 0 },
                { label: "Cancelled", n: cancelled.length, color: d ? "#555" : "#d1d5db", pct: appNames.length ? Math.round(cancelled.length / appNames.length * 100) : 0 },
              ] as { label: string; n: number; color: string; pct: number }[]).map(row => (
                <div key={row.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                  <span className={`text-xs flex-1 ${sub}`}>{row.label}</span>
                  <span className="text-xs font-semibold tabular-nums">{row.n}</span>
                  <span className={`text-[11px] w-7 text-right tabular-nums ${muted}`}>{row.pct}%</span>
                </div>
              ))}
              {(businessCount > 0 || paidCount > 0) && (
                <div className={`border-t pt-2.5 ${d ? "border-white/[0.07]" : "border-black/[0.06]"} space-y-2`}>
                  {paidCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-amber-500/60" />
                      <span className={`text-xs flex-1 ${sub}`}>Paid</span>
                      <span className="text-xs font-semibold tabular-nums">{paidCount}</span>
                    </div>
                  )}
                  {businessCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-indigo-400/70" />
                      <span className={`text-xs flex-1 ${sub}`}>Business</span>
                      <span className="text-xs font-semibold tabular-nums">{businessCount}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top categories */}
          <div className={`${card} p-5 flex-1 min-w-0`}>
            <p className={`text-[11px] uppercase tracking-widest font-semibold mb-4 ${muted}`}>Spending by category</p>
            {cats.length === 0 ? (
              <p className={`text-sm ${muted}`}>No data yet</p>
            ) : (
              <div className="space-y-3">
                {cats.map(([tag, { count, mo }]) => (
                  <div key={tag} className="flex items-center gap-3">
                    <span className={`text-xs w-24 flex-shrink-0 truncate font-medium ${sub}`}>{tag}</span>
                    <div className="flex-1 relative h-5 flex items-center">
                      <div className={`absolute inset-0 rounded-full ${d ? "bg-white/[0.05]" : "bg-black/[0.05]"}`} />
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                        style={{ width: `${Math.max(4, (mo / maxCatMo) * 100)}%`, background: "linear-gradient(90deg, rgba(245,158,11,0.7), rgba(245,158,11,0.4))" }}
                      />
                    </div>
                    <span className={`text-xs w-5 text-right font-medium tabular-nums ${sub}`}>{count}</span>
                    <span className={`text-xs w-20 text-right tabular-nums ${mo > 0 ? (d ? "text-gray-300" : "text-gray-600") : muted}`}>
                      {mo > 0 ? fmt(mo, currency) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom row: Top apps + Payment methods ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Top apps by cost */}
          <div className={`${card} p-5`}>
            <p className={`text-[11px] uppercase tracking-widest font-semibold mb-4 ${muted}`}>Top subscriptions</p>
            {topApps.length === 0 ? (
              <p className={`text-sm ${muted}`}>No paid apps yet</p>
            ) : (
              <div className="space-y-1">
                {topApps.map((app, i) => (
                  <div key={app.name} className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-colors ${d ? "hover:bg-white/[0.04]" : "hover:bg-black/[0.03]"}`}>
                    <span className={`text-[11px] font-medium w-4 text-center tabular-nums ${muted}`}>{i + 1}</span>
                    {app.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={app.icon} alt={app.name} className="w-7 h-7 rounded-lg flex-shrink-0" />
                    ) : (
                      <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${d ? "bg-white/10" : "bg-black/[0.06]"}`} />
                    )}
                    <span className={`text-sm flex-1 truncate font-medium ${d ? "text-gray-200" : "text-gray-700"}`}>{app.name}</span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: "#F59E0B" }}>
                      {fmt(app.mo, currency)}<span className={`text-[11px] font-normal ${muted}`}>/mo</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment methods */}
          <div className={`${card} p-5`}>
            <p className={`text-[11px] uppercase tracking-widest font-semibold mb-4 ${muted}`}>Payment methods</p>
            {meths.length === 0 ? (
              <p className={`text-sm ${muted}`}>No methods assigned yet</p>
            ) : (
              <div className="space-y-3">
                {meths.map(([method, count]) => {
                  const pct = Math.round((count / maxMeth) * 100);
                  const color = METH_COLORS[method] ?? "#6b7280";
                  return (
                    <div key={method} className="flex items-center gap-3">
                      <Ring pct={pct} color={color} size={40} thickness={4} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${d ? "text-gray-200" : "text-gray-700"}`}>
                          {METHOD_LABEL[method as PaymentMethod] ?? method}
                        </div>
                        <div className={`text-[11px] ${muted}`}>{count} app{count !== 1 ? "s" : ""}</div>
                      </div>
                      <div className="flex-1 relative h-1.5">
                        <div className={`absolute inset-0 rounded-full ${d ? "bg-white/[0.07]" : "bg-black/[0.06]"}`} />
                        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Upcoming renewals + Annual projection ── */}
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Upcoming renewals */}
          <div className={`${card} p-5 sm:w-5/12 sm:flex-shrink-0`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`text-[11px] uppercase tracking-widest font-semibold ${muted}`}>Upcoming renewals</p>
              <span className={`text-xs ${muted}`}>Next 30 days</span>
            </div>
            {upcomingRenewals.length === 0 ? (
              <p className={`text-sm ${muted}`}>No renewals in the next 30 days</p>
            ) : (
              <div className="space-y-1">
                {upcomingRenewals.map(item => {
                  const label = relDate(item.date);
                  const urgent = label === "Today" || label === "Tomorrow";
                  const displayAmt = item.period === "annually" ? item.rawAmt : item.mo;
                  return (
                    <div key={item.name} className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-colors ${d ? "hover:bg-white/[0.04]" : "hover:bg-black/[0.03]"}`}>
                      {item.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.icon} alt={item.name} className="w-7 h-7 rounded-lg flex-shrink-0" />
                      ) : (
                        <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${d ? "bg-white/10" : "bg-black/[0.06]"}`} />
                      )}
                      <span className={`text-sm flex-1 truncate font-medium ${d ? "text-gray-200" : "text-gray-700"}`}>{item.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${urgent ? "bg-amber-500/15 text-amber-500" : d ? "bg-white/[0.07] text-gray-400" : "bg-black/[0.05] text-gray-500"}`}>
                        {label}
                      </span>
                      <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${d ? "text-gray-200" : "text-gray-700"}`}>
                        {fmt(displayAmt, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Annual projection */}
          <div className={`${card} p-5 flex-1 min-w-0`}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className={`text-[11px] uppercase tracking-widest font-semibold ${muted}`}>Annual projection</p>
                <p className={`text-[11px] mt-0.5 ${muted}`}>
                  {hasAnnualRenewals ? "Monthly base + annual renewal spikes" : "Monthly recurring × 12"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold tabular-nums" style={{ letterSpacing: "-0.02em" }}>{fmt(annualProjected, currency)}</div>
                <div className={`text-[11px] ${muted}`}>this year</div>
              </div>
            </div>
            <div className="flex items-end gap-[3px]" style={{ height: 72 }}>
              {monthlyProjection.map((v, mi) => {
                const barPct = maxMonthSpend > 0 ? (v / maxMonthSpend) * 100 : 0;
                const isCur = mi === curMonth;
                const isPast = mi < curMonth;
                return (
                  <div key={mi} className="flex-1 flex flex-col items-center gap-1.5" style={{ height: "100%" }}>
                    <div className="w-full flex items-end flex-1">
                      <div
                        className="w-full rounded-t-[3px] transition-all"
                        style={{
                          height: `${Math.max(barPct, 3)}%`,
                          background: isCur
                            ? "#F59E0B"
                            : isPast
                              ? d ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.15)"
                              : d ? "rgba(245,158,11,0.28)" : "rgba(245,158,11,0.35)",
                          boxShadow: isCur ? "0 0 8px rgba(245,158,11,0.4)" : undefined,
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium leading-none ${isCur ? "text-amber-500" : isPast ? (d ? "text-gray-700" : "text-gray-300") : muted}`}>
                      {String(mi + 1)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Year math breakdown ── */}
            <div className={`mt-5 pt-4 border-t ${d ? "border-white/[0.07]" : "border-black/[0.06]"}`}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${muted}`}>
                    Monthly subscriptions <span className={`${d ? "text-gray-700" : "text-gray-300"}`}>× 12</span>
                  </span>
                  <span className="text-xs font-medium tabular-nums">{fmt(monthlyTotal * 12, currency)}</span>
                </div>
                {annualTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${muted}`}>Annual subscriptions</span>
                    <span className="text-xs font-medium tabular-nums">{fmt(annualTotal, currency)}</span>
                  </div>
                )}
                {oneTimeTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${muted}`}>One-time purchases</span>
                    <span className="text-xs font-medium tabular-nums">{fmt(oneTimeTotal, currency)}</span>
                  </div>
                )}
              </div>
              <div className={`flex items-center justify-between mt-3 pt-3 border-t ${d ? "border-white/[0.07]" : "border-black/[0.06]"}`}>
                <span className={`text-xs font-semibold ${d ? "text-gray-300" : "text-gray-700"}`}>Total this year</span>
                <span className="text-sm font-bold tabular-nums">{fmt(annualProjected + oneTimeTotal, currency)}</span>
              </div>
            </div>

            {/* ── Spending mix bar ── */}
            {(monthlyTotal > 0 || annualTotal > 0) && (
              <div className="mt-5">
                <div className={`text-[11px] mb-2 ${muted}`}>Spending mix</div>
                <div className="flex rounded-full overflow-hidden h-2" style={{ gap: 1 }}>
                  {monthlyTotal > 0 && (
                    <div
                      style={{ flex: monthlyTotal * 12, background: "#F59E0B" }}
                      title={`Monthly: ${fmt(monthlyTotal * 12, currency)}/yr`}
                    />
                  )}
                  {annualTotal > 0 && (
                    <div
                      style={{ flex: annualTotal, background: d ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.25)" }}
                      title={`Annual: ${fmt(annualTotal, currency)}/yr`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-amber-500 flex-shrink-0" />
                    <span className={`text-[11px] ${muted}`}>Monthly ({Math.round(monthlyTotal * 12 / (annualProjected || 1) * 100)}%)</span>
                  </div>
                  {annualTotal > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: d ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.4)" }} />
                      <span className={`text-[11px] ${muted}`}>Annual ({Math.round(annualTotal / (annualProjected || 1) * 100)}%)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Trial watchlist ── */}
            <div className={`mt-5 pt-4 border-t ${d ? "border-white/[0.07]" : "border-black/[0.06]"}`}>
              <div className={`text-[11px] uppercase tracking-widest font-semibold mb-3 ${muted}`}>Trial watchlist</div>
              {trial.length === 0 ? (
                <p className={`text-xs ${muted}`}>No apps on trial right now</p>
              ) : (
                <div className="space-y-2">
                  {trial.slice(0, 4).map(name => {
                    const app = catalog.find(a => a.name === name);
                    return (
                      <div key={name} className="flex items-center gap-2.5">
                        {app?.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.icon} alt={name} className="w-6 h-6 rounded-md flex-shrink-0" />
                        ) : (
                          <div className={`w-6 h-6 rounded-md flex-shrink-0 ${d ? "bg-white/10" : "bg-black/[0.06]"}`} />
                        )}
                        <span className={`text-xs flex-1 truncate ${d ? "text-gray-300" : "text-gray-600"}`}>{name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"}`}>Trial</span>
                      </div>
                    );
                  })}
                  {trial.length > 4 && (
                    <p className={`text-[11px] ${muted} pl-8`}>+{trial.length - 4} more</p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
