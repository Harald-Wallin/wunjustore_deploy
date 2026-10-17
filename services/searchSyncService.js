import { getAllProducts } from "./productService.js";
import { indexProducts, replaceAllProducts } from "../integrations/searchAdapter.js";

export async function syncProductsToAlgolia(){

    console.time("PostgreSQL fetch");


    //hämtar från databasen (productService.js)
    const products = await getAllProducts();

    console.log("Products from PostgreSQL:", products.length);
    
    console.time("Algolia indexing");


    //skickar till algolia (searchAdapter.js)
    const indexedCount = await indexProducts(products);

    console.timeEnd("Algolia indexing");
    console.log("Indexed count returned:", indexedCount);

    //returnerar hur många artiklar som hämtades från db, och 
    //hur många som indexerats i algolia
    return {total: products.length, indexed: indexedCount};
}


//Bygger om hela Algolia-indexet från databasen
export async function fullSyncProductsToAlgolia() {

    const products = await getAllProducts();

    const indexedCount = await replaceAllProducts(products);

    return {total: products.length, indexed: indexedCount};
}