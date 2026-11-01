# Wunju Store

## About
Wunju Store är ett första utkast till en e-handel där jag på sikt vill sälja min egen musik under alias 'Wunju', samt eventuell framtida merchandise.

Projektet har utvecklats inom ramen för utbildningen Fullstack Developer och tre laborationer med fokus på externa API, dataintegration, sökfunktionalitet och betalningar.

Fokus har legat på backend, databaslogik och fungerande integrationer snarare än visuell design. Gränssnittet är därför fortfarande relativt enkelt och stora delar av CSS-koden har genererats med hjälp av AI.

## Live site
Frontend: https://client-ten-topaz-75.vercel.app
Backend/API: https://wunju-com.onrender.com
API health:https://wunju-com.onrender.com/api/health

## Tech stack
React
Vite
Express
Node.js
PostgreSQL
Neon
Render
Vercel

## Features
- Browse albums and beats
- Audio previews
- "Merch" products
- Algolia search
- Customer order history
- Admin album/beat CRUD
- Admin order overview
- Fake customer/admin login
- Stripe embedded Checkout (test), webhook, order status and stock reservations
- Supplier product import 
- Admin product CRUD

## Test login
Customer:
Username: USER
Password: 123

Admin:
Username: ADMIN
Password: 123

## Run locally
1. npm install
2. npm install --prefix client
3. configure .env
4. npm run dev

## Database
Databasen hålls minimal i detta första utkast.
Se /docs/diagram/er-diagram_v1.jpg för hur planeringen 
över alla db-tabeller såg/ser ut. 

## Project structure
client/(innehåller react frontend, pages, css, media osv.)
routes/ (Express api-routers)
services/(innehåller databaslogik och SQL)
database/ (innehåller anslutning till databas)
docs/ (dokument, klotter och annat som kan vara intressanta för dig som lärare?)



## Future improvements

### Hade jag haft mer tid hade jag implementerat:
- Sök- och sort-funktionalitet över hela sidan
- Delete album går att göra på ett album trots
att det finns beats kvar i det > Album tas bort från
databas, men beats finns kvar och samlas i en
admin-sida, typ "beatList" eller "unsorted beats",
endast för display av album-lösa beats.
- Riktig authentication. Bättre login med passwordHash osv.
- Cart lagras i databas istället för react state endast
- Bättre backend authorization
- MYCKET mer polerad validation/UI
- Implementera spotify i själva sidan, så att anvädnaren
faktiskt lyssnar på wunjus spotify när de är inne på 
sidan (radio + previews).
- Modularisera HomePage's News/ göra en NewsCard-komponent som kan 
skapas/uppdateras av ADMIN med Header, hero (link), description + alternativt preview-audio.
- Justera så att ADMIN inte kan lägga items i
Cart, alternativt lägga till så att ADMIN
KAN komma åt Cart > Checkout > place order.

## Documentation
Igen, spana gärna in /Docs/ i rootmappen-
där hittar du de första dokumenten från planeringsstadiet:
- components.md
- project-overview.md
- Sitemap.md
- time-plan.md
samt ER-diagramet

BONUS: Du hittar även lite mockData i client/src/data/MockAlbums.js ifall det är något du vill se.

Tack för denna uppgift!


# Labb 1

Jag har valt att använda branschen 'Kläder'("klader") i labben, som placeholder för eventuell framtida *merchandise*.

## Steg

### Refaktorering av fetchJson.js
Refaktorerade 'fetchJson.js' till 'fetchWithRetry.js', och skapade sedan 'fetchJson.js' 2.0 som återanvänder fetchWithRetry.js men returnerar specifikt JSON.

fetchWithRetry.js hanterar bland annat timeout, felhantering och återförsök vid tillfälliga problem med API-anrop.

API-nyckeln ligger i .env och skickas från backend via HTTP-headern X-Api-Key.

### Normalisering, adapter, Zod
Skapade:
- supplierProductSchema.js (Zod)
- normalizeSupplierProduct.js (normaliserar till projektets standard)
- validateSupplierProducts.js (validerar och delar upp (o)giltiga produkter)
- supplierAdapter.js (hämtar och parsar CSV SAMT XML)
- convertXmlProduct.js (konverterar XML-produkter till samma format som CSV-produkterna)

