// Zuivere prijs-/tierlogica zonder afhankelijkheid van de Stripe SDK, zodat
// dit ook in client components (bijv. de upgrade-slider) geïmporteerd kan worden.

export type BillingInterval = "month" | "year";

// Gratis account: maximaal 2 actieve bruiloften in het dashboard.
export const FREE_WEDDING_LIMIT = 2;

// Premium: schuifregelaar van 10 t/m 100+ bruiloften. Prijs loopt lineair
// op van €15 (10 bruiloften) tot €99 (100+, onbeperkt) — ex btw, per maand.
// De hoogste stand (100) is het "100+"-tier: geen limiet meer op het aantal
// bruiloften (premiumWeddingLimit wordt dan null).
export const WEDDING_TIERS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
export type WeddingTier = typeof WEDDING_TIERS[number];

const TIER_MIN = 10;
const TIER_MAX = 100;
const PRICE_MIN_EUR = 15;
const PRICE_MAX_EUR = 99;

export function isWeddingTier(n: number): n is WeddingTier {
  return (WEDDING_TIERS as readonly number[]).includes(n);
}

// Uren die een leverancier naar schatting minimaal per bruiloft bespaart
// dankzij automatische taken, intake-formulieren en agenda-koppeling.
export const HOURS_SAVED_PER_WEDDING = 3;

export function tierMonthlyPriceEur(tier: WeddingTier): number {
  if (tier >= TIER_MAX) return PRICE_MAX_EUR;
  const ratio = (tier - TIER_MIN) / (TIER_MAX - TIER_MIN);
  return Math.round(PRICE_MIN_EUR + (PRICE_MAX_EUR - PRICE_MIN_EUR) * ratio);
}

// Jaarlijks vooraf betalen = 10 maanden i.p.v. 12 (2 maanden gratis).
export function tierAnnualPriceEur(tier: WeddingTier): number {
  return tierMonthlyPriceEur(tier) * 10;
}

export function tierPricePerWeddingEur(tier: WeddingTier): number {
  return tierMonthlyPriceEur(tier) / tier;
}

export function tierLabel(tier: WeddingTier): string {
  return tier >= TIER_MAX ? "100+" : String(tier);
}

// null = onbeperkt (het 100+ tier)
export function tierToWeddingLimit(tier: WeddingTier): number | null {
  return tier >= TIER_MAX ? null : tier;
}
