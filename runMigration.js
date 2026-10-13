import "dotenv/config";
import { readFile } from "node:fs/promises";
import pool from "./database/db.js";

// .argv= hämta filnamnet från terminalen, t.ex:
//"node runMigration.js 002_add_supplier_product_image.sql"
const migrationFile = process.argv[2];

if (!migrationFile) {
    console.error("Ange vilken migration som ska köras!");
    process.exitCode = 1;

} else {
    try {
        const sql = await readFile(
            `./database/migrations/${migrationFile}`,
            "utf8"
        );

        await pool.query(sql);

        console.log(`Migrationen ${migrationFile} kördes utan fel!`);

    } catch (error) {
        console.error("Migrationen misslyckades:", error.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}