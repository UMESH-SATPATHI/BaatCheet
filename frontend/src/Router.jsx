import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";

export default function Router() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Checking authentication">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={authUser ? "/chat" : "/login"} replace />} />
        <Route path="/login" element={authUser ? <Navigate to="/chat" replace /> : <Login />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={authUser ? "/chat" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
