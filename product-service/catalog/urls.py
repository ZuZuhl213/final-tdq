from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BrandViewSet, CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register(r"api/categories", CategoryViewSet)
router.register(r"api/brands", BrandViewSet)
router.register(r"api/products", ProductViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
