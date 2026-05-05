from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Brand",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(max_length=120, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="Category",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("description", models.TextField(blank=True)),
                ("parent", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="children", to="catalog.category")),
            ],
        ),
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("slug", models.SlugField(max_length=220, unique=True)),
                ("sku", models.CharField(max_length=64, unique=True)),
                ("description", models.TextField(blank=True)),
                ("list_price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("category_id", models.IntegerField()),
                ("product_type", models.CharField(choices=[("book", "book"), ("electronics", "electronics"), ("fashion", "fashion")], max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("stock", models.PositiveIntegerField(default=0)),
                ("brand", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="products", to="catalog.brand")),
            ],
        ),
        migrations.CreateModel(
            name="Book",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("author", models.CharField(max_length=200)),
                ("publisher", models.CharField(max_length=200)),
                ("isbn", models.CharField(max_length=32)),
                ("product", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="book", to="catalog.product")),
            ],
        ),
        migrations.CreateModel(
            name="Electronics",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("brand", models.CharField(max_length=120)),
                ("warranty", models.PositiveIntegerField(default=12)),
                ("product", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="electronics", to="catalog.product")),
            ],
        ),
        migrations.CreateModel(
            name="Fashion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("size", models.CharField(max_length=20)),
                ("color", models.CharField(max_length=50)),
                ("product", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="fashion", to="catalog.product")),
            ],
        ),
    ]
