import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config/api.js";

const CurrencyContext = createContext(null);

function CurrencyProvider({ children }) {

    //Vilken valuta har användaren valt just nu?
    const [currency, setCurrency] = useState("SEK");

    //Vilka växelkurser? T.ex Sek: 1, EUR: 0.09, USD: 0.10 osv
    //Default här betyder alltså 1kr = 1kr
    const [rates, setRates] = useState({SEK: 1});

    useEffect(() => {

        async function fetchRates(){

            const response = await fetch(`${API_URL}/api/currency/rates?base=SEK`);
            const data = await response.json();

            //Sätter rates till SEK: 1 + data.rates
            setRates({SEK: 1,...data.rates});
        }

        fetchRates();

    }, []);

    function convertPrice(price) {
        return price * rates[currency];
    }

    const value = {currency,setCurrency,rates,convertPrice};

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );

}

function useCurrency(){
    const context = useContext(CurrencyContext);

    if(!context){
        throw new Error("useCurrency must be used inside Currencyprovider");
    }

    return context;
}

export { CurrencyProvider, useCurrency,};