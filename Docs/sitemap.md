# Sitemap

## Sidor & deras ansvar/funktion
### Homepage ("/") (åtkomst: alla)
-Visa webbplatsens introduktion
-Visa senaste eller aktuella album
-Länka till Browse Music
-Eventuellt visa nyheter eller kampanjinnehåll
### Adminfunktioner
-Redigera eventuella nyheter / kampabjer


### BrowseMusicPage ("/albums") (åtkomst: alla)
-Hämta och visa samtliga album
-Visa albumomslag, namn och eventuell information
-Länka till respektive albums TrackListPage
-Visa adminfunktioner om användaren är administratör
### Adminfunktioner
-Skapa album
-Redigera album
-Eventuellt ta bort album


### TrackListPage ("/albums/:albumId") (åtkomst: alla)
-Hämta ett album
-Visa albuminformation och albumomslag
-Visa albumets beats
-Spela previews
-Lägga enskilda beats i varukorgen
-Lägga hela albumets beats i varukorgen
-Eventuellt markera beats som användaren redan äger (om inloggad)


### AboutPage ("/about") (åtkomst: alla)
-Visa information om Wunju
-Visa bild
-Visa kontakt- eller sociala medielänkar
### Adminfunktioner
-Visa redigeringsalternativ

### CartPage ("/cart") (åtkomst: alla)
-Visa beats i varukorgen
-Ta bort beats från varukorgen
-Förhindra dubletter
-Visa totalpris
-Länka till CheckoutPage


### CheckoutPage ("/checkout") (åtkomst: kund)
-Visa orderöversikt
-Visa totalpris
-Bekräfta kunduppgifter
-Validera formuläret
-Skicka ordern till API:et
-Navigera till orderbekräftelsen


### OrderConfirmationPage ("/orders/:orderId/confirmation") (åtkomst: kund (den som skapade ordern))
-Bekräfta att ordern skapades
-Visa tackmeddelande
-Visa ordernummer
-Visa köpta beats
-Visa totalsumma
-Länka tillbaka till butiken


### LoginPage ("/login") (åtkomst: besökare)
-Visa loginformulär
-Skicka e-post och lösenord till API:et
-Hämta den inloggade användaren
-Navigera kunden eller administratören till rätt sida
-Visa felmeddelande vid misslyckad login


### NotFoundPage ("*") (åtkomst: alla)
-Visas när ingen annan route matchar
-Länka tillbaka till HomePage


### ProfilePage ("/account/profile") (åtkomst: kund)
-Visa kundens namn, e-postadress och adress
-Eventuellt redigera kundinformation


### CustomerOrdersPage ("/account/orders") (åtkomst: kund)
-Visa kundens tidigare ordrar
-Visa orderdatum och totalsumma
-Länka till orderdetaljer


### CustomerOrderDetailsPage ("/account/orders/:orderId") (åtkomst: kund(som äger ordern))
-Visa en specifik order
-Visa samtliga köpta beats
-Visa pris och orderdatum


### AdminAlbumsPage ("/admin/albums") (åtkomst: admin)
-Visa samtliga album
-Skapa album
-Öppna AlbumEditorPage
-Eventuellt ta bort album


### AlbumEditorPage ("/admin/albums/:albumId/edit") (åtkomst: admin)
-Redigera albumets namn, pris och omslag
-Visa albumets beats
-Lägga till beats
-Redigera beats
-Ta bort beats


### BeatCreatePage ("/admin/beats/new") (åtkomst: admin)
-Visa formulär för nytt beat
-Välja album
-Spara beatet i databasen


### AdminOrdersPage ("/admin/orders") (åtkomst: admin)
-Visa samtliga ordrar
-Visa kund, datum och totalsumma
-Länka till orderdetaljer


### AdminOrdersDetailsPage ("/admin/orders/:orderId") (åtkomst: admin)
-Visa kundinformation
-Visa köpta beats
-Visa priset vid köptillfället
-Visa orderns totalsumma

### BeatEditPage ("/admin/beats/:beatId/edit") (åtkomst: admin)
-Hämta befintligt beat
-Visa beatets nuvarande information
-Redigera namn, pris, album och preview
-Validera formuläret
-Spara ändringarna i databasen

### CreateAlbumPage ("/admin/album/new") (åtkomst: admin)
-Visa formulär för ett nytt album
-Ange albumnamn
-Ange albumpris
-Ange albumomslag
-Validera formuläret
-Spara albumet i databasen
-Navigera till AlbumEditorPage efter att albumet skapats

## Route protection
Routes som kräver login ska skyddas av en route-komponent

### RequireAuth
Skyddar routes som kräver en inloggad användare

### RequireAdmin
Skyddar routes som kräver rollen "admin"


## Sitemap
Webbplatsen kommer ha tre möjliga användarstates:

-Besökare (inte inloggad)
-Kund (inloggad)
-Administratör (inloggad som 'admin')

## Sidan som besökare

Home ("/")
    Browse Music ("/albums")
        Album tracklist ("/albums/:albumID")

    About("/about")

    Cart ("/cart")

    Login ("/login")

## Ytterligare routes, inloggad 'Kund'...

    Account ("/account")
        Profile ("/account/profile")
        My Orders ("/account/orders")
            Order Details ("account/orders/:orderId")

## ...eller 'Admin'
Admin ("/admin")
    Create Album ("/admin/albums")
    Edit Album ("/admin/album:Id/edit")
        Create beat ("/admin/albums/new")
        Edit beat ("/admin/albums/:albumId/edit")

    View Orders ("/admin/orders")
        Order Details ("admin/orders/:orderId")



## Gemensam navigation

### Besökare
-Home
-Browse Music
-About
-Cart
-Login


### Kund
-Home
-Browse Music
-About
-cart
-My account/My profile
-Logout (kommer eventuellt istället finnas i My account-sidan)

### Admin(istratör)
-Home
-Browse Music (editable)
-Manage Albums
-About (editable)
-Orders
-Logout


