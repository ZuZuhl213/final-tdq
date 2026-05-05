from django.urls import path

from .views import OrderDetailView, OrderListCreateView

urlpatterns = [
    path("api/orders/", OrderListCreateView.as_view()),
    path("api/orders/<int:order_id>/", OrderDetailView.as_view()),
]
