import { getAllProducts } from "./productService.js";
import { indexProducts } from "../integrations/searchAdapter.js";

export async function syncProductsToAlgolia(){

    //hämtar från databasen (productService.js)
    const products = await getAllProducts();

    //skickar till algolia (searchAdapter.js)
    const indexedCount = await indexProducts(products);

    //returnerar hur många artiklar som hämtades från db, och 
    //hur många som indexerats i algolia
    return {total: products.length, indexed: indexedCount};
}