CSV-filen avkodas med Windows-1252 > csv-parse
XML-filen är utf-8 så den hämtas kompatibel > fast-xml-parser

Båda formaten normaliseras alltså till samma interna struktur/modell innan de Zod-valideras

### Databas
Skapade:
- inspectDatabase.js
- runMigration.js
- 001_create_supplier_products.sql
- 002_add_supplier_product_image.sql

Dessa gör att man inte behöver gå in i t.ex pgAdmin varje gång en query ska köras, och vi får alla databasändringar sparade som kod i Git- mycket bra. 

Jag skapade även tabellen "supplier_products" i postgreSQL, där sku används för att identifierar produkter vidf import.

### Importering
Skapade:
- supplierProductService.js (kontrollerar om en produkt finns och upsertar den)
- importSupplierProducts.js (hämtning, normalisering, validering, databasuppdatering + importstatistik)
- supplierImportRoutes.js (expressroute)

### Kommandon
- node runMigration.js <001_create...> eller <002_add...> (kör SQL-migrationen)
- node inspectDatabase.js (Visa databasens tabeller och kolumner)


### Integrering i frontend - *Endast PLACEHOLDER just nu* - ingen riktig merch!
Min vision är att vi lägger till en "Merch"-page på webplatsen.
Här listas alla produkter i form av productCards, precis som albumCards i "browse music"-page.
Klickar man på ett productCard kommer man till productDetails-page, där man får mer info om produkten-
t.ex lagersaldo, kan välja storlekar, kanske kort beskrivning osv.

Om man är inloggad som admin finns nu en import-knapp, där admin får välja att importera som xml
eller csv via en dropdown-meny.
Som admin ser man också ImportDetails (eller dylikt): lite statistik över importen, t.ex hur många varor
som faktiskt finns tillgängliga för kunder på hemsidan just nu, hur många produkter som uppdaterats och hur, och om någon import har misslyckats och varför.

Jag tänker även att importen från supplier-API't ska ske automatiskt i framtiden, kanske en gång om dagen, plus att man manuellt kan importera produkterna, såklart.

---

# Labb 2 – Sök-API med Algolia

I Labb 2 har jag implementerat sökfunktionalitet med Algolia, integrerat med den befintliga produktdatabasen från Labb 1.

Jag har valt att behålla databasen som Single Source of Truth, medan Algolia står för fritextsökning och paginering av sökresultat.
När användaren besöker merchandise-sidan utan att skriva någon söktext hämtas produkterna från databasen via backend. När användaren börjar söka skickas begäran i stället till vårt eget sök-API, som kommunicerar med Algolia.
Alltså:
- Vanlig produktvisning: React → Express → PostgreSQL
- Sökning: React → Express → Algolia
- Produktändringar: Admin → Express → PostgreSQL → Algolia

Frontend kommunicerar alltså aldrig direkt med Algolia.

## Algolia – adapter och API

Jag skapade 'searchAdapter.js', som ansvarar för kommunikationen med Algolia.
Adaptern innehåller bl.a:

- 'indexProducts()' – skapar eller uppdaterar produkter i sökindexet
- 'replaceAllProducts()' – ersätter hela sökindexets innehåll
- 'searchProducts()' – söker efter produkter och returnerar paginerade resultat
- 'deleteProductFromIndex()' – tar bort en produkt från sökindexet

Produkterna konverteras till Algolias format innan de indexeras.

### Sök-API och validering

Jag skapade 'searchRoutes.js' med endpointen 'GET /api/search?q=hoodie&page=1&pageSize=12'
Sökningen stödjer fritext, sidnummer och antal produkter per sida.

Om Algolia inte kan nås returnerar backend HTTP 502 med felmeddelande.
Jag har även konfigurerat timeout-inställningar för Algolia-klienterna.

## Synkronisering mellan databasen och Algolia

En viktig del av labben har varit att hålla Algolias sökindex uppdaterat när produkter ändras i databasen.
Jag valde att låta databasen uppdateras först och därefter synkronisera ändringen till Algolia.

