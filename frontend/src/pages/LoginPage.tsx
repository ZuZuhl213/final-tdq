import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getMe, login } from "../services/authService";
import useAuthStore from "../stores/authStore";
import useToastStore from "../stores/toastStore";
import Button from "../components/ui/Button";
import { LoginSchema } from "../validation/schemas";

type LoginFormData = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const toast = useToastStore((state) => state.push);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema)
  });

  const query = new URLSearchParams(location.search);
  const redirect = query.get("redirect") || "/";

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      setTokens({
        access: response.access,
        refresh: response.refresh,
      });
      const user = await getMe();
      setUser(user);
      toast("Đăng nhập thành công", "success");
      navigate(redirect);
    } catch (err) {
      toast("Sai tên đăng nhập hoặc mật khẩu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-4xl grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="glass-panel rounded-[32px] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Welcome back</div>
          <h2 className="text-3xl font-bold text-ink mt-2 mb-2">Sign in to TechStore</h2>
          <p className="text-sm text-slate-600 mb-6">Access your cart, orders, and AI recommendations.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Username or email</label>
              <input
                {...register("username")}
                type="text"
                placeholder="admin"
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
              />
              {errors.username && <p className="mt-1 text-sm text-Error">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
              />
              {errors.password && <p className="mt-1 text-sm text-Error">{errors.password.message}</p>}
            </div>

            <Button 
              variant="primary" 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-600 text-center">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-Primary font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Demo accounts</div>
          <h3 className="text-xl font-bold text-ink mt-2 mb-4">Quick login</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-ink">Admin</p>
                <p className="text-xs text-slate-600">admin / Password123</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setValue("username", "admin");
                  setValue("password", "Password123");
                }}
              >
                Use
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-ink">User</p>
                <p className="text-xs text-slate-600">alice / Password123</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setValue("username", "alice");
                  setValue("password", "Password123");
                }}
              >
                Use
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
