# Projektöversikt – Beat Store

## Projektidé

Projektet är en e-handelsplattform där kund/besökare kan lyssna på korta förhandsvisningar av beats och köpa enskilda beats från ett album, i framtiden också hela 
album. Tanken är att lyckas implmementera så att enskild kund-id håller i köpta beat-id's, så att när en kund köper ett album efter att ha köpt enstaka beats dras dessa bort från album-summan. 

Den första versionen kommer att innehålla ungefär 30 beats från ETT album. Samtliga beats använder samma albumomslag men har egna titlar, priser, ljudförhandsvisningar och eventuell metadata såsom "känsla" och BPM.

## Målgrupper

### Kund

Kunden ska kunna:

* se alla tillgängliga beats
* öppna albumets produktsida
* lyssna på korta previews
* lägga beats i en varukorg
* ta bort beats från varukorgen
* se varukorgens totalpris
* fylla i kunduppgifter
* genomföra ett simulerat köp
* skapa en order i systemet

### Administratör

Administratören ska kunna:

* se en lista över produkter
* skapa nya produkter
* redigera befintliga produkter
* se inkomna ordrar
* se vilka produkter varje order innehåller

Vi får se om jag hinner implementera admin/roll-specifik inloggning

## Produkter

Varje beat behandlas som en separat produkt.

En produkt kommer bland annat innehålla:

* titel
* beskrivning
* pris
* genre
* BPM
* albumkoppling
* bildadress
* preview-adress
* information om produkten är tillgänglig

NOTE:Som sagt så delar alla produkter i den första versionen samma albumomslag.

## Orderflöde

1. Kunden öppnar butikens produktsida.
2. Kunden lyssnar eventuellt på previews.
3. Kunden lägger ett eller flera beats i varukorgen.
4. Kunden öppnar checkout.
5. Kunden fyller i namn, e-postadress och adressuppgifter.
6. Servern kontrollerar produkterna och hämtar deras aktuella priser från databasen.
7. En order skapas i databasen.
8. En orderrad skapas för varje beställd produkt.
9. Kunden visas en orderbekräftelse.
10. Administratören kan se ordern i administrationsgränssnittet.

## Teknik

I projektet estimerar jag att jag kommer använda:

* React
* Vite
* React Router
* React Context
* Node.js
* Express
* PostgreSQL
* Git och GitHub
* Render för webbservern
* Neon eller motsvarande tjänst för PostgreSQL-databasen

## Ljudfunktioner

Grundversionen ska stödja en kort ljudpreview för varje beat.

Som en senare extrafunktion planeras en global radio som spelar slumpmässiga beats. När användaren spelar en specifik preview ska radion tonas ned och previewn tonas upp. När previewn slutar ska radion kunna återupptas.


## Saker jag vill hinna med nu eller vid fortsatt utveckling:

* verkliga kortbetalningar
* leverans av fullständiga ljudfiler (kommer behöva rendera ut alla beats som .WAV)
* användarkonton
* kundprofiler
* administratörsinloggning
* databaslagrad varukorg
* favoriter
* köp av hela albumet som en separat produkt
* återbetalningar
* avancerad orderstatus


Detta dokument kommer ändras mycket genom projektets gång.
Då kör vi!