### Automatisk synkronisering

Algolia uppdateras automatiskt när produkter:

- Importeras från leverantören
- Skapas manuellt
- Uppdateras
- Raderas

Vid vanlig indexering används `saveObjects()` för att skapa eller uppdatera sökposter. Vid borttagning används `deleteObject()`.

### Manuell fullsynkronisering

Jag lade även till en separat 'Sync Algolia'-knapp för admin.

Till en början använde jag 'replaceAllObjects()' även vid vanlig import, eftersom jag ville säkerställa att gamla sökposter som inte längre fanns i databasen togs bort. Problemet var att synkroniseringen då kunde ta gott och väl över två minuter - dåligt.

Lösningen blev att separera vanlig synkronisering från fullständig synkronisering:
- Automatisk synk: 'saveObjects()' med 'waitForTasks: false'
- Manuell fullsynk: 'replaceAllObjects()'

Den vanliga importenbehöver alltså inte vänta på att Algolia färdigbehandlar alla indexeringsuppgifter.

'waitForTasks: false' innebär dock att en lyckad begäran inte garanterar att produkterna redan är sökbara, utan att Algolia har tagit emot indexeringsbegäran.

## CRUD och adminpanel

Jag har implementerat ett enklare CRUD-API för produkterna:

POST: '/api/admin/products' -Skapa produkt
PATCH: '/api/admin/products/:sku' -Uppdatera produktens namn/pris
DELETE: '/api/admin/products/:sku' -Radera produkt

Alla tre operationer uppdaterar PostgreSQL först och skickar därefter motsvarande ändring till Algolia.

Jag har även byggt en liten, tillfällig produkthantering i SupplierImportPanel, där admin kan använda crud direkt från gränssnittet.

OBS!!! *Detta är inte tänkt som den slutgiltiga produktadministrationen!*

Min framtida vision är att admin ska kunna skapa produkter direkt från Merchandise-sidan och redigera/radera dem via en 'ProductDetailsPage'/ modal, på liknande sätt som hanteringen av musikprodukter.

### Testprodukt

För CRUD-testerna har jag använt produkten `DEMO-001`, som alltås inte ingår i leverantörens importfil.
På så sätt riskerar inte nästa leverantörsimport att skriva över testprodukten.

## Integrering i React

När användaren skriver en söktext anropas '/api/search', och Algolia ansvarar för sökresultat och pagineringen .Frontend visar även det totala antalet produkter/sökträffar.

Jag använder 'AbortController' för att avbryta äldre sökbegäranden när användaren ändrar söktext eller byter sida (tog ett tag för mig att fatta detta, osäker på om jag faktiskt gjorde det..).

Efter en produktimport eller CRUD-operation hämtar React produktinformationen igen.

## Säkerhet och adminskydd

Jag har skapat middleware-funktionen 'localOnly', som tillfälligt skyddar admin-endpoints.
När 'NODE_ENV=production' returnerar dessa endpoints HTTP 403.

OBS!!!*Detta är inte en fullständig autentiseringslösning!!* 
Under utveckling är dessa endpoints tillgängliga utan serverroll-auth.

Kör i terminal:
- $env:NODE_ENV = "development"
- $env:NODE_ENV = "production"

## Framtida visioner

Den nuvarande produktadministrationen är en tillfällig lösning specifikt för labben.
Jag vill bygga en mer komplett Merchandise-del med produktdetaljer, varianter, lagersaldo och ett integrerat CRUD-gränssnitt (ProductPage som visar alla ProductCards (som idag), klickar man på ett producCard > ProductDetailsPage där admin har edit/delete-funktionaliteter).

Jag vill även automatisera leverantörsimporten, exempelvis genom att köra den en gång per dygn.



# Labb 3 - Stripe-integration

## Flöde
1. Kund lägger produkter i varukorg- ingen reservation läggs på produkterna.
2. Kund går vidare till 'checkoutPage' och ser en sammanfattning av sin kundkorg.
3. När kund klickar sig vidare till Payment sker lagerreservation på varorna, en stripe session startas och en order med status 'pending' skapas. 
4. Kunden har 30min på sig att betala innan sessionen löper ut och order cancellas.
5A. Stripe skickar webhook, backend markerar order som 'paid' > genomfört köp
5B. Checkoutsession löper ut, backend hanterar ordern som 'cancelled' och återställer lagersaldo.

