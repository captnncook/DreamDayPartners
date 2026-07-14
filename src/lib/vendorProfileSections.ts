// ============================================================
// vendorProfileSections.ts
// Categorie-specifieke velden voor de "Profiel bewerken"-pagina van
// leveranciers. Los van vendorTypeConfigs.ts (dat gaat over per-bruiloft
// intake/modules) — dit zijn algemene, publieke profielgegevens die
// bruidsparen op het leveranciersprofiel te zien krijgen, ongeacht welke
// bruiloft. Elke categorie heeft hier een sectie; categorieën zonder eigen
// configuratie vallen terug op DEFAULT_PROFILE_FIELDS zodat letterlijk
// elke leverancierssoort een profielsectie heeft.
// ============================================================

export type ProfileFieldType = "text" | "longtext" | "number" | "boolean" | "multiselect" | "select";

export interface ProfileField {
  key: string;
  label: string;
  type: ProfileFieldType;
  placeholder?: string;
  options?: string[];
}

export interface VendorProfileSection {
  title: string;
  fields: ProfileField[];
}

const DEFAULT_PROFILE_FIELDS: ProfileField[] = [
  { key: "werkwijze", label: "Werkwijze", type: "longtext", placeholder: "Hoe werk je, en wat kan een bruidspaar van je verwachten?" },
  { key: "ervaring", label: "Ervaring", type: "text", placeholder: "bijv. 8 jaar, 150+ bruiloften" },
];

