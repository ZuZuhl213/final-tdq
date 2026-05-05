from rest_framework import serializers

from .models import Book, Brand, Category, Electronics, Fashion, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "parent")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug")


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ("author", "publisher", "isbn")


class ElectronicsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Electronics
        fields = ("brand", "warranty")


class FashionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fashion
        fields = ("size", "color")


class ProductSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    book = BookSerializer(read_only=True)
    electronics = ElectronicsSerializer(read_only=True)
    fashion = FashionSerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "description",
            "image_url",
            "brand",
            "brand_name",
            "list_price",
            "price",
            "category_id",
            "product_type",
            "is_active",
            "stock",
            "book",
            "electronics",
            "fashion",
        )
