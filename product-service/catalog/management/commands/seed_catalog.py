import random

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from catalog.models import Book, Brand, Category, Electronics, Fashion, Product


class Command(BaseCommand):
    help = "Seed catalog with categories, brands, and products"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=50, help="Number of products to create")
        parser.add_argument(
            "--append",
            action="store_true",
            help="Append new products even when catalog already has data",
        )

    @staticmethod
    def build_image_url(idx: int, product_type: str) -> str:
        return f"https://picsum.photos/seed/techstore-{product_type}-{idx}/640/480"

    def handle(self, *args, **options):
        append_mode = options.get("append", False)
        product_count = max(int(options.get("count", 50)), 1)

        if Product.objects.exists() and not append_mode:
            updated = 0
            for product in Product.objects.all():
                if not product.image_url:
                    product.image_url = self.build_image_url(product.id, product.product_type)
                    product.save(update_fields=["image_url"])
                    updated += 1
            self.stdout.write(f"Catalog already seeded. Backfilled image_url for {updated} products.")
            return

        parent_names = ["Books", "Electronics", "Fashion"]
        parents = []
        for name in parent_names:
            parent, _ = Category.objects.get_or_create(
                slug=slugify(name), defaults={"name": name, "description": f"{name} root"}
            )
            parents.append(parent)

        child_names = [
            ("Fiction", parents[0]),
            ("Non-Fiction", parents[0]),
            ("Phones", parents[1]),
            ("Laptops", parents[1]),
            ("Mens", parents[2]),
            ("Womens", parents[2]),
        ]
        children = []
        for name, parent in child_names:
            child, _ = Category.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name, "description": name, "parent": parent},
            )
            children.append(child)

        brands = []
        for name, slug in [("Acme", "acme"), ("Nova", "nova"), ("Zenith", "zenith"), ("Orbit", "orbit")]:
            brand, _ = Brand.objects.get_or_create(slug=slug, defaults={"name": name})
            brands.append(brand)

        names = [
            "Prime Book",
            "Nova Book",
            "Zenith Reader",
            "Orbit Novel",
            "Pixel Phone",
            "Quantum Phone",
            "ZenBook Laptop",
            "Orbit Laptop",
            "Classic Tee",
            "Urban Jacket",
            "Fusion Dress",
            "Trail Sneakers",
        ]

        existing_count = Product.objects.count()
        start_index = existing_count + 1

        for idx in range(product_count):
            absolute_index = start_index + idx
            name = random.choice(names) + f" {idx + 1}"
            product_type = random.choice([Product.TYPE_BOOK, Product.TYPE_ELECTRONICS, Product.TYPE_FASHION])
            brand = random.choice(brands)
            category = random.choice(children)
            list_price = random.randint(20, 200) + 0.99
            price = list_price - random.randint(1, 10)
            product = Product.objects.create(
                name=name,
                slug=slugify(name) + f"-{absolute_index}",
                sku=f"SKU-{1000 + absolute_index}",
                description=f"{name} description",
                image_url=self.build_image_url(absolute_index, product_type),
                brand=brand,
                list_price=list_price,
                price=price,
                category_id=category.id,
                product_type=product_type,
                is_active=True,
                stock=random.randint(5, 100),
            )

            if product_type == Product.TYPE_BOOK:
                Book.objects.create(
                    product=product,
                    author="Author A",
                    publisher="Publisher A",
                    isbn=f"ISBN{100 + absolute_index}",
                )
            elif product_type == Product.TYPE_ELECTRONICS:
                Electronics.objects.create(product=product, brand=brand.name, warranty=random.choice([6, 12, 24]))
            else:
                Fashion.objects.create(product=product, size=random.choice(["S", "M", "L"]), color=random.choice(["black", "blue", "red"]))

        self.stdout.write(f"Seeded {product_count} products. Total products: {Product.objects.count()}.")
