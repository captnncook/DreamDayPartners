# DreamDay Platform — Testplan voor lancering

Dit document loop je van boven naar beneden door. Elke rol heeft één doorlopende reis: speel die na alsof je die persoon bént, met een echt scenario in je hoofd. Vink af wat werkt, noteer bij elke afwijking: **wat deed je, wat verwachtte je, wat gebeurde er** (en maak een screenshot).

**Testopzet:** gebruik 4 browserprofielen of incognito-vensters naast elkaar (bruidspaar, planner, leverancier, admin), zodat je synchronisatie tussen rollen echt ziet. Test minimaal één volledige reis op een echte telefoon, niet alleen in de devtools-simulator.

---

## Reis 1 — Het bruidspaar (Emma & Thomas)

*Scenario: jullie zijn net verloofd, hebben nog niets geregeld en horen over DreamDay.*

### Aanmelden
- [ ] Ga naar de homepage → klik "Begin gratis" → kies "Wij zijn een bruidspaar"
- [ ] Doorloop alle stappen: namen, datum, locatie, gastenaantal, budget, e-mail
- [ ] Ontvang je de 6-cijferige verificatiecode per e-mail? Binnen hoeveel seconden? Kijk ook in spam
- [ ] Vul een **verkeerde** code in: krijg je een nette foutmelding?
- [ ] Kies "Account aanmaken met wachtwoord" → probeer eerst een te kort wachtwoord (foutmelding?) → dan een goed wachtwoord
- [ ] Test ook een keer de "Doorgaan met Google"-route
- [ ] Kom je na afronden direct in het dashboard, met de juiste namen en countdown?

### De eerste week gebruiken
- [ ] Dashboard: klopt het aantal dagen tot de bruiloft? Klik "Naar onze bruiloft"
- [ ] Voeg 10 gasten toe, waarvan 2 met dieetwensen en 1 met plus-één
- [ ] Verstuur een RSVP-link naar jezelf → vul hem in als gast (ander browservenster, niet ingelogd) → verschijnt de reactie bij het bruidspaar?
- [ ] Vul het budget: voeg 3 posten toe, markeer 1 aanbetaling als betaald, klopt het totaal?
- [ ] Maak 3 taken aan, vink er 1 af, verwijder er 1
- [ ] Zoek in de catalogus een fotograaf → open het profiel → verstuur een contactaanvraag
- [ ] Voeg een leverancier toe aan jullie Dream Team
- [ ] Klik "Draaiboek" in de sidebar: kom je direct in jullie draaiboek (zonder tussenlijst)?
- [ ] Voeg een draaiboek-item toe, versleep het naar een andere tijd, exporteer de pdf: staat het logo erin en klopt de tijdlijn?
- [ ] Stuur een bericht naar een leverancier via Berichten

### Instellingen en account
- [ ] Wijzig je naam, zet 2 meldingsvoorkeuren uit, log uit, log weer in: staan ze nog goed?
- [ ] "Wachtwoord vergeten"-flow: e-mail ontvangen → reset → inloggen met nieuw wachtwoord

---

## Reis 2 — De weddingplanner (Sophie)

*Scenario: je beheert 3 bruiloften tegelijk en krijgt er vandaag een nieuwe bij.*

- [ ] Maak een nieuwe bruiloft aan via de wizard: alle 4 stappen, controleer dat de gegevens kloppen op de detailpagina
- [ ] Heb je 2+ bruiloften? Controleer dat het dashboard de eerstvolgende prominent toont en de rest in de lijst
- [ ] Nodig een teamlid uit voor een bruiloft: kan die persoon daarna inloggen en alleen díe bruiloft zien?
- [ ] Koppel 3 leveranciers aan een bruiloft, geef er 1 portaltoegang en 1 niet
- [ ] Maak een draaiboek, voeg 5 items toe waarvan 2 gekoppeld aan een leverancier
- [ ] Zet 1 draaiboek-item op "Privé": controleer in het leveranciersvenster dat die het item **niet** ziet
- [ ] Wijs een taak toe aan het bruidspaar: zien zij die direct?
- [ ] Vul bij een leverancier de betaalgegevens in (aanbetaling, bedragen, deadlines)
- [ ] Stuur vanuit een bruiloft een bericht en controleer dat het bruidspaar het ontvangt
- [ ] Test de leverancier-goedkeuringsknop (status wijzigen van aangevraagd → bevestigd)

---

## Reis 3 — De leverancier (DJ Marco)

*Scenario: je bent uitgenodigd voor een bruiloft en wilt daarna premium worden.*

