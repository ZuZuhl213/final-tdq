CREATE TABLE IF NOT EXISTS payments_payment (
    id bigserial PRIMARY KEY,
    order_id integer NOT NULL,
    amount numeric(12, 2) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'success',
    transaction_code varchar(100) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_payment_order_id_idx ON payments_payment(order_id);
