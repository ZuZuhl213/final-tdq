import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getRecommendations } from "../services/aiService";
import { listBrands, listCategories, listProducts } from "../services/productService";
import { addToCart, getCart } from "../services/cartService";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import useToastStore from "../stores/toastStore";
import ProductCard from "../components/ProductCard";
import Skeleton from "../components/ui/Skeleton";

const typeOptions = ["all", "book", "electronics", "fashion"];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const user = useAuthStore((state) => state.user);
  const setCart = useCartStore((state) => state.setCart);
  const toast = useToastStore((state) => state.push);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: listBrands
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", type, priceMin, priceMax, selectedBrands, selectedCategories],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (type !== "all") params.product_type = type;
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;
      if (selectedBrands.length > 0) params.brand = selectedBrands[0];
      if (selectedCategories.length > 0) params.category_id = selectedCategories[0];
      return listProducts(params);
    }
  });

  const { data: picks } = useQuery({
    queryKey: ["ai-picks", user?.id || 1],
    queryFn: () => getRecommendations(user?.id || 1, 5),
    staleTime: 60000
  });

  const filtered = useMemo(() => {
    const items = Array.isArray(data) ? data : (data?.results || []);
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item: any) => item.name.toLowerCase().includes(keyword));
  }, [data, search]);

  const toggleSelected = (list: number[], value: number, setter: (values: number[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleAdd = async (productId: number) => {
    await addToCart(productId, 1);
    const cart = await getCart();
    setCart(cart);
    toast("Đã thêm vào giỏ hàng", "success");
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="glass-panel rounded-[32px] p-5 h-fit">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Filters</div>
        <div className="mt-4 space-y-5">
          <div>
            <div className="text-sm font-semibold mb-2">Product type</div>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option}
                  className={option === type ? "chip chip-active" : "chip"}
                  onClick={() => setType(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Price</div>
            <input
              className="input mb-2"
              value={priceMin}
              onChange={(event) => setPriceMin(event.target.value)}
              placeholder="Min"
            />
            <input
              className="input"
              value={priceMax}
              onChange={(event) => setPriceMax(event.target.value)}
              placeholder="Max"
            />
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Brands</div>
            <div className="space-y-2 text-sm">
              {brands?.map((brand: { id: number; name: string }) => (
                <label key={brand.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => toggleSelected(selectedBrands, brand.id, setSelectedBrands)}
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Categories</div>
            <div className="space-y-2 text-sm">
              {categories?.map((category: { id: number; name: string }) => (
                <label key={category.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleSelected(selectedCategories, category.id, setSelectedCategories)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Catalog</h2>
            <p className="text-sm text-slate-500">Browse 50+ seeded products across categories.</p>
          </div>
          <input
            className="input max-w-xs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product name"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-48" />)}
          {filtered.map((product: any) => (
            <ProductCard key={product.id} product={product} onAddToCart={() => handleAdd(product.id)} />
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-panel rounded-[32px] p-5 mt-8">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">AI picks</div>
          <h3 className="text-xl font-semibold mb-3">Recommended for you</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {picks?.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={() => handleAdd(product.id)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
