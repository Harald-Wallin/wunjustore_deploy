# Sitemap 

Webbplatsen kommer ha tre möjliga användarstates:

-Besökare (inte inloggad)
-Kund (inloggad)
-Administratör (inloggad som 'admin')

## Sidan som besökare

Home ("/")
    Browse Music ("/albums")
        Album tracklist ("albums/:albumID")

    About("/about")

    Login ("/Login")

## Ytterligare routes, inloggad 'Kund'...

    Account ("/account")
        Profile ("/account/profile")
        My Orders ("/account/orders")
            Order Details ("account/orders/:orderId")

## ...eller 'Admin'
Admin ("/Admin")
    Manage Albums ("/admin/albums")
        Create Album ("/admin/albums/new")
        Edit Album ("/admin/albums/:albumId/edit")

    Manage Beats ("admin/beats")
        Create Beat ("/admin/beats/new")
        Edit Beat ("admin/beats/:beatId/edit")

    View Orders ("/admin/orders")
        Order Details ("admin/orders/:orderId")

    Edit About ("admin/about")


## Gemensam navigation

### Besökare
-Home
-Browse Music
-About
-Login

### Kund
-Home
-Browse Music
-About
-My account/My profile
-Cart
-Logout (kommer eventuellt istället finnas i My account-sidan)

### Admin(istratör)
-Home
-Browse Music (editable)
-About (editable)
-Orders



