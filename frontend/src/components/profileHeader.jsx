import React from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { LogOut, Volume2, VolumeX } from "lucide-react";

export default function ProfileHeader() {
  const { authUser, logout, isLoggingOut } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  return (
    <div className="flex items-center justify-between p-2.5 bg-[#1a1a24]/95 backdrop-blur-sm rounded-2xl border border-zinc-800/70 hover:border-purple-500/30 shadow-md transition-all duration-200">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-sm">
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              authUser?.fullName ? authUser.fullName.substring(0, 2).toUpperCase() : "ME"
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22d3ee] ring-2 ring-[#1a1a24] online-dot" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-white truncate leading-tight">
            {authUser?.fullName || "My Account"}
          </h4>
          <p className="text-[10px] text-zinc-400 truncate leading-tight">
            {authUser?.email || "online"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-1.5">
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-purple-300 hover:bg-purple-500/15 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>
        <button
          onClick={logout}
          disabled={isLoggingOut}
          title="Log out"
          className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
