// ============================================================
// vendorTypeConfigs.ts
// Static configuration for all vendor types in DreamDayPartners
// No project imports — pure data + types
// ============================================================

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type FieldType = "text" | "longtext" | "boolean" | "number" | "select" | "color-multi" | "time" | "date";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface DeliverableConfig {
  key: string;
  label: string;
  approvalRequired?: boolean;
}

export interface TimelineBlockTemplate {
  key: string;
  label: string;
  phase: "arrival" | "setup" | "perform" | "teardown" | "custom";
  defaultDuration?: number; // minutes
}

export type ModuleKey =
  | "statusTracker"
  | "contractPayment"
  | "messageThread"
  | "fileVault"
  | "intakeForm"
  | "timelinePlanner"
  | "checklistDeadlines"
  | "logisticsPanel"
  | "deliverablesTracker"
  | "moodboardUploader"
  | "guestDataPanel"
  | "approvalButton"
  | "photoUpload"
  | "documentUpload"
  | "setlistPlanner"
  | "menuBuilder"
  | "couvertCalculator";

export interface VendorTypeConfig {
  type: string;
  label: string;
  emoji: string;
  modules: ModuleKey[]; // EXTRA modules beyond BASE_MODULES
  intakeFields: Field[];
  deliverables: DeliverableConfig[];
  timelineTemplate: TimelineBlockTemplate[];
  logisticsFields: Field[];
  readsGuestData?: ("counts" | "allergies" | "ages")[];
}

// ────────────────────────────────────────────────────────────
// Base modules — always included for every vendor
// ────────────────────────────────────────────────────────────

export const BASE_MODULES: ModuleKey[] = [
  "statusTracker",
  "contractPayment",
  "messageThread",
  "fileVault",
  "intakeForm",
];

// ────────────────────────────────────────────────────────────
// Vendor type configurations
// ────────────────────────────────────────────────────────────

