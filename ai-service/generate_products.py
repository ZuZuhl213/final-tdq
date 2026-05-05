import json
import random
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent / "data" / "products.json"

PRODUCT_TYPES = ["book", "electronics", "fashion"]
BRANDS = ["Acme", "Nova", "Zenith", "Orbit"]
CATEGORIES = ["Fiction", "Non-Fiction", "Phones", "Laptops", "Mens", "Womens"]


def generate_products(count: int = 50):
    products = []
    for idx in range(1, count + 1):
        product_type = random.choice(PRODUCT_TYPES)
        category = random.choice(CATEGORIES)
        brand = random.choice(BRANDS)
        name = f"{brand} {product_type.title()} {idx}"
        product = {
            "id": idx,
            "name": name,
            "category": category,
            "brand": brand,
            "product_type": product_type,
            "price": round(random.uniform(10, 300), 2),
            "description": f"{name} for {category} with {brand} quality.",
        }
        products.append(product)
    return products


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    if OUTPUT_PATH.exists():
        return
    products = generate_products()
    OUTPUT_PATH.write_text(json.dumps(products, indent=2))


if __name__ == "__main__":
    main()
