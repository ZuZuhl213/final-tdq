from __future__ import annotations

import json
import random
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"

ACTION_PATTERN = ["view", "click", "add_to_cart", "view", "click", "add_to_cart"]


def _build_product_groups(products: list[dict]) -> dict[tuple[str, str], list[int]]:
    grouped: dict[tuple[str, str], list[int]] = defaultdict(list)
    for product in products:
        grouped[(str(product["category"]), str(product["brand"]))].append(int(product["id"]))
    return {key: sorted(value) for key, value in grouped.items() if value}


def generate_synthetic_behavior(
    output_path: str | Path,
    num_users: int = 120,
    sequence_repeats: int = 18,
    seed: int = 42,
) -> Path:
    rng = random.Random(seed)
    products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
    grouped_products = _build_product_groups(products)
    group_keys = sorted(grouped_products)
    if len(group_keys) < 6:
        raise ValueError("Need at least 6 product groups to build synthetic behavior")

    rows: list[dict] = []
    start_time = datetime(2026, 1, 1, 8, 0, 0)

    for user_id in range(1, num_users + 1):
        primary_group = group_keys[(user_id - 1) % len(group_keys)]
        primary_products = grouped_products[primary_group]

        # Keep each user in a stable journey so the next-item task becomes learnable.
        base_journey = primary_products[:4]
        if len(base_journey) < 4:
            base_journey = (primary_products * 4)[:4]

        if len(group_keys) > 1:
            adjacent_group = group_keys[(group_keys.index(primary_group) + 1) % len(group_keys)]
            adjacent_products = grouped_products[adjacent_group][:2]
        else:
            adjacent_products = primary_products[:2]

        journey = base_journey + adjacent_products
        current_time = start_time + timedelta(hours=user_id * 3)

        for repeat in range(sequence_repeats):
            for step, product_id in enumerate(journey):
                action = ACTION_PATTERN[(repeat + step) % len(ACTION_PATTERN)]
                rows.append(
                    {
                        "user_id": user_id,
                        "product_id": int(product_id),
                        "action": action,
                        "timestamp": (current_time + timedelta(minutes=(repeat * len(journey)) + step)).isoformat(),
                    }
                )

            # Add a tiny amount of noise while keeping the main pattern dominant.
            if repeat % 6 == 0:
                noise_product = rng.choice(primary_products)
                rows.append(
                    {
                        "user_id": user_id,
                        "product_id": int(noise_product),
                        "action": "view",
                        "timestamp": (current_time + timedelta(minutes=(repeat * len(journey)) + len(journey))).isoformat(),
                    }
                )

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(rows).to_csv(output, index=False)
    return output
