from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from users.models import Address


class Command(BaseCommand):
    help = "Seed sample users and addresses"

    def handle(self, *args, **options):
        User = get_user_model()

        seed_users = [
            {
                "username": "admin",
                "email": "admin@techstore.local",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "username": "staff",
                "email": "staff@techstore.local",
                "role": "staff",
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "alice",
                "email": "alice@techstore.local",
                "role": "customer",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "bob",
                "email": "bob@techstore.local",
                "role": "customer",
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        created = 0
        for data in seed_users:
            user, is_created = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "role": data["role"],
                    "is_staff": data["is_staff"],
                    "is_superuser": data["is_superuser"],
                },
            )
            if is_created:
                user.set_password("Password123")
                user.save()
                created += 1

        alice = User.objects.filter(username="alice").first()
        bob = User.objects.filter(username="bob").first()

        if alice:
            Address.objects.get_or_create(
                user=alice,
                line1="123 Market St",
                city="Hanoi",
                postal_code="100000",
                country="VN",
                defaults={"line2": "", "state": "HN", "is_default": True},
            )

        if bob:
            Address.objects.get_or_create(
                user=bob,
                line1="456 River Rd",
                city="Ho Chi Minh",
                postal_code="700000",
                country="VN",
                defaults={"line2": "", "state": "HCM", "is_default": True},
            )

        self.stdout.write(f"Seeded users: {created}")
