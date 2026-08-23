import pool from "../database/db.js";

async function createOrder(userId, beatIds) {

    //samlar connection för kommande transaction
    const client = await pool.connect();

    try {
        // Här används en "transaction" som startas.
        //Jag vill testa transaction (nytt för mig) för jag läst och
        //tycker det låter stabilare/mindre krångel med trasiga ordrar
        await client.query("BEGIN");


        // kontroll att användaren finns
        const userResult = await client.query(`
            SELECT id
            FROM users
            WHERE id = $1;
            `,[userId]
        );

        //if not..
        if (userResult.rows.length === 0) {
            throw new Error("USER_NOT_FOUND");
        }


        // Hämta beats + priser från db'n.
        //"WHERE id = ANY($1::int[]);" > beats där 
        // id är någon av parameter-värdena ($1)
        const beatsResult = await client.query(`
            SELECT
            id,
            beat_price::float AS "beatPrice"
            FROM beats
            WHERE id = ANY($1::int[]);
            `,[beatIds]
        );

        const beats = beatsResult.rows;


        // kontroll att begärda beats exsterar
        if (beats.length !== beatIds.length) {
            throw new Error("BEAT_NOT_FOUND");
        }


        // total
        const orderTotal = beats.reduce(
            (total, beat) => total + beat.beatPrice,
            0
        );


        //skapar ordern
        const orderResult = await client.query(`
            INSERT INTO orders (
            user_id,
            order_total
            )
            VALUES ($1, $2)
            RETURNING
            id,
            user_id AS "userId",
            order_total::float AS "orderTotal",
            created_at AS "createdAt";
            `,[userId, orderTotal]
        );

        const order = orderResult.rows[0];


        // Skapar en ORDER_ITEMS-rad per köpt beat
        for (const beat of beats) {
            await client.query(`
                INSERT INTO order_items (
                order_id,
                beat_id,
                unit_price
                )
                VALUES ($1, $2, $3);
                `,[order.id,beat.id, beat.beatPrice]
            );
        }

        //om allt fungerar så..
        await client.query("COMMIT");

        return {...order,items: beats};

    } catch (error) {

        //om något går fel > rollback
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}

export { createOrder };