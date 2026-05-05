CREATE TABLE IF NOT EXISTS carts_cart (
    id bigserial PRIMARY KEY,
    user_id integer NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carts_cartitem (
    id bigserial PRIMARY KEY,
    cart_id bigint NOT NULL REFERENCES carts_cart(id) DEFERRABLE INITIALLY DEFERRED,
    product_id integer NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS carts_cartitem_cart_id_idx ON carts_cartitem(cart_id);