export const VENDOR_PROFILE_SECTIONS: Record<string, VendorProfileSection> = {
  weddingplanner: {
    title: "Weddingplanner-profiel",
    fields: [
      { key: "scopeOpties", label: "Aangeboden scope", type: "multiselect", options: ["Volledige planning", "Dag-van coördinatie", "Advies op afstand", "Partieel (losse onderdelen)"] },
      { key: "werkgebied", label: "Werkgebied", type: "text", placeholder: "bijv. heel Nederland, regio Utrecht" },
      { key: "aantalPerJaar", label: "Aantal bruiloften per jaar", type: "number" },
    ],
  },
  fotograaf: {
    title: "Fotograaf-profiel",
    fields: [
      { key: "stijlen", label: "Fotografiestijlen", type: "multiselect", options: ["Documentair", "Klassiek", "Editorial", "Romantisch", "Reportage"] },
      { key: "pakketten", label: "Pakketten & wat erin zit", type: "longtext", placeholder: "bijv. 8 uur verslaglegging, digitale bestanden, album optioneel" },
      { key: "tweedeFotograaf", label: "Tweede fotograaf mogelijk", type: "boolean" },
      { key: "reisbereidheid", label: "Reisbereidheid buiten regio", type: "boolean" },
    ],
  },
  videograaf: {
    title: "Videograaf-profiel",
    fields: [
      { key: "eindproducten", label: "Eindproducten", type: "multiselect", options: ["Highlight film", "Cinematic film", "Documentary", "Same-day edit", "Drone-opnames"] },
      { key: "pakketten", label: "Pakketten & wat erin zit", type: "longtext" },
      { key: "leveringstermijn", label: "Gemiddelde leveringstermijn", type: "text", placeholder: "bijv. 6-8 weken" },
    ],
  },
  contentcreator: {
    title: "Content Creator-profiel",
    fields: [
      { key: "diensten", label: "Diensten", type: "multiselect", options: ["Instagram stories", "Reels", "TikTok content", "Same-day edit"] },
      { key: "pakketten", label: "Pakketten & wat erin zit", type: "longtext" },
    ],
  },
  fotocabine: {
    title: "Fotocabine-profiel",
    fields: [
      { key: "types", label: "Type cabines", type: "multiselect", options: ["Open", "Gesloten", "Spiegel"] },
      { key: "props", label: "Props & accessoires inbegrepen", type: "longtext" },
      { key: "printOpties", label: "Direct printen mogelijk", type: "boolean" },
    ],
  },
  fotoboothspeciaal: {
    title: "Fotobooth-profiel",
    fields: [
      { key: "types", label: "Type fotobooths", type: "multiselect", options: ["Open", "Gesloten", "Spiegel", "360-graden", "Neon"] },
      { key: "props", label: "Props & accessoires inbegrepen", type: "longtext" },
    ],
  },
  dj: {
    title: "DJ-profiel",
    fields: [
      { key: "genres", label: "Muziekgenres", type: "multiselect", options: ["Commercieel", "R&B", "Jaren 80/90", "Latin", "House", "Klassiek"] },
      { key: "eigenApparatuur", label: "Eigen apparatuur meegenomen", type: "boolean" },
      { key: "mcRol", label: "MC-diensten mogelijk", type: "boolean" },
      { key: "speeltijd", label: "Gebruikelijke speeltijd", type: "text", placeholder: "bijv. 5 uur, uit te breiden" },
    ],
  },
  liveband: {
    title: "Liveband-profiel",
    fields: [
      { key: "genres", label: "Genre & stijl", type: "multiselect", options: ["Jazz", "Pop", "Soul / R&B", "Funk", "Rock", "Klassiek", "Akoestisch", "Latin"] },
      { key: "aantalBandleden", label: "Aantal bandleden", type: "number" },
      { key: "mcRol", label: "MC-diensten mogelijk", type: "boolean" },
    ],
  },
  entertainment: {
    title: "Entertainment-profiel",
    fields: [
      { key: "typesActs", label: "Type acts", type: "text", placeholder: "bijv. goochelaar, acrobaat, caricaturist" },
      { key: "duurOptreden", label: "Gebruikelijke duur optreden (minuten)", type: "number" },
    ],
  },
  vuurwerk: {
    title: "Vuurwerk & Effecten-profiel",
    fields: [
      { key: "types", label: "Type vuurwerk/effecten", type: "text", placeholder: "bijv. fonteinen, indoor confetti, outdoor show" },
      { key: "vergunningRegeling", label: "Regelt zelf vergunning", type: "boolean" },
    ],
  },
  bloemist: {
    title: "Bloemist-profiel",
    fields: [
      { key: "diensten", label: "Diensten", type: "multiselect", options: ["Bruidsboeket", "Corsages", "Tafeldecoratie", "Bloemenboog", "Ceremonie-decor"] },
      { key: "bezorging", label: "Bezorging & opbouw mogelijk", type: "boolean" },
      { key: "verhuurmateriaal", label: "Verhuurmateriaal beschikbaar", type: "boolean" },
    ],
  },
  decoratie: {
    title: "Decoratie & Styling-profiel",
    fields: [
      { key: "stijlen", label: "Stijlen", type: "multiselect", options: ["Boho", "Klassiek", "Modern", "Romantisch", "Minimalistisch"] },
      { key: "verhuurOfKoop", label: "Verhuur of koop materiaal", type: "select", options: ["Verhuur", "Koop", "Beide"] },
      { key: "opbouwService", label: "Opbouw & afbouw service", type: "boolean" },
    ],
  },
  verlichting: {
    title: "Verlichting-profiel",
    fields: [
      { key: "types", label: "Type verlichting", type: "text", placeholder: "bijv. moving heads, LED-strip, gobo" },
      { key: "opbouwService", label: "Opbouw & afbouw service", type: "boolean" },
    ],
  },
  catering: {
    title: "Catering-profiel",
    fields: [
      { key: "types", label: "Type catering", type: "multiselect", options: ["Buffet", "Walking dinner", "Diner", "Shared dining", "BBQ", "Foodtruck"] },
      { key: "dieetwensen", label: "Dieetwensen mogelijk", type: "multiselect", options: ["Vegetarisch", "Veganistisch", "Halal", "Koosjer", "Glutenvrij"] },
      { key: "minCouverts", label: "Minimum aantal couverts", type: "number" },
      { key: "proeverij", label: "Proeverij mogelijk", type: "boolean" },
    ],
  },
  bakker: {
    title: "Bakker-profiel",
    fields: [
      { key: "smaken", label: "Beschikbare smaken", type: "text", placeholder: "bijv. vanille/framboos, chocolade/salted caramel" },
      { key: "dieetwensen", label: "Dieetwensen mogelijk", type: "multiselect", options: ["Vegetarisch", "Veganistisch", "Glutenvrij", "Lactosevrij", "Suikervrij"] },
      { key: "proeverij", label: "Proeverij mogelijk", type: "boolean" },
      { key: "bezorging", label: "Bezorging inbegrepen", type: "boolean" },
    ],
  },
  bar: {
    title: "Bar / Cocktails-profiel",
    fields: [
      { key: "aanbod", label: "Aanbod", type: "multiselect", options: ["Wijn", "Bier", "Cocktails", "Non-alcoholisch", "Champagne"] },
      { key: "signatureCocktail", label: "Signature cocktail op maat", type: "boolean" },
    ],
  },
  koffiebar: {
    title: "Koffiebar / Foodtruck-profiel",
    fields: [
      { key: "aanbod", label: "Aanbod", type: "text", placeholder: "bijv. koffie, thee, foodtruckgerechten" },
      { key: "eigenStroomVoorziening", label: "Eigen stroomvoorziening", type: "boolean" },
    ],
  },
  trouwlocatie: {
    title: "Trouwlocatie-profiel",
    fields: [],
  },
  verhuur: {
    title: "Verhuur-profiel",
    fields: [
      { key: "categorieen", label: "Itemcategorieën", type: "multiselect", options: ["Tafels & stoelen", "Servies", "Linnengoed", "Podium", "Tenten"] },
      { key: "bezorgService", label: "Bezorging & plaatsing", type: "boolean" },
    ],
  },
  tentverhuur: {
    title: "Tentverhuur-profiel",
    fields: [
      { key: "types", label: "Type tenten", type: "multiselect", options: ["Partytent", "Tipi", "Glazen paviljoen", "Feesttent"] },
      { key: "weerbestendig", label: "Zijwanden/verwarming beschikbaar", type: "boolean" },
    ],
  },
  vervoer: {
    title: "Vervoer-profiel",
    fields: [
      { key: "types", label: "Type voertuigen", type: "multiselect", options: ["Oldtimer", "Limousine", "Vintage bus", "Cabriolet", "Paarden-koets", "Elektrisch"] },
      { key: "aantalVoertuigen", label: "Aantal beschikbare voertuigen", type: "number" },
      { key: "chauffeurInbegrepen", label: "Chauffeur inbegrepen", type: "boolean" },
    ],
  },
  trouwauto: {
    title: "Trouwauto-profiel",
    fields: [
      { key: "types", label: "Type trouwauto's", type: "multiselect", options: ["Oldtimer", "Limousine", "Cabriolet", "Klassiek", "Elektrisch"] },
      { key: "chauffeurInbegrepen", label: "Chauffeur inbegrepen", type: "boolean" },
    ],
  },
  gastenvervoer: {
    title: "Gastenvervoer-profiel",
    fields: [
      { key: "capaciteit", label: "Capaciteit per rit (personen)", type: "number" },
      { key: "voertuigtype", label: "Voertuigtype", type: "text", placeholder: "bijv. touringcar, minibus" },
    ],
  },
  haarstylist: {
    title: "Haar & Make-up-profiel",
    fields: [
      { key: "aanHuis", label: "Aan huis mogelijk", type: "boolean" },
      { key: "proefsessie", label: "Proefsessie inbegrepen", type: "boolean" },
      { key: "teamGrootte", label: "Team beschikbaar (aantal stylisten)", type: "number" },
    ],
  },
  visagist: {
    title: "Visagist-profiel",
    fields: [
      { key: "aanHuis", label: "Aan huis mogelijk", type: "boolean" },
      { key: "proefsessie", label: "Proefsessie inbegrepen", type: "boolean" },
      { key: "merken", label: "Gebruikte merken/producten", type: "text" },
    ],
  },
  bruidsmode: {
    title: "Bruidsmode-profiel",
    fields: [
      { key: "stijlen", label: "Stijlen", type: "multiselect", options: ["A-lijn", "Ballerina", "Zeemeermin", "Bohemian", "Klassiek"] },
      { key: "opMaat", label: "Op maat maken mogelijk", type: "boolean" },
    ],
  },
  herenmode: {
    title: "Herenmode-profiel",
    fields: [
      { key: "huurOfKoop", label: "Huur of koop", type: "multiselect", options: ["Huur", "Koop", "Op maat"] },
    ],
  },
  juwelier: {
    title: "Juwelier-profiel",
    fields: [
      { key: "opMaat", label: "Ringen op maat maken", type: "boolean" },
      { key: "gravering", label: "Gravering mogelijk", type: "boolean" },
    ],
  },
  drukwerk: {
    title: "Drukwerk-profiel",
    fields: [
      { key: "producten", label: "Producten", type: "multiselect", options: ["Uitnodigingen", "Menukaarten", "Programmaboekjes", "Bordjes/signage"] },
      { key: "opMaatOntwerp", label: "Ontwerp op maat", type: "boolean" },
    ],
  },
  ceremoniespreker: {
    title: "Ceremoniespreker-profiel",
    fields: [
      { key: "toon", label: "Toon", type: "multiselect", options: ["Formeel", "Ontspannen", "Humoristisch", "Poëtisch"] },
      { key: "talen", label: "Talen", type: "text", placeholder: "bijv. Nederlands, Engels" },
    ],
  },
  ceremoniemeester: {
    title: "Ceremoniemeester-profiel",
    fields: [
      { key: "rol", label: "Rol", type: "multiselect", options: ["Dagcoördinatie", "Aankondigingen", "Gasten begeleiden"] },
    ],
  },
  overnachting: {
    title: "Overnachting-profiel",
    fields: [
      { key: "kamertypes", label: "Kamertypes", type: "text", placeholder: "bijv. standaard, deluxe, bruidssuite" },
      { key: "groepskorting", label: "Groepskorting mogelijk", type: "boolean" },
    ],
  },
  kinderoppas: {
    title: "Kinderoppas-profiel",
    fields: [
      { key: "leeftijdsgroepen", label: "Leeftijdsgroepen", type: "text", placeholder: "bijv. 0-2, 3-6, 7-12 jaar" },
      { key: "gediplomeerd", label: "Gediplomeerde oppas", type: "boolean" },
    ],
  },
  bedankjes: {
    title: "Bedankjes & Favors-profiel",
    fields: [
      { key: "types", label: "Type bedankjes", type: "text", placeholder: "bijv. zelfgemaakt, ervaringsgift" },
      { key: "personalisatie", label: "Personalisatie mogelijk", type: "boolean" },
    ],
  },
  huwelijksreis: {
    title: "Huwelijksreis-profiel",
    fields: [
      { key: "bestemmingen", label: "Populaire bestemmingen", type: "text" },
      { key: "opMaat", label: "Reizen op maat samenstellen", type: "boolean" },
    ],
  },
  beveiliging: {
    title: "Beveiliging-profiel",
    fields: [
      { key: "gecertificeerd", label: "Gecertificeerde beveiligers", type: "boolean" },
      { key: "posities", label: "Standaard inzetbare posities", type: "text", placeholder: "bijv. ingang, parkeerplaats" },
    ],
  },
  schoonmaak: {
    title: "Schoonmaak-profiel",
    fields: [
      { key: "scope", label: "Scope", type: "multiselect", options: ["Tussenschoonmaak", "Eindschoonmaak", "Beide"] },
    ],
  },
  trouwverzekering: {
    title: "Trouwverzekering-profiel",
    fields: [
      { key: "dekking", label: "Dekkingsopties", type: "text", placeholder: "bijv. annulering, schade, aansprakelijkheid" },
    ],
  },
  overig: {
    title: "Profiel",
    fields: DEFAULT_PROFILE_FIELDS,
  },
};

export function getVendorProfileSection(category: string): VendorProfileSection {
  const normalized = category.toLowerCase().trim();
  return (
    VENDOR_PROFILE_SECTIONS[normalized] ?? {
      title: "Profiel",
      fields: DEFAULT_PROFILE_FIELDS,
    }
  );
}
