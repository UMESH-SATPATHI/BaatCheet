import { useAuthStore } from "../store/authStore";
import { LoaderCircle } from "lucide-react";

export default function Chat() {
  const authUser = useAuthStore((state) => state.authUser);
  const logout = useAuthStore((state) => state.logout);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-6">
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="card-title">Welcome, {authUser.fullName}</h1>
          <p>Your chat page will go here.</p>
          <button className="btn btn-error mt-4" onClick={logout} disabled={isLoggingOut}>
            {isLoggingOut ? (
              <LoaderCircle className="animate-spin" size={20} aria-label="Logging out" />
            ) : (
              "Log out"
            )}
          </button>
        </div>
      </section>
    </main>
  );
}
