import { getSupplierProductsFromCsv } from "../integrations/supplierAdapter.js";
import { getSupplierProductsFromXml } from "../integrations/supplierAdapter.js";

import { validateSupplierProducts } from "../integrations/validateSupplierProducts.js";
import {upsertSupplierProduct, supplierProductExists} from "./supplierProductService.js";

export async function importSupplierProducts(format = "csv"){//CSV = standardformatet


    if(format !== "csv" && format !== "xml"){
        throw new Error("Formatet måste vara csv eller xml!");
    }

    //Hämta leverantörens produkter, om xml = ...FromXml(), om inte > ...FromCsv()
    const rawProducts = format === "xml" ? await getSupplierProductsFromXml() : await getSupplierProductsFromCsv();

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