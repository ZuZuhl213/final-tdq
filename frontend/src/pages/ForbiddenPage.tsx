import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-Error bg-opacity-10 rounded-full mb-6">
          <span className="text-5xl font-bold text-Error">403</span>
        </div>

        <h1 className="text-4xl font-bold text-ink mb-3">Access Denied</h1>
        <p className="text-slate-600 mb-8">
          You do not have permission to view this page. If you believe this is a mistake, please contact support.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          Error Code: 403 Forbidden
        </p>
      </div>
    </div>
  );
}
