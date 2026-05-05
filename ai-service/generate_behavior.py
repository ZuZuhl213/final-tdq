import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent / "data" / "user_behavior.csv"


def main(rows: int = 8000, users: int = 200, products: int = 50):
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    if OUTPUT_PATH.exists():
        return

    start = datetime.utcnow() - timedelta(days=30)
    with OUTPUT_PATH.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["user_id", "product_id", "event_type", "timestamp"])
        for _ in range(rows):
            user_id = random.randint(1, users)
            product_id = random.randint(1, products)
            event_type = random.choice(["view", "cart", "purchase"])
            timestamp = start + timedelta(minutes=random.randint(1, 60 * 24 * 30))
            writer.writerow([user_id, product_id, event_type, timestamp.isoformat()])


if __name__ == "__main__":
    main()
