import os

import requests
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem
from .serializers import OrderSerializer

PRODUCT_SERVICE_URL = os.environ.get("PRODUCT_SERVICE_URL", "http://product-service:8002")
PAYMENT_SERVICE_URL = os.environ.get("PAYMENT_SERVICE_URL", "http://payment-service:8005")
SHIPPING_SERVICE_URL = os.environ.get("SHIPPING_SERVICE_URL", "")


def fetch_product(product_id: int):
    url = f"{PRODUCT_SERVICE_URL}/api/products/{product_id}/"
    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        raise ValidationError("Product not found")
    return response.json()


def call_payment(order_id: int, amount):
    url = f"{PAYMENT_SERVICE_URL}/api/payments/"
    response = requests.post(url, json={"order_id": order_id, "amount": str(amount)}, timeout=5)
    if response.status_code != 201:
        raise ValidationError("Payment failed")
    return response.json()


def call_shipping(order_id: int):
    if not SHIPPING_SERVICE_URL:
        return {"status": "shipped", "order_id": order_id, "tracking_code": f"TRK-{order_id}"}
    response = requests.post(f"{SHIPPING_SERVICE_URL}/api/shipping/", json={"order_id": order_id}, timeout=5)
    if response.status_code != 200:
        raise ValidationError("Shipping failed")
    return response.json()


class OrderListCreateView(APIView):
    def get(self, request):
        if getattr(request.user, "role", "") == "admin":
            orders = Order.objects.all().order_by("-created_at")
        else:
            orders = Order.objects.filter(user_id=request.user.id).order_by("-created_at")
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        items = request.data.get("items", [])
        if not items:
            raise ValidationError("Items are required")

        order = Order.objects.create(user_id=request.user.id, total_amount=0, status=Order.STATUS_PENDING)
        total_amount = 0

        for item in items:
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 1))
            product = fetch_product(product_id)

            if not product.get("is_active", False):
                raise ValidationError("Product is inactive")
            if quantity > int(product.get("stock", 0)):
                raise ValidationError("Insufficient stock")

            unit_price = float(product.get("price", 0))
            total_amount += unit_price * quantity
            OrderItem.objects.create(
                order=order,
                product_id=product_id,
                product_name=product.get("name", ""),
                unit_price=unit_price,
                quantity=quantity,
            )

        order.total_amount = total_amount
        order.save()

        payment = call_payment(order.id, order.total_amount)
        order.status = Order.STATUS_PAID if payment.get("status") == "success" else Order.STATUS_FAILED

        if order.status == Order.STATUS_PAID:
            call_shipping(order.id)
            order.status = Order.STATUS_SHIPPED

        order.save()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    def get(self, request, order_id: int):
        try:
            order = Order.objects.get(id=order_id, user_id=request.user.id)
        except Order.DoesNotExist as exc:
            raise ValidationError("Order not found") from exc
        return Response(OrderSerializer(order).data)
