# Wunju Store

## About
Ett OTROLIGT grovhugget utkast av en eventuell egen sida
där jag säljer min egna musik under alias Wunju.

URSÄKTA en mycket ÖGONSTICKANDE besökarupplevelse på sidan,
det har varit snålt om tid och focus har legat på att få klart
funktionalitet!

(PS. All css är i det stora hela AI-genererad)

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
- Cart
- Checkout / create orders
- Customer order history
- Admin album/beat CRUD
- Admin order overview
- Fake customer/admin login

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
- Order status
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
Igen, pana gärna in /Docs/ i rootmappen-
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

# Labb 2

Implementering av sökfunktionen Algolia.
Huvudkonceptet är att den initiala produkt-fetchen fortfarande hämtas från databasen, och algolia endast ansvarar över funktionaliteten. Lite självklart kanske, men jag var lite inne på att låta algolia sköta även visningen över ALLA produkter när söktext saknades- men jag valde att låta db stå för "single source of truth" så långt det går.

### Refaktorering av 