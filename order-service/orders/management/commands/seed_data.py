from decimal import Decimal

from django.core.management.base import BaseCommand

from orders.models import Order, OrderItem


class Command(BaseCommand):
    help = "Seed sample orders"

    def handle(self, *args, **options):
        if Order.objects.exists():
            self.stdout.write("Order data already exists.")
            return

        orders = [
            {
                "user_id": 1,
                "status": Order.STATUS_SHIPPED,
                "items": [
                    {"product_id": 1, "product_name": "Acme Book 1", "unit_price": Decimal("19.99"), "quantity": 1},
                    {"product_id": 3, "product_name": "Nova Phone 3", "unit_price": Decimal("199.00"), "quantity": 1},
                ],
            },
            {
                "user_id": 2,
                "status": Order.STATUS_PAID,
                "items": [
                    {"product_id": 4, "product_name": "Zenith Laptop 4", "unit_price": Decimal("499.00"), "quantity": 1},
                ],
            },
        ]

        for seed in orders:
            total = sum(item["unit_price"] * item["quantity"] for item in seed["items"])
            order = Order.objects.create(user_id=seed["user_id"], total_amount=total, status=seed["status"])
            for item in seed["items"]:
                OrderItem.objects.create(order=order, **item)

        self.stdout.write("Seeded order data.")
