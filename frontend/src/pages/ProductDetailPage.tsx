import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getProduct } from "../services/productService";
import { getRecommendations } from "../services/aiService";
import { addToCart, getCart } from "../services/cartService";
import useCartStore from "../stores/cartStore";
import useToastStore from "../stores/toastStore";
import useAuthStore from "../stores/authStore";
import { Product } from "../types/models";
import QuantitySelector from "../components/QuantitySelector";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import RatingStars from "../components/ui/RatingStars";
import ProductCard from "../components/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [quantity, setQuantity] = useState(1);
  const setCart = useCartStore((state) => state.setCart);
  const toast = useToastStore((state) => state.push);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id || "")
  });

  const { data: recommendations } = useQuery({
    queryKey: ["related-products", data?.id],
    queryFn: () => getRecommendations(user?.id || 1, 4),
    enabled: !!data
  });

  const handleAdd = async () => {
    if (!data) return;
    try {
      await addToCart(data.id, quantity);
      const cart = await getCart();
      setCart(cart);
      toast("Thêm vào giỏ hàng thành công", "success");
      setQuantity(1);
    } catch (err) {
      toast("Không thể thêm vào giỏ hàng", "error");
    }
  };

  if (error) {
    return (
      <div className="glass-panel rounded-[32px] p-6 text-center">
        <p className="text-Error mb-4">Không thể tải sản phẩm</p>
        <Button onClick={() => navigate("/products")}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Product Detail */}
      <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Left: Product Info */}
        <div className="glass-panel rounded-[32px] p-8">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-24 mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-20 w-full mb-6" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : data ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-Primary bg-opacity-10 text-Primary text-xs font-semibold rounded-full uppercase">
                  {data.product_type || "Product"}
                </span>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                  {typeof data.brand === "object" ? (data.brand as any).name : (data.brand || "Brand")}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-ink mb-4">{data.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <RatingStars rating={data.rating || 4.5} interactive={false} />
                <span className="text-sm text-slate-600">({data.rating || 4.5}/5.0)</span>
              </div>

              <p className="text-slate-600 mb-8 leading-relaxed">{data.description}</p>

              {/* Specs */}
              <div className="mb-8 pb-8 border-b border-Border">
                <h3 className="text-sm font-semibold text-ink mb-3 uppercase tracking-[0.1em]">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">SKU</p>
                    <p className="font-medium text-ink">{data.sku || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Category</p>
                    <p className="font-medium text-ink">{typeof data.category === "object" ? (data.category as any).name : (data.category || "Uncategorized")}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Stock</p>
                    <p className="font-medium text-ink">{data.stock > 0 ? `${data.stock} available` : "Out of stock"}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status</p>
                    <p className={`font-medium ${data.is_active ? "text-Success" : "text-Error"}`}>
                      {data.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-Primary">${data.price}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    data.stock > 0 
                      ? "bg-Success bg-opacity-10 text-Success" 
                      : "bg-Error bg-opacity-10 text-Error"
                  }`}>
                    {data.stock > 0 ? "In stock" : "Out of stock"}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-semibold mb-3">Quantity</p>
                  <QuantitySelector value={quantity} onChange={setQuantity} max={data.stock} />
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={handleAdd}
                    disabled={data.stock === 0}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate("/products")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Right: Quick Info */}
        <div className="glass-panel rounded-[32px] p-6 h-fit">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Product Info</div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : data ? (
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Product Type</p>
                <p className="font-semibold text-ink">{data.product_type}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Brand</p>
                <p className="font-semibold text-ink">{typeof data.brand === "object" ? (data.brand as any).name : (data.brand || "Unknown")}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Category</p>
                <p className="font-semibold text-ink">{typeof data.category === "object" ? (data.category as any).name : (data.category || "Uncategorized")}</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-slate-600 mb-1">Free Shipping</p>
                <p className="font-semibold text-Primary">On all orders</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-slate-600 mb-1">Warranty</p>
                <p className="font-semibold text-Success">30 days</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Related Products */}
      {recommendations && recommendations.length > 0 && (
        <section className="glass-panel rounded-[32px] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">You might like</div>
          <h2 className="text-2xl font-bold text-ink mb-6">Related Products</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