## Reservationer av produkter
1. Kund lägger en produkt i varukorgen - ingenting händer med saldot
2. Kund klickar på checkout - backend kollar + minskar saldot
3A. Kund betalar - order = paid, lagersaldo förblir minskat
3B. Kund avbryter/checkout timeout - order = cancelled, lagersaldo återställs

Jag tänkte först simulera en fysisk butik där föremål reserveras så fort kunden lägger produkten i varukorgen, men detta innebär att mycket mer intrikat reservationshantering hade krävt, t.ex om man vill förhindra att en kund inte reserverar massor av produkter och ändå låta denne "titta runt" och handla utan tidspress att varukorgen ska nollställas.

## Leverantörsimport & saldo

Efter lite tänkande valde jag att låta importen fortsätta skriva över lagersaldo- en enkel nollställning vid testning.


## Refaktoreringar
- orderService.CreateOrder: createOrder() går nu från att ha skapat en order och sedan skicka kunden till orderbekräftelse till att endast skapa en order med cartItems, och status 'pending'
- CheckOutPage.jsx: gick från att hantera den gamla checkout'en till Stripes embedded' checkout
- CartContext: implementerat gemensam produktstruktur och hantering för både beats och "merch"

## Vad som inte är bygg än
- Dubblett-köp av beats. En användare ska inte kunna köpa ett beat som den redan äger (finns inget vits med det), men det finns ännu inget stöd för detta än.
- Decrease/increase knappar på merch i cart, om man t.ex vill lägga till eller ta bort antal från en produkt som redan ligger i kundkorgen.
- Förenklad checkout. Kunden ska inte behöva gå in i Cart för att komma till checkout- ska lägga till en lättåtkommlig checkout-knapp.
- Omfattande valuta-omvandling. Just nu fungerar endast valuta-omvandligen i beats. Detta ska såklart implementeras överallt på sidan (merch, checkout, stripe)



# Labb 4 – molnlagring av bilder

## Flöde

1. Admin väljer en produkt via SKU och laddar upp en JPEG/PNG-bild från Merchandise-sidan.
2. Frontend/react skickar filen som `FormData` till Express.
3. Backend validerar filen och laddar upp den till supabase bucket.
4. Bildens URL och sökväg sparas i databasen.
5. Algolia synkroniseras så att bilden även visas i sökresultaten.

 > React kommunicerar aldrig direkt med supabase, databasen förblir single source of truth!!

## Supabase Storage och databas

-'storageAdapter.js' sköter kommunikationen med supabase bucket'en 'product-images' och anges filnamn med UUID.
- Jag lade även till kolumnen 'image_path' i 'supplier_products' via migrationen '004_add_supplier_product_image_path.sql'.
- 'image_url' används för att visa bilden i frontend, och 'image_path' används för att hitta och radera filen i bucketen.

## API och validering

Jag utökade 'adminProductRoutes.js' med två endpoints:

- 'post /api/admin/products/:sku/image' : där bild laddas upp eller ersätter gammal
- 'delete /api/admin/products/:sku/image' : tar bort produktbild

Endast JPEG och PNG tillåts, med en maxstorlek på 4 MB precis som i genomgången.

## Bildersättning

-Bildersättning följer samma flöde som i genomgången: uppladdning > sparning > radera gammal fil.
- Efter uppladdning eller borttagning uppdateras även Algolia med produktens aktuella image_url.

## React / användargränssnitt

- Jag missade först att inkludera 'image_url' i algolias produktmodell, vilket gjorde att bilderna fungerade i den vanliga produktlistan men inte vid sökning. Detta korrigerades i 'searchAdapter.js'.

Jag utökade 'SupplierImportPanel.jsx' med bilduppladdning, ersättning, borttagning, felmeddelanden och förhandsvisning.

## Fortfarande kvar att göra

