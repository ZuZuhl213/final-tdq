CREATE TABLE IF NOT EXISTS orders_order (
    id bigserial PRIMARY KEY,
    user_id integer NOT NULL,
    total_amount numeric(12, 2) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders_orderitem (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES orders_order(id) DEFERRABLE INITIALLY DEFERRED,
    product_id integer NOT NULL,
    product_name varchar(200) NOT NULL,
    unit_price numeric(12, 2) NOT NULL,
    quantity integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS orders_order_user_id_idx ON orders_order(user_id);
CREATE INDEX IF NOT EXISTS orders_orderitem_order_id_idx ON orders_orderitem(order_id);
