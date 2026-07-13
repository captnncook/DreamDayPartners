import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" });
  }
  return _stripe;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Eén bron van waarheid voor de Pro-prijs. Bij jaarlijks vooraf betalen krijgt
// de leverancier 10% korting op het jaarbedrag (12 maanden voor de prijs van ~10,8).
export const PRO_MONTHLY_PRICE_EUR = 29;
export const PRO_ANNUAL_DISCOUNT = 0.10;
export const PRO_ANNUAL_PRICE_EUR = Math.round(PRO_MONTHLY_PRICE_EUR * 12 * (1 - PRO_ANNUAL_DISCOUNT));

export type BillingInterval = "month" | "year";

export function proPriceData(interval: BillingInterval) {
  const amountEur = interval === "year" ? PRO_ANNUAL_PRICE_EUR : PRO_MONTHLY_PRICE_EUR;
  return {
    currency: "eur",
    unit_amount: amountEur * 100,
    recurring: { interval },
    product_data: {
      name: interval === "year" ? "DreamDay Platform Pro (jaarlijks, 10% korting)" : "DreamDay Platform Pro (maandelijks)",
    },
  };
}
