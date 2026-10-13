import {fetchWithRetry} from "../lib/fetchWithRetry.js"
import { mapSupplierXmlProduct } from "./convertXmlPoduct.js";

import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";

const BASE_URL = "https://leverantor-api.vercel.app"


//----------CSV------------

export async function getSupplierCsv(){

    //FELSÖKNING
    //console.log("BASE_URL:", BASE_URL);
    //console.log("BASE_URL type:", typeof BASE_URL);


    //Parametrar: Sökväg, sedan Basadress (funktionen vill ha denna ordning)
    //Intressant: Hela kompletta url'en blir en 'href'.
    const url = new URL("/v1/export/products.csv", BASE_URL);

    //FELSÖKNING
    //console.log("URL:", url.toString());

    //sätter search-parametrarna "?branch=klader" (key + value?), så:
    // "https://leverantor-api.vercel.app/v1/export/products.csv?bransch=klader"
    url.searchParams.set("bransch", "klader");

    const response = await fetchWithRetry(url.toString(),{
        headers: {
            //X-Api-Key är namnet på headern som leverantören förväntar sig, 
            //med värdet hämtat från miljövariabeln 
            "X-Api-Key": process.env.SUPPLIER_API_KEY
        }
    })

    //buffer läser innehåll som råa bytes
    const buffer = await response.arrayBuffer();

    //Decoder-object som tolkar "windows-1252" så vårat system kan förstå det
    const decoder = new TextDecoder("windows-1252");

    //Decoding
    return decoder.decode(buffer);

}

//Omformaterar till CSV
export async function getSupplierProductsFromCsv(){
    
    const csvText = await getSupplierCsv();

    const products = parse(csvText,{
        columns: true, //låter översta raden läsas som kolumnnamn
        delimiter: ";", //symbol som separerar kolumnerna
        skip_empty_lines: true, //hoppar över helt tomma rader
        trim: true //tar bort blanksteg
    })

    return products;
}


//---------XML----------

export async function getSupplierXml() {
    const url = new URL("/v1/export/products.xml", BASE_URL);

    url.searchParams.set("bransch", "klader");

    const response = await fetchWithRetry(url.toString(), {
        headers: {
            "X-Api-Key": process.env.SUPPLIER_API_KEY
        }
    });

    //console.log("Content-Type:", response.headers.get("content-type"));

    const buffer = await response.arrayBuffer();

    //CSV'n var i windows1252, men denna xml är i utf-8, enligt header-datan
    const decoder = new TextDecoder("utf-8");

    return decoder.decode(buffer);
}


export async function getSupplierProductsFromXml(){
    const xmlText = await getSupplierXml();

    const parser = new XMLParser({
        ignoreAttributes: false, //behåller attributer i elementen
        parseTagValue: false, //Behåller värden som text, t.ex bra för ean så de inte blir Number
        trimValues: true,
        isArray: (tagName) => tagName === "produkt" || tagName === "variant" //produkt + variant blir alltid arrayer
    });

    const parsedXml = parser.parse(xmlText);

    const xmlProducts = parsedXml.katalog?.produkt ?? [];

    return xmlProducts.map(mapSupplierXmlProduct);
}