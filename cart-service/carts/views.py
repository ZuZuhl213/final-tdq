import os

import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer

PRODUCT_SERVICE_URL = os.environ.get("PRODUCT_SERVICE_URL", "http://product-service:8002")


def fetch_product(product_id: int):
    url = f"{PRODUCT_SERVICE_URL}/api/products/{product_id}/"
    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        raise ValidationError("Product not found")
    return response.json()


class CartView(APIView):
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user_id=request.user.id)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemCreateView(APIView):
    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user_id=request.user.id)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        product = fetch_product(product_id)
        if not product.get("is_active", False):
            raise ValidationError("Product is inactive")
        if quantity > int(product.get("stock", 0)):
            raise ValidationError("Insufficient stock")

        item, created = CartItem.objects.get_or_create(cart=cart, product_id=product_id)
        item.quantity = item.quantity + quantity if not created else quantity
        item.save()

        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    def put(self, request, item_id: int):
        try:
            item = CartItem.objects.get(id=item_id, cart__user_id=request.user.id)
        except CartItem.DoesNotExist as exc:
            raise ValidationError("Cart item not found") from exc

        quantity = int(request.data.get("quantity", 1))
        product = fetch_product(item.product_id)
        if quantity > int(product.get("stock", 0)):
            raise ValidationError("Insufficient stock")

        item.quantity = quantity
        item.save()
        return Response(CartItemSerializer(item).data)

    def delete(self, request, item_id: int):
        CartItem.objects.filter(id=item_id, cart__user_id=request.user.id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