- Verifiering av felhantering vid avbrott i Supabase.
- Deployment och testning i produktionsmiljön.
- Ersätta det tillfälliga 'localOnly''-skyddet med riktig adminbehörighet innan uppladdning tillåts till produktion.


# Labb 5 – Postnord Shipping

## Prompts och korrigeringar

**Prompt 1**- (shippingAdapter.js): "Hej! i shippingAdapter.js har jag påbörjat ett zod-schema som heter PostNordAnswers. Implementera schemat så det denna struktur från postnords Json-response: 
- servicePointInformationResponse: ett objekt som innehåller:
- servicePoints: en array med objekt, som i sin tur innehåller servicPointId(string), name (string), och visitingAdress(objekt).
-visitingAdress innehåller streetName, streetNumber, postalCode och city (samtliga är strings)"
### Inga korrigeringar
-----

**Prompt 2**- (shippingAdapter.js): "Använd postNordAnswer.safeParse() för att validera resultatet från response.json, innan det används i findServicePoints(). Implementera även enkel felhantering ifall valideringen misslyckas"
### Inga korrigeringar
-----

**Prompt 3**- (shippingService.js): "Skapa services/ shippingService.js
i shippingService.js, definiera två shippingmethods: "service_point" och home_delivery", där frakt till ett ombud kostar 59kr och hemleverans kostar 99kr
skapa två metoder: "validateShippingSelection (method, subtotal)" som returnerar fraktpriset, samt "validateShippingSelection(method, postalCode, servicePointId, subtotal)", som returnerar validerat faktobjekt med method, price och servicePoint"
### Korrigeringar:
#### Korrigering 1.
*jag missade lägga till "gratis frakt" i prompten, samt blev koden rätt stökig då copilot blandade sync/async-funktioner. La även till postnummervalidering i detta steg!*

**Prompt 4**- (shippingService.js): "Lägg till i shippingService.js så att om "subtotal"" är lika med eller överstiger 500kr (eller motsvarande värde i annan valuta som projektet hanterar) blir frakten gratis. shippingService.js ska inte hämta produktpriser eller ordertotal från databas, den ska få en redan beräknad summa som argument. Kontrollera befintliga order- och checkout-tjänster och hur de hanterar pengar (kronor och ören) MEN GÖR INGA ÄNDRINGAR I DESSA."

Gör även validateShippingSelection() till en async-funktion och använd await för findServicePoints(). Funktionen ska alltid returnera ett promise med ett fraktobjekt vid lyckad validering!

Lägg även till postnummervalidering för svenska postnummer med fem siffror. Acceptera format med mellanslag, dvs t.ex "både 12345 och 123 45 med .trim. 
Inkludera även postalCode i det returnerade fraktobjektet. Objektet ska alltså ha method, price, postalCode och servicePoint

