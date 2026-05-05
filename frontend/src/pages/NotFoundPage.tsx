import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
          <span className="text-5xl font-bold text-slate-400">404</span>
        </div>

        <h1 className="text-4xl font-bold text-ink mb-3">Page Not Found</h1>
        <p className="text-slate-600 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          Error Code: 404 Not Found
        </p>
      </div>
    </div>
  );
}