### Gratis account
- [ ] Meld je aan als leverancier: bedrijfsgegevens, categorie, verificatiecode
- [ ] Vul je catalogusprofiel: beschrijving, stad, prijzen, foto's uploaden (test ook een te groot bestand >10MB: nette foutmelding?)
- [ ] Open een bruiloft waaraan je gekoppeld bent: zie je alleen jóuw onderdelen en de publieke draaiboek-items?
- [ ] Vul je vakspecifieke modules in (setlist voor DJ, shotlist voor fotograaf, enz.): worden ze opgeslagen en ziet de planner ze?
- [ ] Controleer je "Draaiboek"-pagina in de sidebar: alleen eigen items zichtbaar?
- [ ] Maak zelf een draaiboek-item aan: verschijnt het direct (binnen ~12 sec) bij planner en bruidspaar zonder verversen?
- [ ] Stuur een bericht naar de planner
- [ ] Instellingen → Dashboard-functies: zie je als niet-premium alleen de vaste lijst met een upgrade-melding?

### Premium worden
- [ ] Klik "Upgrade" op je profielpagina → doorloop de Stripe-checkout met testkaart 4242 4242 4242 4242
- [ ] Kom je terug op je profiel met premium actief? Staat "Pro" bij je naam in de sidebar?
- [ ] Krijg je de bevestigingsmail?
- [ ] Instellingen → Dashboard-functies: kun je nu modules aan/uit zetten? Zet er 1 uit en controleer dat die uit je dashboard verdwijnt
- [ ] Vraag een extra functie aan met een toelichting → controleer dat de admin het verzoek ziet
- [ ] Test het facturatieportaal ("Abonnement beheren"): kun je opzeggen? Wat gebeurt er daarna met je premium-functies?
- [ ] Test een **mislukte** betaling met testkaart 4000 0000 0000 0002: nette afhandeling?

---

## Reis 4 — De admin (jij)

- [ ] Log in als admin: zie je het admin-dashboard met de juiste totalen?
- [ ] Accounts: maak een account aan, reset een wachtwoord, wijzig een e-mailadres
- [ ] Leveranciers: markeer een leverancier als "Aanbevolen" → staat die daarna bovenaan in de publieke catalogus?
- [ ] Functieverzoeken: keur het verzoek van de leverancier uit Reis 3 goed → heeft die de functie direct?
- [ ] Wijs een leverancier rechtstreeks een extra functie toe via het "Functies"-paneel
- [ ] Claim-verzoeken: doorloop een volledige claim (aanvraag → goedkeuren → e-mail → account instellen via de link)
- [ ] Test "Gedeelde stockfoto's opschonen" en controleer dat unieke foto's blijven staan
- [ ] Belangrijkste beveiligingstest: kopieer als **leverancier** de URL van een bruiloft waar je NIET aan gekoppeld bent → krijg je netjes geen toegang? Doe hetzelfde als bruidspaar met andermans bruiloft-URL

---

## Dwarsdoorsnede — dingen die geen rol-reis zijn

### Mobiel (echte telefoon, minimaal iPhone Safari én Android Chrome)
- [ ] Geen horizontale scroll op: homepage, catalogus, aanmelden, dashboard, draaiboek, gastenlijst
- [ ] Draaiboek op touch: item toevoegen via de knop, tijden slepen/aanpassen, opslaan
- [ ] Datepickers en dropdowns openen goed op iOS Safari (berucht probleempunt)
- [ ] Bestanden uploaden vanaf je telefoon (foto uit galerij)

### E-mails (check in Gmail, Outlook én op je telefoon)
- [ ] Verificatiecode, wachtwoord-reset, taaknotificatie, premium-bevestiging, claim-uitnodiging
- [ ] Logo zichtbaar, links werken, afzender herkenbaar, niet in spam

### Randgevallen
- [ ] Extreem lange naam ("Bruiloft Anne-Sophie van den Heuvel-Vermeulen & Maximiliaan"): breekt de layout ergens?
- [ ] Emoji en aanhalingstekens in berichten en namen
- [ ] Trouwdatum vandaag en in het verleden: wat toont de countdown?
- [ ] Twee tabbladen tegelijk hetzelfde draaiboek bewerken
- [ ] Trage verbinding (Chrome devtools → Slow 3G): verschijnen skeletons/laadstatussen of lijkt de app kapot?
- [ ] Direct naar een niet-bestaande URL: nette 404-pagina?
- [ ] Verlopen RSVP/claim/reset-link: begrijpelijke melding?

### Publieke site
- [ ] Cookiebanner: verschijnt bij eerste bezoek, onthoudt je keuze, komt niet terug
- [ ] Privacybeleid en algemene voorwaarden bereikbaar via de footer en leesbaar op mobiel
- [ ] Blog: overzicht + artikelen laden, "Begin gratis"-knop onderaan werkt
- [ ] Uitloggen en terug naar de site: geen restanten van ingelogde staat

### Browsers
- [ ] Chrome, Safari, Firefox en Edge: minimaal inloggen + dashboard + draaiboek per browser

---

## Bij elke gevonden bug noteren

1. **Rol + pagina** (bijv. "leverancier, /draaiboek")
2. **Stappen** om het na te doen
3. **Verwacht** vs. **werkelijk** gedrag
4. Screenshot of schermopname
5. Ernst: blokkeert de reis / hinderlijk / cosmetisch

Prioriteer vóór lancering alleen: alles wat een reis blokkeert, alles rond betalingen, en alles rond toegang tot andermans gegevens. De rest mag na de stille beta.
