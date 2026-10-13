import "dotenv/config";

import pool from "./database/db.js";
import { importSupplierProducts } from "./services/importSupplierProducts.js";

try {
    const result = await importSupplierProducts("xml");

    console.log("XML-import klar!");
    console.log(JSON.stringify(result, null, 2));

} catch (error) {
    console.error("XML-importen misslyckades:", error);

} finally {
    await pool.end();
}