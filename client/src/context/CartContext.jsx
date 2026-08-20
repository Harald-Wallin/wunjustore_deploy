import {createContext, useContext, useState} from "react";

const CartContext = createContext(null);

function CartProvider ({children}) {
    
    const [cartItems, setCartItems] = useState([]);

    //Add BEAT to cart
    function addBeatToCart(beat){

        /*Catch ifall beatet redan finns i varukorgen, ingen idé att köpa plural,
        kanske ev. om man vill kunna "gifta" bort ett beat till nån i framtiden.

        'Some' loopar precis som map igenom alla items innuti, i detta fall 'CartItems' 
        och returnerar bool "true" vid matchning. Skriver detta för självpedagogik..*/
        const beatAlreadyInCart = cartItems.some(
            (currentBeat) => currentBeat.id === beat.id
        );

        /*Avbryter alltså funktionen innan serCartItems om some hittar ett beat som 
        redan ligger i varukorg. Ska skriva en alert eller något med returnen nedan för bra UX*/
        if (beatAlreadyInCart) {
            return;
        };

        //Skapar ny array med alla items från cartItems + 'beat'-prop'en
        setCartItems([...cartItems, beat]);
    };


    //Add ALBUM to cart
    function addAlbumToCart(album){
        setCartItems((currentCartItems) =>{

            //Lägger endast till beats som inte redan finns i cart
            const newBeats = album.beats.filter(
                (albumBeat) => !currentCartItems.some(
                    (cartBeat) => cartBeat.id === albumBeat.id
                )
            );

            return [...currentCartItems, ...newBeats];
        });
    };


    //Remove BEAT
    function removeBeatFromCart(beatId){
        setCartItems(cartItems.filter(
            (currentbeat => currentbeat.id !== beatId
            ))
        );
    };


    //Clear cart
    function clearCart(){
        setCartItems([]);
    };


    //Total
    const totalPrice = cartItems.reduce(
        (total, currentBeat) => total + currentBeat.beatPrice, 0
    );

    
    //"Verktygslåda" vi skickar med
    const value = {
        cartItems,
        addBeatToCart,
        addAlbumToCart,
        removeBeatFromCart,
        clearCart,
        totalPrice,
    };

    return(
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );

    /*städar upp CartContext*/
    function useCart(){
        const context = useContext(CartContext);

        if(!context){
            throw new Error("useCart must be used inside CartProvider");
        };

        return context;
    };
};

export {CartProvider, useCart};
