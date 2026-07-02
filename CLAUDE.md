# DreamDay Platform

Next.js (App Router) + Prisma/PostgreSQL platform voor weddingplanners, bruidsparen en leveranciers.

## Kritieke conventies

- **Databaseschema**: nieuwe tabellen/kolommen moeten óók in `scripts/ensure-schema.js` (draait bij startup via `src/instrumentation.ts`). Prisma migrate wordt niet gebruikt in productie.
- **E-mails**: altijd via de template-helpers in `src/lib/mail.ts` (gebruik `emailLayout()`). Geen losse inline-HTML in routes.
- **Taal**: alle UI-teksten in het Nederlands.

## Designsysteem — verplicht voor ALLE pagina's

Het volledige palet en de componentklassen staan in `src/app/globals.css`. Identiteit: inkt-groen (`--ink` #1C2B24) + goud (`--gold`) + crème (`--background`), Playfair Display (`.font-serif`) voor namen/koppen met karakter, Geist voor data en lijsten.

### Verboden patronen (kenmerken van AI-template-design)

1. **Geen grid van identieke statistiek-kaarten** (groot getal + label + rond icoontje). Gebruik inline cijfers naast de paginatitel (zie `StatInline` in DashboardClient).
2. **Geen decoratieve iconen in gekleurde cirkels** (hartje, vinkje, kalender, sparkle). Iconen alleen als ze functioneel zijn: klikbaar of statusdrager.
3. **Geen standaard badge-pillen voor status of prioriteit** (rood/oranje/geel/blauw blokjes). Status en urgentie communiceren via typografie: gewicht, kleine caps, en `--gold-deep` voor wat aandacht verdient, `--muted`/`--muted-light` voor de rest.
4. **Geen kaart-om-alles**: lijsten zijn rijen met dunne scheidingslijnen (`.dash-row`), geen losse witte kaartjes per item.
5. **Geen traffic-light kleurcodering** (rood = urgent, oranje = middel). Urgentie = gewicht + goud.
6. **Geen sparkle/AI-verwijzingen, geen emoji's** in de interface.
7. **Geen decoratieve hover-effecten of motion zonder functie.**

### Verplichte patronen

- Paginatitels: `.font-serif`, gewicht 700.
- Namen van bruiloften en leveranciers: `.font-serif`.
- Sectielabels: `.ddp-section-label` (kleine caps).
- Lijstrijen: `.dash-row`.
- Donkere panelen (hero's, sidebar): `--ink`/`--ink-mid` met `--gold` accent.
- Bruiloft-hero's (`.dash-hero`): toon elk gegeven maar **één keer** — naam (serif), datum + locatie op één regel eronder, aftellen rechts. Geen aparte datumring/medaillon meer (verwijderd — was redundant met de datum in de regel eronder).
- Zoekvelden: gebruik `.ddp-search` wrapper (icoon + input) — nooit los een icoon absoluut positioneren over een `.ddp-input`, en nooit Tailwind `pl-*` combineren met `.ddp-input` (die overschrijft de padding).

### Responsiviteit — geen uitzonderingen

- Elke pagina moet kloppen van 360px (telefoon) tot desktop. Media queries in `globals.css` bij de componentklasse, niet inline (inline styles kunnen geen breakpoints).
- Test alignment op mobiel: overlappende iconen, afgekapte teksten en scrollende containers zijn bugs.
- Wide content (tabellen) krijgt zijn eigen `overflow-x: auto` container.

## Verificatie

- `npx tsc --noEmit` moet schoon zijn.
- Visuele wijzigingen controleren met Playwright-screenshot op 1280px én 400px breed.