#### Korrigering 2. 
*Då jag inte riktigt fattade vad copilot gjort vid "
async function validateShippingSelection(method, ...args) {
    if (args.length === 1) {
        return {
            method,
            price: getShippingPrice(method, args[0]),
            postalCode: null,
            servicePoint: null
        };
    }
    "
rådfrågade jag ChatGPT hur jag exakt skulle tolka denna kod och om det fanns potentiella risker med den, fick jag svaret att "Funktionen kan returnera ett till synes validerat fraktobjekt utan att något postnummer eller ombudsval har validerats." * 
-----

**Prompt 5**- (shippingService.js): "Utan att ändra anda filer än shippingService.js, gör detta:
- exportera getShippingPrice().
- ändra signaturen till async function validateShippingSelection(method, postalCode, servicePointId, subtotal).
- Ta bort "...args" och all logik som hanterar olika antal argument.
- ValidateShippingSelection() ska alltid kräva ett giltigt postnummer och returnera ett validerat fraktobjekt."
### Inga korrigeringar
----- 

**Prompt 6** (shippingService.js): "i shippingService.js måste vi separera ansvaren somvalidateShippingSelection() idag har.

ValidateShippingSelection ska vara en async funktion som tar parametrarna method, postalCode och servicePointId. Funktionen ska validera leveransmetoden och normalisera svenskt postnummer. Vid service_point, hämta ombud från postNord via findServicePoints() och validera ombuds-ID. Vid home_delivery, anrope INTE postnord. Returnera ett objekt med method, postalCode och servicePoint (inkludera inget fraktpris i return'en).

Skapa en ny synkron funktion som heter calculateShippingPrice som tar emot parametrarna method och subtotal. Ombudsleverans ska fortfarande kosta 59kr och hemleveranse 99kr (gratis om subtotal >= 500kr). Validera metod och subtotal, och använd kronor som valuta. Denna funktion ska INTE kommunicera med postNord eller databas!

visa den färdiga filen och berätta gärna kort om vad som ändrats!"
### Inga korrigeringar
-----

** Prompt 7** - (shippingRoutes.js): "Skapa routes/shippingRoutes.js, och skapa GET /service-points som tar emot postalCode som parameter. Validera även här postnumret, och normalisera det innan anropet. Använd findServicePoints(postalCode) från shippingAdapter.js, och returnera ombuden som JSON. Returnera ochså relevant  HTTP-felkod om ogiltigt postnummereller om postnord inte kan nås/skickar ogiltigt svar. 
Använd express router!

Registrera också routen i server.js"
### Inga korrigeringar
-----

 **Prompt 8** - (): "-Undersök den nuvarande databasstrukturen, sql-filerna och migrationerna och se hur de är strukturerade. Ändra ingen befintlig struktur.
- Skapa sedan migrations/"005_add_order_subtotal_and_shipping.sql" och skriv SQL för att lägga till kolumnen 'subtotal' (Numeric 10,2) i tabellen 'orders'. Kolumnen måste tillåta NULLvärden. Lägg till en check-constraint som hindrar negativa subtotal-värden.

- I samma fil, skriv även SQL för att skapa en ny tabell: order_shipping, med kolumnerna: order_id (INT Primary key references orders (id)), method (varchar 20 NOT NULL), price (Numeric (10,2) NOT NULL), postal_code (varchar 5 NOT NULL), service_point_id(varchar 50), service_point_name (text), service_point_address (text). Använd här order_id både som primary key och foreign key. 

-Lägg även till check-constrains som hindrar att 'method' aldrig är något annat än service_point eller home_delivery, att 'price' aldrig är negativt, att postal_code innehåller exakt 5 siffror, att service_point's ombudsfält måste vara ifyllda med giltig input, och att om method = home_delivery så ska alla ombudsfält vara nullade. 

Använd även BEGIN och COMMIT i queryn.

Kör INTE migrationen automatiskt- det gör jag gärna manuellt
"
 #### Korrigering 1. 
 AIn ville lägga in shippingdatan direkt i orders, men jag valde att skapa en ny tabell exklusiv för shippingdatan istället.
-----

**Prompt 9** - (checkoutService.js, orderService.js, checkoutRoutes.js): "- Utöka checkoutService.startCheckout() så att den kan ta emot kundens leveransval. Vid beställningar av merch ska validateShippingSelection() anropas innan ordertransaktion startar. Om en order endast innehåller beats ska frakt inte krävas. Låt inte heller klienten ange fraktpriser eller ordertotal!

- i orderService.js, beräkna subtotal från databasens produktpriser och fraktpris med calculateShippingPrice() från shippingService.js. Räkna också ut orderTotal = subtotal + shippingPrice, och spara subtotal or order_total i 'orders'. 

- Skapa en rad i order_shipping när ordern innehåller merch, men skippa detta ifall ordern endast innehåller beats. Sätt då också fraktpriset till 0. 
Returnera också subtotal,shippingPrice och orderTotal i orderobjektet för Stripe att hantera. 

Ändra endast de filer som behövs för att föra leveransvalet från checkout-route till orderflödet, och ändra ingen Stripe eller React-kod. "
#### Korrigering 1.
- AIn skapade en ny fil "checkoutRoute.js" vars innehåll var identiskt med "checkoutRoutes.js". Denna nya fil togs bort.
- shippingRoutes.js duplicerade postnummervalideringen (regex). Åtgärdades i nästa prompt genom att återanvända normalizePostalCOde().
------

**Prompt 10** - (Stripe): "- Undersök befintlig implementation av stripeService.js, checkoutService.js, orderService.js och stripe-webhooks.
- Skriv om stripeService.createCheckoutSession() så att produkttotalen skickas som en separat line_item baserad på order.subtotal, att fraktkostnaden skickas som en separat line_item när orderns shippingprice är större än 0. 

- Omvandla även kronor till ören med Math.round vid stripe-anropet, men verifiera FÖRE anropet att summan av betalningsraderna motsvarar order.orderTotal i ören. LITA ALDRIG PÅ BELOPP FRÅN FRONTEND. 

- I orderService.js om lagerreservationen misslyckas, använd felkoden "INSUFFICIENT_STOCK" så checkout-route kan returnera "409". 
-----

**Prompt 10** - (leveransprognostest):"Gör ett isolerat GET-test mot PostNords Transit Time v2 API. 
Endpoint:https://atapi2.postnord.com/rest/transport/v2/transittime/addresstoaddress.
apikey: process.env.POSTNORD_API:KEY
startTime: 2026-11-02T08:00
serviceCodes: 19
originPostalCode: 17173
originCountryCode: SE
destinationPostalCode: 63354
destinationCountryCode: SE

ÄNDRA INGA FILER I SAMBAND MED DETTA!
Skicka Accept: application/json
Redovisa http-status och json-svar"

### Inga korrigeringar
-----

**Prompt 11** - (integration av leveransprognos): "-Implementera postNord Transit Time 2 i vår backend.
Endpoint: GET https://atapi2.postnord.com/rest/transport/v2/transittime/addresstoaddress

verifierade query-parametrar:
-apikey: process.env.POSTNORD_API_KEY
-startTime: lokal svensk datum/tid då PostNord förväntas ta emot paketet, format YYYY-MM-DDTHH
-serviceCodes: 19 för service_point, 17 för home_delivery
-originPostalCode: avsändarens postnummer
-originCountryCode: SE
- destinationPostalCode: mottagarens postnummer
- destinationCountryCode: SE

Läs först shippingAdapter.js, shippingService.js och shippingRoutes.js och återanvänd deras struktur.
Lägg till getDeliveryEstimate() i shippingAdapter.js som använder befintlig API-nyckel, har en timeout på 5sek, hanterar nätverksfel samt ogiltiga svar. API ska returnera en array med resultat, filtrera bort resultaten där isSupported !== true, isBookable !== true eller estimatedTimeOfArrival.timeOfArrival saknas.
Matcha rätt service.basicServiceCode. 

- Lägg till funktion i shippingService.js som validerar fraktmetod och mottagarpostnummer (genom de funktioner vi redan har), map'ar service_point till servicekod 19 och home_delivery till servicekod 17, anropar adaptern och återanvänder den postnummervalidering som redan finns. 

Ändra ingen kod som inte behövs ändras, och kör inga externa API-tester automatiskt, och visa vilka filer du ändrat och hur man testar endpointen manuellt!"

#### Korrigeringar:
- shippingAdapter.js returnerar fel format (rådata istället för normaliserat datum).
- 'startTIme' saknar minuter och överlämningstid.
- Saknad serverkonfiguration = fel HTTP-status

Korrigeringsprompt:
"- i shippingAdapter.js ska getDeliveryEstimate() returnera en array med den befintliga normaliserade datumet. Lägg till service.name i zod-schemat, filtrera på isSupported === true, isBookable === true, rätt basicServiceCode och giltig timeOfArrival. 
Vid fler resultat med samma prioritet, välj tidigaste ankomst. 

-Returnera:
{
estimatedDeliveryDate: "YYYY-MM-DD",
estimatedDeliveryTime: "YYYY-MM-DDTHH:mm",
serviceName: "PostNord Service Point"
}

- i shippingService, GEnerera startTime i svensk lokal tid. Använd nästa vardag kl 08.00 som förenklad överlämningstid, med formatet YYYY-MM-DDTHH. 
Hantera också lördag och söndag genom att välja måndag.

- om POSTNORD_ORIGIN_POSTAL_CODE saknas/ogiltig, kasta ett fel. Låt inte det jkass
