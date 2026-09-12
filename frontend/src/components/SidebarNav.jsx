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
import ProfileHeader from "./profileHeader";
import { VerticalDock, VerticalDockIcon } from "./magicui";

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
    <aside className="w-[56px] sm:w-[62px] md:w-[70px] h-full max-h-[100dvh] bg-[#101014] border-r border-[#1f1f26] flex flex-col items-center justify-between py-2.5 sm:py-3 md:py-4 select-none shrink-0 z-20 overflow-y-auto overflow-x-hidden scrollbar-none">
      {/* Top Section: Brand Logo & Nav Icons with Vertical Dock Magnification */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 w-full shrink-0">
        {/* Brand App Logo */}
        <button
          onClick={() => setActiveTab("chats")}
          title="BaatCheet"
          className="w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/40 hover:rotate-3 hover:shadow-purple-500/50 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
        </button>

        {/* Navigation List with Vertical Dock Magnification */}
        <VerticalDock
          magnification={52}
          distance={110}
          baseSize={40}
          className="gap-2 sm:gap-2.5 w-full px-1"
        >
          {/* Chats Icon */}
          <VerticalDockIcon
            onClick={() => setActiveTab("chats")}
            title="Chats"
            className={`rounded-xl transition-colors cursor-pointer ${
              activeTab === "chats"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/50"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </VerticalDockIcon>

          {/* Contacts / Users Icon */}
          <VerticalDockIcon
            onClick={() => setActiveTab("contacts")}
            title="Contacts"
            className={`rounded-xl transition-colors cursor-pointer ${
              activeTab === "contacts"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/50"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
            }`}
          >
            <Users className="w-5 h-5" />
          </VerticalDockIcon>

          {/* Documents / Files Icon */}
          <VerticalDockIcon
            onClick={() => setActiveTab("files")}
            title="Files"
            className={`rounded-xl transition-colors cursor-pointer ${
              activeTab === "files"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/50"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
            }`}
          >
            <FileText className="w-5 h-5" />
          </VerticalDockIcon>

          {/* Settings Icon */}
          <VerticalDockIcon
            onClick={() => setActiveTab("settings")}
            title="Settings"
            className={`rounded-xl transition-colors cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/50"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1a24]"
            }`}
          >
            <Settings className="w-5 h-5" />
          </VerticalDockIcon>
        </VerticalDock>
      </div>

      {/* Bottom Section: Volume & User Profile with Vertical Dock Magnification */}
      <div className="flex flex-col items-center gap-2 relative shrink-0 pb-safe pt-2 w-full">
        <VerticalDock
          magnification={48}
          distance={90}
          baseSize={38}
          className="gap-2.5 w-full px-1"
        >
          {/* Sound Toggle */}
          <VerticalDockIcon
            onClick={toggleSound}
            title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
            className="rounded-xl text-zinc-400 hover:text-white hover:bg-[#202028]"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-5 h-5 text-purple-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-zinc-500" />
            )}
          </VerticalDockIcon>

          {/* User Avatar with status dot */}
          <div className="relative flex items-center justify-center">
            <VerticalDockIcon
              onClick={() => setIsProfileModalOpen(true)}
              title="Your Profile"
              className="rounded-full bg-[#8b5cf6] text-white text-xs font-bold overflow-hidden shadow-md ring-1 ring-purple-400/40"
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
            </VerticalDockIcon>

            {/* Cyan Online Status Dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22d3ee] ring-2 ring-[#101014] online-dot pointer-events-none" />
          </div>
        </VerticalDock>
      </div>

      {/* Profile Header Modal */}
      <ProfileHeader
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </aside>
  );
}
