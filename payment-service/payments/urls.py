from django.urls import path

from .views import PaymentByOrderView, PaymentCreateView

urlpatterns = [
    path("api/payments/", PaymentCreateView.as_view()),
    path("api/payments/by-order/<int:order_id>/", PaymentByOrderView.as_view()),
]
