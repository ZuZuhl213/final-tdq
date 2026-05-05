from django.urls import path

from .views import CartItemCreateView, CartItemDetailView, CartView

urlpatterns = [
    path("api/cart/", CartView.as_view()),
    path("api/cart/items/", CartItemCreateView.as_view()),
    path("api/cart/items/<int:item_id>/", CartItemDetailView.as_view()),
]
