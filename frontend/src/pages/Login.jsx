import React from "react";
import { useAuthStore } from "../store/authStore";
import { MessageSquare, ShieldCheck, LogOut, Trash2, LoaderCircle } from "lucide-react";
import {
  Particles,
  InteractiveHoverButton,
  MagicCard,
  AnimatedShinyText,
  Meteors,
} from "../components/magicui";

export default function Login() {
  const { authUser, loginWithGoogle, logout, deleteAccount, isLoggingIn } =
    useAuthStore();

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 select-none"
      style={{
        backgroundColor: "#0d0d11",
        backgroundImage: `
          radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.15), transparent 45%),
          radial-gradient(circle at 80% 85%, rgba(34, 211, 238, 0.08), transparent 40%),
          radial-gradient(circle at 20% 75%, rgba(147, 51, 234, 0.1), transparent 40%)
        `,
      }}
    >
      {/* 1. Magic UI Atmospheric Meteors & Ambient Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Meteors number={16} />
      </div>
      <Particles
        className="absolute inset-0 z-0"
        quantity={65}
        color="#a78bfa"
        size={0.9}
        staticity={40}
        ease={60}
      />

      {/* Subtle radial ambient vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(13, 13, 17, 0.8) 100%)",
        }}
      />

      {/* 2. Central Authentication Card with MagicCard cursor-tracking orb */}
      <MagicCard className="w-full max-w-md">

        {/* Brand App Icon with glowing aura */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-900/50">
          <MessageSquare className="h-8 w-8 text-white fill-white" />
        </div>

        {/* Title with Magic UI Animated Shiny Text */}
        <div className="mb-2 flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <AnimatedShinyText shimmerWidth={120}>
              BaatCheet
            </AnimatedShinyText>
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-zinc-400 font-medium mb-6">
          Fast, ultra-secure, state-of-the-art messaging
        </p>

        {authUser ? (
          /* Logged In State Card */
          <div className="space-y-4">
            <div
              className="rounded-2xl border border-purple-500/20 p-4 text-center"
              style={{
                backgroundColor: "rgba(139, 92, 246, 0.08)",
              }}
            >
              <span className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold block mb-1">
                Currently Signed In
              </span>
              <p className="text-sm font-semibold text-white truncate max-w-full">
                {authUser.email || authUser.fullName}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-900/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to permanently delete your account?")) {
                    deleteAccount();
                  }
                }}
                disabled={isLoggingIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 py-2.5 text-xs font-semibold text-rose-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Delete account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In with Google State */
          <div className="space-y-5">
            <p className="text-xs text-zinc-400">
              Sign in with your Google Account to connect with your team and friends.
            </p>

            {/* Magic UI Interactive Hover Button for Google Authentication */}
            <div className="flex justify-center w-full">
              <InteractiveHoverButton
                onClick={handleGoogleLogin}
                loading={isLoggingIn}
                disabled={isLoggingIn}
                icon={
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                }
              >
                Continue with Google
              </InteractiveHoverButton>
            </div>
          </div>
        )}

        {/* Bottom Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-zinc-800/80 pt-5">
          <ShieldCheck className="h-4 w-4 text-[#22d3ee] shrink-0" />
          <span className="text-[11px] font-medium text-zinc-400">
            End-to-End Encrypted &bull; Instant Delivery
          </span>
        </div>
      </MagicCard>
    </main>
  );
}