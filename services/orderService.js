import pool from "../database/db.js";

async function createOrder(userId, beatIds) {

    //hämtar kundinfo + ordern
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


async function getOrderById(orderId) {

    const orderResult = await pool.query(`
        SELECT
        orders.id,
        orders.order_total::float AS "orderTotal",
        orders.created_at AS "createdAt",
        users.id AS "userId",
        users.user_name AS "userName",
        users.user_email AS "userEmail"
        FROM orders
        JOIN users
        ON users.id = orders.user_id
        WHERE orders.id = $1;
        `,[orderId]
    );

    //om ordern inte finns
    if (orderResult.rows.length === 0) {
        return null;
    }


    //Hämtar order-items + beat/album-information
    const itemsResult = await pool.query(`
        SELECT
        order_items.beat_id AS "beatId",
        order_items.unit_price::float AS "unitPrice",
        beats.beat_name AS "beatName",
        albums.id AS "albumId",
        albums.album_name AS "albumName",
        albums.cover_url AS "albumCover"
        FROM order_items
        JOIN beats
        ON beats.id = order_items.beat_id

        JOIN albums
        ON albums.id = beats.album_id

        WHERE order_items.order_id = $1

        ORDER BY order_items.id;
        `,[orderId]
    );


    const orderRow = orderResult.rows[0];

    const order = {
        id: orderRow.id,
        orderTotal: orderRow.orderTotal,
        createdAt: orderRow.createdAt,

        customer: {
            id: orderRow.userId,
            name: orderRow.userName,
            email: orderRow.userEmail

        },items: itemsResult.rows
    };


    return order;
};


async function getAllOrders(){

    const result = await pool.query(`
        SELECT
            orders.id,
            orders.order_total::float AS "orderTotal",
            orders.created_at AS "createdAt",

            users.id AS "userId",
            users.user_name AS "userName",
            users.user_email AS "userEmail"

        FROM orders
        JOIN users
        ON users.id = orders.user_id
        ORDER BY orders.created_at DESC;
    `);

    return result.rows;
};

//Get orders by userId
async function getOrdersByUserId(userId) {
    const result = await pool.query(`
        SELECT
            orders.id,
            orders.order_total::float AS "orderTotal",
            orders.created_at AS "createdAt"
        FROM orders
        WHERE orders.user_id = $1
        ORDER BY orders.created_at DESC;
        `,[userId]
    );

    return result.rows;
}

export { createOrder, getOrderById, getAllOrders, getOrdersByUserId };