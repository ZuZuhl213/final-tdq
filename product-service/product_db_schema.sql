CREATE TABLE IF NOT EXISTS catalog_category (
    id bigserial PRIMARY KEY,
    name varchar(100) NOT NULL,
    slug varchar(120) NOT NULL UNIQUE,
    description text NOT NULL DEFAULT '',
    parent_id bigint NULL REFERENCES catalog_category(id)
);

CREATE TABLE IF NOT EXISTS catalog_brand (
    id bigserial PRIMARY KEY,
    name varchar(100) NOT NULL,
    slug varchar(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS catalog_product (
    id bigserial PRIMARY KEY,
    name varchar(200) NOT NULL,
    slug varchar(220) NOT NULL UNIQUE,
    sku varchar(64) NOT NULL UNIQUE,
    description text NOT NULL DEFAULT '',
    brand_id bigint NOT NULL REFERENCES catalog_brand(id) DEFERRABLE INITIALLY DEFERRED,
    list_price numeric(12, 2) NOT NULL,
    price numeric(12, 2) NOT NULL,
    category_id integer NOT NULL,
    product_type varchar(20) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    stock integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS catalog_book (
    id bigserial PRIMARY KEY,
    product_id bigint NOT NULL UNIQUE REFERENCES catalog_product(id) DEFERRABLE INITIALLY DEFERRED,
    author varchar(200) NOT NULL,
    publisher varchar(200) NOT NULL,
    isbn varchar(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS catalog_electronics (
    id bigserial PRIMARY KEY,
    product_id bigint NOT NULL UNIQUE REFERENCES catalog_product(id) DEFERRABLE INITIALLY DEFERRED,
    brand varchar(120) NOT NULL,
    warranty integer NOT NULL DEFAULT 12
);

CREATE TABLE IF NOT EXISTS catalog_fashion (
    id bigserial PRIMARY KEY,
    product_id bigint NOT NULL UNIQUE REFERENCES catalog_product(id) DEFERRABLE INITIALLY DEFERRED,
    size varchar(20) NOT NULL,
    color varchar(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS catalog_product_category_idx ON catalog_product(category_id);
CREATE INDEX IF NOT EXISTS catalog_product_price_idx ON catalog_product(price);
