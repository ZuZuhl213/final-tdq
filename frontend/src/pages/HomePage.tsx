import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getRecommendations } from "../services/aiService";
import { listProducts } from "../services/productService";
import useAuthStore from "../stores/authStore";
import { Product } from "../types/models";
import ProductCard from "../components/ProductCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const { data: picks, isLoading: picksLoading } = useQuery({
    queryKey: ["recommendations", user?.id || 1],
    queryFn: () => getRecommendations(user?.id || 1, 4)
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-home"],
    queryFn: () => listProducts({}),
    staleTime: 60000
  });

  return (
    <div className="space-y-12">
      <section className="hero-grid">
        <div className="hero-card">
          <div className="chip chip-muted mb-4">New season drop</div>
          <h1 className="hero-title text-4xl lg:text-6xl font-semibold mb-4">
            Shop smarter with AI-curated tech, fashion, and reads.
          </h1>
          <p className="text-slate-600 mb-6">
            TechStore blends microservices scale with RAG-driven discovery. Browse products, chat with AI,
            and checkout in a single flow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary">
              Shop now
            </Link>
            <Link to="/account" className="btn-ghost">
              My account
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>50+ seeded products</span>
            <span>RAG chatbot ready</span>
            <span>JWT secured</span>
          </div>
        </div>
        <div className="hero-stack">
          <div className="glass-panel rounded-3xl p-6 animate-fade">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">AI picks</div>
            <p className="text-lg font-semibold">Fresh recommendations every visit.</p>
            <p className="text-sm text-slate-500 mt-2">Powered by hybrid ML + co-occurrence + RAG.</p>
          </div>
          <div className="glass-panel rounded-3xl p-6 animate-fade delay-150">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Secure checkout</div>
            <p className="text-lg font-semibold">Payments mocked, flow realistic.</p>
            <p className="text-sm text-slate-500 mt-2">Orders, payments, and carts are decoupled services.</p>
          </div>
          <div className="glass-panel rounded-3xl p-6 animate-fade delay-300">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Realtime stack</div>
            <p className="text-lg font-semibold">Gateway + 6 services</p>
            <p className="text-sm text-slate-500 mt-2">Scale each service independently.</p>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[32px] p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Recommended for you</div>
            <h2 className="text-3xl font-semibold">AI picks</h2>
          </div>
          <Button variant="ghost" size="sm">
            Refresh
          </Button>
        </div>
        <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-4">
          {picksLoading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40" />)}
          {picks?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {["Books", "Electronics", "Fashion"].map((category) => (
          <div key={category} className="glass-panel rounded-3xl p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Featured</div>
            <h3 className="text-2xl font-semibold mb-2">{category}</h3>
            <p className="text-sm text-slate-500 mb-4">Curated picks from our {category.toLowerCase()} partners.</p>
            <Link to="/products" className="btn-ghost">
              Explore {category}
            </Link>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[32px] p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Trending now</div>
        <h2 className="text-3xl font-semibold mb-4">New arrivals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {productsLoading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40" />)}
          {products?.results?.slice(0, 4).map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
