export type PaymentPeriod = "monthly" | "annually" | "once";
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

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "Amex",
  paypal: "PayPal", apple: "Apple Pay", google: "Google Pay", other: "Other",
};
