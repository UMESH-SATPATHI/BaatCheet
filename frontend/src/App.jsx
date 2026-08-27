import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/auth/check`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account?",
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Account deletion failed");
      }

      setUser(null);
    } catch (error) {
      console.error(error);
      window.alert("Unable to delete your account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-6">
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-3xl">Welcome to Baatcheet</h1>
          {user ? (
            <>
              <p>Signed in as {user.email}</p>
              <button className="btn btn-error mt-4" onClick={handleLogout}>
                Log out
              </button>
              <button
                className="btn btn-outline btn-error"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete account"}
              </button>
            </>
          ) : (
            <>
              <p>Sign in with Google to start chatting.</p>
              <a className="btn btn-primary mt-4" href={`${apiUrl}/api/auth/google`}>
                Continue with Google
              </a>
            </>
          )}
        </div>
      </section>
    </main>
  )
}