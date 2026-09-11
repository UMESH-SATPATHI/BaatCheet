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
import ProfileHeader from "./profileHeader";

export default function SidebarNav() {
  const { activeTab, setActiveTab, isSoundEnabled, toggleSound } = useChatStore();
  const { authUser } = useAuthStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    <aside className="w-[60px] md:w-[68px] h-full max-h-[100dvh] bg-[#101014] border-r border-[#1f1f26] flex flex-col items-center justify-between py-3 md:py-4 select-none shrink-0 z-20 overflow-y-auto overflow-x-hidden scrollbar-none">
      {/* Top Section: Brand Logo & Nav Icons */}
      <div className="flex flex-col items-center gap-3 md:gap-6 w-full shrink-0">
        {/* Brand App Logo */}
        <button
          onClick={() => setActiveTab("chats")}
          title="BaatCheet"
          className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/40 hover:scale-110 hover:rotate-3 hover:shadow-purple-500/50 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
        </button>

        {/* Navigation List */}
        <nav className="flex flex-col items-center gap-2 md:gap-3 w-full px-1.5 md:px-2" aria-label="Main Navigation">
          {/* Chats Icon */}
          <button
            onClick={() => setActiveTab("chats")}
            title="Chats"
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${activeTab === "chats"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
              }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Contacts / Users Icon */}
          <button
            onClick={() => setActiveTab("contacts")}
            title="Contacts"
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${activeTab === "contacts"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
              }`}
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Phone / Calls Icon */}
          <button
            onClick={() => setActiveTab("calls")}
            title="Calls"
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${activeTab === "calls"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
              }`}
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Documents / Files Icon */}
          <button
            onClick={() => setActiveTab("files")}
            title="Files"
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${activeTab === "files"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
              }`}
          >
            <FileText className="w-5 h-5" />
          </button>

          {/* Settings Icon */}
          <button
            onClick={() => setActiveTab("settings")}
            title="Settings"
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${activeTab === "settings"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
              }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Bottom Section: Volume & User Profile */}
      <div className="flex flex-col items-center gap-3 md:gap-4 relative shrink-0 pb-safe pt-2">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#202028] hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-5 h-5 text-purple-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-zinc-500" />
          )}
        </button>

        {/* User Avatar with status dot */}
        <div className="relative">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Your Profile"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold hover:scale-110 hover:ring-2 hover:ring-purple-400 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden shadow-md"
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
        </div>
      </div>

      {/* Profile Header Modal */}
      <ProfileHeader
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </aside>
  );
}
