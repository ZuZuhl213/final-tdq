import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { register as registerUser } from "../services/authService";
import useToastStore from "../stores/toastStore";
import Button from "../components/ui/Button";
import { RegisterSchema } from "../validation/schemas";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToastStore((state) => state.push);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data as any);
      toast("Đăng ký thành công, vui lòng đăng nhập", "success");
      navigate("/auth/login");
    } catch (err) {
      toast("Đăng ký thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-4xl grid gap-8 lg:grid-cols-[1fr_1fr] items-center">
        <div className="glass-panel rounded-[32px] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Create account</div>
          <h2 className="text-3xl font-bold text-ink mt-2 mb-2">Join TechStore</h2>
          <p className="text-sm text-slate-600 mb-6">Unlock AI recommendations and personalized shopping.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Username</label>
              <input
                {...register("username")}
                type="text"
                placeholder="john_doe"
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
              />
              {errors.username && <p className="mt-1 text-sm text-Error">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
              />
              {errors.email && <p className="mt-1 text-sm text-Error">{errors.email.message}</p>}
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

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Confirm password</label>
              <input
                {...register("password_confirm")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink placeholder-slate-400 focus:ring-2 focus:ring-Primary focus:border-transparent transition"
              />
              {errors.password_confirm && <p className="mt-1 text-sm text-Error">{errors.password_confirm.message}</p>}
            </div>

            <Button 
              variant="primary" 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-600 text-center">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-Primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Why join</div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="text-Primary font-bold">✓</span>
              <span>Save addresses and order history</span>
            </li>
            <li className="flex gap-3">
              <span className="text-Primary font-bold">✓</span>
              <span>AI-powered product recommendations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-Primary font-bold">✓</span>
              <span>Faster checkout on any device</span>
            </li>
            <li className="flex gap-3">
              <span className="text-Primary font-bold">✓</span>
              <span>Chat with our AI assistant</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
