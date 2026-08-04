import Stripe from "stripe";
import { tierMonthlyPriceEur, tierAnnualPriceEur, tierLabel, type BillingInterval, type WeddingTier } from "@/lib/pricing";

export * from "@/lib/pricing";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" });
  }
  return _stripe;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export function tierPriceData(tier: WeddingTier, interval: BillingInterval) {
  const amountEur = interval === "year" ? tierAnnualPriceEur(tier) : tierMonthlyPriceEur(tier);
  const label = tierLabel(tier);
  return {
    currency: "eur",
    unit_amount: amountEur * 100,
    recurring: { interval },
    product_data: {
      name: interval === "year"
        ? `DreamDay Premium — tot ${label} bruiloften (jaarlijks, 2 maanden gratis)`
        : `DreamDay Premium — tot ${label} bruiloften (maandelijks)`,
    },
  };
}
