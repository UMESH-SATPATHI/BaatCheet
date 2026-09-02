import { Navigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Checking authentication">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  }

  return authUser ? children : <Navigate to="/login" replace />;
}
