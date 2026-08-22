import pg from "pg";    

//Tänkte prova på en pool, nu när det kommit upp under föreläsningen
const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    //Liten debuggingbool
    hasPassword: Boolean(process.env.DB_PASSWORD),
});

export default pool;