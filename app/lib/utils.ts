import type { PaymentPeriod, Payment } from "./types";

export function formatPaidLabel(amount: string, currency: string, period?: PaymentPeriod): string {
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

export function paymentLabel(payment: Payment, currency: string): string {
  if (payment.type === "free") return "Free";
  return formatPaidLabel(payment.amount ?? "", currency, payment.period);
}

export const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function ordinal(n: number): string {
  const v = n % 100;
  return n + (["th","st","nd","rd"][(v - 20) % 10] || ["th","st","nd","rd"][v] || "th");
}

export function paymentDueLabel(payment: Payment): string | null {
  if (payment.type === "free" || !payment.day) return null;
  if (payment.period === "annually" && payment.month) {
    return `due ${MONTH_SHORT[payment.month - 1]} ${ordinal(payment.day)}`;
  }
  if (payment.period === "monthly") {
    return `due ${ordinal(payment.day)}`;
  }
  return null;
}

export function getDaysUntilDue(payment: Payment): number | null {
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

export function formatLastEdited(iso: string): string {
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
