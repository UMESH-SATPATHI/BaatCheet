import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Camera,
  LogOut,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";

export default function ProfileHeader({ isOpen, onClose }) {
  const { authUser, logout, isLoggingOut, updateProfile, deleteAccount } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mount/animate states for open & close transitions
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setIsMounted(true);
      timer = setTimeout(() => setIsAnimating(true), 20);
    } else {
      setIsAnimating(false);
      timer = setTimeout(() => {
        setIsMounted(false);
        setShowDeleteConfirm(false);
      }, 200);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const initials = authUser?.fullName
    ? authUser.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "ME";

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploading(true);
        await updateProfile({ profilePic: reader.result });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 transition-opacity duration-200 ease-out ${
        isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border border-zinc-800 w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 sm:gap-5 transition-all duration-200 ease-out overflow-hidden backdrop-blur-xl ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
        style={{
          backgroundColor: "rgba(23, 23, 30, 0.9)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px -10px rgba(139, 92, 246, 0.2)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close (Esc)"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Your Profile</h2>
          <p className="text-xs text-zinc-400">Manage your profile and account settings</p>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex flex-col items-center p-4 sm:p-5 bg-[#121217] rounded-2xl border border-zinc-800/80 relative">
          <div className="relative group">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-xl">
              <div className="w-full h-full rounded-full bg-[#17171e] overflow-hidden flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                {authUser?.profilePic ? (
                  <img
                    src={authUser.profilePic}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            {/* Online Badge */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#22d3ee] ring-2 ring-[#121217] online-dot" />

            {/* Change Photo Overlay Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Change Profile Photo"
              className={`absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white transition-opacity cursor-pointer ${
                isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white mt-3 leading-tight">
            {authUser?.fullName || "User"}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{authUser?.email || "online"}</p>

          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Google Account Connected</span>
          </div>
        </div>

        {/* Preferences & Settings */}
        <div className="space-y-2 text-xs">
          {/* Sound Notifications Toggle */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#121217] border border-zinc-800/80">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              </div>
              <div>
                <span className="font-semibold text-white block text-xs">Message Sounds</span>
                <span className="text-[10px] sm:text-[11px] text-zinc-400">
                  {isSoundEnabled ? "Sound effects active" : "Sounds muted"}
                </span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                isSoundEnabled
                  ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/30 hover:bg-[#7c3aed]"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isSoundEnabled ? "Enabled" : "Muted"}
            </button>
          </div>

          {/* Security & Encryption Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#121217] border border-zinc-800/80">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white block text-xs">Protected Connection</span>
              <span className="text-[10px] sm:text-[11px] text-zinc-400">
                All messages and media transfers are encrypted.
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone / Log Out Action */}
        <div className="pt-1 sm:pt-2 flex flex-col gap-2">
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-semibold text-xs border border-rose-500/20 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors duration-150 cursor-pointer text-center py-1"
            >
              Delete account
            </button>
          ) : (
            <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-2xl flex flex-col gap-2 text-center">
              <p className="text-[11px] text-rose-300 font-medium">Are you sure? This cannot be undone.</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{isDeleting ? "Deleting..." : "Yes, delete"}</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
