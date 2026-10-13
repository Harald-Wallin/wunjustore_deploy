import "dotenv/config";
import { readFile } from "node:fs/promises";
import pool from "./database/db.js";

try {
    const sql = await readFile(
        "./database/migrations/001_create_supplier_products.sql",
        "utf8"
    );

    await pool.query(sql);

    console.log("Migrationen kördes utan fel!");

} catch (error) {
    console.error("Migrationen misslyckades:", error.message);
    process.exitCode = 1;

} finally {
    await pool.end();
}