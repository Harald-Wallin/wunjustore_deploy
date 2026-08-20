import {createContext, useContext, useState} from "react";

const CartContext = createContext(null);

function CartProvider ({children}) {
    
    const [cartItems, setCartItems] = useState([]);

    /*Add BEAT to cart*/
    function addBeatToCart(beat){
        const beatAlreadyInCart = cartItems.some(
            (currentBeat) => currentBeat.id === beat.id
        );

        if (beatAlreadyInCart) {
            return;
        };
    };


    /*Add ALBUM to cart*/
    function addAlbumToCart(album){
        setCartItems((currentCartItems) =>{
            const newBeats = album.beats.filter(
                (albumBeat) => !currentCartItems.some(
                    (cartBeat) => cartBeat.id === albumBeat.id
                )
            );

            return [...currentCartItems, ...newBeats];
        });
    };

};
