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