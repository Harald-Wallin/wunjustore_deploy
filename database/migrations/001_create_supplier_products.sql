

CREATE TABLE IF NOT EXISTS supplier_products(

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    ean VARCHAR(30) NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    variants TEXT[] NOT NULL DEFAULT '{}',
    supplier_updated_at DATE NOT NULL

);