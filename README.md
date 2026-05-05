# TechStore

TechStore is a microservices e-commerce system with AI recommendation and a RAG-powered chatbot.

## Run with Docker Compose

```bash
docker compose up --build
```

Gateway: http://localhost:18080

### Create admin user

```bash
docker exec -it user-service python manage.py createsuperuser
```

## Environment variables

The root `.env` file provides shared defaults:

- `DB_CONNECTION=pgsql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=5432`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=1`
- `JWT_SECRET_KEY=techstore-jwt-secret`
- `DEBUG=true`
- `SECRET_KEY=techstore-django-secret`

Each service overrides `DB_NAME` and `DB_HOST` in `docker-compose.yml`.

## Database ports

Each PostgreSQL container exposes port 5432 to a unique host port:

- user-db: 54321
- product-db: 54322
- cart-db: 54323
- order-db: 54324
- payment-db: 54325

## API walkthrough

1. Register and login
   - `POST /api/auth/register/`
   - `POST /api/auth/login/`
2. Browse products
   - `GET /api/products/`
3. Add items to cart
   - `POST /api/cart/items/`
4. Checkout
   - `POST /api/orders/`

## AI recommendation

- `GET /api/ai/recommend?user_id=1&limit=5`
- `POST /api/ai/chat/` with `{ "query": "gaming laptop" }`

## Notes

- Django migration files are included in each service under their app `migrations` directory.
- SQL schema files are provided at service root:
  - `user-service/user_db_schema.sql`
  - `product-service/product_db_schema.sql`
  - `cart-service/cart_db_schema.sql`
  - `order-service/order_db_schema.sql`
  - `payment-service/payment_db_schema.sql`

## Testing the purchase flow

1. Register a user and login to obtain JWT tokens.
2. Call `GET /api/products/` to pick product IDs.
3. Add items via `POST /api/cart/items/`.
4. Checkout with `POST /api/orders/`.
5. Review order history with `GET /api/orders/`.
