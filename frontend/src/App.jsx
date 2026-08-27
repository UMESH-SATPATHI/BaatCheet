const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-6">
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-3xl">Welcome to Baatcheet</h1>
          <p>Sign in with Google to start chatting.</p>
          <a className="btn btn-primary mt-4" href={`${apiUrl}/api/auth/google`}>
            Continue with Google
          </a>
        </div>
      </section>
    </main>
  )
}