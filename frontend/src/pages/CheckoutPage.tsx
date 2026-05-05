import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createOrder } from "../services/orderService";
import useCartStore from "../stores/cartStore";
import useAuthStore from "../stores/authStore";
import useToastStore from "../stores/toastStore";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { CheckoutSchema } from "../validation/schemas";

type CheckoutFormData = {
  name: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
  payment: "cod" | "bank";
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clear);
  const user = useAuthStore((state) => state.user);
  const toast = useToastStore((state) => state.push);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      payment: "cod"
    }
  });

  const watchPayment = watch("payment");

  if (!user) {
    return (
      <div className="glass-panel rounded-[32px] p-6 text-center">
        <p className="text-slate-600 mb-4">Please log in to continue checkout.</p>
        <Button onClick={() => navigate("/auth/login")}>Sign In</Button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="glass-panel rounded-[32px] p-6 text-center">
        <p className="text-slate-600 mb-4">Your cart is empty.</p>
        <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  const total = cart.items.reduce((sum: number, item) => {
    return sum + (item.product?.price ? Number(item.product.price) * item.quantity : 0);
  }, 0);

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    try {
      const order = await createOrder(
        cart.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      );
      clearCart();
      toast("Đặt hàng thành công!", "success");
      navigate(`/order-confirmation?order_id=${order.id}`);
    } catch (error) {
      toast("Thanh toán thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-ink mb-8">Checkout</h1>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-6">Delivery Information</div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Full Name *</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
                />
                {errors.name && <p className="mt-1 text-sm text-Error">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Phone *</label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+84 9xxxxxxxx"
                  className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
                />
                {errors.phone && <p className="mt-1 text-sm text-Error">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Address *</label>
              <input
                {...register("address")}
                type="text"
                placeholder="123 Main St"
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
              />
              {errors.address && <p className="mt-1 text-sm text-Error">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">City *</label>
              <input
                {...register("city")}
                type="text"
                placeholder="Ho Chi Minh City"
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
              />
              {errors.city && <p className="mt-1 text-sm text-Error">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Notes (Optional)</label>
              <textarea
                {...register("note")}
                placeholder="Any special instructions..."
                rows={3}
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition resize-none"
              />
            </div>

            <div className="border-t border-Border pt-4">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Payment Method</div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-Border rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <input
                    {...register("payment")}
                    type="radio"
                    value="cod"
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">Cash on Delivery</p>
                    <p className="text-xs text-slate-500">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-Border rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <input
                    {...register("payment")}
                    type="radio"
                    value="bank"
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">Bank Transfer</p>
                    <p className="text-xs text-slate-500">Quick and secure payment</p>
                  </div>
                </label>
              </div>

              {watchPayment === "bank" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-600">
                  <p className="font-semibold mb-2">Bank Details:</p>
                  <p>Account: 1234567890</p>
                  <p>Bank: TechStore Demo Bank</p>
                </div>
              )}
            </div>

            <Button 
              variant="primary" 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : `Place Order (${(total).toFixed(2)} đ)`}
            </Button>
          </form>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Order Summary</div>

          <div className="space-y-3 mb-6 pb-6 border-b border-Border">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-ink">{item.product?.name || `Product #${item.product_id}`}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-ink">
                  {(item.product?.price ? Number(item.product.price) * item.quantity : 0).toFixed(2)} đ
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{total.toFixed(2)} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="font-medium text-Success">FREE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium">{(total * 0.1).toFixed(2)} đ</span>
            </div>
          </div>

          <div className="border-t border-Border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-ink">Total</span>
              <span className="text-2xl font-bold text-Primary">{(total * 1.1).toFixed(2)} đ</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
