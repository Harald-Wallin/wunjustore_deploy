import { normalizeSupplierProduct } from "./normalizeSupplierProduct.js";
import { SupplierProductSchema } from "./supplierProductSchema.js";

export function validateSupplierProducts(rawProducts){

    const validProducts = [];
    const skippedProducts = [];

    for (const rawProduct of rawProducts){

        const product = normalizeSupplierProduct(rawProduct);

        const result = SupplierProductSchema.safeParse(product);

        if (result.success){

            validProducts.push(result.data);

        } else {

            skippedProducts.push({
                sku: rawProduct.artNr,
                reasons: result.error.issues.map(issue => issue.message)
            });
        }
    }

    return {validProducts, skippedProducts};
}