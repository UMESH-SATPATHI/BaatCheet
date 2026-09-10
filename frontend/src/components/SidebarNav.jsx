import React, { useState } from "react";
import {
  MessageSquare,
  Users,
  Phone,
  FileText,
  Settings,
  Volume2,
  VolumeX,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

export default function SidebarNav() {
  const { activeTab, setActiveTab, isSoundEnabled, toggleSound } = useChatStore();
  const { authUser, logout, isLoggingOut } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Get user initials
  const initials = authUser?.fullName
    ? authUser.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "ME";

  return (
    <aside className="w-[68px] h-full bg-[#101014] border-r border-[#1f1f26] flex flex-col items-center justify-between py-4 select-none shrink-0 z-20">
      {/* Top Section: Brand Logo & Nav Icons */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand App Logo */}
        <button
          onClick={() => setActiveTab("chats")}
          title="BaatCheet"
          className="w-11 h-11 bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6 text-white fill-white" />
        </button>

        {/* Navigation List */}
        <nav className="flex flex-col items-center gap-3 w-full px-2" aria-label="Main Navigation">
          {/* Chats Icon */}
          <button
            onClick={() => setActiveTab("chats")}
            title="Chats"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === "chats"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a22]"
              }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Contacts / Users Icon */}
          <button
            onClick={() => setActiveTab("contacts")}
            title="Contacts"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === "contacts"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a22]"
              }`}
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Phone / Calls Icon */}
          <button
            onClick={() => setActiveTab("calls")}
            title="Calls"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === "calls"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a22]"
              }`}
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Documents / Files Icon */}
          <button
            onClick={() => setActiveTab("files")}
            title="Files"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === "files"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a22]"
              }`}
          >
            <FileText className="w-5 h-5" />
          </button>

          {/* Settings Icon */}
          <button
            onClick={() => setActiveTab("settings")}
            title="Settings"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === "settings"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a22]"
              }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Bottom Section: Volume & User Profile */}
      <div className="flex flex-col items-center gap-4 relative">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1a1a22] transition-colors cursor-pointer"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5 text-zinc-500" />
          )}
        </button>

        {/* User Avatar with status dot */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Your Profile"
            className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-purple-400 transition cursor-pointer overflow-hidden"
          >
            {authUser?.profilePic ? (
              <img
                src={authUser.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </button>

          {/* Cyan Online Status Dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22d3ee] ring-2 ring-[#101014] online-dot pointer-events-none" />

          {/* Profile Dropdown Popover */}
          {showProfileMenu && (
            <div
              className="absolute left-14 bottom-0 w-auto bg-[#18181f] border border-zinc-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
                <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {authUser?.profilePic ? (
                    <img
                      src={authUser.profilePic}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-white truncate">
                    {authUser?.fullName || "My Account"}
                  </span>
                  <span className="text-xs text-zinc-400 truncate">
                    {authUser?.email || "online"}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-xl transition cursor-pointer w-full text-left mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
