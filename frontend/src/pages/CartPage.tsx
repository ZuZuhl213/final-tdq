import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCart, removeCartItem, updateCartItem } from "../services/cartService";
import { getProduct } from "../services/productService";
import useCartStore from "../stores/cartStore";
import QuantitySelector from "../components/QuantitySelector";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

export default function CartPage() {
  const navigate = useNavigate();
  const setCart = useCartStore((state) => state.setCart);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await getCart();
      const itemsWithProduct = await Promise.all(
        response.items.map(async (item: any) => {
          try {
            const product = await getProduct(item.product_id);
            return { ...item, product };
          } catch (error) {
            return { ...item, product: undefined };
          }
        })
      );
      const payload = { ...response, items: itemsWithProduct };
      setCart(payload);
      return payload;
    }
  });

  const handleUpdate = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(itemId);
      return;
    }
    await updateCartItem(itemId, quantity);
    await refetch();
  };

  const handleRemove = async (itemId: number) => {
    await removeCartItem(itemId);
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="glass-panel rounded-[32px] p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <span className="text-3xl">🛒</span>
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">Your cart is empty</h2>
        <p className="text-slate-600 mb-6">Add some items and come back to checkout</p>
        <Button variant="primary" onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const subtotal = data.items.reduce((sum, item) => {
    const price = item.product?.price ? Number(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-ink mb-2">Shopping Cart</h1>
        <p className="text-slate-600">{data.items.length} items in your cart</p>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Cart Items */}
        <div className="glass-panel rounded-[32px] p-6">
          <div className="space-y-4">
            {data.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-Border rounded-lg hover:bg-slate-50 transition">
                {/* Product Image Placeholder */}
                <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink truncate">{item.product?.name || `Product #${item.product_id}`}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    ${item.product?.price ? Number(item.product.price).toFixed(2) : "0.00"} each
                  </p>
                  <p className="text-xs text-slate-500 mt-1">SKU: {item.product?.sku || "N/A"}</p>
                </div>

                {/* Quantity & Total */}
                <div className="flex flex-col items-end gap-2">
                  <div className="font-semibold text-ink whitespace-nowrap">
                    ${((item.product?.price ? Number(item.product.price) : 0) * item.quantity).toFixed(2)}
                  </div>
                  <QuantitySelector 
                    value={item.quantity} 
                    onChange={(value) => handleUpdate(item.id, value)}
                    max={item.product?.stock || 1}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    className="text-Error hover:text-Error"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass-panel rounded-[32px] p-6 h-fit">
          <h2 className="text-xl font-bold text-ink mb-4">Order Summary</h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-Border text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-ink">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-Success">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tax (10%)</span>
              <span className="font-medium text-ink">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {subtotal > 50 ? (
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-Success">✓ Free shipping applied!</span> Orders over $50 qualify.
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Add ${(50 - subtotal).toFixed(2)} more</span> for free shipping
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-ink">Total</span>
            <span className="text-3xl font-bold text-Primary">${total.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Free returns within 30 days
          </p>
        </div>
      </section>
    </div>
  );
}
