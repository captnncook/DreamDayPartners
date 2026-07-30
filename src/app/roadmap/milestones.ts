export type Status = "done" | "current" | "upcoming";

export type Milestone = {
  period: string;
  title: string;
  description: string;
  status: Status;
  image: string;
  imageAlt: string;
};

// Richtdatums zijn indicatief en kunnen opschuiven — de kern (bèta, veiligheidscheck,
// lancering) is de vaste volgorde, de exacte week hangt af van wat de bèta oplevert.
export const MILESTONES: Milestone[] = [
  {
    period: "Afgerond",
    title: "Kernplatform",
    description: "Draaiboek, gastenlijst, budget, berichten en het Dream Team waarin bruidspaar, planner en leveranciers samenwerken.",
    status: "done",
    image: "/images/hero-bride-phone.png",
    imageAlt: "Bruid bekijkt de trouwdag-checklist en aftellen in de DreamDay-app",
  },
  {
    period: "Afgerond",
    title: "Abonnementen & betalingen",
    description: "Premium-abonnement voor leveranciers via Stripe, maandelijks opzegbaar, met facturatieportaal.",
    status: "done",
    image: "/images/app-ipad.png",
    imageAlt: "Weddingplanner bekijkt haar DreamDay-dashboard op een tablet",
  },
  {
    period: "Nu bezig",
    title: "Leveranciers-catalogus vullen",
    description: "Eerste leveranciers per categorie en regio toevoegen, zodat bruidsparen bij lancering echt iets te kiezen hebben.",
    status: "current",
    image: "/images/planner-outdoor.png",
    imageAlt: "Weddingplanner coördineert leveranciers op locatie met DreamDay op haar tablet",
  },
  {
    period: "Komende weken",
    title: "Besloten bèta",
    description: "Een kleine groep weddingplanners, bruidsparen en leveranciers gebruikt het platform in het echt. We verzamelen feedback en lossen knelpunten op voordat de deuren opengaan.",
    status: "upcoming",
    image: "/images/bride-sofa.png",
    imageAlt: "Bruid gebruikt lachend de DreamDay-app terwijl ze zich klaarmaakt",
  },
  {
    period: "Voor lancering",
    title: "Veiligheid & betrouwbaarheid",
    description: "AVG-check, back-ups en monitoring, en een laatste beveiligingsreview voordat we met echte gegevens live gaan.",
    status: "upcoming",
    image: "/images/phone-table.png",
    imageAlt: "Telefoon met DreamDay-logo rustig op tafel, symbool voor een zorgvuldig en rustig proces",
  },
  {
    period: "Doel: Q4 2026",
    title: "Publieke lancering",
    description: "De website en het dashboard gaan open voor iedereen — bruidsparen, weddingplanners en leveranciers.",
    status: "upcoming",
    image: "/images/future-planning.png",
    imageAlt: "The Future of Wedding Planning — DreamDay merkbeeld",
  },
];
