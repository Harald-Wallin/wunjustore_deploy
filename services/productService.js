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