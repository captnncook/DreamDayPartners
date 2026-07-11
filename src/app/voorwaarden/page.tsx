import type { Metadata } from "next";
import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: "De afspraken die gelden wanneer je DreamDay Platform gebruikt als bruidspaar, weddingplanner of leverancier.",
};

export default function VoorwaardenPage() {
  return (
    <PublicPageShell
      title="Algemene voorwaarden"
      intro="Dit zijn de afspraken die gelden als je DreamDay Platform gebruikt. We hebben ze zo geschreven dat je ze ook zonder jurist kunt begrijpen."
    >
      <p className="ddp-prose-meta">Laatst bijgewerkt: juli 2026</p>

      <h2>1. Wat DreamDay is</h2>
      <p>
        DreamDay Platform is een online omgeving waarin bruidsparen, weddingplanners en leveranciers samen een bruiloft
        plannen: met een gedeeld draaiboek, taken, gastenlijst, budget en berichten. Deze voorwaarden gelden voor
        iedereen die een account aanmaakt of het platform gebruikt.
      </p>

      <h2>2. Je account</h2>
      <ul>
        <li>Je bent zelf verantwoordelijk voor de juistheid van de gegevens in je account en voor het geheimhouden van je wachtwoord.</li>
        <li>Een account is persoonlijk. Voor bedrijven geldt: degene die het account aanmaakt, verklaart bevoegd te zijn om namens het bedrijf te handelen.</li>
        <li>We mogen accounts weigeren, beperken of sluiten bij misbruik, fraude of het schenden van deze voorwaarden. Dat doen we niet zomaar; bij twijfel nemen we eerst contact op.</li>
      </ul>

      <h2>3. Gratis voor bruidsparen, premium voor leveranciers</h2>
      <ul>
        <li>Voor bruidsparen is DreamDay gratis. Geen proefperiode, geen verborgen kosten.</li>
        <li>Leveranciers kunnen een premium-abonnement afsluiten (€29 per maand) met extra functies, zoals een uitgebreid profiel in de catalogus, dashboard-aanpassingen en een analytisch overzicht.</li>
        <li>Het abonnement loopt per maand en is <strong>maandelijks opzegbaar</strong> via het facturatieportaal in je profiel. Na opzegging blijft premium actief tot het einde van de betaalde periode; er vindt geen restitutie plaats over de lopende maand.</li>
        <li>Prijswijzigingen kondigen we minimaal 30 dagen van tevoren aan. Ben je het er niet mee eens, dan kun je opzeggen voordat de nieuwe prijs ingaat.</li>
        <li>Betalingen verlopen via Stripe. Bij een mislukte betaling proberen we het opnieuw; blijft betaling uit, dan kunnen we het premium-abonnement pauzeren.</li>
      </ul>

      <h2>4. Wat je met het platform mag (en niet mag)</h2>
      <ul>
        <li>Gebruik het platform waarvoor het bedoeld is: het plannen van bruiloften en het samenwerken daaromheen.</li>
        <li>Niet toegestaan: spam, misleidende profielen, het plaatsen van content waarop je geen rechten hebt, het schrapen van gegevens van andere gebruikers, en alles wat wettelijk niet mag.</li>
        <li>Leveranciers zijn zelf verantwoordelijk voor de juistheid van hun profiel, prijzen en beschikbaarheid.</li>
      </ul>

      <h2>5. Jullie content blijft van jullie</h2>
      <p>
        Alles wat je uploadt of invoert (foto's, draaiboeken, teksten) blijft van jou. Je geeft ons alleen de licentie
        die technisch nodig is om het platform te laten werken: opslaan, tonen aan de mensen met wie je samenwerkt, en
        back-ups maken. We gebruiken jouw content niet voor andere doeleinden.
      </p>

      <h2>6. De rol van DreamDay bij afspraken tussen gebruikers</h2>
      <p>
        DreamDay brengt bruidsparen en leveranciers bij elkaar en geeft ze gereedschap om samen te werken, maar is
        <strong> geen partij</strong> bij de overeenkomst tussen een bruidspaar en een leverancier. Afspraken over
        prijs, levering en kwaliteit maak je rechtstreeks met elkaar. Wij zijn niet aansprakelijk voor het handelen of
        nalaten van andere gebruikers.
      </p>

      <h2>7. Beschikbaarheid en aansprakelijkheid</h2>
      <ul>
        <li>We doen ons uiterste best om het platform altijd beschikbaar te houden, maar kunnen geen 100% uptime garanderen. Gepland onderhoud kondigen we waar mogelijk aan.</li>
        <li>Maak zelf ook een export van belangrijke documenten (zoals het draaiboek als pdf) in de aanloop naar de trouwdag.</li>
        <li>Onze aansprakelijkheid is beperkt tot directe schade en tot maximaal het bedrag dat je in de 12 maanden voorafgaand aan de schade aan ons hebt betaald. Voor gratis accounts is de aansprakelijkheid beperkt tot €100. Deze beperking geldt niet bij opzet of grove schuld.</li>
      </ul>

      <h2>8. Beëindiging</h2>
      <p>
        Je kunt je account op elk moment verwijderen. Leveranciers doen dit via hun profielpagina; daarbij wordt eerst
        een bevestigingsmail gestuurd. Na verwijdering geldt het bewaartermijnenbeleid uit ons{" "}
        <Link href="/privacy">privacybeleid</Link>.
      </p>

      <h2>9. Wijzigingen van deze voorwaarden</h2>
      <p>
        We kunnen deze voorwaarden aanpassen. Ingrijpende wijzigingen kondigen we minimaal 30 dagen van tevoren aan via
        e-mail of een melding in de app. Blijf je het platform daarna gebruiken, dan gelden de nieuwe voorwaarden.
      </p>

      <h2>10. Toepasselijk recht</h2>
      <p>
        Op deze voorwaarden is Nederlands recht van toepassing. Geschillen leggen we voor aan de bevoegde rechter in
        Nederland, tenzij de wet dwingend anders bepaalt.
      </p>
    </PublicPageShell>
  );
}
