# Components

De components jag planerar att projektet ska innehålla/använda
Detta är endast ett första utkast och för planering, så fler, färre eller andra komponenter kanske kommer användas/skapas

## Layout

### AppLayout
-Rendera Header
-Rendera Footer
-Rendera sidans innehåll
-Eventuellt rendera en global musikspelare

### AdminLayout
-Rendera Header
-Rendera Footer
-Rendera adminnavigation
-Rendera sidans innehåll


### Header
-Visa Logotyp
-Huvudnavigering
-Länk till varukorgen
-Visa login/account/logout beroende på state
-Visa adminlänkar, om admin

### Navbar
-Home
-Browse Music
-About

+ om kund:
-Cart
-My Account
-Logout

+ om admin:
-Manage albums
-Orders
-Logout

### Footer
-Visa medielänkar

### PageContainer
-Gemensam wrapper för sidoinehåll

## Album Components

### AlbumList
- Visar en lista med album, eventuellt genom fler "albumCard"-components
- albums/isLoading/error

### AlbumCard
-Albumomslag
-Albumnamn
-Beskrivning, eventuell
-Album pris
-Knapp för att lägga hela albumet i varukorg

### AlbumForm
-Album name
-Description
-Album price
-Cover image

## Beats

### BeatList
- Beats
- Mode (shop/admin)
- ownedBeatIds
- cardBeatIds

### BeatRow
-Beat Name
-Pris

+ om shop-läge:
-Preview-knapp
-Add-to-cart-knapp
-Eventuell status (owned/in cart)

+ om admin-läge:
-Edit-knapp
-Remove-knapp

### BeatForm
-Formulär för att skapa/redigera beats
-Beat name
- Album
-Price
-Description
-Preview path/URL

### PreviewButton
-Starta/Pausa valt beat
-Kommunicera emd ett globalt audio-state

### AddToCartButton
-Lägg till produkt i Cart
-Förhindra dublettering
-Visa State om "in cart"/"Owned"

### AddAlbumToCartButton
-Lägga till hela albumet i Cart
-Hoppa över beats som redan finns i varukorg/användaren redan äger

### CartList
-Visar alla produkter i varukorgen, CartItem-komponenter

### CartItem
-Visar en produkt i varukorgen
-Beat name
-Album name
-Unit-pris
-Remove-knapp

### CartSummary
-Sammanfattar varukorgen
-Antal beats, totalpris, och checkout-knapp

## Checkout

### CheckoutForm
- Formulär där man bekräftar eller redigerar kunduppfigterna:
-Name, Email, adress, postkod, stad
-Hanterar formulärvärden, valideringsfel, och skickar ordern

### OrderSummary
-Beats
-Unit Prices
-Total price

### FormField
-Formulärkomponent, återanvändbar
-Label, input, valideringsfel

## Authentication

### LoginForm
-Email
-Password
- Skicka login-anrop, visa loadingstate, + felmeddelanden

### UserMenu
-Visar värde beroende på state,
-Kund: Profile, My Orders, Logout
-Admin: Manage Albums, Orders, Logout

### RequireAuth
-Skydd för sidor som kräver inloggad användare
-Tillåter inloggad användare
-skickar besökare till LoginPage

### RequireAdmin
-Skydd för sidor som kräver admin-roll
-Kontrollera inlogg, och att användare har admin
-Skicka obehörig användarte till lämplig sida

## Profile

### ProfileDetails
-Visar kundens info
-Name, email, adress, postal code, city

## Orders

### OrderList
-Visar alla ordrar genom OrderRow

### OrderRow
-Sammanfattar en order
- OrderID, customer, created at, total price, veiw details-knapp

### OrderDetails (använder alternativt inte denna)
-Visar fullständig info
-order ID, mer detaljerad lista kring vilka produkter som köptes

### OrderItemRow
-Enskild orderrad
-Beat name
-Price

## Admin

### AdminNavigation 
-Visar endast admin-layout
-Manage albums
-Orders
-Eventuellt Home & Browse Music

### AlbumAdminActions
-Samling av admin-knappar för ett album
-Edit-button
-Delete-button

### BeatAdminActions
-Samling av admin-knappar för ett beat
-Edit-button
-Delete-button

## Generella UI-komponenter

### Button (kanske inte använder)
-Generell knappkomponent

### LoadingMessage
-Visas medan data hämtas

### ErrorMessage
-Visar felmeddelande, frontend/API

### EmptyState
-Om innehåll saknas
-Varukorg tom/ saknar order


## Providers

### AuthProvider
-Hanterar auth. state
-States: Loading, Not logged in, Logged in customer, Logged in admin

### CartProvider
-Hanterar varukorg
-Spara korg i local storage

### AudioPlayerProvider
-Lagra aktuellt beat
-Starta/stoppa preview
-Volym

## Audio extras

### VolumeControl
-Kontrollerar volym

### AudioProgressBar
-Visar progress i preview