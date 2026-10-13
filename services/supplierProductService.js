import pool from "../database/db.js";

export async function upsertSupplierProduct(product) {

    //"VALUES ($1, $2,...) = placeholders, INTE priser!!"
    //ON CONFLICT = om sku redan finns, uppdatera

    const result = await pool.query(
        `INSERT INTO supplier_products (
            sku,
            ean,
            name,
            category,
            price,
            stock,
            variants,
            supplier_updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

        ON CONFLICT (sku)
        DO UPDATE SET
            ean = EXCLUDED.ean,
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            stock = EXCLUDED.stock,
            variants = EXCLUDED.variants,
            supplier_updated_at = EXCLUDED.supplier_updated_at

        RETURNING *;`,
        [
            product.sku,
            product.ean,
            product.name,
            product.category,
            product.price,
            product.stock,
            product.variants,
            product.updatedAt
        ]
    );

    return result.rows[0];
}

export async function supplierProductExists(sku) {
    const result = await pool.query(
        `SELECT EXISTS (
            SELECT 1
            FROM supplier_products
            WHERE sku = $1
        ) AS exists`,
        [sku]
    );

    return result.rows[0].exists;
}