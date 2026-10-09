import { fetchJson } from "../lib/fetchJson.js";
import { z } from "zod";

const BASE_URL = "https://api.frankfurter.dev/v1";

//Zod: nästan som typescript fast för inkommande data
const FrankfurterRatesSchema = z.object ({
    amount: z.number(). positive(),
    base: z.string(),
    date: z.string(),
    rates: z.record(
        z.string(),
        z.number().positive()
    )
});

//CACHE
const CACHE_DURATION = Number(process.env.CURRENCY_CACHE_SECONDS ?? 300) * 1000;
// Map kan endast lagra "KEY:" + "VALUE:" 
// !!!Value: KAN vara ett {objekt}!!!
const cache = new Map();

//base= om ingen "base" skickas in, kör på SEK
//'base' är utgångsvalutan, 'symbols' är de som frankfurter ska skicka tillbaks
export async function getRates(base = "SEK", symbols = ["SEK", "EUR", "USD"]){

    // En unik nyckel för just denna valutaförfrågan, t.ex "SEK:SEK,EUR,USD". Key används för att 
    //hämta rätt/matchande cache- flera caches kan ju vara sparade samtidigt i "MAP();"
    const cacheKey = `${base}:${symbols.join(",")}`;

    // Finns ett tidigare sparat resultat?
    const cached = cache.get(cacheKey);

    // Finns resultatet OCH är det fortfarande giltigt?
    if (cached && Date.now() < cached.expiresAt) {
        console.log("Currency cache HIT");

        return cached.data;
    }

    console.log("Currency cache MISS");

    //URL-objektet förstår en url-struktur
    const url = new URL(`${BASE_URL}/latest`);

    //searchParams låter oss manipulera url. 
    // Här lägger vi till "base" + base-värdet från funktionshuvud (base är en del av api'ns egna URL-path)
    //Resultatet = "https://api.frankfurter.dev/v1/latest?base=SEK"
    // + symbols = "https://api.frankfurter.dev/v1/latest?base=SEK&symbols=SEK,EUR,USD,DKK"
    url.searchParams.set("base", base);
    url.searchParams.set("symbols", symbols.join(","));

    const data = await fetchJson(url.toString());//Vi har ingen TS så .toString får duga

    //'data' stoppas in i 'safeParse' och testas mot 'FrankfurterRatesSchema'
    const result = FrankfurterRatesSchema.safeParse(data);

    if (!result.success){
        console.log(result.error);//Zod's data
        throw new Error("Invalid data recieved from Frankfurter");
    }

    //Här KAN man använda endast "data.base" men för att använda den testade datan
    //returnerar vi "RESULT.data.base".
    // vi gör här ett objekt av det vi ska returnera ist för att returnera allt direkt)
    const rates= {
        base: result.data.base,
        date: result.data.date,
        rates: result.data.rates
    };

    cache.set(cacheKey,{ data: rates, expiresAt: Date.now() + CACHE_DURATION});

    return rates;
};