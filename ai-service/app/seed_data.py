from __future__ import annotations

import csv
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
BEHAVIOR_FILE = DATA_DIR / "user_behavior.csv"
POLICY_FILE = DATA_DIR / "policy.txt"

BRANDS = ["Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Apple", "Samsung", "Logitech", "Sony"]
CATEGORIES = ["laptop", "phone", "monitor", "keyboard", "mouse", "headphone", "tablet", "camera"]


def _generate_products(n: int = 50) -> list[dict]:
    random.seed(42)
    products: list[dict] = []
    for i in range(1, n + 1):
        brand = random.choice(BRANDS)
        category = random.choice(CATEGORIES)
        price = random.randint(1_990_000, 39_990_000)
        stock = random.randint(0, 30)
        name = f"{brand} {category.title()} {i}"
        description = (
            f"{name} phù hợp cho nhu cầu {category}, hiệu năng ổn định, pin tốt, "
            f"thiết kế hiện đại, bảo hành chính hãng 12 tháng."
        )
        products.append(
            {
                "id": i,
                "name": name,
                "description": description,
                "brand": brand,
                "category": category,
                "price": float(price),
                "stock": stock,
                "image_url": f"https://picsum.photos/id/{i}/300/300",
            }
        )
    return products


def _generate_behavior(products: list[dict], rows: int = 5000) -> list[list]:
    random.seed(99)
    actions = ["view", "click", "add_to_cart"]
    weights = [0.62, 0.23, 0.15]
    now = datetime.utcnow()

    data: list[list] = []
    for _ in range(rows):
        user_id = random.randint(1, 100)
        product_id = random.randint(1, len(products))
        action = random.choices(actions, weights=weights, k=1)[0]
        ts = now - timedelta(minutes=random.randint(0, 90 * 24 * 60))
        data.append([user_id, product_id, action, ts.isoformat()])
    return data


def ensure_seed_data() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if not POLICY_FILE.exists():
        POLICY_FILE.write_text(
            "- Chinh sach doi tra trong vong 30 ngay, mien phi.\n"
            "- Van chuyen: mien phi cho don hang > 500.000d.\n"
            "- Ho tro bao hanh 12 thang.\n",
            encoding="utf-8",
        )

    if not PRODUCTS_FILE.exists():
        products = _generate_products(50)
        PRODUCTS_FILE.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))

    if not BEHAVIOR_FILE.exists():
        behavior = _generate_behavior(products, 5000)
        with BEHAVIOR_FILE.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["user_id", "product_id", "action", "timestamp"])
            writer.writerows(behavior)
