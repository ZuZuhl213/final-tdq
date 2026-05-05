import json
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent / "data" / "rag_corpus.json"

DEFAULT_CORPUS = [
    {
        "id": 1,
        "title": "Shipping policy",
        "content": "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Free shipping is available for orders over $99.",
        "tags": ["shipping", "delivery", "time"],
    },
    {
        "id": 2,
        "title": "Returns and refunds",
        "content": "You can return items within 14 days in original condition. Refunds are issued to the original payment method within 3-5 business days after inspection.",
        "tags": ["returns", "refunds", "policy"],
    },
    {
        "id": 3,
        "title": "Payment methods",
        "content": "We accept Visa, Mastercard, and bank transfer. For demo purposes, payments are mocked as successful.",
        "tags": ["payment", "cards", "bank"],
    },
    {
        "id": 4,
        "title": "Warranty coverage",
        "content": "Electronics include a 12-month warranty unless otherwise specified. Warranty covers manufacturing defects only.",
        "tags": ["warranty", "electronics"],
    },
    {
        "id": 5,
        "title": "Order tracking",
        "content": "After checkout, your order status appears in your account. Tracking codes are shown once the order is shipped.",
        "tags": ["orders", "tracking"],
    },
    {
        "id": 6,
        "title": "Account and security",
        "content": "Use a strong password and keep your access token safe. You can update your profile and shipping addresses from My Account.",
        "tags": ["account", "security"],
    },
    {
        "id": 7,
        "title": "Customer support",
        "content": "Support is available 9am-6pm Mon-Fri. Contact support@techstore.local for help with orders and returns.",
        "tags": ["support", "contact"],
    },
    {
        "id": 8,
        "title": "Size guide",
        "content": "Fashion sizes follow standard US sizing. Use size S for chest 34-36, M for 38-40, L for 42-44.",
        "tags": ["fashion", "size"],
    },
]


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    if OUTPUT_PATH.exists():
        return
    OUTPUT_PATH.write_text(json.dumps(DEFAULT_CORPUS, indent=2))


if __name__ == "__main__":
    main()
