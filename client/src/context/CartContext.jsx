import {createContext, useContext, useState} from "react";

const CartContext = createContext(null);

function CartProvider ({children}) {
    
    const [cartItems, setCartItems] = useState([]);

    //Add BEAT to cart
    function addBeatToCart(beat){

        setCartItems((currentCartItems) => {

            /*Catch ifall beatet redan finns i varukorgen, ingen idé att köpa plural,
            kanske ev. om man vill kunna "gifta" bort ett beat till nån i framtiden.

            'Some' loopar precis som map igenom alla items innuti, i detta fall 'CartItems' 
            och returnerar bool "true" vid matchning*/
            const beatAlreadyInCart = cartItems.some(
                (item) => item.productType === "beat" && item.productId === beat.id
            );

            /*Avbryter alltså funktionen innan serCartItems om some hittar ett beat som 
            redan ligger i varukorg. Ska skriva en alert eller något med returnen nedan för bra UX*/
            if (beatAlreadyInCart) {
                return currentCartItems;
            };

            const newBeat = {
                productType: "beat",
                productId: beat.id,
                quantity: 1,
                name: beat.beatName,
                price: Number(beat.beatPrice),
                image: beat.albumCover,
                albumId: beat.albumId,
                albumName: beat.albumName
            };

            //Skapar ny array med alla items från cartItems + 'beat'-prop'en
            return [...currentCartItems, newBeat];
        });
    };

    //add MERCH to cart
    function addMerchToCart(product) {

        setCartItems((currentCartItems) => {

            const merchAlreadyInCart = currentCartItems.some(
                (item) => item.productType === "merch" && item.productId === product.id
            );

            if (merchAlreadyInCart) {
                return currentCartItems;
            }

            const newMerch = {
                productType: "merch",
                productId: product.id,
                quantity: 1,
                name: product.name,
                price: Number(product.price),
                image: product.image_url
            };

            return [...currentCartItems, newMerch];
        });
    }


    //Add ALBUM to cart
    function addAlbumToCart(album) {

        setCartItems((currentCartItems) => {

            const newBeats = album.beats
                .filter(
                    (beat) => !currentCartItems.some(
                        (item) => item.productType === "beat" && item.productId === beat.id
                    )
                )
                .map((beat) => ({
                    productType: "beat",
                    productId: beat.id,
                    quantity: 1,
                    name: beat.beatName,
                    price: Number(beat.beatPrice),
                    image: beat.albumCover ?? album.albumCover,
                    albumId: beat.albumId ?? album.id,
                    albumName: beat.albumName ?? album.albumName
                }));

            return [...currentCartItems, ...newBeats];
        });
    }


    
    function removeFromCart(productType, productId) {

        setCartItems((currentCartItems) =>
            currentCartItems.filter(
                (item) => !(item.productType === productType && item.productId === productId)
            )
        );
    }


    //Clear cart
    function clearCart(){
        setCartItems([]);
    };


    //Total
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,0
    );

    
    //"Verktygslåda" vi skickar med
    const value = {
    cartItems,
    addBeatToCart,
    addAlbumToCart,
    addMerchToCart,
    removeFromCart,
    clearCart,
    totalPrice
};

    return(
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

/*städar upp CartContext*/
function useCart(){
    const context = useContext(CartContext);

    if(!context){
        throw new Error("useCart must be used inside CartProvider");
    };

    return context;
};

export {CartProvider, useCart};
