import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { getMe } from "../services/authService";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ChatbotWidget from "./ChatbotWidget";
import ToastContainer from "./ui/ToastContainer";

const navItems = [
  { label: "Products", to: "/products" },
  { label: "Cart", to: "/cart" },
  { label: "Account", to: "/account" }
];

export default function Layout() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clear);
  const cart = useCartStore((state) => state.cart);

  const cartCount = useMemo(() => {
    return cart?.items?.reduce((sum: number, item) => sum + item.quantity, 0) || 0;
  }, [cart]);

  useEffect(() => {
    if (!accessToken || user) return;
    getMe()
      .then((data) => setUser(data))
      .catch(() => clearAuth());
  }, [accessToken, user, setUser, clearAuth]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-40">
        <div className="topbar">
          <span className="text-xs uppercase tracking-[0.3em]">TechStore Commerce</span>
          <span className="text-xs text-slate-500">Support: support@techstore.local</span>
        </div>
        <nav className="nav-shell">
          <div className="flex items-center gap-4">
            <Link to="/" className="brand">
              <span className="brand-mark">TS</span>
              <span>TechStore</span>
            </Link>
            <form onSubmit={handleSearch} className="hidden md:flex search-pill">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search devices, books, fashion"
                className="bg-transparent outline-none text-sm flex-1"
              />
              <button className="btn-ghost" type="submit">
                Search
              </button>
            </form>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex gap-1 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
                >
                  {item.label}
                </NavLink>
              ))}
              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
                >
                  Admin
                </NavLink>
              )}
            </div>
            <Link to="/cart" className="chip">
              Cart
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="chip">{user.username}</span>
                <button className="btn-ghost" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="content-shell">
        <ToastContainer />
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="footer-shell">
        <div>
          <div className="brand footer-brand">TechStore</div>
          <p className="text-sm text-slate-500">
            Modern commerce with AI recommendations, personalized carts, and instant discovery.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h4 className="footer-title">Explore</h4>
            <Link to="/products">Products</Link>
            <Link to="/account">My account</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div>
            <h4 className="footer-title">AI</h4>
            <span>Recommendation engine</span>
            <span>RAG chatbot</span>
            <span>Smart discovery</span>
          </div>
          <div>
            <h4 className="footer-title">Support</h4>
            <span>support@techstore.local</span>
            <span>Mon-Fri 9am-6pm</span>
            <span>Shipping FAQ</span>
          </div>
        </div>
      </footer>

      {user && <ChatbotWidget />}
    </div>
  );
}
