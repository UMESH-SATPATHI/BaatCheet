import React, { useState } from "react";
import {
  MessageSquare,
  Users,
  FileText,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import ProfileHeader from "./ProfileHeader";

export default function SidebarNav() {
  const {
    activeTab,
    setActiveTab,
    isSoundEnabled,
    toggleSound,
    setMediaContactFilter,
  } = useChatStore();
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
    <aside className="w-[58px] md:w-[64px] h-full max-h-[100dvh] bg-[#121215] border-r border-[#202026] flex flex-col items-center justify-between py-3 select-none shrink-0 z-20">
      {/* Top Section: App Logo & Main Nav Items */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Brand App Logo */}
        <button
          onClick={() => setActiveTab("chats")}
          title="BaatCheet"
          className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700/90 text-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-indigo-400" />
        </button>

        {/* Navigation Rail */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2" aria-label="Main Navigation">
          {/* Chats */}
          <button
            onClick={() => setActiveTab("chats")}
            title="Chats"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === "chats"
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <MessageSquare className="w-[18px] h-[18px]" />
          </button>

          {/* Contacts */}
          <button
            onClick={() => setActiveTab("contacts")}
            title="Contacts"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === "contacts"
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Users className="w-[18px] h-[18px]" />
          </button>

          {/* Files */}
          <button
            onClick={() => {
              setMediaContactFilter("all");
              setActiveTab("files");
            }}
            title="Files & Media"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === "files"
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FileText className="w-[18px] h-[18px]" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Settings"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </nav>
      </div>

      {/* Bottom Section: Sound & User Profile */}
      <div className="flex flex-col items-center gap-3 w-full pb-safe pt-2">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
          className="w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 flex items-center justify-center transition-colors cursor-pointer"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-4 h-4 text-zinc-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {/* User Avatar with quiet online dot */}
        <div className="relative">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Your Profile"
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 text-xs font-semibold overflow-hidden flex items-center justify-center cursor-pointer ring-1 ring-zinc-700/60 hover:ring-zinc-500 transition-all"
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

          {/* Subtle Online Status Dot */}
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#121215] pointer-events-none" />
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

