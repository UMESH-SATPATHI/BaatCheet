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
  Bell,
  BellOff,
  Download,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { requestNotificationPermission } from "../lib/notification";
import { usePWAInstall } from "../lib/PWAInstallContext";

export default function ProfileHeader({ isOpen, onClose }) {
  const { authUser, logout, isLoggingOut, updateProfile, deleteAccount } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const { openInstall, platform } = usePWAInstall();
  const [notificationPermission, setNotificationPermission] = useState(
    () => ("Notification" in window ? Notification.permission : "denied")
  );
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

  const handleEnableNotifications = async () => {
    try {
      await requestNotificationPermission();
      setNotificationPermission("granted");
    } catch (error) {
      setNotificationPermission("denied");
    }
  };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 transition-opacity duration-150 ease-out ${
        isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border border-zinc-800 bg-[#16161b] w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 transition-all duration-150 ease-out overflow-hidden ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-98 translate-y-1 pointer-events-none"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close (Esc)"
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Settings</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Profile & preferences</p>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex flex-col items-center p-4 bg-[#1b1b22] rounded-xl border border-zinc-800/80 relative">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-zinc-800 ring-1 ring-zinc-700/80 overflow-hidden flex items-center justify-center text-zinc-200 text-base font-semibold">
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

            {/* Online Badge */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#1b1b22]" />

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
                <Loader2 className="w-4 h-4 animate-spin text-zinc-200" />
              ) : (
                <Camera className="w-4 h-4 text-zinc-200" />
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

          <h3 className="text-sm font-medium text-zinc-100 mt-2.5 leading-tight">
            {authUser?.fullName || "User"}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{authUser?.email || "online"}</p>

          <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Connected</span>
          </div>
        </div>

        {/* Preferences & Settings */}
        <div className="space-y-1.5 text-xs">
          {/* Sound Notifications Toggle */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#1b1b22] border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
              </div>
              <div>
                <span className="font-medium text-zinc-200 block text-xs">Message Sounds</span>
                <span className="text-[11px] text-zinc-400">
                  {isSoundEnabled ? "Sound effects active" : "Sounds muted"}
                </span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                isSoundEnabled
                  ? "bg-zinc-700 text-white hover:bg-zinc-600"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isSoundEnabled ? "Enabled" : "Muted"}
            </button>
          </div>

          {/* Browser Notifications Toggle */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#1b1b22] border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                {notificationPermission === "granted" ? (
                  <Bell className="w-3.5 h-3.5" />
                ) : (
                  <BellOff className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </div>
              <div>
                <span className="font-medium text-zinc-200 block text-xs">Browser Notifications</span>
                <span className="text-[11px] text-zinc-400">
                  {notificationPermission === "granted" ? "Enabled for background tabs" : "Notify for new messages"}
                </span>
              </div>
            </div>
            <button
              onClick={handleEnableNotifications}
              disabled={notificationPermission === "granted"}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                notificationPermission === "granted"
                  ? "bg-zinc-800 text-zinc-400 cursor-default"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {notificationPermission === "granted" ? "Enabled" : "Enable"}
            </button>
          </div>

          {platform !== "installed" && (
            <button
              type="button"
              onClick={openInstall}
              className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#1b1b22] p-2.5 text-left transition hover:border-zinc-700"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                <Download className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="block text-xs font-medium text-zinc-200">Install BaatCheet</span>
                <span className="text-[11px] text-zinc-400">Run in standalone window</span>
              </div>
            </button>
          )}

          {/* Security & Encryption Info */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1b1b22] border border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-medium text-zinc-200 block text-xs">End-to-End Encryption</span>
              <span className="text-[11px] text-zinc-400">
                All messages and media transfers are encrypted.
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone / Log Out Action */}
        <div className="pt-1 flex flex-col gap-2">
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700/60 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[11px] text-zinc-500 hover:text-rose-400 transition cursor-pointer text-center py-0.5"
            >
              Delete account
            </button>
          ) : (
            <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-xl flex flex-col gap-2 text-center">
              <p className="text-[11px] text-rose-300 font-medium">Are you sure? This cannot be undone.</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{isDeleting ? "Deleting..." : "Yes, delete"}</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition cursor-pointer"
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
