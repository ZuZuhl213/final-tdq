import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createProduct, listBrands, listCategories, listProducts } from "../services/productService";
import { listOrders } from "../services/orderService";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import Modal from "../components/ui/Modal";
import useToastStore from "../stores/toastStore";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const toast = useToastStore((state) => state.push);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    image_url: "",
    brand: "",
    category_id: "",
    product_type: "electronics",
    list_price: "99.99",
    price: "89.99",
    stock: "10",
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProducts({})
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: listCategories,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: listBrands,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listOrders
  });

  const productItems = Array.isArray(products) ? products : products?.results || [];
  const firstBrandId = useMemo(() => (brands[0]?.id ? String(brands[0].id) : ""), [brands]);
  const firstCategoryId = useMemo(() => (categories[0]?.id ? String(categories[0].id) : ""), [categories]);

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast("Product created", "success");
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-home"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      toast("Create product failed", "error");
    },
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateProduct = () => {
    const slug = (form.slug || form.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const sku = form.sku || `SKU-${Date.now()}`;
    const brandId = Number(form.brand || firstBrandId);
    const categoryId = Number(form.category_id || firstCategoryId);

    if (!form.name.trim() || !brandId || !categoryId) {
      toast("Name, brand, category are required", "warning");
      return;
    }

    createProductMutation.mutate({
      name: form.name.trim(),
      slug,
      sku,
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      brand: brandId,
      list_price: Number(form.list_price),
      price: Number(form.price),
      category_id: categoryId,
      product_type: form.product_type as "book" | "electronics" | "fashion",
      is_active: true,
      stock: Number(form.stock),
    });
  };

  const stats = [
    { label: "Total Products", value: productItems.length, icon: "📦" },
    { label: "Active Orders", value: Array.isArray(orders) ? orders.filter((o: any) => o.status === "pending").length : 0, icon: "📋" },
    { label: "Completed", value: Array.isArray(orders) ? orders.filter((o: any) => o.status === "completed").length : 0, icon: "✅" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-[32px] p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Admin Panel</div>
        <h1 className="text-3xl font-bold text-ink mt-3 mb-2">Operations Dashboard</h1>
        <p className="text-slate-600">Manage products, users, and orders. Role-based access control ensures data security.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-[32px] p-6">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-semibold mb-1">{ stat.label}</p>
            <p className="text-3xl font-bold text-Primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Products Management */}
      <div className="glass-panel rounded-[32px] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-ink">Products</h2>
            <p className="text-sm text-slate-600 mt-1">Manage your product catalog</p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Add Product</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-Border">
                <th className="text-left py-3 px-4 font-semibold text-ink">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-Border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : productItems.slice(0, 10).map((product: any) => (
                <tr key={product.id} className="border-b border-Border hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{product.id}</td>
                  <td className="py-3 px-4 font-medium text-ink">{product.name}</td>
                  <td className="py-3 px-4">${product.price}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.stock > 0 ? "bg-Success bg-opacity-10 text-Success" : "bg-Error bg-opacity-10 text-Error"
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {productItems.length > 10 && (
          <p className="text-xs text-slate-500 mt-4">Showing 10 of {productItems.length} products</p>
        )}
      </div>

      {/* Orders Management */}
      <div className="glass-panel rounded-[32px] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-ink">Orders</h2>
            <p className="text-sm text-slate-600 mt-1">Recent orders from customers</p>
          </div>
          <Button variant="outline">Export</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-Border">
                <th className="text-left py-3 px-4 font-semibold text-ink">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-Border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders?.slice(0, 10).map((order: any) => (
                <tr key={order.id} className="border-b border-Border hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">#{order.id}</td>
                  <td className="py-3 px-4 font-medium text-ink">${(order.total_amount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === "completed" 
                        ? "bg-Success bg-opacity-10 text-Success"
                        : "bg-blue-50 text-Primary"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Update</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders && orders.length > 10 && (
          <p className="text-xs text-slate-500 mt-4">Showing 10 of {orders.length} orders</p>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Product"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateProduct} disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          <input className="input" placeholder="SKU (optional)" value={form.sku} onChange={(e) => updateField("sku", e.target.value)} />
          <input className="input" placeholder="Slug (optional)" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} />
          <select className="input" value={form.product_type} onChange={(e) => updateField("product_type", e.target.value)}>
            <option value="book">book</option>
            <option value="electronics">electronics</option>
            <option value="fashion">fashion</option>
          </select>
          <select className="input" value={form.brand || firstBrandId} onChange={(e) => updateField("brand", e.target.value)}>
            {brands.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select className="input" value={form.category_id || firstCategoryId} onChange={(e) => updateField("category_id", e.target.value)}>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input className="input" placeholder="List price" value={form.list_price} onChange={(e) => updateField("list_price", e.target.value)} />
          <input className="input" placeholder="Price" value={form.price} onChange={(e) => updateField("price", e.target.value)} />
          <input className="input" placeholder="Stock" value={form.stock} onChange={(e) => updateField("stock", e.target.value)} />
          <input className="input" placeholder="Image URL" value={form.image_url} onChange={(e) => updateField("image_url", e.target.value)} />
          <textarea
            className="input md:col-span-2 min-h-[90px]"
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
