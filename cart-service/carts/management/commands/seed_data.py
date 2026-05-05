from django.core.management.base import BaseCommand

from carts.models import Cart, CartItem


class Command(BaseCommand):
    help = "Seed sample carts"

    def handle(self, *args, **options):
        if Cart.objects.exists():
            self.stdout.write("Cart data already exists.")
            return

        carts = [
            (1, [(1, 2), (3, 1), (5, 1)]),
            (2, [(2, 1), (4, 2)]),
            (3, [(6, 1)]),
        ]

        for user_id, items in carts:
            cart = Cart.objects.create(user_id=user_id)
            for product_id, quantity in items:
                CartItem.objects.create(cart=cart, product_id=product_id, quantity=quantity)

        self.stdout.write("Seeded cart data.")
