const BASE_URL = "https://api.frankfurter.dev/v1";

//base= om ingen "base" skickas in, kör på SEK
//base är utgångsvalutan, symbols är de som frankfurter ska skicka tillbaks
export async function getRates(base = "SEK", symbols = ["SEK", "EUR", "USD"]){

    //URL-objektet förstår en url-struktur
    const url = new URL(`${BASE_URL}/latest`);

    //searchParams låter oss manipulera url. 
    // Här lägger vi till "base" + base-värdet från funktionshuvud. 
    //Resultatet = "https://api.frankfurter.dev/v1/latest?base=SEK"
    // + symbols = "https://api.frankfurter.dev/v1/latest?base=SEK&symbols=SEK,EUR,USD,DKK"
    url.searchParams.set("base", base);
    url.searchParams.set("symbols", symbols.join(","));

    try{
        const response = await fetch(url);
        const data = await response.json();

        return{
            base: data.base,
            date: data.date,
            rates: data.rates
        };

    }catch (error){// bättre med ifsats på själva fetchen med !fetch än detta
        throw new Error('Hoppsan, fel vid currency converter fetchen')
    };

};