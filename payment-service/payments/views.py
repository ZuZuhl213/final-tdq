import uuid

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer


class PaymentCreateView(APIView):
    def post(self, request):
        order_id = request.data.get("order_id")
        amount = request.data.get("amount")
        payment = Payment.objects.create(
            order_id=order_id,
            amount=amount,
            status=Payment.STATUS_SUCCESS,
            transaction_code=str(uuid.uuid4()),
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentByOrderView(APIView):
    def get(self, request, order_id: int):
        payments = Payment.objects.filter(order_id=order_id).order_by("-created_at")
        return Response(PaymentSerializer(payments, many=True).data)
