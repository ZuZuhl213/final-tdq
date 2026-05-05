import { Link } from "react-router-dom";

import { Product } from "../types/models";
import Button from "./ui/Button";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  horizontal?: boolean;
}

export default function ProductCard({ product, onAddToCart, horizontal }: ProductCardProps) {
  const imageUrl = product.image_url || `https://picsum.photos/seed/product-${product.id}/640/480`;

  return (
    <div className={horizontal ? "product-card horizontal" : "product-card"}>
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-44 object-cover rounded-2xl mb-3"
        loading="lazy"
      />
      <div className="chip chip-muted">{product.product_type}</div>
      <div className="text-lg font-semibold">{product.name}</div>
      <div className="text-sm text-slate-600">
        Brand: {(product as any).brand_name || (typeof product.brand === "object" ? (product.brand as any).name : product.brand) || "N/A"}
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="rating-stars">★★★★★</span>
        <span>(4.8)</span>
      </div>
      <div className="text-xl font-semibold">${product.price}</div>
      <div className="flex items-center justify-between mt-2">
        <Link className="btn-ghost" to={`/products/${product.id}`}>
          View details
        </Link>
        {onAddToCart && (
          <Button variant="secondary" size="sm" onClick={() => onAddToCart(product)}>
            Add to cart
          </Button>
        )}
      </div>
    </div>
  );
}
