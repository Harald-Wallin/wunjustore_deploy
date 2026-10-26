BEGIN;

    /*---betalningsinfo---*/
    ALTER TABLE orders
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';

    ALTER TABLE orders
    ADD COLUMN stripe_session_id TEXT UNIQUE;

    /*inbyggd säkerhetscheck i databasen där vi endast tar emot dessa värden*/
    ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'paid', 'cancelled'));



    /*---stöd för beats OCH merch---*/
    ALTER TABLE order_items
    ALTER COLUMN beat_id DROP NOT NULL;

    ALTER TABLE order_items
    ADD COLUMN supplier_product_id INTEGER
    REFERENCES supplier_products(id);

    ALTER TABLE order_items
    ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

    /*antingen ett BEAT eller en MERCH-produkt per orderrad- inte båda/ingen*/
    ALTER TABLE order_items
    ADD CONSTRAINT order_items_product_check
    CHECK (
        (beat_id IS NOT NULL AND supplier_product_id IS NULL)
        OR 
        (beat_id IS NULL AND supplier_product_id IS NOT NULL)
    );

    ALTER TABLE order_items
    ADD CONSTRAINT order_items_quantity_check
    CHECK (quantity > 0);

    ALTER TABLE order_items
    ADD CONSTRAINT unique_order_supplier_product
    UNIQUE (order_id, supplier_product_id);

    ALTER TABLE order_items
    ADD CONSTRAINT order_items_beat_quantity_check
    CHECK (beat_id IS NULL OR quantity = 1);

COMMIT;