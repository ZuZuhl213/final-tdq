from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children")

    def __str__(self) -> str:
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    TYPE_BOOK = "book"
    TYPE_ELECTRONICS = "electronics"
    TYPE_FASHION = "fashion"

    TYPE_CHOICES = [
        (TYPE_BOOK, "book"),
        (TYPE_ELECTRONICS, "electronics"),
        (TYPE_FASHION, "fashion"),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    sku = models.CharField(max_length=64, unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True, default="")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")
    list_price = models.DecimalField(max_digits=12, decimal_places=2)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category_id = models.IntegerField()
    product_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.name


class Book(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="book")
    author = models.CharField(max_length=200)
    publisher = models.CharField(max_length=200)
    isbn = models.CharField(max_length=32)


class Electronics(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="electronics")
    brand = models.CharField(max_length=120)
    warranty = models.PositiveIntegerField(default=12)


class Fashion(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="fashion")
    size = models.CharField(max_length=20)
    color = models.CharField(max_length=50)
