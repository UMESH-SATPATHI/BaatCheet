import React from "react";
import { useAuthStore } from "../store/authStore";
import { MessageSquare, Lock, LogOut, Trash2, Loader2, Download } from "lucide-react";
import { usePWAInstall } from "../lib/PWAInstallContext";

export default function Login() {
  const { authUser, loginWithGoogle, logout, deleteAccount, isLoggingIn } =
    useAuthStore();
  const { openInstall, platform } = usePWAInstall();

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-4 select-none bg-[#0e0e11]">
      {/* Central Authentication Card */}
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#15151a] p-6 sm:p-7 shadow-xl flex flex-col text-center">
        {/* Brand App Icon */}
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-200">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
        </div>

        {/* Title */}
        <h1 className="text-base font-semibold tracking-tight text-zinc-100">
          BaatCheet
        </h1>

        <p className="text-xs text-zinc-400 mt-1 mb-6">
          Quiet, modern messaging
        </p>

        {authUser ? (
          /* Logged In State */
          <div className="space-y-3.5">
            <div className="rounded-xl border border-zinc-800 bg-[#1c1c22] p-3 text-center">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">
                Signed in as
              </span>
              <p className="text-xs font-medium text-zinc-200 truncate">
                {authUser.email || authUser.fullName}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-medium text-zinc-200 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
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
                className="text-[11px] text-zinc-500 hover:text-rose-400 transition cursor-pointer py-1"
              >
                Delete account
              </button>
            </div>
          </div>
        ) : (
          /* Sign In with Google State */
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Sign in with your Google account to get started.
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-xs py-2.5 px-4 rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
              ) : (
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
              )}
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {platform !== "installed" && (
          <button
            type="button"
            onClick={openInstall}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#1b1b22] py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-700"
          >
            <Download className="h-3.5 w-3.5" />
            Install BaatCheet
          </button>
        )}

        {/* Bottom Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-zinc-800/80 pt-4">
          <Lock className="h-3 w-3 text-zinc-500" />
          <span className="text-[11px] text-zinc-500 font-medium">
            End-to-End Encrypted
          </span>
        </div>
      </div>
    </main>
  );
}