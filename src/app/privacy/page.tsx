import type { Metadata } from "next";
import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description: "Hoe DreamDay Platform omgaat met jouw persoonsgegevens: wat we verzamelen, waarom, hoe lang we het bewaren en welke rechten je hebt.",
};

export default function PrivacyPage() {
  return (
    <PublicPageShell
      title="Privacybeleid"
      intro="Jullie vertrouwen ons met iets persoonlijks: de planning van een trouwdag. Hieronder lees je precies welke gegevens we daarvoor gebruiken, waarom, en wat jouw rechten zijn."
    >
      <p className="ddp-prose-meta">Laatst bijgewerkt: juli 2026</p>

      <h2>1. Wie zijn wij</h2>
      <p>
        DreamDay Platform is een online planningsomgeving voor bruidsparen, weddingplanners en leveranciers in de
        bruiloftsbranche. DreamDay Platform is de verwerkingsverantwoordelijke voor de persoonsgegevens die je via de
        website en de app met ons deelt. Vragen over dit beleid kun je stellen via het contactformulier op de website of
        per e-mail aan het adres dat in je account vermeld staat als supportadres.
      </p>

      <h2>2. Welke gegevens we verzamelen</h2>
      <p>Afhankelijk van hoe je DreamDay gebruikt, verwerken we de volgende gegevens:</p>
      <ul>
        <li><strong>Accountgegevens</strong>: naam, e-mailadres, wachtwoord (versleuteld opgeslagen) en je rol op het platform (bruidspaar, planner, teamlid of leverancier).</li>
        <li><strong>Bruiloftgegevens</strong>: trouwdatum, locatie, budget, taken, draaiboeken en berichten die je binnen het platform verstuurt.</li>
        <li><strong>Gastgegevens</strong>: namen, e-mailadressen, dieetwensen en RSVP-status van gasten die het bruidspaar zelf invoert of die gasten via een RSVP-link doorgeven.</li>
        <li><strong>Leveranciersgegevens</strong>: bedrijfsnaam, contactpersoon, telefoonnummer, website, plaats, foto's en profielinformatie.</li>
        <li><strong>Betaalgegevens</strong>: bij een premium-abonnement verwerkt onze betaalprovider Stripe je betaalgegevens. Wij slaan zelf geen creditcard- of rekeningnummers op.</li>
        <li><strong>Technische gegevens</strong>: een inlogcookie om je sessie te onthouden, en serverlogs voor beveiliging en foutopsporing.</li>
      </ul>

      <h2>3. Waarvoor we je gegevens gebruiken</h2>
      <ul>
        <li>Het leveren van de dienst: bruiloften plannen, samenwerken met leveranciers en communiceren binnen het platform.</li>
        <li>Het versturen van functionele e-mails, zoals verificatiecodes, taaknotificaties en wachtwoord-resets. Meldingsvoorkeuren beheer je zelf onder Instellingen.</li>
        <li>Het afhandelen van betalingen voor premium-abonnementen.</li>
        <li>Beveiliging, misbruikpreventie en het verbeteren van het platform.</li>
      </ul>
      <p>
        De rechtsgrond hiervoor is de uitvoering van onze overeenkomst met jou (artikel 6 lid 1 sub b AVG), en waar het
        gaat om beveiliging en verbetering ons gerechtvaardigd belang (artikel 6 lid 1 sub f AVG).
      </p>

      <h2>4. Met wie we gegevens delen</h2>
      <p>We verkopen je gegevens nooit. We delen ze alleen met partijen die nodig zijn om de dienst te laten werken:</p>
      <ul>
        <li><strong>Binnen jouw bruiloft</strong>: gegevens die je invoert zijn zichtbaar voor de mensen met wie je samenwerkt. Een cateraar ziet bijvoorbeeld dieetwensen van gasten, en een leverancier ziet het draaiboek van de bruiloft waaraan hij gekoppeld is.</li>
        <li><strong>Stripe</strong>: voor de verwerking van betalingen.</li>
        <li><strong>Hostingproviders</strong>: onze applicatie en database draaien bij Europese en Amerikaanse cloudleveranciers, met wie we verwerkersovereenkomsten hebben.</li>
        <li><strong>E-maildienst</strong>: voor het versturen van functionele e-mails.</li>
      </ul>

      <h2>5. Hoe lang we gegevens bewaren</h2>
      <p>
        We bewaren je gegevens zolang je account actief is. Verwijder je je account, dan verwijderen we je
        persoonsgegevens binnen 30 dagen, met uitzondering van gegevens die we wettelijk langer moeten bewaren (zoals
        facturatiegegevens, die we 7 jaar bewaren voor de Belastingdienst). Leveranciers kunnen verwijdering van hun
        profiel aanvragen via hun profielpagina.
      </p>

      <h2>6. Cookies</h2>
      <p>
        DreamDay gebruikt een functionele cookie om je ingelogde sessie te onthouden. Die is noodzakelijk om het
        platform te laten werken en vereist geen toestemming. Gebruiken we in de toekomst analytische of
        marketingcookies, dan vragen we daar eerst je toestemming voor via de cookiebanner. Je keuze kun je op elk
        moment aanpassen door de cookies van deze site te wissen in je browser.
      </p>

      <h2>7. Jouw rechten</h2>
      <p>Op grond van de AVG heb je het recht om:</p>
      <ul>
        <li>je gegevens in te zien, te corrigeren of te laten verwijderen;</li>
        <li>je gegevens in een leesbaar formaat te ontvangen (dataportabiliteit);</li>
        <li>bezwaar te maken tegen bepaalde verwerkingen of de verwerking te laten beperken;</li>
        <li>een klacht in te dienen bij de <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.</li>
      </ul>
      <p>
        De meeste gegevens kun je zelf inzien en aanpassen via je account. Voor de overige verzoeken kun je contact met
        ons opnemen; we reageren binnen 30 dagen.
      </p>

      <h2>8. Beveiliging</h2>
      <p>
        Alle verbindingen met DreamDay verlopen via https. Wachtwoorden slaan we uitsluitend versleuteld op en
        toegang tot gegevens is beperkt per rol: een leverancier ziet alleen de bruiloften waaraan hij gekoppeld is, en
        alleen de onderdelen die voor hem bedoeld zijn.
      </p>

      <h2>9. Wijzigingen</h2>
      <p>
        Als we dit beleid aanpassen, publiceren we de nieuwe versie op deze pagina met een nieuwe datum. Bij
        ingrijpende wijzigingen informeren we je per e-mail of via een melding in de app.
      </p>

      <p>
        Zie ook onze <Link href="/voorwaarden">algemene voorwaarden</Link>.
      </p>
    </PublicPageShell>
  );
}
