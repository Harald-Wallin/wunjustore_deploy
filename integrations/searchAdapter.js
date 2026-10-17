import "dotenv/config";
import { algoliasearch } from "algoliasearch";

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX ?? "wunjustore_products";


//Timeout-inställningar för Algolia (millisekunder)
const ALGOLIA_TIMEOUTS = {
    connect: 2000,
    read: 5000,
    write: 10000
};


//adminklient med nycklar till algolia
const adminClient = algoliasearch(APP_ID, ADMIN_KEY, {timeouts: ALGOLIA_TIMEOUTS});
//sökklient
const searchClient = algoliasearch(APP_ID, SEARCH_KEY, {timeouts: ALGOLIA_TIMEOUTS});


//anpassar vår interna produktmodell till Algolia-format:
//Alla rader kan döpas till vad som helst förutom "objectID" som måste heta just detta.
function mapProductsToRecords(products) {

    return products.map((product) => ({
        objectID: product.sku,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        stock: product.stock
    }));
}


//skickar produkter till Algolias sökindex
export async function indexProducts(products) {

    const records = mapProductsToRecords(products);

    console.log("Algolia index:", INDEX_NAME);
    console.log("Records sent to Algolia:", records.length);

    //Spara produkterna i Algolia, det faktiska anropet
    await adminClient.saveObjects({
        indexName: INDEX_NAME, //alltså "wunjustore_products"
        objects: records,
        waitForTasks: false
    });

    //returnerar antalet map'ade produkter
    return records.length;
}


//Fullständig synkronisering, ersätter indexets innehåll. Hålls separat från 'indexProducts();' 
//pga mycket långsam funktion
export async function replaceAllProducts(products) {

    const records = mapProductsToRecords(products);

    await adminClient.replaceAllObjects({
        indexName: INDEX_NAME,
        objects: records
    });

    return records.length;
}


//söker efter produkter i algolia
export async function searchProducts(query, page = 1, pageSize = 9){

    //SÖKNING SKICKAS TILL ALGOLIA
    //"searchSingleIndex" = inbyggd funktion i searchClient (inbygd fetch)
    //
    const response = await searchClient.searchSingleIndex({
        indexName: INDEX_NAME, //vilket algolia-index vi ska söka i
        searchParams: {
            query, //t.ex "keps"( egentligen 'query:query', JS tillåter förkortningen)
            page: page - 1, //Om funktion tar emot page = 2, skickas page: 1 till algolia
            hitsPerPage: pageSize //antalet sökträffar per sida
        }
    });

    //omvanlar algolias resultat (hits) till vår interna modell
    const products = response.hits.map((hit) =>({
        sku: hit.objectID,
        name: hit.name,
        category: hit.category,
        price: hit.price,
        stock: hit.stock
    }));

    //EXEMPEL på algola-response:

    /*const response = {
    hits: [
        {
            objectID: "LEV-1001",
            name: "Blue Hoodie",
            category: "Kläder",
            price: 499,
            stock: 12
        },
        {
            objectID: "LEV-1002",
            name: "Black Hoodie",
            category: "Kläder",
            price: 599,
            stock: 8
        }
    ],
    nbHits: 2,*/

    //antalet träffar
    const total = response.nbHits ?? 0;

    //returnerar resultatet med pageSize. Math.ceil avrundar uppåt till närmsat heltal
    return {
        data: products,
        meta: {page, pageSize, total, totalPages: Math.ceil(total / pageSize)}
    };
}


//Ta bort en produkt från Algolia
export async function deleteProductFromIndex(sku) {

    return await adminClient.deleteObject({
        indexName: INDEX_NAME,
        objectID: sku
    });
}