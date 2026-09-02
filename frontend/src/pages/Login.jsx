import { useAuthStore } from "../store/authStore";
import { LoaderCircle } from "lucide-react";

export default function Login() {
  const { authUser, loginWithGoogle, logout, deleteAccount, isLoggingIn } =
    useAuthStore();

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-6">
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-3xl">Welcome to Baatcheet</h1>
          {authUser ? (
            <>
              <p>Signed in as {authUser.email}</p>
              <button className="btn btn-error mt-4" onClick={logout}>
                Log out
              </button>
              <button
                className="btn btn-outline btn-error"
                onClick={() => {
                  if (window.confirm("Are you sure you want to permanently delete your account?")) {
                    deleteAccount();
                  }
                }}
                disabled={isLoggingIn}
              >
                Delete account
              </button>
            </>
          ) : (
            <>
              <p>Sign in with Google to start chatting.</p>
              <button className="btn btn-primary mt-4" onClick={loginWithGoogle} disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <LoaderCircle className="animate-spin" size={20} aria-label="Redirecting" />
                ) : (
                  "Continue with Google"
                )}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}