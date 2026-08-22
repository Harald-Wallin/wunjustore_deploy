import pg from "pg";    

//Tänkte prova på en pool, nu när det kommit upp under föreläsningen
const { pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default pool;