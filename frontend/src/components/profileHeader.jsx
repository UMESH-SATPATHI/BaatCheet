import React from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { LogOut, Volume2, VolumeX } from "lucide-react";

export default function ProfileHeader() {
  const { authUser, logout, isLoggingOut } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  return (
    <div className="flex items-center justify-between p-3 bg-[#1c1c24] rounded-2xl border border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-xs">
          {authUser?.fullName ? authUser.fullName.substring(0, 2).toUpperCase() : "ME"}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-white">{authUser?.fullName || "User"}</h4>
          <p className="text-[10px] text-zinc-400">{authUser?.email || "online"}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
