import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config/api.js";

const CurrencyContext = createContext(null);

function CurrencyProvider({ children }) {

    //Vilken valuta har användaren valt just nu?
    const [currency, setCurrency] = useState("SEK");

    //Vilka växelkurser? T.ex Sek: 1, EUR: 0.09, USD: 0.10 osv
    //Default här betyder alltså 1kr = 1kr
    const [rates, setRates] = useState({SEK: 1});

    const effectiveCurrency = rates[currency] ? currency : "SEK";

    useEffect(() => {

        async function fetchRates(){

            try{
                const response = await fetch(`${API_URL}/api/currency/rates?base=SEK`);

                if(!response.ok){
                    throw new Error(`Failed to fetch currency rates: ${response.status}`);
                }

                const data = await response.json();

                //Sätter rates till SEK: 1 + data.rates
                setRates({SEK: 1,...data.rates});

            }catch(error){
               console.error("Could not load currency rates:", error); 

               setRates({SEK: 1});
               //Fallback till SEK
               setCurrency("SEK");
            }
        
        };

        fetchRates();

    }, []);



        function convertPrice(price) {
            return price * rates[effectiveCurrency];
        }

    const value = {currency,setCurrency,effectiveCurrency,rates,convertPrice};

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