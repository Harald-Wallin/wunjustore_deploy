import { getSupplierProductsFromCsv } from "../integrations/supplierAdapter.js";
import { validateSupplierProducts } from "../integrations/validateSupplierProducts.js";

import {upsertSupplierProduct, supplierProductExists} from "./supplierProductService.js";

export async function importSupplierProducts() {

    //Hämta leverantörens produkter
    const rawProducts = await getSupplierProductsFromCsv();

    //Normalisera + validera
    const { validProducts, skippedProducts } =
        validateSupplierProducts(rawProducts);

    //Förbered statistik
    let created = 0;
    let updated = 0;

    //Spara varje giltig produkt
    for (const product of validProducts) {

        const exists = await supplierProductExists(product.sku);

        await upsertSupplierProduct(product);

        if (exists) {
            updated++;
        } else {
            created++;
        }
    }

    //Returnera resultatet
    return {
        total: rawProducts.length,
        created,
        updated,
        skipped: skippedProducts.length,
        skippedProducts
    };
}