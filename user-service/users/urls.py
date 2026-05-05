from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView

from .auth_serializers import RoleTokenObtainPairSerializer
from .views import AddressListCreateView, HealthView, MeView, RegisterView


class RoleTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleTokenObtainPairSerializer

urlpatterns = [
    path("api/health/", HealthView.as_view()),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", RoleTokenObtainPairView.as_view()),
    path("api/auth/refresh/", TokenRefreshView.as_view()),
    path("api/users/me/", MeView.as_view()),
    path("api/users/addresses/", AddressListCreateView.as_view()),
]
