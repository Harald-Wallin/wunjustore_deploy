BEGIN;

ALTER TABLE orders
ADD COLUMN subtotal NUMERIC(10, 2);

ALTER TABLE orders
ADD CONSTRAINT orders_subtotal_non_negative
CHECK (subtotal IS NULL OR subtotal >= 0);

CREATE TABLE order_shipping (
    order_id INT PRIMARY KEY REFERENCES orders(id),
    method VARCHAR(20) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    service_point_id VARCHAR(50),
    service_point_name TEXT,
    service_point_address TEXT,
    CONSTRAINT order_shipping_method_check
        CHECK (method IN ('service_point', 'home_delivery')),
    CONSTRAINT order_shipping_price_non_negative
        CHECK (price >= 0),
    CONSTRAINT order_shipping_postal_code_check
        CHECK (postal_code ~ '^[0-9]{5}$'),
    CONSTRAINT order_shipping_service_point_fields_check
        CHECK (
            (
                method = 'service_point'
                AND service_point_id IS NOT NULL
                AND btrim(service_point_id) <> ''
                AND service_point_name IS NOT NULL
                AND btrim(service_point_name) <> ''
                AND service_point_address IS NOT NULL
                AND btrim(service_point_address) <> ''
            )
            OR
            (
                method = 'home_delivery'
                AND service_point_id IS NULL
                AND service_point_name IS NULL
                AND service_point_address IS NULL
            )
        )
);

COMMIT;
