CREATE TABLE IF NOT EXISTS django_migrations (
    id bigserial PRIMARY KEY,
    app varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    applied timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS django_content_type (
    id bigserial PRIMARY KEY,
    app_label varchar(100) NOT NULL,
    model varchar(100) NOT NULL,
    UNIQUE (app_label, model)
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL,
    content_type_id bigint NOT NULL REFERENCES django_content_type(id) DEFERRABLE INITIALLY DEFERRED,
    codename varchar(100) NOT NULL,
    UNIQUE (content_type_id, codename)
);

CREATE TABLE IF NOT EXISTS auth_group (
    id bigserial PRIMARY KEY,
    name varchar(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id bigserial PRIMARY KEY,
    group_id bigint NOT NULL REFERENCES auth_group(id) DEFERRABLE INITIALLY DEFERRED,
    permission_id bigint NOT NULL REFERENCES auth_permission(id) DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users_user (
    id bigserial PRIMARY KEY,
    password varchar(128) NOT NULL,
    last_login timestamptz NULL,
    is_superuser boolean NOT NULL DEFAULT false,
    username varchar(150) NOT NULL UNIQUE,
    first_name varchar(150) NOT NULL DEFAULT '',
    last_name varchar(150) NOT NULL DEFAULT '',
    email varchar(254) NOT NULL DEFAULT '',
    is_staff boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    date_joined timestamptz NOT NULL,
    role varchar(20) NOT NULL DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS users_user_groups (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users_user(id) DEFERRABLE INITIALLY DEFERRED,
    group_id bigint NOT NULL REFERENCES auth_group(id) DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (user_id, group_id)
);

CREATE TABLE IF NOT EXISTS users_user_user_permissions (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users_user(id) DEFERRABLE INITIALLY DEFERRED,
    permission_id bigint NOT NULL REFERENCES auth_permission(id) DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users_address (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users_user(id) DEFERRABLE INITIALLY DEFERRED,
    line1 varchar(255) NOT NULL,
    line2 varchar(255) NOT NULL DEFAULT '',
    city varchar(100) NOT NULL,
    state varchar(100) NOT NULL DEFAULT '',
    postal_code varchar(20) NOT NULL,
    country varchar(100) NOT NULL DEFAULT 'US',
    is_default boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS users_address_user_id_idx ON users_address(user_id);
