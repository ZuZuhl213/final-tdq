import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getOrderDetail } from "../services/orderService";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-confirmation", orderId],
    queryFn: () => orderId ? getOrderDetail(orderId) : Promise.reject("No order ID"),
    enabled: !!orderId
  });

  return (
    <div className="max-w-2xl mx-auto py-12">
      {isLoading ? (
        <div className="glass-panel rounded-[32px] p-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : order ? (
        <>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-Success bg-opacity-10 rounded-full mb-4">
              <svg className="w-8 h-8 text-Success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-ink mb-2">Order Confirmed!</h1>
            <p className="text-slate-600">Thank you for your purchase. We're preparing your order for shipment.</p>
          </div>

          <div className="glass-panel rounded-[32px] p-8 mb-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-semibold mb-2">Order Number</p>
                <p className="text-2xl font-bold text-ink">#{order.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-semibold mb-2">Order Status</p>
                <span className="inline-block px-3 py-1 bg-blue-50 text-Primary font-semibold rounded-full text-sm">
                  {order.status || "Processing"}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-semibold mb-2">Total Amount</p>
                <p className="text-2xl font-bold text-Primary">${(order.total_amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-semibold mb-2">Order Date</p>
                <p className="text-lg text-ink font-medium">{new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-8 mb-6">
            <h2 className="text-xl font-bold text-ink mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-Border rounded-lg">
                  <div>
                    <p className="font-medium text-ink">{item.product_name || `Product #${item.product_id}`}</p>
                    <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-ink">${(item.price || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={() => window.location.href = "/account"}
            >
              View Order Details
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.href = "/products"}
            >
              Continue Shopping
            </Button>
          </div>

          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">What's next?</span> We'll send you an email confirmation shortly. Track your order in your account dashboard.
            </p>
          </div>
        </>
      ) : (
        <div className="glass-panel rounded-[32px] p-8 text-center">
          <p className="text-Error mb-4">Order not found</p>
          <Button onClick={() => window.location.href = "/products"}>Back to Shopping</Button>
        </div>
      )}
    </div>
  );
}
