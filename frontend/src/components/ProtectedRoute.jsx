import { Navigate, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "true";

  if (isCheckingAuth && !isPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Checking authentication">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  }

  return (authUser || isPreview) ? children : <Navigate to="/login" replace />;
}
