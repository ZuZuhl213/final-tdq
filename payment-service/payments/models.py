from django.db import models


class Payment(models.Model):
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"

    order_id = models.IntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default=STATUS_SUCCESS)
    transaction_code = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
