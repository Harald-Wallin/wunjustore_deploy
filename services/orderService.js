import pool from "../database/db.js";
import {z} from "zod";


const cartItemSchema = z.object({
    productType: z.enum(["beat", "merch"]),
    productId: z.number().int().positive(),
    quantity: z.number().int().positivte()

    //refine= mer komplex regel än vanlig zod-validering. true om validering lyckatdes, annars false
    // parameter 1, parameter 2. P1 = funktion med objekt som ska valideras, ska returnera true/false
    // P2 = "konfigurationsobjekt" som talar om för zod hur valideringsfelet ska beskrivas
}).refine(
    (item) => item.productType !== "beat" || item.quantity === 1,
    {message: "Beats can only have quantity 1"}
);

//-cartSchema förväntar sig en array och alla objekt i arrayen måste följa zod'en, och innehålla minst ett objekt
//-innbyggd validering mot dubbla orderrader: new Set = kan endast innehålla unika värden.
const cartSchema = z.array (cartItemSchema).min(1).refine(
    (items) => {
        const keys = items.map(
            (item) => `${item.productType} -${item.productId}`// blir t.ex 'keys= ["merch-3","merch-3", "beat-3"]'
        );

        return new Set (keys).size === keys.length;//antalet element i Set(size) är samma som längden i array(length) = true
    }, 
    {message: "WARNING: Duplicated products in cart"}
    //Så om det finns en dublett = underkänd varukorg
);

async function createOrder(userId, cartItems) {

    //Vailderar cart med Zod
    const validation = cartSchema.safeParse(cartItems);

    if(!validation.success){
        throw new Error("Invalid cart");
    }

    cartItems = validation.data;

    //delar upp cart efter beats och merch-types
    const beatItems = cartItems.filter((item) => item.productType === "beat");
    const merchItems = cartItems.filter((item) => item.productType === "merch");

    //plockar ut beatId's för att t.ex hämta priser
    const beatIds = beatItems.map((item) => item.productId);
    const merchIds = merchItems.map((item) => item.productId);


    //hämtar kundinfo + ordern
    const client = await pool.connect();

    try {
        // Här används en "transaction" som startas.
        //Jag vill testa transaction (nytt för mig i JS men har använt i PHP) för jag läst och
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

        //plockar ut den datan vi faktiskt vill jobba med från beatsResult
        const beats = beatsResult.rows;


        // kontroll att begärda beats exsterar (jämför resultatens antal mot begärda antal)
        if (beats.length !== beatIds.length) {
            throw new Error("BEAT_NOT_FOUND");
        }

        const merchResult = await client.query(`
            SELECT 
                id,
                price::float AS "price",
                stock
            FROM supplier_products
            WHERE id  = ANY($1::int[])`,//parametern ska behandlas som en array med heltal i postgresql
        [merchIds]);

        const merch = merchResult.rows;

        if (merch.length !== merchIds.length){
            throw new Error ("Merch not found!");
        }


        // total
        const beatsTotal = beats.reduce(
            (total, beat) => total + beat.beatPrice,
            0
        );

        const merchTotal = merchItems.reduce((total, cartItem) =>{

            const product = merch.find((dbProduct) => dbProduct.id === cartItem.productId);
            
            return total + product.price * cartItem.quantity;//return här = skickar tillbaks nya värdet TILL NÄSTA VARV
        }, 0);

        const orderTotal = beatsTotal + merchTotal;
        
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
            status,
            created_at AS "createdAt";
            `,[userId, orderTotal]
        );

        const order = orderResult.rows[0];


        // Skapar en ORDER_ITEMS-rad per köpt beat...
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

        //...för köpt merch
        for(const item of merchItems){

            const product = merch.find((dbProduct)=> dbProduct.id === item.productId);

            await client.query(`
                INSERT INTO order_items (
                order_id,
                supplier_product_id,
                quantity,
                unit_price
                )
                VALUES ($1, $2, $3, $4);
            ` [order.id, product.id, item.quantity, product.price]);
        }

        //Justera lagersaldo för fysiska merch-produkterna
        for (const item of merchItems){

            const result = await client.query(`
                UPDATE supplier_products
                SET stock = stock - $1
                WHERE id = $2
                AND stock >= $1
                RETURNING id;
            `, [item.quantity, item.productId]);

            if (result.rows.length === 0){
                throw new Error("We do not currently have your wished amount of this item in stock!")
            }
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
        orders.status,

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


    //VISAR VARULISTAN/ORDERRADERNA, t.ex innan betalningssteget
    //Hämtar order-items + beat/album-information
    const itemsResult = await pool.query(`
        SELECT
        order_items.id,
        order_items.beat_id AS "beatId",
        order_items.supplier_product_id AS "supplierProductId",
        order_items.quantity,
        order_items.unit_price::float AS "unitPrice",

        CASE 
            WHEN order_items.beat_id IS NOT NULL
            THEN 'beat'
            ELSE 'merch'
        END AS "productType",

        beats.beat_name AS "beatName",

        albums.id AS "albumId",
        albums.album_name AS "albumName",
        albums.cover_url AS "albumCover",

        supplier_products.name AS "productName",
        supplier_products.sku AS "productSku",
        supplier_products.image_url AS "productImage"

        FROM order_items
        LEFT JOIN beats
        ON beats.id = order_items.beat_id

        LEFT JOIN albums
        ON albums.id = beats.album_id

        LEFT JOIN supplier_products 
        ON supplier_products.id = order_items.supplier_products_id

        WHERE order_items.order_id = $1

        ORDER BY order_items.id;
        `,[orderId]
    );


    const orderRow = orderResult.rows[0];

    const order = {
        id: orderRow.id,
        orderTotal: orderRow.orderTotal,
        createdAt: orderRow.createdAt,
        status: orderRow.status,

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
            orders.status,

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
            orders.status,

        FROM orders
        WHERE orders.user_id = $1
        ORDER BY orders.created_at DESC;
        `,[userId]
    );

    return result.rows;
}

async function cancelOrder(orderId, sessionId = null){
    const client = await pool.connect();

    try{
        await client.query("BEGIN");

            //kollar så att orderId och stripe session ID matchar (och att ordern är "pending" innan avbrott)
            const orderResult = await client.query(`
                UPDATE orders
                SET status = 'cancelled'
                WHERE id = $1
                AND status = 'pending'
                AND stripe_session_id = $2
                RETURNING id;`,
            [orderId, sessionId]);

            if (orderResult.rows.length === 0){
                await client.query("COMMIT");
                return;
            }

            const itemsResult = await client.query(`
                SELECT supplier_product_id, quantity
                FROM order_items
                WHERE order_id = $1
                AND supplier_product_id IS NOT NULL;`,
            [orderId]);

            for (const item of itemsResult.rows){
                await client.query(`
                    UPDATE supplier_product
                    SET stock = stock + $1
                    WHERE id = $2;`,
                [item.quantity, item.supplier_product_id]);
            }

        await client.query("COMMIT");

    } catch(error){

        await client.query("ROLLBACK");
        throw error;
    }finally{
        client.release();
    }
}

async function markOrderAsPaid(orderId, sessionId){

    const result = await pool.query(`
        UPDATE orders
        SET status = 'paid'
        WHERE id = $1
        AND status = 'pending'
        AND stripe_session_id = $2
        RETURNING id;`, 
    [orderId, sessionId]);

    return result.rows.length > 0;
}

export { createOrder, getOrderById, getAllOrders, getOrdersByUserId, cancelOrder, markOrderAsPaid};