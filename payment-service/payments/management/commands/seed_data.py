import uuid

from django.core.management.base import BaseCommand

from payments.models import Payment


class Command(BaseCommand):
    help = "Seed sample payments"

    def handle(self, *args, **options):
        if Payment.objects.exists():
            self.stdout.write("Payment data already exists.")
            return

        payments = [
            {"order_id": 1, "amount": "218.99"},
            {"order_id": 2, "amount": "499.00"},
        ]

        for entry in payments:
            Payment.objects.create(
                order_id=entry["order_id"],
                amount=entry["amount"],
                status=Payment.STATUS_SUCCESS,
                transaction_code=str(uuid.uuid4()),
            )

        self.stdout.write("Seeded payment data.")
