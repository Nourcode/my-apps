export type PaymentPeriod = "monthly" | "annually" | "once";
export type SpendingEntry = {
  id: string;
  date: string;   // YYYY-MM-DD
  amount: number;
  note?: string;
};
export type PaymentMethod = "visa" | "mastercard" | "amex" | "paypal" | "apple" | "google" | "other";
export type Payment = {
  type: "free" | "paid";
  amount?: string;
  period?: PaymentPeriod;
  day?: number;
  month?: number;
  method?: PaymentMethod;
};
export type AppStatus = "active" | "trial" | "cancelled";
export type AppUse = "personal" | "business";
export type AppPlatform = "desktop" | "mobile" | "both";
export type CardProperty = "brand" | "status" | "use" | "platform" | "payment" | "method" | "dueDate" | "bank";
export type CardProps = Record<CardProperty, boolean>;

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "Amex",
  paypal: "PayPal", apple: "Apple Pay", google: "Google Pay", other: "Other",
};
