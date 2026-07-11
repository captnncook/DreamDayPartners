// Blogartikelen — statische content voor /blog.
// Elk artikel is een array van paragrafen; koppen beginnen met "## ".

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingMinutes: number;
  category: string;
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "draaiboek-trouwdag-maken",
    title: "Zo maak je een draaiboek voor je trouwdag (zonder er gek van te worden)",
    excerpt: "Een goed draaiboek is geen minutenschema van 14 pagina's. Het is één document waar iedereen op vertrouwt. Zo bouw je het op.",
    date: "2026-06-28",
    readingMinutes: 6,
    category: "Planning",
    content: [
      "Vraag tien pas getrouwde stellen naar hun trouwdag en negen vertellen je hetzelfde: de dag vliegt voorbij. Wat het verschil maakt tussen 'voorbijvliegen' en 'voorbijrazen in chaos' is bijna altijd het draaiboek. Niet omdat alles volgens plan verloopt (dat doet het nooit), maar omdat iedereen weet wat het plan wás, en dus ook hoe je terugkomt op koers.",
      "## Begin achteraan",
      "De grootste beginnersfout is vooraan beginnen: hoe laat staan we op, hoe laat komt de visagiste. Draai het om. Begin bij het moment dat vaststaat, meestal de ceremonie of het eerste officiële moment op de locatie, en reken terug. Als de ceremonie om 15:00 begint en de locatie 45 minuten rijden is, en je wilt een kwartier marge, dan weet je dat de auto's om 14:00 moeten vertrekken. Zo werkt elke tijd zich vanzelf uit.",
      "## Eén versie van de waarheid",
      "Het klassieke probleem: de fotograaf heeft versie 3 van het schema, de DJ versie 5, en de ceremoniespreker een screenshot uit een appgroep. Elke wijziging betekent zeven mailtjes, en er gaat er altijd één mis. De oplossing is simpel: één gedeeld draaiboek waar iedereen in dezelfde versie kijkt. Verandert er iets, dan ziet iedereen dat meteen.",
      "## Bouw marge in waar het pijn doet",
      "Niet elke vertraging is even erg. Tien minuten uitloop bij het diner merkt niemand. Tien minuten uitloop bij hair en make-up schuift wél de hele ochtend op, want daarachter staan de fotograaf, de first look en het vertrek. Vuistregel: bouw marge in vóór de momenten die niet kunnen schuiven, en wees ontspannen over de rest.",
      "## Wijs één aanspreekpunt aan",
      "Op de dag zelf wil je als bruidspaar geen telefoon in je hand. Wijs iemand aan (een weddingplanner, ceremoniemeester of die ene organisatorisch sterke vriendin) die het draaiboek kent en beslissingen mag nemen. Zet de naam en het nummer van die persoon bovenaan het draaiboek, zodat elke leverancier weet wie te bellen.",
      "## Deel het op tijd, maar niet te vroeg",
      "Stuur het definitieve draaiboek twee weken van tevoren naar alle leveranciers. Vroeger heeft weinig zin (er verandert toch nog van alles), later wordt krap voor leveranciers die hun eigen planning erop bouwen. En print één papieren exemplaar voor op de dag zelf. Batterijen raken leeg, papier niet.",
    ],
  },
  {
    slug: "vragen-aan-je-trouwfotograaf",
    title: "10 vragen die je elke trouwfotograaf zou moeten stellen",
    excerpt: "De foto's zijn het enige dat je overhoudt van de dag. Deze tien vragen scheiden de vakmensen van de mooie Instagram-pagina's.",
    date: "2026-06-14",
    readingMinutes: 5,
    category: "Leveranciers",
    content: [
      "Een trouwfotograaf boek je gemiddeld een jaar van tevoren, op basis van een portfolio met andermans bruiloften. Dat maakt het kiezen lastig: iedereen laat alleen zijn beste werk zien. De volgende vragen helpen je voorbij het portfolio te kijken.",
      "## 1. Mag ik één complete bruiloft zien?",
      "Niet de highlights, maar alles wat een echt bruidspaar geleverd kreeg. Zo zie je hoe de fotograaf omgaat met de rommelige momenten: de donkere feestzaal, de regenbui, tante die met flitser door het beeld loopt.",
      "## 2. Wat gebeurt er als je ziek bent op onze trouwdag?",
      "Goede fotografen hebben een netwerk van collega's als achtervang en kunnen precies vertellen hoe die regeling werkt. Wie hier vaag over doet, heeft het niet geregeld.",
      "## 3. Hoe lang duurt het voor we alles hebben?",
      "Vraag naar twee termijnen: de eerste preview (vaak binnen een week) en de volledige levering. Alles boven drie maanden voor de volledige set verdient een goede uitleg.",
      "## 4. Wie bewerkt de foto's, en hoeveel?",
      "Sommige fotografen besteden de nabewerking uit. Dat hoeft geen probleem te zijn, maar je wilt het wél weten, want de bewerkingsstijl bepaalt hoe jouw foto's er over tien jaar uitzien.",
      "## 5. Hoe werk je samen met een videograaf?",
      "Foto en video op één dag vraagt afstemming over posities en momenten. Een fotograaf die hier soepel over praat, heeft het vaker gedaan. Een fotograaf die zucht, wordt op de dag zelf een probleem.",
      "## 6 tot 10: de praktische set",
      "Vraag ook altijd: staat de btw in de offerte? Hoeveel uur zit er in het pakket en wat kost uitloop? Ben je verzekerd? Hoe lang bewaar je de bestanden? En: wanneer eet jij, en verwacht je een leveranciersmaaltijd? Die laatste klinkt banaal, maar een fotograaf die om 21:00 nog niets gegeten heeft, mist je openingsdans.",
      "Tot slot het belangrijkste advies dat geen vraag is: plan een kennismakingsgesprek, desnoods per video. Deze persoon staat de hele dag naast je op de meest emotionele momenten. Als het niet klikt, worden de foto's het ook niet.",
    ],
  },
  {
    slug: "wat-kost-een-bruiloft-in-nederland",
    title: "Wat kost een bruiloft in Nederland? Een eerlijk overzicht",
    excerpt: "Gemiddeldes zeggen weinig als de spreiding enorm is. Dit is hoe een bruiloftsbudget echt is opgebouwd, en waar de verrassingen zitten.",
    date: "2026-05-30",
    readingMinutes: 7,
    category: "Budget",
    content: [
      "Zoek op 'gemiddelde kosten bruiloft' en je vindt bedragen tussen de 10.000 en 30.000 euro. Allebei waar, allebei nutteloos. De spreiding is zo groot dat het gemiddelde niets zegt over jouw bruiloft. Nuttiger is begrijpen hoe het budget is opgebouwd, want de verhoudingen zijn bij bijna elke bruiloft hetzelfde.",
      "## De grote drie: locatie, catering, feest",
      "Locatie en catering samen zijn bijna altijd 40 tot 50 procent van het totaalbudget. Dat is geen toeval: het zijn de twee posten die met elke gast meegroeien. Daarom is je gastenaantal de belangrijkste budgetknop die je hebt. Van 100 naar 80 gasten scheelt al snel duizenden euro's, terwijl 500 euro besparen op bloemen vooral heel veel gedoe oplevert.",
      "## De middenmoot: foto, video, muziek, kleding",
      "Fotografie (1.500 tot 3.500 euro), videografie (vergelijkbaar), DJ of band (750 tot 4.000 euro) en kleding vormen samen zo'n 25 tot 30 procent. Hier zit de grootste kwaliteitsspreiding: het verschil tussen een fotograaf van 1.500 en 3.000 euro is vaak echt zichtbaar, terwijl het verschil tussen trouwauto's vooral in het logo zit.",
      "## De sluipmoordenaars",
      "De posten die begrotingen laten ontsporen zijn zelden de grote. Het zijn de kleine dingen die je per stuk 'ach, dat kan er wel bij' vindt: bedankjes voor gasten, extra borrelhapjes, de proefsessie visagie, bezorgkosten van zeven verschillende leveranciers, kurkengeld, de verlenging van het feest met een uur. Reken op 10 tot 15 procent onvoorzien, en wees er blij mee als je het niet nodig hebt.",
      "## Wat niemand je vertelt over aanbetalingen",
      "Je budget is niet één bedrag op één moment. Vrijwel elke leverancier vraagt een aanbetaling bij het boeken (vaak 25 tot 50 procent), en de rest in de weken rond de bruiloft. Als je in september trouwt en in januari boekt, geef je dus al in januari serieus geld uit. Zet naast je begroting ook een betaalkalender: wanneer moet wat betaald zijn, en aan wie. Het voorkomt zowel gemiste deadlines als de schrik van drie facturen in één week.",
      "## De enige budgetregel die altijd werkt",
      "Bepaal eerst met z'n tweeën wat de dag voor jullie betekent en welke drie dingen er echt toe doen. Geef daar ruim aan uit, en wees meedogenloos saai over de rest. De bruiloften die uit de hand lopen zijn zelden de bruiloften met een duur draaiboekonderdeel; het zijn de bruiloften waar álles een beetje duurder werd.",
    ],
  },
  {
    slug: "gastenlijst-belangrijkste-planningsdocument",
    title: "Waarom je gastenlijst je belangrijkste planningsdocument is",
    excerpt: "Niet het moodboard, niet het draaiboek: de gastenlijst. Elke leverancier rekent ermee, en elke wijziging werkt overal in door.",
    date: "2026-05-12",
    readingMinutes: 5,
    category: "Planning",
    content: [
      "Er is één document waar je cateraar, je bakker, je locatie, je vervoerder en je stylist allemaal iets mee moeten: de gastenlijst. Toch behandelen de meeste stellen het als een simpel lijstje namen, ergens in een spreadsheet die alleen zijzelf kunnen vinden. Dat wreekt zich, meestal twee weken voor de bruiloft.",
      "## Alles rekent met je gastenaantal",
      "De cateraar rekent per couvert. De bakker bepaalt het aantal taartlagen op je aantal. De locatie toetst of je binnen de capaciteit van de zaal blijft. De vervoerder telt zitplaatsen. Verandert je aantal van 90 naar 82, dan zou dat bij vijf leveranciers iets moeten wijzigen. In de praktijk hoort de helft het te laat, en betaal je voor acht maaltijden die niemand eet.",
      "## De lijst is nooit af, en dat is oké",
      "Een gastenlijst is geen document dat je één keer maakt, maar een levend ding dat tot de laatste week verandert. Er komen afmeldingen, er komt een onverwachte plus-één, iemand blijkt zwanger en drinkt niet mee met het wijnarrangement. Plan daarop: spreek met je cateraar af tot welke datum het definitieve aantal mag wijzigen, en zet die datum groot in je agenda.",
      "## Dieetwensen zijn geen bijzaak",
      "Vraag dieetwensen uit bij de uitnodiging, niet twee weken van tevoren via een paniekerig groepsbericht. Een goede RSVP vraagt in één moeite naam, aanwezigheid, dieetwensen en of iemand een introducee meeneemt. En zorg dat die informatie bij de cateraar én de bakker terechtkomt; een notenallergie is bij allebei relevant.",
      "## Houd één lijst bij, op één plek",
      "Het echte probleem is bijna nooit de informatie zelf, maar de versies ervan. De lijst in je mail is anders dan die in de spreadsheet, die weer anders is dan wat de cateraar genoteerd heeft. Kies één plek waar de lijst leeft en waar iedereen die het nodig heeft meekijkt in de actuele stand. Dan wordt een wijziging doorvoeren één handeling in plaats van vijf telefoontjes.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
