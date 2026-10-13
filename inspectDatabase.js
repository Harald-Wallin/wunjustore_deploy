import "dotenv/config";
import pool from "./database/db.js";
import { id } from "zod/locales";
import { promise, size } from "zod";

try {
    const result = await pool.query(`
        SELECT
            table_name,
            column_name,
            data_type,
            is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    `);

    console.table(result.rows);

} catch (error) {
    console.error("Kunde inte läsa databasen:", error.message);

} finally {
    await pool.end();
} 
