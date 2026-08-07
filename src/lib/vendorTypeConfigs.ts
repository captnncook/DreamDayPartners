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
  | "couvertCalculator"
  | "shotlistBuilder"
  | "galleryDelivery"
  | "videoDelivery"
  | "bruidsteamBuilder"
  | "materialChecklist"
  | "venueRooms"
  | "vendorAccessTimes"
  | "dayOfContact"
  | "rittenPlanner"
  | "chauffeurInfo"
  | "portieCalculator";

export interface VendorTypeConfig {
  type: string;
  label: string;
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
// Menselijk leesbare labels + de set modules die een leverancier
// zelf aan/uit kan zetten (BASE_MODULES zijn altijd verplicht en
// worden hier bewust niet in opgenomen).
// ────────────────────────────────────────────────────────────

export const MODULE_LABELS: Record<ModuleKey, string> = {
  statusTracker: "Statusbalk",
  contractPayment: "Contract & betaling",
  messageThread: "Berichten",
  fileVault: "Documentenkluis",
  intakeForm: "Intakeformulier",
  timelinePlanner: "Tijdlijnplanner",
  checklistDeadlines: "Checklist & deadlines",
  logisticsPanel: "Logistiek",
  deliverablesTracker: "Opleverpunten",
  moodboardUploader: "Moodboard",
  guestDataPanel: "Gastgegevens",
  approvalButton: "Goedkeuringsknop",
  photoUpload: "Foto-upload",
  documentUpload: "Documentupload",
  setlistPlanner: "Setlist",
  menuBuilder: "Menusamenstelling",
  couvertCalculator: "Couvert-calculator",
  shotlistBuilder: "Shotlist",
  galleryDelivery: "Galerij-oplevering",
  videoDelivery: "Video-oplevering",
  bruidsteamBuilder: "Bruidsteam",
  materialChecklist: "Materiaalchecklist",
  venueRooms: "Locatieruimtes",
  vendorAccessTimes: "Toegangstijden leveranciers",
  dayOfContact: "Contactpersoon op de dag zelf",
  rittenPlanner: "Rittenplanner",
  chauffeurInfo: "Chauffeursinformatie",
  portieCalculator: "Portie-calculator",
};

// Modules die daadwerkelijk los aan/uit te zetten zijn in het dashboard
// (BASE_MODULES zijn verplicht; approvalButton/deliverablesTracker hangen
// niet aan de modules-toggle maar aan andere logica).
export const TOGGLEABLE_MODULE_KEYS: ModuleKey[] = [
  "timelinePlanner",
  "checklistDeadlines",
  "logisticsPanel",
  "moodboardUploader",
  "guestDataPanel",
  "photoUpload",
  "documentUpload",
  "setlistPlanner",
  "menuBuilder",
  "couvertCalculator",
  "shotlistBuilder",
  "galleryDelivery",
  "videoDelivery",
  "bruidsteamBuilder",
  "materialChecklist",
  "venueRooms",
  "vendorAccessTimes",
  "dayOfContact",
  "rittenPlanner",
  "chauffeurInfo",
  "portieCalculator",
];

// ────────────────────────────────────────────────────────────
// Vendor type configurations
// ────────────────────────────────────────────────────────────

export const VENDOR_TYPE_CONFIGS: VendorTypeConfig[] = [
  // ── Planning & Coördinatie ───────────────────────────────

  {
    // Omvat ook de rol van ceremoniemeester (dagcoördinatie, aankondigingen) —
    // die is als los type samengevoegd omdat de behoeftes (tijdlijn, checklist)
    // identiek zijn aan die van de weddingplanner.
    type: "weddingplanner",
    label: "Weddingplanner",
    modules: ["checklistDeadlines", "timelinePlanner"],
    intakeFields: [
      { key: "scope", label: "Scope van opdracht", type: "text", placeholder: "Volledig, dag-van, advies..." },
      { key: "budget", label: "Totaalbudget (€)", type: "number", placeholder: "Bijv. 25000" },
      { key: "beslisbevoegdheid", label: "Beslisbevoegdheid", type: "text", placeholder: "Wie mag akkoord geven?" },
      { key: "rolafbakening", label: "Rolafbakening (indien ook ceremoniemeester)", type: "longtext", placeholder: "Dagcoördinatie, aankondigingen, gasten begeleiden..." },
      { key: "sprekers", label: "Sprekers & volgorde", type: "longtext", placeholder: "Naam, onderwerp, duur per spreker" },
      { key: "verrassingen", label: "Verrassingen & speciale momenten", type: "longtext", placeholder: "Flash mob, surprise optreden, etc." },
    ],
    deliverables: [
      { key: "projectplan", label: "Projectplan" },
      { key: "leveranciersoverzicht", label: "Leveranciersoverzicht" },
      { key: "draaiboek", label: "Draaiboek dag-van" },
      { key: "aankondigingen", label: "Aankondigingsteksten" },
    ],
    timelineTemplate: [
      { key: "regie-overzicht", label: "Regie & overzicht alle blokken", phase: "custom", defaultDuration: 480 },
      { key: "aankomst-cmc", label: "Aankomst ceremoniemeester", phase: "arrival", defaultDuration: 30 },
      { key: "aankondigingen", label: "Aankondigingen & cues", phase: "perform", defaultDuration: 360 },
    ],
    logisticsFields: [],
  },

  {
    type: "ceremoniespreker",
    label: "Ceremoniespreker",
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

  // ── Beeld & Video ────────────────────────────────────────

  {
    type: "fotograaf",
    label: "Fotograaf",
    modules: ["deliverablesTracker", "timelinePlanner", "shotlistBuilder", "galleryDelivery"],
    intakeFields: [
      {
        key: "stijl",
        label: "Fotografiestijl",
        type: "select",
        options: ["Documentair", "Klassiek", "Editorial", "Romantisch", "Reportage"],
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
    // Omvat ook Content Creator (social-mediacontent) — zelfde soort
    // deliverable-cyclus (opnemen → korte clips → definitief) als video.
    type: "videograaf",
    label: "Videograaf",
    modules: ["deliverablesTracker", "timelinePlanner", "videoDelivery"],
    intakeFields: [
      {
        key: "eindproduct",
        label: "Eindproduct",
        type: "select",
        options: ["Highlight film (3–5 min)", "Cinematic film (10–15 min)", "Documentary (30+ min)", "Same-day edit"],
      },
      { key: "drone", label: "Drone-opnames gewenst?", type: "boolean" },
      { key: "audioGeloften", label: "Aparte audio geloften opnemen?", type: "boolean" },
      { key: "muziekstijl", label: "Favoriete muziekstijl voor de film", type: "text", placeholder: "Bijv. klassiek, emotioneel, jaren 80..." },
      { key: "muziekNummers", label: "Specifieke nummers voor de film", type: "longtext", placeholder: "Geef nummers op die je wil verwerken..." },
      { key: "contentstijl", label: "Contentstijl & feed-esthetiek (indien ook social content)", type: "longtext", placeholder: "Warm, licht, donker, kleurrijk..." },
      { key: "hashtag", label: "Bruiloft hashtag", type: "text", placeholder: "#VanDenBergTrauwt2026" },
      { key: "sameDayEdit", label: "Same-day edit gewenst?", type: "boolean" },
    ],
    deliverables: [
      { key: "ceremonie-audio", label: "Ceremonie-audio (ruwe cut)" },
      { key: "speeches", label: "Speeches compilatie" },
      { key: "teaser", label: "Teaser (1–2 min)", approvalRequired: false },
      { key: "trouwfilm", label: "Trouwfilm (definitief)", approvalRequired: true },
      { key: "stories", label: "Stories (dag-van)" },
      { key: "reels", label: "Reels / korte video" },
    ],
    timelineTemplate: [
      { key: "voorbereiding", label: "Voorbereiding / getting ready", phase: "arrival", defaultDuration: 60 },
      { key: "aankomst-ceremonie", label: "Aankomst ceremonie", phase: "arrival", defaultDuration: 30 },
      { key: "ceremonie", label: "Ceremonie & geloften", phase: "perform", defaultDuration: 45 },
      { key: "eerste-dans", label: "Eerste dans", phase: "perform", defaultDuration: 10 },
      { key: "speeches", label: "Speeches", phase: "perform", defaultDuration: 30 },
      { key: "drone-shot", label: "Drone-shots buitenlocatie", phase: "perform", defaultDuration: 20 },
      { key: "film-deadline", label: "Film deadline levering", phase: "custom", defaultDuration: 0 },
    ],
    logisticsFields: [
      { key: "stroombehoefte", label: "Stroombehoefte (Watt)", type: "number" },
      {
        key: "drone-vergunning",
        label: "Drone-vergunning status",
        type: "select",
        options: ["Nog niet aangevraagd", "Aangevraagd", "Goedgekeurd"],
      },
    ],
  },

  {
    type: "fotocabine",
    label: "Fotocabine",
    modules: ["timelinePlanner"],
    intakeFields: [
      {
        key: "type",
        label: "Type cabine",
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
      { key: "opbouw-cabine", label: "Opbouw fotocabine", phase: "setup", defaultDuration: 60 },
      { key: "cabine-actief", label: "Fotocabine actief tijdens feest", phase: "perform", defaultDuration: 240 },
      { key: "afbouw-cabine", label: "Afbouw fotocabine", phase: "teardown", defaultDuration: 45 },
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
    // Omvat ook overige entertainment-acts (goochelaar, acrobaat, etc.) —
    // die hebben dezelfde kerninformatie nodig (tijdschema, technische rider,
    // stroom/ruimte) als een liveband.
    type: "liveband",
    label: "Liveband & Entertainment",
    modules: ["setlistPlanner", "timelinePlanner", "deliverablesTracker", "logisticsPanel", "documentUpload"],
    intakeFields: [
      {
        key: "genre", label: "Genre & stijl", type: "select",
        options: ["Jazz", "Pop", "Soul / R&B", "Funk", "Rock", "Klassiek / Orkest", "Folk / Akoestisch", "Latin", "Motown", "Gemengd repertoire"],
      },
      { key: "eersteDans", label: "Eerste dans nummer", type: "text", placeholder: "Artiest, titel" },
      { key: "setlist", label: "Setlist wensen", type: "longtext", placeholder: "Genres of specifieke nummers per moment van de dag" },
      { key: "mcRole", label: "MC-rol gewenst?", type: "boolean" },
      { key: "covers", label: "Specifieke covers / verzoeken", type: "longtext", placeholder: "Verzoekjes van het bruidspaar" },
      { key: "typeAct", label: "Type act (indien geen band maar bijv. goochelaar, acrobaat)", type: "text", placeholder: "Goochelaar, acrobaat, caricaturist..." },
      { key: "duur", label: "Duur optreden (minuten)", type: "number" },
      { key: "rider", label: "Technische rider / vereisten", type: "longtext", placeholder: "Ruimte, licht, geluid, kleedkamer..." },
    ],
    deliverables: [
      { key: "setlist", label: "Setlist (definitief)", approvalRequired: true },
      { key: "technische-rider", label: "Technische rider" },
      { key: "soundcheck-tijden", label: "Soundcheck tijdschema" },
      { key: "programmaomschrijving", label: "Programmaomschrijving" },
    ],
    timelineTemplate: [
      { key: "opbouw-apparatuur", label: "Opbouw apparatuur", phase: "setup", defaultDuration: 90 },
      { key: "soundcheck", label: "Soundcheck", phase: "setup", defaultDuration: 60 },
      { key: "optreden-1", label: "Eerste set optreden", phase: "perform", defaultDuration: 60 },
      { key: "pauze-1", label: "Pauze", phase: "custom", defaultDuration: 20 },
      { key: "optreden-2", label: "Tweede set optreden", phase: "perform", defaultDuration: 60 },
      { key: "pauze-2", label: "Pauze", phase: "custom", defaultDuration: 20 },
      { key: "optreden-3", label: "Derde set / toegift", phase: "perform", defaultDuration: 45 },
      { key: "afbreken", label: "Afbreken & laden", phase: "teardown", defaultDuration: 90 },
    ],
    logisticsFields: [
      { key: "soundcheck-tijdstip", label: "Soundcheck tijdstip", type: "time" },
      { key: "aanvangstijd-optreden", label: "Aanvangstijd eerste set", type: "time" },
      { key: "aantal-bandleden", label: "Aantal bandleden", type: "number" },
      { key: "aantal-crew", label: "Aantal crew / technici", type: "number" },
      { key: "stroomvereiste", label: "Stroomvereiste (Watt)", type: "number" },
      { key: "geluidsgrens-db", label: "Geluidsgrens locatie (dB)", type: "number" },
      { key: "podium-afmeting", label: "Podiumafmeting (m²)", type: "text" },
      { key: "kleedkamer", label: "Kleedkamer / backstage vereist?", type: "boolean" },
      { key: "ruimtevereiste", label: "Benodigde ruimte (m²), indien geen podium", type: "text" },
    ],
  },

  {
    type: "vuurwerk",
    label: "Vuurwerk & Effecten",
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
    modules: ["photoUpload", "timelinePlanner", "documentUpload"],
    intakeFields: [
      { key: "palette", label: "Kleurenpalet", type: "color-multi" },
      { key: "flowers", label: "Gewenste bloemen & stijl", type: "text", placeholder: "Rozen, pioenrozen, wild/romantisch..." },
      { key: "allergies", label: "Allergieën (bruidspaar of gasten)", type: "longtext", placeholder: "Bijv. stuifmeelgevoelig, vermijd bepaalde bloemen..." },
      {
        key: "strooibloemenBeleid",
        label: "Strooibloemen-beleid van de locatie",
        type: "select",
        options: ["Biologische strooibloemen toegestaan", "Zijde strooibloemen toegestaan", "Strooien niet toegestaan"],
      },
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
    // Omvat ook Verlichting, Verhuur, Tentverhuur en Drukwerk — allemaal
    // leveranciers die de fysieke aankleding/opbouw van de bruiloft
    // verzorgen, met grotendeels dezelfde soort tijdlijn- en logistiek-
    // behoeftes als decoratie & styling.
    type: "decoratie",
    label: "Decoratie & Styling",
    modules: ["moodboardUploader", "timelinePlanner", "deliverablesTracker", "approvalButton"],
    intakeFields: [
      { key: "thema", label: "Thema & stijl", type: "text", placeholder: "Boho, klassiek, modern, romantisch..." },
      { key: "palette", label: "Kleurenpalet", type: "color-multi" },
      { key: "planPerRuimte", label: "Inrichtingsplan per ruimte", type: "longtext", placeholder: "Foyer, ceremonie, diner, dance floor..." },
      { key: "lichtplanPerZone", label: "Lichtplan per zone (indien ook verlichting)", type: "longtext", placeholder: "Ceremonie, diner, dance floor, exterieur..." },
      { key: "dansvloerEffect", label: "Dance floor lichteffect", type: "text", placeholder: "Moving heads, LED-strip, gobo..." },
      { key: "itemlijst", label: "Itemlijst (indien ook verhuur)", type: "longtext", placeholder: "Tafels, stoelen, servies, linnengoed..." },
      { key: "aantallen", label: "Aantallen per item", type: "longtext" },
      { key: "plattegrond", label: "Plaatsingsplattegrond gewenst?", type: "boolean" },
      { key: "typeTent", label: "Type tent (indien ook tentverhuur)", type: "text", placeholder: "Partytent, tipi, glazen paviljoen, feesttent..." },
      { key: "ondergrond", label: "Ondergrond locatie", type: "text", placeholder: "Gras, klinkers, zand..." },
      { key: "weerplan", label: "Weerplan / plan-B", type: "longtext", placeholder: "Zijwanden, verwarming, vloer bij regen..." },
      { key: "huisstijl", label: "Huisstijl / thema drukwerk (indien ook drukwerk)", type: "text", placeholder: "Kleuren, lettertype, stijl..." },
      { key: "teksten", label: "Benodigde teksten", type: "longtext", placeholder: "Uitnodiging, menukaart, programma, bordje..." },
      { key: "oplage", label: "Oplage per item", type: "longtext", placeholder: "Uitnodiging: 120x, menukaart: 80x..." },
    ],
    deliverables: [
      { key: "moodboard", label: "Moodboard", approvalRequired: true },
      { key: "inrichtingsplan", label: "Inrichtingsplan (definitief)", approvalRequired: true },
      { key: "ceremonie-decor", label: "Ceremonie decor opgeleverd" },
      { key: "diner-decor", label: "Diner decor opgeleverd" },
      { key: "lichtplan", label: "Lichtplan (definitief)" },
      { key: "verhuurlijst", label: "Verhuurlijst (definitief)", approvalRequired: true },
      { key: "tentplan", label: "Tentplan & plattegrond", approvalRequired: true },
      { key: "uitnodiging-proof", label: "Uitnodiging drukproef", approvalRequired: true },
      { key: "menukaart-proof", label: "Menukaart drukproef", approvalRequired: true },
      { key: "programmaboekje", label: "Programmaboekje", approvalRequired: true },
    ],
    timelineTemplate: [
      { key: "opbouw-decoratie", label: "Opbouw decoratie", phase: "setup", defaultDuration: 180 },
      { key: "omzetten-decor", label: "Ceremonie → diner omzetten", phase: "custom", defaultDuration: 45 },
      { key: "afbouw-decoratie", label: "Afbouw decoratie", phase: "teardown", defaultDuration: 120 },
      { key: "opbouw-tent", label: "Opbouw tent (indien van toepassing, dagen vooraf)", phase: "setup", defaultDuration: 480 },
      { key: "afbouw-tent", label: "Afbouw tent", phase: "teardown", defaultDuration: 480 },
    ],
    logisticsFields: [
      { key: "toegang-venue", label: "Toegangstijd venue voor opbouw", type: "time" },
      { key: "huurmateriaal-retour", label: "Huurmateriaal retour datum", type: "text" },
      { key: "stroomvereiste", label: "Stroomvereiste (Watt)", type: "number" },
      { key: "aansluitpunten", label: "Aantal benodigde aansluitpunten", type: "number" },
      { key: "retouradres", label: "Retouradres / -datum verhuurmateriaal", type: "text" },
      { key: "schadebeleid", label: "Schadebeleid", type: "text" },
      { key: "stroomaansluitingTent", label: "Stroomaansluiting tent", type: "boolean" },
      { key: "verwarming", label: "Verwarmingselement aanwezig?", type: "boolean" },
      { key: "vloerNodig", label: "Tentbodem / vloer vereist?", type: "boolean" },
    ],
  },

  // ── Eten & Drinken ───────────────────────────────────────

  {
    // Omvat ook Bar/Cocktails en Koffiebar/Foodtruck — allemaal
    // eten-en-drinken-leveranciers met dezelfde gastenaantal-behoefte.
    type: "catering",
    label: "Catering",
    modules: ["menuBuilder", "couvertCalculator", "guestDataPanel", "deliverablesTracker", "timelinePlanner"],
    readsGuestData: ["counts", "allergies"],
    intakeFields: [
      { key: "menu", label: "Menuvoorstel / -wensen", type: "longtext", placeholder: "Starters, hoofdgerecht, dessert, veganistisch..." },
      { key: "proeverijDatum", label: "Datum proeverij", type: "date" },
      { key: "drankarrangement", label: "Drankarrangement", type: "text", placeholder: "Wijn, bier, frisdrank, open bar..." },
      { key: "kindermaaltijden", label: "Kindermaaltijden gewenst?", type: "boolean" },
      { key: "drankenkaart", label: "Drankenkaart / bar-aanbod (indien ook bar)", type: "longtext", placeholder: "Wijn, bier, cocktails, non-alcoholisch..." },
      { key: "signatureCocktail", label: "Signature cocktail wens", type: "text", placeholder: "Naam en beschrijving" },
      { key: "aanbodFoodtruck", label: "Aanbod koffiebar/foodtruck (indien van toepassing)", type: "longtext", placeholder: "Koffiedranken, thee, foodtruckgerechten..." },
      { key: "serveermoment", label: "Serveermomenten", type: "text", placeholder: "Na ceremonie, bij avondbuffet, doorlopend..." },
    ],
    deliverables: [
      { key: "menukaart", label: "Menukaart (ontwerp)", approvalRequired: true },
      { key: "proeverijverslag", label: "Proeverijverslag" },
      { key: "definitief-menu", label: "Definitief menu", approvalRequired: true },
      { key: "drankenkaart", label: "Drankenkaart (definitief)", approvalRequired: true },
      { key: "benodigde-materialen", label: "Materialen & glaswerk overzicht" },
    ],
    timelineTemplate: [
      { key: "borrel", label: "Borrel / ontvangst", phase: "perform", defaultDuration: 60 },
      { key: "diner-gang-1", label: "Diner – voorgerecht", phase: "perform", defaultDuration: 30 },
      { key: "diner-gang-2", label: "Diner – hoofdgerecht", phase: "perform", defaultDuration: 45 },
      { key: "diner-gang-3", label: "Diner – dessert", phase: "perform", defaultDuration: 30 },
      { key: "avondhap", label: "Avondhap", phase: "perform", defaultDuration: 30 },
      { key: "bar-open", label: "Bar open (indien van toepassing)", phase: "perform", defaultDuration: 360 },
    ],
    logisticsFields: [
      { key: "keukenvoorziening", label: "Keukenvoorzieningen venue", type: "longtext" },
      { key: "serveeroppervlak", label: "Serveerpunten / buffetruimte", type: "text" },
      { key: "personeelsaantal", label: "Aantal servicemedewerkers", type: "number" },
      { key: "stroomaansluiting", label: "Stroomaansluiting (voor koeling/bar/truck)", type: "boolean" },
      { key: "wateraansluiting", label: "Wateraansluiting aanwezig?", type: "boolean" },
      { key: "parkeerplaatsTruck", label: "Parkeerplaats foodtruck geregeld?", type: "boolean" },
    ],
  },

  {
    type: "bakker",
    label: "Bruidstaart & Bakker",
    modules: ["portieCalculator", "moodboardUploader", "timelinePlanner"],
    readsGuestData: ["counts", "allergies"],
    intakeFields: [
      { key: "smaak", label: "Smaak(combinaties)", type: "text", placeholder: "Vanille/framboos, chocolade/salted caramel..." },
      { key: "proeverijDatum", label: "Datum proeverij", type: "date" },
      { key: "designOmschrijving", label: "Taartdesign omschrijving", type: "longtext", placeholder: "Stijl, kleuren, decoraties, topper..." },
      { key: "verdiepingen", label: "Aantal verdiepingen", type: "number" },
      { key: "portiesExtra", label: "Extra porties (buffet/gasten onzeker)", type: "number", placeholder: "bv. 10" },
    ],
    deliverables: [
      { key: "smaakproef", label: "Smaakproef resultaat" },
      { key: "design-proof", label: "Design visualisatie / schets", approvalRequired: true },
      { key: "definitieve-taart", label: "Definitieve taart bezorgd" },
    ],
    timelineTemplate: [
      { key: "bezorging-taart", label: "Bezorging taart bij venue", phase: "arrival", defaultDuration: 30 },
      { key: "opbouw-taart", label: "Opbouw / plaatsing taart", phase: "setup", defaultDuration: 20 },
      { key: "aansnijmoment", label: "Aansnijmoment", phase: "perform", defaultDuration: 15 },
    ],
    logisticsFields: [
      { key: "koeling-taart", label: "Koelruimte bij venue aanwezig?", type: "boolean" },
      { key: "taartmes-aanwezig", label: "Taartmes & schep aanwezig bij venue?", type: "boolean" },
      { key: "bezorgmoment", label: "Bezorg- of ophaalmoment", type: "text", placeholder: "bv. zaterdag 10:00 bij de venue" },
      { key: "afleveradres", label: "Afleveradres venue", type: "text", placeholder: "Straatnaam + huisnummer, Stad" },
      { key: "contactVenue", label: "Contactpersoon op de venue", type: "text", placeholder: "Naam + telefoonnummer" },
    ],
  },

  // ── Locatie & Verhuur ────────────────────────────────────

  {
    type: "trouwlocatie",
    label: "Trouwlocatie",
    modules: ["timelinePlanner", "venueRooms", "vendorAccessTimes", "dayOfContact", "fileVault"],
    intakeFields: [
      { key: "capaciteit", label: "Capaciteit (max. personen)", type: "number" },
      { key: "eindtijd", label: "Eindtijd evenement", type: "time" },
      { key: "huisregels", label: "Huisregels & restricties", type: "longtext", placeholder: "Geluidsgrens, confetti-beleid, rookbeleid..." },
      { key: "annuleringsbeleid", label: "Annuleringsbeleid", type: "longtext", placeholder: "Voorwaarden bij annulering..." },
    ],
    deliverables: [
      { key: "leveranciersrooster", label: "Leverancierstoegang rooster" },
      { key: "plattegrond", label: "Plattegrond venue" },
      { key: "ceremonieopstelling", label: "Ceremonieopstelling plan" },
    ],
    timelineTemplate: [
      { key: "leverancierstoegang", label: "Leverancierstoegang start", phase: "arrival", defaultDuration: 0 },
      { key: "opbouw-decoratie", label: "Opbouw decoratie / styling", phase: "setup", defaultDuration: 120 },
      { key: "opbouw-catering", label: "Opbouw catering", phase: "setup", defaultDuration: 90 },
      { key: "ontvangst-gasten", label: "Ontvangst gasten", phase: "perform", defaultDuration: 30 },
      { key: "ceremonie", label: "Ceremonie", phase: "perform", defaultDuration: 45 },
      { key: "diner", label: "Diner", phase: "perform", defaultDuration: 120 },
      { key: "feest", label: "Feest / dansvloer open", phase: "perform", defaultDuration: 180 },
      { key: "oplevering-locatie", label: "Oplevering locatie aan bruidspaar", phase: "custom", defaultDuration: 15 },
      { key: "eindtijd-locatie", label: "Eindtijd evenement", phase: "teardown", defaultDuration: 0 },
      { key: "afbouw", label: "Afbouw & schoonmaak", phase: "teardown", defaultDuration: 120 },
    ],
    logisticsFields: [
      { key: "parkeergelegenheid", label: "Parkeergelegenheid aanwezig?", type: "boolean" },
      { key: "toegankelijkheid-rolstoel", label: "Rolstoeltoegankelijk (gehele locatie)?", type: "boolean" },
      { key: "toegankelijkheid-lift", label: "Lift aanwezig?", type: "boolean" },
      { key: "toegankelijkheid-mindervalide-toilet", label: "Mindervalidentoilet aanwezig?", type: "boolean" },
      { key: "catering-beleid", label: "Cateringbeleid", type: "select", options: ["Eigen catering verplicht", "Externe catering toegestaan", "Externe catering mits gecertificeerd", "Vrije keuze"] },
      { key: "geluidsgrens", label: "Geluidsgrens (dB)", type: "text" },
      { key: "setupTimeOverride", label: "Opbouwtijd (alleen voor deze bruiloft, leeg = standaard)", type: "time" },
      { key: "teardownTimeOverride", label: "Afbouwtijd (alleen voor deze bruiloft, leeg = standaard)", type: "time" },
    ],
  },

  // ── Vervoer ──────────────────────────────────────────────

  {
    // Omvat ook Trouwauto (subset van dit type) en Gastenvervoer
    // (groepsvervoer met opstap-/afzetpunten i.p.v. individuele adressen).
    type: "vervoer",
    label: "Vervoer",
    modules: ["timelinePlanner", "rittenPlanner", "chauffeurInfo", "logisticsPanel", "guestDataPanel"],
    readsGuestData: ["counts"],
    intakeFields: [
      {
        key: "type",
        label: "Type voertuig",
        type: "select",
        options: ["Oldtimer", "Limousine", "Vintage bus", "Cabriolet", "Paarden-koets", "Motor + sidecar", "Elektrisch", "Overig"],
      },
      { key: "ingeboektVoertuig", label: "Ingeboekt voertuig (model / naam)", type: "text", placeholder: "bv. Rolls Royce Silver Shadow 1975" },
      { key: "passagiers", label: "Aantal passagiers", type: "number" },
      { key: "decoratie", label: "Decoratiewensen", type: "text", placeholder: "Linten, bloemen, blikjes..." },
      { key: "ophaaladresBruid", label: "Ophaaladres bruid", type: "text", placeholder: "Straatnaam + huisnummer, Stad" },
      { key: "ophaaladresBruidegom", label: "Ophaaladres bruidegom", type: "text", placeholder: "Straatnaam + huisnummer, Stad" },
      { key: "ceremoniepunt", label: "Adres ceremonie", type: "text", placeholder: "Naam locatie, Straat, Stad" },
      { key: "receptieLocatie", label: "Adres receptie / feest", type: "text", placeholder: "Naam locatie, Straat, Stad" },
      { key: "eindpunt", label: "Eindbestemming (hotel / thuis)", type: "text", placeholder: "Straatnaam + huisnummer, Stad" },
      { key: "opstappunten", label: "Opstappunten (indien groepsvervoer gasten)", type: "longtext", placeholder: "Station, hotel, parkeerplaats..." },
      { key: "afzetpunten", label: "Afzetpunten / terugrit", type: "longtext", placeholder: "Na feest: hotels, stations..." },
    ],
    deliverables: [
      { key: "rittenplan", label: "Rittenplan (definitief)", approvalRequired: true },
      { key: "adressen", label: "Bevestigde adressen & tijden" },
      { key: "boekingsbevestiging", label: "Boekingsbevestiging / contract" },
      { key: "routeplan", label: "Routeplan & tijdschema (groepsvervoer)" },
    ],
    timelineTemplate: [
      { key: "vertrek-naar-bruid", label: "Vertrek richting ophaaladres bruid", phase: "arrival", defaultDuration: 30 },
      { key: "ophaal-bruid", label: "Ophalen bruid", phase: "arrival", defaultDuration: 15 },
      { key: "ophaal-bruidegom", label: "Ophalen bruidegom (indien apart)", phase: "arrival", defaultDuration: 15 },
      { key: "aankomst-ceremonie", label: "Aankomst ceremonie", phase: "perform", defaultDuration: 0 },
      { key: "wachttijd-ceremonie", label: "Wachttijd tijdens ceremonie", phase: "perform", defaultDuration: 60 },
      { key: "vertrek-naar-receptie", label: "Vertrek naar receptie / fotoshoot", phase: "perform", defaultDuration: 30 },
      { key: "aankomst-receptie", label: "Aankomst receptie", phase: "perform", defaultDuration: 0 },
      { key: "eindrit", label: "Eindrit naar hotel / thuis", phase: "teardown", defaultDuration: 45 },
      { key: "einde-dienst", label: "Einde dienst", phase: "teardown", defaultDuration: 0 },
    ],
    logisticsFields: [
      { key: "parkeerplaats", label: "Parkeerplaats bij locatie geregeld?", type: "boolean" },
      { key: "verzekering", label: "Verzekerd voor personenvervoer?", type: "boolean" },
      { key: "bijzonderheden-route", label: "Bijzonderheden rijroute", type: "text", placeholder: "Wegwerkzaamheden, omleidingen, brug..." },
      { key: "alternatief-bij-pech", label: "Alternatief voertuig bij pech?", type: "boolean" },
      { key: "chauffeurContact", label: "Chauffeur contactnummer", type: "text" },
    ],
  },

  // ── Beauty ───────────────────────────────────────────────

  {
    // Omvat ook Visagist — vrijwel identieke behoeftes (proefsessie, allergieën, look).
    type: "haarstylist",
    label: "Haar & Make-up",
    modules: ["moodboardUploader", "timelinePlanner", "bruidsteamBuilder", "materialChecklist"],
    intakeFields: [
      { key: "trialDatum", label: "Datum proefsessie", type: "date" },
      { key: "allergies", label: "Productallergieën", type: "text", placeholder: "Bijv. latex, parfum, specifieke ingrediënten" },
      { key: "aantalPersonen", label: "Aantal personen", type: "number" },
      { key: "behandeltijdPerPersoon", label: "Behandeltijd per persoon (minuten)", type: "number", placeholder: "Bijv. 45" },
      { key: "look", label: "Gewenste make-up look", type: "longtext", placeholder: "Natural, dramatic, smoky eye, no-make-up look..." },
    ],
    deliverables: [
      { key: "trial-resultaat", label: "Trial resultaat (foto's)", approvalRequired: true },
      { key: "definitieve-look", label: "Definitieve look bevestigd" },
    ],
    timelineTemplate: [
      { key: "aankomst-opbouw", label: "Aankomst & opbouw materiaal", phase: "arrival", defaultDuration: 30 },
      { key: "bruid-haar-makeup", label: "Bruid: haar & make-up", phase: "perform", defaultDuration: 90 },
      { key: "bruidsmeisjes", label: "Bruidsmeisjes & moeder", phase: "perform", defaultDuration: 120 },
      { key: "check-touchup", label: "Check & touch-ups voor ceremonie", phase: "custom", defaultDuration: 15 },
      { key: "einde-sessie", label: "Einde sessie & opruimen", phase: "teardown", defaultDuration: 20 },
    ],
    logisticsFields: [
      { key: "locatie-sessie", label: "Locatie sessie (thuis / hotel / venue)", type: "text" },
      { key: "parkeer-mogelijkheid", label: "Parkeermogelijkheid aanwezig?", type: "boolean" },
    ],
  },

  // ── Mode & Accessoires ───────────────────────────────────

  {
    type: "bruidsmode",
    label: "Bruidsmode",
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

  // ── Logistiek & Diversen ─────────────────────────────────

  {
    type: "overnachting",
    label: "Overnachting",
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
