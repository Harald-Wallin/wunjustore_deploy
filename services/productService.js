import pool from "../database/db.js";

//Hämta alla produkter från vår egen databas
export async function getAllProducts(){

    const result = await pool.query(`
        SELECT
            id,
            sku,
            name,
            category,
            price,
            stock,
            variants,
            image_url
        FROM supplier_products
        ORDER BY name ASC`
    );

    return result.rows;
}


//Skapa en ny produkt manuellt
export async function createProduct(product) {

    const result = await pool.query(
        `INSERT INTO supplier_products (
            sku,
            ean,
            name,
            category,
            price,
            stock,
            supplier_updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
        RETURNING *;`,
        [
            product.sku,
            product.ean,
            product.name,
            product.category,
            product.price,
            product.stock
        ]
    );

    return result.rows[0];
}




//Uppdatera namn och pris på en befintlig produkt
export async function updateProduct(sku, changes) {

    //COALESCE = använder befintligt värde om inget nytt kommer in
    //'::' = type casting, anger en explicit datatyp, t.ex "1::text"
    const result = await pool.query(
        `UPDATE supplier_products
        SET
            name = COALESCE($1::text, name),
            price = COALESCE($2::numeric, price)
        WHERE sku = $3
        RETURNING *;`,
        [
            changes.name ?? null,
            changes.price ?? null,
            sku
        ]
    );

    return result.rows[0] ?? null;
}



//Ta bort en produkt från databasen
export async function deleteProduct(sku) {

    const result = await pool.query(
        `DELETE FROM supplier_products
        WHERE sku = $1
        RETURNING *;`,
        [sku]
    );

    return result.rows[0] ?? null;
}