export const VENDOR_TYPE_CONFIGS: VendorTypeConfig[] = [
  // ── Planning & Coördinatie ───────────────────────────────

  {
    type: "weddingplanner",
    label: "Weddingplanner",
    emoji: "💍",
    modules: ["checklistDeadlines", "timelinePlanner"],
    intakeFields: [
      { key: "scope", label: "Scope van opdracht", type: "text", placeholder: "Volledig, dag-van, advies..." },
      { key: "budget", label: "Totaalbudget (€)", type: "number", placeholder: "Bijv. 25000" },
      { key: "beslisbevoegdheid", label: "Beslisbevoegdheid", type: "text", placeholder: "Wie mag akkoord geven?" },
    ],
    deliverables: [
      { key: "projectplan", label: "Projectplan" },
      { key: "leveranciersoverzicht", label: "Leveranciersoverzicht" },
    ],
    timelineTemplate: [
      { key: "regie-overzicht", label: "Regie & overzicht alle blokken", phase: "custom", defaultDuration: 480 },
    ],
    logisticsFields: [],
  },

  {
    type: "ceremoniespreker",
    label: "Ceremoniespreker",
    emoji: "🎤",
    modules: ["deliverablesTracker", "timelinePlanner"],
    intakeFields: [
      { key: "liefdesverhaal", label: "Liefdesverhaal & achtergrond", type: "longtext", placeholder: "Vertel het verhaal van het stel..." },
      { key: "rituelen", label: "Rituelen & bijzondere elementen", type: "longtext", placeholder: "Zandceremonie, handfasting, etc." },
      {
        key: "toon",
        label: "Toon van de ceremonie",
        type: "select",
        options: ["formeel", "ontspannen", "humoristisch", "poëtisch"],
      },
    ],
    deliverables: [
      { key: "ceremoniescript", label: "Ceremoniescript (concept)" },
      { key: "definitieve-tekst", label: "Definitieve tekst", approvalRequired: true },
    ],
    timelineTemplate: [
      { key: "repetitie", label: "Repetitie", phase: "setup", defaultDuration: 30 },
      { key: "start-ceremonie", label: "Start ceremonie", phase: "perform", defaultDuration: 5 },
      { key: "duur-ceremonie", label: "Duur ceremonie", phase: "perform", defaultDuration: 30 },
    ],
    logisticsFields: [],
  },

  {
    type: "ceremoniemeester",
    label: "Ceremoniemeester",
    emoji: "🎙️",
    modules: ["timelinePlanner", "checklistDeadlines"],
    intakeFields: [
      { key: "rolafbakening", label: "Rolafbakening", type: "longtext", placeholder: "Dagcoördinatie, aankondigingen, gasten begeleiden..." },
      { key: "sprekers", label: "Sprekers & volgorde", type: "longtext", placeholder: "Naam, onderwerp, duur per spreker" },
      { key: "verrassingen", label: "Verrassingen & speciale momenten", type: "longtext", placeholder: "Flash mob, surprise optreden, etc." },
    ],
    deliverables: [
      { key: "draaiboek", label: "Draaiboek dag-van" },
      { key: "aankondigingen", label: "Aankondigingsteksten" },
    ],
    timelineTemplate: [
      { key: "aankomst-cmc", label: "Aankomst ceremoniemeester", phase: "arrival", defaultDuration: 30 },
      { key: "aankondigingen", label: "Aankondigingen & cues", phase: "perform", defaultDuration: 360 },
    ],
    logisticsFields: [],
  },

  // ── Beeld & Video ────────────────────────────────────────

  {
    type: "fotograaf",
    label: "Fotograaf",
    emoji: "📷",
    modules: ["deliverablesTracker", "timelinePlanner"],
    intakeFields: [
      {
        key: "stijl",
        label: "Fotografiestijl",
        type: "select",
        options: ["reportage", "klassiek", "editorial", "documentair"],
      },
      { key: "firstLook", label: "First look gewenst?", type: "boolean" },
      { key: "familiefotolijst", label: "Familiefotolijst", type: "longtext", placeholder: "Combinaties die vastgelegd moeten worden" },
    ],
    deliverables: [
      { key: "sneak-peek", label: "Sneak peek (3–5 foto's)", approvalRequired: false },
      { key: "digitale-bestanden", label: "Digitale bestanden (full set)" },
      { key: "fotoalbum", label: "Fotoalbum", approvalRequired: true },
    ],
    timelineTemplate: [
      { key: "getting-ready", label: "Getting ready", phase: "arrival", defaultDuration: 90 },
      { key: "ceremonie", label: "Ceremonie", phase: "perform", defaultDuration: 45 },
      { key: "golden-hour", label: "Golden hour portretfoto's", phase: "perform", defaultDuration: 30 },
      { key: "levering", label: "Levering bestanden", phase: "custom", defaultDuration: 0 },
    ],
    logisticsFields: [
      { key: "tweede-fotograaf", label: "Tweede fotograaf aanwezig?", type: "boolean" },
      { key: "backup-opslag", label: "Back-up opslag methode", type: "text" },
    ],
  },

  {
    type: "videograaf",
    label: "Videograaf",
    emoji: "🎥",
    modules: ["deliverablesTracker", "timelinePlanner"],
    intakeFields: [
      {
        key: "eindproduct",
        label: "Eindproduct",
        type: "select",
        options: ["korte film", "lange film", "beide"],
      },
      { key: "drone", label: "Drone-opnames gewenst?", type: "boolean" },
      { key: "audioGeloften", label: "Aparte audio geloften opnemen?", type: "boolean" },
    ],
    deliverables: [
      { key: "ceremonie-audio", label: "Ceremonie-audio (ruwe cut)" },
      { key: "speeches", label: "Speeches compilatie" },
      { key: "teaser", label: "Teaser (1–2 min)", approvalRequired: false },
      { key: "trouwfilm", label: "Trouwfilm (definitief)", approvalRequired: true },
    ],
    timelineTemplate: [
      { key: "ceremonie-audio-opname", label: "Ceremonie-audio opname", phase: "perform", defaultDuration: 45 },
      { key: "speeches-opname", label: "Speeches opname", phase: "perform", defaultDuration: 60 },
      { key: "teaser-deadline", label: "Teaser deadline", phase: "custom", defaultDuration: 0 },
      { key: "film-deadline", label: "Film deadline", phase: "custom", defaultDuration: 0 },
    ],
    logisticsFields: [
      { key: "stroombehoefte", label: "Stroombehoefte (Watt)", type: "number" },
      { key: "drone-vergunning", label: "Drone-vergunning geregeld?", type: "boolean" },
    ],
  },

  {
    type: "contentcreator",
    label: "Content Creator",
    emoji: "📱",
    modules: ["deliverablesTracker", "timelinePlanner"],
    intakeFields: [
      { key: "stijl", label: "Contentstijl & feed-esthetiek", type: "longtext", placeholder: "Warm, licht, donker, kleurrijk..." },
      { key: "hashtag", label: "Bruiloft hashtag", type: "text", placeholder: "#VanDenBergTrauwt2026" },
      { key: "sameDayEdit", label: "Same-day edit gewenst?", type: "boolean" },
    ],
    deliverables: [
      { key: "stories", label: "Stories (dag-van)" },
      { key: "reels", label: "Reels / korte video" },
      { key: "highlights", label: "Highlights compilatie", approvalRequired: true },
    ],
    timelineTemplate: [
      { key: "getting-ready-content", label: "Content getting ready", phase: "arrival", defaultDuration: 60 },
      { key: "ceremonie-content", label: "Content ceremonie", phase: "perform", defaultDuration: 45 },
      { key: "feest-content", label: "Content feest", phase: "perform", defaultDuration: 120 },
    ],
    logisticsFields: [],
  },

  {
    type: "fotocabine",
    label: "Fotocabine",
    emoji: "📸",
    modules: ["timelinePlanner"],
    intakeFields: [
      {
        key: "type",
        label: "Type cabine",
        type: "select",
        options: ["open", "gesloten", "spiegel"],
      },
      { key: "props", label: "Props & accessoires", type: "text", placeholder: "Hoeden, brillen, borden..." },
      { key: "branding", label: "Branding / personalisatie", type: "text", placeholder: "Logo, namen, datum op de strip" },
    ],
    deliverables: [
      { key: "proppenlijst", label: "Proppenlijst" },
      { key: "branded-prints", label: "Branded prints template", approvalRequired: true },
      { key: "fotostrip", label: "Digitale fotostrip bezoekers" },
    ],
    timelineTemplate: [
      { key: "opbouw-cabine", label: "Opbouw fotocabine", phase: "setup", defaultDuration: 60 },
      { key: "cabine-actief", label: "Fotocabine actief tijdens feest", phase: "perform", defaultDuration: 240 },
      { key: "afbouw-cabine", label: "Afbouw fotocabine", phase: "teardown", defaultDuration: 45 },
    ],
    logisticsFields: [
      { key: "stroomaansluiting", label: "Stroomaansluiting vereist (230V)", type: "boolean" },
      { key: "ruimte-afmeting", label: "Benodigde ruimte (m²)", type: "text" },
    ],
  },

  {
    type: "fotoboothspeciaal",
    label: "Fotoboothspeciaal",
    emoji: "📸",
    modules: ["timelinePlanner"],
    intakeFields: [
      {
        key: "type",
        label: "Type fotobooth",
        type: "select",
        options: ["open", "gesloten", "spiegel", "360-graden", "neon"],
      },
      { key: "props", label: "Props & accessoires", type: "text", placeholder: "Hoeden, brillen, borden..." },
      { key: "branding", label: "Branding / personalisatie", type: "text", placeholder: "Logo, namen, datum op de strip" },
    ],
    deliverables: [
      { key: "proppenlijst", label: "Proppenlijst" },
      { key: "branded-prints", label: "Branded prints template", approvalRequired: true },
      { key: "fotostrip", label: "Digitale fotostrip bezoekers" },
    ],
    timelineTemplate: [
      { key: "opbouw-booth", label: "Opbouw fotobooth", phase: "setup", defaultDuration: 90 },
      { key: "booth-actief", label: "Fotobooth actief tijdens feest", phase: "perform", defaultDuration: 240 },
      { key: "afbouw-booth", label: "Afbouw fotobooth", phase: "teardown", defaultDuration: 60 },
    ],
    logisticsFields: [
      { key: "stroomaansluiting", label: "Stroomaansluiting vereist (230V)", type: "boolean" },
      { key: "ruimte-afmeting", label: "Benodigde ruimte (m²)", type: "text" },
    ],
  },

  // ── Muziek & Entertainment ───────────────────────────────

  {
    type: "dj",
    label: "DJ / Muziek",
    emoji: "🎧",
    modules: ["setlistPlanner", "timelinePlanner", "deliverablesTracker", "logisticsPanel"],
    intakeFields: [
      { key: "vibe", label: "Gewenste vibe & muziekstijlen", type: "longtext", placeholder: "Commercieel, R&B, jaren 80, latin..." },
      { key: "firstDanceSong", label: "Openingsdansnummer", type: "text", placeholder: "Artiest - Titel" },
      { key: "ceremonyMusic", label: "Ceremoniemuziek wensen", type: "longtext", placeholder: "Inkomst, tekenen, uitgang..." },
      { key: "mcRole", label: "MC-rol gewenst?", type: "boolean" },
    ],
    deliverables: [
      { key: "must-play", label: "Must-play lijst" },
      { key: "do-not-play", label: "Do-not-play lijst" },
      { key: "verzoeknummers", label: "Verzoeknummers link / formulier" },
    ],
    timelineTemplate: [
      { key: "soundcheck", label: "Soundcheck & opbouw", phase: "setup", defaultDuration: 90 },
      { key: "ceremoniemuziek", label: "Ceremoniemuziek", phase: "perform", defaultDuration: 45 },
      { key: "diner-achtergrond", label: "Diner achtergrondmuziek", phase: "perform", defaultDuration: 120 },
      { key: "eerste-dans", label: "Eerste dans & feest", phase: "perform", defaultDuration: 180 },
      { key: "afbreken", label: "Afbreken & laden", phase: "teardown", defaultDuration: 60 },
    ],
    logisticsFields: [
      { key: "stroomvereiste", label: "Stroomvereiste (Watt)", type: "number" },
      { key: "geluidsgrens-db", label: "Geluidsgrens locatie (dB)", type: "number" },
      { key: "opbouwtijd", label: "Benodigde opbouwtijd (min)", type: "number" },
      { key: "afbouwtijd", label: "Benodigde afbouwtijd (min)", type: "number" },
    ],
  },

  {
    type: "liveband",
    label: "Liveband & Muziek",
    emoji: "🎵",
    modules: ["timelinePlanner", "deliverablesTracker", "logisticsPanel"],
    intakeFields: [
      { key: "genre", label: "Genre & stijl", type: "text", placeholder: "Pop, jazz, funk, akoestisch..." },
      { key: "setlist", label: "Setlist wensen", type: "longtext", placeholder: "Nummers of genres per moment" },
      { key: "mcRole", label: "MC-rol gewenst?", type: "boolean" },
      { key: "covers", label: "Specifieke covers / verzoeken", type: "longtext", placeholder: "Verzoekjes van het bruidspaar" },
    ],
    deliverables: [
      { key: "setlist", label: "Setlist (definitief)", approvalRequired: true },
      { key: "technische-rider", label: "Technische rider" },
      { key: "soundcheck-tijden", label: "Soundcheck tijdschema" },
    ],
    timelineTemplate: [
      { key: "soundcheck", label: "Soundcheck & opbouw", phase: "setup", defaultDuration: 120 },
      { key: "optreden-1", label: "Eerste set optreden", phase: "perform", defaultDuration: 60 },
      { key: "pauze", label: "Pauze(s)", phase: "custom", defaultDuration: 20 },
      { key: "optreden-2", label: "Tweede set optreden", phase: "perform", defaultDuration: 60 },
      { key: "afbreken", label: "Afbreken & laden", phase: "teardown", defaultDuration: 90 },
    ],
    logisticsFields: [
      { key: "stroomvereiste", label: "Stroomvereiste (Watt)", type: "number" },
      { key: "geluidsgrens-db", label: "Geluidsgrens locatie (dB)", type: "number" },
      { key: "podium-afmeting", label: "Podiumafmeting (m²)", type: "text" },
      { key: "kleedkamer", label: "Kleedkamer / backstage vereist?", type: "boolean" },
    ],
  },

  {
    type: "entertainment",
    label: "Entertainment / Acts",
    emoji: "🎭",
    modules: ["timelinePlanner"],
    intakeFields: [
      { key: "typeAct", label: "Type act", type: "text", placeholder: "Goochelaar, acrobaat, caricaturist..." },
      { key: "duur", label: "Duur optreden (minuten)", type: "number" },
      { key: "rider", label: "Technische rider / vereisten", type: "longtext", placeholder: "Ruimte, licht, geluid, kleedkamer..." },
    ],
    deliverables: [
      { key: "programmaomschrijving", label: "Programmaomschrijving" },
      { key: "technische-rider", label: "Technische rider" },
    ],
    timelineTemplate: [
      { key: "soundcheck-act", label: "Soundcheck / voorbereiding act", phase: "setup", defaultDuration: 30 },
      { key: "timing-draaiboek", label: "Optreden in draaiboek", phase: "perform", defaultDuration: 45 },
    ],
    logisticsFields: [
      { key: "ruimtevereiste", label: "Benodigde ruimte (m²)", type: "text" },
      { key: "stroomaansluiting", label: "Stroomaansluiting vereist?", type: "boolean" },
    ],
  },

  {
    type: "vuurwerk",
    label: "Vuurwerk & Effecten",
    emoji: "🎆",
    modules: ["timelinePlanner", "logisticsPanel"],
    intakeFields: [
      { key: "type", label: "Type vuurwerk / effect", type: "text", placeholder: "Fonteinen, indoor confetti, outdoor show..." },
      { key: "vergunning", label: "Vergunning status", type: "text", placeholder: "Aangevraagd / verkregen / locatie regelt" },
      { key: "planBWeer", label: "Plan-B bij slecht weer", type: "longtext", placeholder: "Indoor alternatief of uitstelplan" },
    ],
    deliverables: [
      { key: "vuurwerkplan", label: "Vuurwerkplan" },
      { key: "vergunning-doc", label: "Vergunningsdocument" },
    ],
    timelineTemplate: [
      { key: "setup-vuurwerk", label: "Opbouw & inspectie vuurwerk", phase: "setup", defaultDuration: 60 },
      { key: "afvuurmoment", label: "Afvuurmoment", phase: "perform", defaultDuration: 10 },
    ],
    logisticsFields: [
      { key: "veiligheidszone", label: "Veiligheidszone (meter)", type: "number" },
      { key: "vergunning-aanwezig", label: "Vergunning aanwezig op dag", type: "boolean" },
      { key: "brandweer-melding", label: "Brandweer voormelding gedaan?", type: "boolean" },
    ],
  },

  // ── Bloemen & Decoratie ──────────────────────────────────

  {
    type: "bloemist",
    label: "Bloemist",
    emoji: "🌸",
    modules: ["photoUpload", "timelinePlanner", "documentUpload"],
    intakeFields: [
      { key: "palette", label: "Kleurenpalet", type: "color-multi" },
      { key: "flowers", label: "Gewenste bloemen & stijl", type: "text", placeholder: "Rozen, pioenrozen, wild/romantisch..." },
      { key: "allergies", label: "Allergieën (bruidspaar of gasten)", type: "longtext", placeholder: "Bijv. stuifmeelgevoelig, vermijd bepaalde bloemen..." },
    ],
    deliverables: [],
    timelineTemplate: [
      { key: "boeket-bruid", label: "Boeket bezorgen bij bruid", phase: "arrival", defaultDuration: 15 },
      { key: "decor-venue", label: "Bloemdecor naar venue", phase: "setup", defaultDuration: 30 },
      { key: "opbouw-bloemen", label: "Opbouw bloemdecoraties", phase: "setup", defaultDuration: 120 },
      { key: "omzetten", label: "Ceremonie → diner omzetten", phase: "custom", defaultDuration: 30 },
      { key: "ophalen", label: "Ophalen huurmateriaal", phase: "teardown", defaultDuration: 60 },
    ],
    logisticsFields: [
      { key: "water-venue", label: "Water bij venue aanwezig?", type: "boolean" },
      { key: "koeling-venue", label: "Koeling bij venue aanwezig?", type: "boolean" },
      { key: "huurmateriaal-retour", label: "Afspraak verhuurmateriaal retourneren", type: "text", placeholder: "bijv. maandag 14:00 bij venue" },
      { key: "toegang-venue", label: "Toegangstijd venue (eerste mogelijke opbouwtijd)", type: "time" },
    ],
  },

  {
    type: "decoratie",
    label: "Decoratie & Styling",
    emoji: "✨",
    modules: ["moodboardUploader", "timelinePlanner", "deliverablesTracker"],
    intakeFields: [
      { key: "thema", label: "Thema & stijl", type: "text", placeholder: "Boho, klassiek, modern, romantisch..." },
      { key: "palette", label: "Kleurenpalet", type: "color-multi" },
      { key: "planPerRuimte", label: "Inrichtingsplan per ruimte", type: "longtext", placeholder: "Foyer, ceremonie, diner, dance floor..." },
    ],
    deliverables: [
      { key: "moodboard", label: "Moodboard", approvalRequired: true },
      { key: "inrichtingsplan", label: "Inrichtingsplan (definitief)", approvalRequired: true },
      { key: "ceremonie-decor", label: "Ceremonie decor opgeleverd" },
      { key: "diner-decor", label: "Diner decor opgeleverd" },
    ],
    timelineTemplate: [
      { key: "opbouw-decoratie", label: "Opbouw decoratie", phase: "setup", defaultDuration: 180 },
      { key: "omzetten-decor", label: "Ceremonie → diner omzetten", phase: "custom", defaultDuration: 45 },
      { key: "afbouw-decoratie", label: "Afbouw decoratie", phase: "teardown", defaultDuration: 120 },
    ],
    logisticsFields: [
      { key: "toegang-venue", label: "Toegangstijd venue voor opbouw", type: "time" },
      { key: "huurmateriaal-retour", label: "Huurmateriaal retour datum", type: "text" },
    ],
  },

  {
    type: "verlichting",
    label: "Verlichting",
    emoji: "💡",
    modules: ["timelinePlanner"],
    intakeFields: [
      { key: "lichtplanPerZone", label: "Lichtplan per zone", type: "longtext", placeholder: "Ceremonie, diner, dance floor, exterieur..." },
      { key: "dansvloerEffect", label: "Dance floor lichteffect", type: "text", placeholder: "Moving heads, LED-strip, gobo..." },
    ],
    deliverables: [
      { key: "lichtplan", label: "Lichtplan (definitief)" },
      { key: "technische-rider", label: "Technische rider verlichting" },
    ],
    timelineTemplate: [
      { key: "opbouw-licht", label: "Opbouw verlichting", phase: "setup", defaultDuration: 120 },
      { key: "scenewissels", label: "Scènewissels tijdens dag", phase: "perform", defaultDuration: 0 },
      { key: "afbouw-licht", label: "Afbouw verlichting", phase: "teardown", defaultDuration: 60 },
    ],
    logisticsFields: [
      { key: "stroomvereiste", label: "Stroomvereiste (Watt)", type: "number" },
      { key: "aansluitpunten", label: "Aantal benodigde aansluitpunten", type: "number" },
    ],
  },

  // ── Eten & Drinken ───────────────────────────────────────

  {
    type: "catering",
    label: "Catering",
    emoji: "🍽️",
    modules: ["menuBuilder", "couvertCalculator", "guestDataPanel", "deliverablesTracker", "timelinePlanner"],
    readsGuestData: ["counts", "allergies"],
    intakeFields: [
      { key: "menu", label: "Menuvoorstel / -wensen", type: "longtext", placeholder: "Starters, hoofdgerecht, dessert, veganistisch..." },
      { key: "proeverijDatum", label: "Datum proeverij", type: "date" },
      { key: "drankarrangement", label: "Drankarrangement", type: "text", placeholder: "Wijn, bier, frisdrank, open bar..." },
      { key: "kindermaaltijden", label: "Kindermaaltijden gewenst?", type: "boolean" },
    ],
    deliverables: [
      { key: "menukaart", label: "Menukaart (ontwerp)", approvalRequired: true },
      { key: "proeverijverslag", label: "Proeverijverslag" },
      { key: "definitief-menu", label: "Definitief menu", approvalRequired: true },
    ],
    timelineTemplate: [
      { key: "borrel", label: "Borrel / ontvangst", phase: "perform", defaultDuration: 60 },
      { key: "diner-gang-1", label: "Diner – voorgerecht", phase: "perform", defaultDuration: 30 },
      { key: "diner-gang-2", label: "Diner – hoofdgerecht", phase: "perform", defaultDuration: 45 },
      { key: "diner-gang-3", label: "Diner – dessert", phase: "perform", defaultDuration: 30 },
      { key: "avondhap", label: "Avondhap", phase: "perform", defaultDuration: 30 },
    ],
    logisticsFields: [
      { key: "keukenvoorziening", label: "Keukenvoorzieningen venue", type: "longtext" },
      { key: "serveeroppervlak", label: "Serveerpunten / buffetruimte", type: "text" },
      { key: "personeelsaantal", label: "Aantal servicemedewerkers", type: "number" },
    ],
  },

  {
    type: "bakker",
    label: "Bruidstaart & Bakker",
    emoji: "🎂",
    modules: ["approvalButton", "guestDataPanel", "timelinePlanner"],
    readsGuestData: ["counts", "allergies"],
    intakeFields: [
      { key: "smaak", label: "Smaak(combinaties)", type: "text", placeholder: "Vanille/framboos, chocolade/salted caramel..." },
      { key: "proeverijDatum", label: "Datum proeverij", type: "text" },
      { key: "designOmschrijving", label: "Taartdesign omschrijving", type: "longtext", placeholder: "Stijl, kleuren, decoraties, topper..." },
      { key: "verdiepingen", label: "Aantal verdiepingen", type: "number" },
    ],
    deliverables: [
      { key: "smaakproef", label: "Smaakproef resultaat" },
      { key: "design-proof", label: "Design visualisatie / schets", approvalRequired: true },
      { key: "definitieve-taart", label: "Definitieve taart bezorgd" },
    ],
    timelineTemplate: [
      { key: "bezorging-taart", label: "Bezorging taart bij venue", phase: "arrival", defaultDuration: 30 },
      { key: "aansnijmoment", label: "Aansnijmoment", phase: "perform", defaultDuration: 15 },
    ],
    logisticsFields: [
      { key: "koeling-taart", label: "Koelruimte bij venue aanwezig?", type: "boolean" },
      { key: "taartmes-aanwezig", label: "Taartmes & schep aanwezig bij venue?", type: "boolean" },
    ],
  },

  {
    type: "bar",
    label: "Bar / Cocktails",
    emoji: "🍸",
    modules: ["guestDataPanel", "timelinePlanner"],
    readsGuestData: ["counts"],
    intakeFields: [
      { key: "drankenkaart", label: "Drankenkaart / aanbod", type: "longtext", placeholder: "Wijn, bier, cocktails, non-alcoholisch..." },
      { key: "signatureCocktail", label: "Signature cocktail wens", type: "text", placeholder: "Naam en beschrijving" },
    ],
    deliverables: [
      { key: "drankenkaart", label: "Drankenkaart (definitief)", approvalRequired: true },
      { key: "benodigde-materialen", label: "Materialen & glaswerk overzicht" },
    ],
    timelineTemplate: [
      { key: "bar-opbouw", label: "Opbouw bar", phase: "setup", defaultDuration: 60 },
      { key: "bar-open", label: "Bar open", phase: "perform", defaultDuration: 360 },
      { key: "bar-dicht", label: "Bar gesloten / afbouw", phase: "teardown", defaultDuration: 45 },
    ],
    logisticsFields: [
      { key: "stroomaansluiting", label: "Stroomaansluiting voor koeling", type: "boolean" },
      { key: "wateraansluiting", label: "Wateraansluiting aanwezig?", type: "boolean" },
    ],
  },

  {
    type: "koffiebar",
    label: "Koffiebar / Foodtruck",
    emoji: "☕",
    modules: ["guestDataPanel", "timelinePlanner"],
    readsGuestData: ["counts"],
    intakeFields: [
      { key: "aanbod", label: "Aanbod & menukaart", type: "longtext", placeholder: "Koffiedranken, thee, foodtruckgerechten..." },
      { key: "serveermoment", label: "Serveermomenten", type: "text", placeholder: "Na ceremonie, bij avondbuffet, doorlopend..." },
    ],
    deliverables: [
      { key: "menukaart", label: "Menukaart (definitief)", approvalRequired: true },
    ],
    timelineTemplate: [
      { key: "opbouw-foodstation", label: "Opbouw koffiebar / foodtruck", phase: "setup", defaultDuration: 60 },
      { key: "serveervenster", label: "Serveervenster actief", phase: "perform", defaultDuration: 180 },
      { key: "afbouw-foodstation", label: "Afbouw", phase: "teardown", defaultDuration: 45 },
    ],
    logisticsFields: [
      { key: "stroomaansluiting", label: "Stroomaansluiting (230V/stroom)", type: "boolean" },
      { key: "wateraansluiting", label: "Wateraansluiting vereist?", type: "boolean" },
      { key: "parkeerplaats-truck", label: "Parkeerplaats foodtruck geregeld?", type: "boolean" },
    ],
  },

  // ── Locatie & Verhuur ────────────────────────────────────

  {
    type: "trouwlocatie",
    label: "Trouwlocatie",
    emoji: "🏛️",
    modules: ["logisticsPanel"],
    intakeFields: [
      { key: "capaciteit", label: "Capaciteit (personen)", type: "number" },
      { key: "ruimtes", label: "Beschikbare ruimtes", type: "longtext", placeholder: "Ceremonie, diner, feest, bruidskamer..." },
      { key: "huisregels", label: "Huisregels & restricties", type: "longtext", placeholder: "Geluidsgrens, eindtijd, cateringbeleid..." },
      { key: "eindtijd", label: "Eindtijd evenement", type: "time" },
    ],
    deliverables: [
      { key: "leveranciersrooster", label: "Leverancierstoegang rooster" },
      { key: "plattegrond", label: "Plattegrond venue" },
      { key: "ceremonieopstelling", label: "Ceremonieopstelling plan" },
    ],
    timelineTemplate: [
      { key: "leverancierstoegang", label: "Leverancierstoegang start", phase: "arrival", defaultDuration: 0 },
      { key: "oplevering-locatie", label: "Oplevering locatie aan bruidspaar", phase: "custom", defaultDuration: 15 },
      { key: "eindtijd-locatie", label: "Eindtijd evenement", phase: "teardown", defaultDuration: 0 },
    ],
    logisticsFields: [
      { key: "parkeergelegenheid", label: "Parkeergelegenheid aanwezig?", type: "boolean" },
      { key: "toegankelijkheid", label: "Rolstoeltoegankelijkheid", type: "boolean" },
      { key: "catering-beleid", label: "Cateringbeleid (eigen/extern)", type: "text" },
    ],
  },

  {
    type: "verhuur",
    label: "Verhuur",
    emoji: "📦",
    modules: ["timelinePlanner", "deliverablesTracker"],
    intakeFields: [
      { key: "itemlijst", label: "Itemlijst", type: "longtext", placeholder: "Tafels, stoelen, servies, linnengoed..." },
      { key: "aantallen", label: "Aantallen per item", type: "longtext" },
      { key: "plattegrond", label: "Plaatsingsplattegrond gewenst?", type: "boolean" },
    ],
    deliverables: [
      { key: "verhuurlijst", label: "Verhuurlijst (definitief)", approvalRequired: true },
      { key: "bezorging", label: "Bezorging & plaatsing" },
      { key: "retourcheck", label: "Retourcheck na event" },
    ],
    timelineTemplate: [
      { key: "bezorging-verhuur", label: "Bezorging huurmaterialen", phase: "arrival", defaultDuration: 120 },
      { key: "ophalen-verhuur", label: "Ophalen huurmaterialen", phase: "teardown", defaultDuration: 120 },
    ],
    logisticsFields: [
      { key: "retouradres", label: "Retouradres / -datum", type: "text" },
      { key: "schadebeleid", label: "Schadebeleid", type: "text" },
    ],
  },

  {
    type: "tentverhuur",
    label: "Tentverhuur",
    emoji: "⛺",
    modules: ["timelinePlanner", "logisticsPanel"],
    intakeFields: [
      { key: "type", label: "Type tent", type: "text", placeholder: "Partytent, tipi, glazen paviljoen, feesttent..." },
      { key: "ondergrond", label: "Ondergrond locatie", type: "text", placeholder: "Gras, klinkers, zand..." },
      { key: "weerplan", label: "Weerplan / plan-B", type: "longtext", placeholder: "Zijwanden, verwarming, vloer bij regen..." },
    ],
    deliverables: [
      { key: "tentplan", label: "Tentplan & plattegrond", approvalRequired: true },
      { key: "oplevering-tent", label: "Oplevering tent na plaatsing" },
    ],
    timelineTemplate: [
      { key: "opbouw-tent", label: "Opbouw tent (dagen vooraf)", phase: "setup", defaultDuration: 480 },
      { key: "afbouw-tent", label: "Afbouw tent", phase: "teardown", defaultDuration: 480 },
    ],
    logisticsFields: [
      { key: "stroomaansluiting", label: "Stroomaansluiting tent", type: "boolean" },
      { key: "verwarming", label: "Verwarmingselement aanwezig?", type: "boolean" },
      { key: "vloer-nodig", label: "Tentbodem / vloer vereist?", type: "boolean" },
    ],
  },

  // ── Vervoer ──────────────────────────────────────────────

  {
    type: "vervoer",
    label: "Vervoer",
    emoji: "🚗",
    modules: ["timelinePlanner"],
    intakeFields: [
      {
        key: "type",
        label: "Type voertuig",
        type: "select",
        options: ["oldtimer", "limousine", "trouwauto", "bus"],
      },
      { key: "passagiers", label: "Aantal passagiers", type: "number" },
      { key: "decoratie", label: "Decoratiewensen", type: "text", placeholder: "Linten, bloemen, blikjes..." },
    ],
    deliverables: [
      { key: "rittenplan", label: "Rittenplan" },
      { key: "adressen", label: "Bevestigde adressen & tijden" },
    ],
    timelineTemplate: [
      { key: "ophaal-rit-1", label: "Ophaaltijden + adressen per rit", phase: "perform", defaultDuration: 60 },
    ],
    logisticsFields: [],
  },

  {
    type: "trouwauto",
    label: "Trouwauto",
    emoji: "🚗",
    modules: ["timelinePlanner"],
    intakeFields: [
      {
        key: "type",
        label: "Type trouwauto",
        type: "select",
        options: ["oldtimer", "limousine", "cabriolet", "klassiek", "elektrisch"],
      },
      { key: "passagiers", label: "Aantal passagiers", type: "number" },
      { key: "decoratie", label: "Decoratiewensen", type: "text", placeholder: "Linten, bloemen, nummerbord..." },
    ],
    deliverables: [
      { key: "rittenplan", label: "Rittenplan (definitief)" },
      { key: "adressen", label: "Adressen & tijdstip bevestigd" },
    ],
    timelineTemplate: [
      { key: "ophaal-bruid", label: "Ophalen bruid/bruidegom", phase: "perform", defaultDuration: 30 },
      { key: "rit-per-rit", label: "Ritten op dag", phase: "perform", defaultDuration: 60 },
    ],
    logisticsFields: [],
  },

  {
    type: "gastenvervoer",
    label: "Gastenvervoer",
    emoji: "🚌",
    modules: ["timelinePlanner", "guestDataPanel"],
    readsGuestData: ["counts"],
    intakeFields: [
      { key: "opstappunten", label: "Opstappunten", type: "longtext", placeholder: "Station, hotel, parkeerplaats..." },
      { key: "afzetpunten", label: "Afzetpunten / terugrit", type: "longtext", placeholder: "Na feest: hotels, stations..." },
    ],
    deliverables: [
      { key: "routeplan", label: "Routeplan & tijdschema" },
      { key: "communicatie-gasten", label: "Communicatie naar gasten" },
    ],
    timelineTemplate: [
      { key: "heen-rit", label: "Heenrit gasten naar locatie", phase: "arrival", defaultDuration: 45 },
      { key: "terug-rit", label: "Terugrit gasten", phase: "teardown", defaultDuration: 45 },
    ],
    logisticsFields: [
      { key: "chauffeur-contact", label: "Chauffeur contactnummer", type: "text" },
    ],
  },

  // ── Beauty ───────────────────────────────────────────────

  {
    type: "haarstylist",
    label: "Haar & Make-up",
    emoji: "💄",
    modules: ["moodboardUploader", "timelinePlanner"],
    intakeFields: [
      { key: "trialDatum", label: "Datum proefsessie", type: "text" },
      { key: "lookPerPersoon", label: "Look per persoon", type: "longtext", placeholder: "Bruid, moeder, bruidsmeisjes, getuigen..." },
      { key: "allergies", label: "Productallergieën", type: "text", placeholder: "Bijv. latex, parfum, specifieke ingrediënten" },
      { key: "aantalPersonen", label: "Aantal personen", type: "number" },
    ],
    deliverables: [
      { key: "trial-resultaat", label: "Trial resultaat (foto's)", approvalRequired: true },
      { key: "definitieve-look", label: "Definitieve look bevestigd" },
    ],
    timelineTemplate: [
      { key: "ochtend-tijdschema", label: "Ochtend haar & make-up schema", phase: "setup", defaultDuration: 180 },
      { key: "touch-up", label: "Touch-up voor ceremonie", phase: "custom", defaultDuration: 15 },
    ],
    logisticsFields: [
      { key: "locatie-sessie", label: "Locatie sessie (thuis / hotel / venue)", type: "text" },
      { key: "parkeer-mogelijkheid", label: "Parkeermogelijkheid aanwezig?", type: "boolean" },
    ],
  },

  {
    type: "visagist",
    label: "Visagist",
    emoji: "💋",
    modules: ["moodboardUploader", "timelinePlanner"],
    intakeFields: [
      { key: "trialDatum", label: "Datum proefsessie", type: "text" },
      { key: "look", label: "Gewenste make-up look", type: "longtext", placeholder: "Natural, dramatic, smoky eye, no-make-up look..." },
      { key: "allergies", label: "Productallergieën", type: "text", placeholder: "Bijv. latex, parfum, specifieke ingrediënten" },
    ],
    deliverables: [
      { key: "trial-resultaat", label: "Trial resultaat (foto's)", approvalRequired: true },
      { key: "definitieve-look", label: "Definitieve make-up look bevestigd" },
    ],
    timelineTemplate: [
      { key: "ochtend-tijdschema", label: "Ochtend make-up schema", phase: "setup", defaultDuration: 120 },
      { key: "touch-up", label: "Touch-up voor ceremonie", phase: "custom", defaultDuration: 15 },
    ],
    logisticsFields: [
      { key: "locatie-sessie", label: "Locatie sessie", type: "text" },
    ],
  },

  // ── Mode & Accessoires ───────────────────────────────────

  {
    type: "bruidsmode",
    label: "Bruidsmode",
    emoji: "👗",
    modules: ["checklistDeadlines"],
    intakeFields: [
      { key: "stijl", label: "Jurk-stijl", type: "text", placeholder: "A-lijn, ballerina, zeemeermin, bohemian..." },
      { key: "fittingen", label: "Fittingdata", type: "longtext", placeholder: "Eerste fitting, tweede fitting, ophaalmoment..." },
      { key: "accessoires", label: "Accessoires", type: "longtext", placeholder: "Sluier, schoenen, sieraden, tiara..." },
    ],
    deliverables: [
      { key: "jurk", label: "Jurk klaar voor ophalen" },
      { key: "accessoires", label: "Accessoires compleet" },
      { key: "ophaalmoment", label: "Ophaalmoment bevestigd" },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  {
    type: "herenmode",
    label: "Herenmode",
    emoji: "🤵",
    modules: ["checklistDeadlines"],
    intakeFields: [
      { key: "stijl", label: "Pak-stijl & kleur", type: "text", placeholder: "Donkerblauw, grijs, krijtstreep, smoking..." },
      { key: "huurOfKoop", label: "Huur of koop?", type: "select", options: ["huur", "koop", "op maat"] },
      { key: "accessoires", label: "Accessoires", type: "longtext", placeholder: "Stropdas, pochet, manchetknopen, schoenen..." },
    ],
    deliverables: [
      { key: "pak", label: "Pak gereed / opgehaald" },
      { key: "accessoires", label: "Accessoires compleet" },
      { key: "aankleden", label: "Aankledinstructies dag-van" },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  {
    type: "juwelier",
    label: "Juwelier",
    emoji: "💍",
    modules: ["checklistDeadlines"],
    intakeFields: [
      { key: "ontwerp", label: "Ringontwerp / -stijl", type: "text", placeholder: "Klassiek, modern, gravering, steentype..." },
      { key: "maten", label: "Ringmaten", type: "text", placeholder: "Maat bruid + bruidegom" },
      { key: "gravering", label: "Graveringtekst", type: "text", placeholder: "Initialen, datum, quote..." },
    ],
    deliverables: [
      { key: "ringen", label: "Ringen gereed & goedgekeurd", approvalRequired: true },
      { key: "levering", label: "Levering / ophaalmoment" },
      { key: "overdracht-getuige", label: "Overdracht aan getuige geregeld" },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  // ── Drukwerk & Communicatie ──────────────────────────────

  {
    type: "drukwerk",
    label: "Drukwerk",
    emoji: "🖨️",
    modules: ["approvalButton", "deliverablesTracker", "checklistDeadlines"],
    intakeFields: [
      { key: "huisstijl", label: "Huisstijl / thema", type: "text", placeholder: "Kleuren, lettertype, stijl..." },
      { key: "teksten", label: "Benodigde teksten", type: "longtext", placeholder: "Uitnodiging, menukaart, programma, bordje..." },
      { key: "oplage", label: "Oplage per item", type: "longtext", placeholder: "Uitnodiging: 120x, menukaart: 80x..." },
    ],
    deliverables: [
      { key: "uitnodiging-proof", label: "Uitnodiging drukproef", approvalRequired: true },
      { key: "menukaart-proof", label: "Menukaart drukproef", approvalRequired: true },
      { key: "programmaboekje", label: "Programmaboekje", approvalRequired: true },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  // ── Logistiek & Diversen ─────────────────────────────────

  {
    type: "overnachting",
    label: "Overnachting",
    emoji: "🏨",
    modules: ["guestDataPanel"],
    readsGuestData: ["counts"],
    intakeFields: [
      { key: "kamerblok", label: "Kamerblok / categorie", type: "text", placeholder: "Standaard, deluxe, suite, bruidssuite..." },
      { key: "reserveringscode", label: "Reserveringscode voor gasten", type: "text" },
      { key: "checkInTijd", label: "Check-in tijd", type: "time" },
      { key: "checkOutTijd", label: "Check-out tijd", type: "time" },
    ],
    deliverables: [
      { key: "kameroverzicht", label: "Kameroverzicht gasten" },
      { key: "reserveringsbevestiging", label: "Reserveringsbevestiging" },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  {
    type: "kinderoppas",
    label: "Kinderoppas",
    emoji: "👶",
    modules: ["guestDataPanel", "timelinePlanner"],
    readsGuestData: ["ages", "allergies"],
    intakeFields: [
      { key: "aantalKinderen", label: "Aantal kinderen", type: "number" },
      { key: "leeftijden", label: "Leeftijden / leeftijdsgroepen", type: "text", placeholder: "Bijv. 0–2, 3–6, 7–12 jaar" },
      { key: "activiteiten", label: "Activiteiten & programma", type: "longtext", placeholder: "Knutselen, filmpjes, buitenspelen..." },
    ],
    deliverables: [
      { key: "activiteitenprogramma", label: "Activiteitenprogramma" },
      { key: "noodcontacten", label: "Noodcontacten lijst" },
    ],
    timelineTemplate: [
      { key: "oppas-start", label: "Start oppas", phase: "arrive", defaultDuration: 0 } as unknown as TimelineBlockTemplate,
      { key: "oppas-eind", label: "Einde oppas", phase: "teardown", defaultDuration: 0 },
    ],
    logisticsFields: [
      { key: "oppasruimte", label: "Oppasruimte bij venue aanwezig?", type: "boolean" },
      { key: "EHBO", label: "EHBO-doos aanwezig?", type: "boolean" },
    ],
  },

  {
    type: "bedankjes",
    label: "Bedankjes & Favors",
    emoji: "🎁",
    modules: ["deliverablesTracker"],
    intakeFields: [
      { key: "type", label: "Type bedankje", type: "text", placeholder: "Zelfgemaakt, gekocht, ervaringsgift..." },
      { key: "aantal", label: "Aantal stuks", type: "number" },
      { key: "personalisatie", label: "Personalisatie wensen", type: "longtext", placeholder: "Label, tekst, verpakking, kleur..." },
    ],
    deliverables: [
      { key: "levering-bedankjes", label: "Levering bedankjes" },
      { key: "uitstalmoment", label: "Uitstalmoment geregeld" },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  {
    type: "huwelijksreis",
    label: "Huwelijksreis",
    emoji: "✈️",
    modules: ["checklistDeadlines"],
    intakeFields: [
      { key: "bestemming", label: "Bestemming(en)", type: "text", placeholder: "Malediven, Italië, Thailand..." },
      { key: "boekingen", label: "Boekingsstatus", type: "longtext", placeholder: "Vluchten, hotel, activiteiten..." },
      { key: "visa", label: "Visa & documenten vereist?", type: "longtext", placeholder: "Landen waarvoor visum nodig is" },
    ],
    deliverables: [
      { key: "reisbescheiden", label: "Reisbescheiden compleet" },
      { key: "visa-goedkeuring", label: "Visa goedgekeurd" },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  {
    type: "beveiliging",
    label: "Beveiliging",
    emoji: "🔒",
    modules: ["timelinePlanner"],
    intakeFields: [
      { key: "gastenaantal", label: "Verwacht gastenaantal", type: "number" },
      { key: "posities", label: "Beveiligingsposities", type: "longtext", placeholder: "Ingang, parkeerplaats, feestzaal..." },
    ],
    deliverables: [
      { key: "veiligheidsplan", label: "Veiligheidsplan" },
      { key: "contactlijst", label: "Contactlijst dag-van" },
    ],
    timelineTemplate: [
      { key: "start-dienst", label: "Start dienst beveiliging", phase: "arrival", defaultDuration: 0 },
      { key: "eind-dienst", label: "Einde dienst beveiliging", phase: "teardown", defaultDuration: 0 },
    ],
    logisticsFields: [
      { key: "noodplan", label: "Noodplan & evacuatieplan", type: "text" },
    ],
  },

  {
    type: "schoonmaak",
    label: "Schoonmaak",
    emoji: "🧹",
    modules: ["checklistDeadlines", "timelinePlanner"],
    intakeFields: [
      { key: "scope", label: "Scope schoonmaak", type: "longtext", placeholder: "Tussenschoonmaak WC, eindschoonmaak zalen..." },
      { key: "opleivereisen", label: "Opleveringseisen venue", type: "longtext", placeholder: "Vrij van etensresten, vloer gedweild..." },
    ],
    deliverables: [
      { key: "schoonmaakplan", label: "Schoonmaakplan" },
      { key: "eindoplevering", label: "Eindoplevering getekend" },
    ],
    timelineTemplate: [
      { key: "tussenschoonmaak", label: "Tussenschoonmaak (WC/common areas)", phase: "custom", defaultDuration: 30 },
      { key: "eindschoonmaak", label: "Eindschoonmaak na event", phase: "teardown", defaultDuration: 180 },
    ],
    logisticsFields: [
      { key: "materialen-eigen", label: "Eigen schoonmaakmiddelen meegenomen?", type: "boolean" },
    ],
  },

  {
    type: "trouwverzekering",
    label: "Trouwverzekering",
    emoji: "🛡️",
    modules: [],
    intakeFields: [
      { key: "dekking", label: "Dekkingsomschrijving", type: "longtext", placeholder: "Annulering, schade, aansprakelijkheid..." },
      { key: "polisnummer", label: "Polisnummer", type: "text" },
      { key: "verzekeraar", label: "Verzekeraar", type: "text" },
    ],
    deliverables: [
      { key: "polis", label: "Polisdocument ontvangen" },
    ],
    timelineTemplate: [],
    logisticsFields: [],
  },

  // ── Catch-all ────────────────────────────────────────────

  {
    type: "overig",
    label: "Overig",
    emoji: "⭐",
    modules: ["timelinePlanner"],
    intakeFields: [
      { key: "omschrijving", label: "Omschrijving dienst", type: "longtext", placeholder: "Wat levert deze leverancier?" },
      { key: "bijzonderheden", label: "Bijzonderheden", type: "text", placeholder: "Aanvullende informatie" },
    ],
    deliverables: [
      { key: "eindresultaat", label: "Eindresultaat" },
    ],
    timelineTemplate: [
      { key: "uitvoering", label: "Uitvoering", phase: "perform", defaultDuration: 60 },
    ],
    logisticsFields: [],
  },
];

// ────────────────────────────────────────────────────────────
// Helper
// ────────────────────────────────────────────────────────────

export function getVendorTypeConfig(type: string): VendorTypeConfig {
  const normalized = type.toLowerCase().trim();
  return (
    VENDOR_TYPE_CONFIGS.find((c) => c.type === normalized) ??
    VENDOR_TYPE_CONFIGS.find((c) => c.type === "overig")!
  );
}
