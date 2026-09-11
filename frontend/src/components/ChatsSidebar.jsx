import React, { useState } from "react";
import {
  Plus,
  MoreVertical,
  Search,
  Pin,
  Check,
  CheckCheck,
  MessageSquarePlus,
  Image as ImageIcon,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import ProfileHeader from "./profileHeader";

export default function ChatsSidebar({ onOpenNewChat }) {
  const {
    chats,
    selectedUser,
    setSelectedUser,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    setActiveTab,
  } = useChatStore();

  const [showMenu, setShowMenu] = useState(false);
  const [failedProfilePics, setFailedProfilePics] = useState(new Set());

  // Filter chats by search query and active tab filter
  const filteredChats = chats.filter((chat) => {
    // Search match
    const matchesSearch = chat.fullName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter pill match
    if (activeFilter === "unread") {
      return (chat.unreadCount || 0) > 0;
    }
    if (activeFilter === "favorites") {
      return !!chat.isFavorite;
    }
    return true;
  });

  return (
    <aside className="w-[280px] md:w-[310px] lg:w-[340px] h-full max-h-[100dvh] bg-[#17171c] border-r border-[#22222b] flex flex-col select-none shrink-0 z-10 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-5 pt-4 pb-2 flex flex-col shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-semibold">
              BaatCheet
            </span>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight leading-none mt-1">
              Chats
            </h1>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => {
                if (onOpenNewChat) onOpenNewChat();
                else setActiveTab("contacts");
              }}
              title="New Chat"
              className="w-8 h-8 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center shadow-md shadow-purple-900/40 hover:shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 bg-[#24242c] rounded-3xl flex items-center px-3.5 py-2.5 gap-2.5 border border-zinc-800/80 focus-within:border-[#8b5cf6]/70 focus-within:shadow-[0_0_12px_rgba(139,92,246,0.18)] transition-all duration-200">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start chat"
            className="bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none w-full"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 md:gap-2 mt-3">
          <button
            onClick={() => setActiveFilter("all")}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
              activeFilter === "all"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "bg-[#24242c] text-zinc-400 hover:text-zinc-200 hover:bg-[#2c2c36]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("unread")}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
              activeFilter === "unread"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "bg-[#24242c] text-zinc-400 hover:text-zinc-200 hover:bg-[#2c2c36]"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setActiveFilter("favorites")}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
              activeFilter === "favorites"
                ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-900/40"
                : "bg-[#24242c] text-zinc-400 hover:text-zinc-200 hover:bg-[#2c2c36]"
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#202028] flex items-center justify-center text-zinc-500 mb-3">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-zinc-400">No chats yet</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
              {searchQuery ? "No chats matching your search" : "Your recent chats will appear here"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = String(selectedUser?._id) === String(chat._id);
            return (
              <div
                key={chat._id}
                onClick={() => {
                  setSelectedUser(chat);
                  setActiveTab("chats");
                }}
                className={`group flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-2xl cursor-pointer transition-all duration-200 chat-card-interactive ${
                  isSelected
                    ? "bg-[#241c33] border border-[#8b5cf6]/40 shadow-sm shadow-purple-950/20"
                    : "hover:bg-[#1e1e26] border border-transparent"
                }`}
              >
                {/* Avatar with Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-200">
                    {chat.profilePic && !failedProfilePics.has(chat._id) ? (
                      <img
                        src={chat.profilePic}
                        alt={chat.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedProfilePics((failed) =>
                            new Set([...failed, chat._id]),
                          )
                        }
                      />
                    ) : (
                      chat.initials || "BC"
                    )}
                  </div>

                  {/* Online Badge */}
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22d3ee] ring-2 ring-[#17171c] online-dot" />
                  )}
                </div>

                {/* Details Column */}
                <div className="flex-1 min-w-0">
                  {/* Top line: Pin + Name + Time */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {chat.isPinned && (
                        <Pin className="w-3 h-3 text-[#a855f7] fill-[#a855f7] -rotate-45 shrink-0" />
                      )}
                      <span className="text-xs md:text-sm font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                        {chat.fullName}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-[11px] text-zinc-400 shrink-0 font-medium">
                      {chat.lastMessageTime || ""}
                    </span>
                  </div>

                  {/* Bottom line: Last Message Snippet + Unread Badge */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-[11px] md:text-xs text-zinc-400 truncate flex-1 leading-snug group-hover:text-zinc-300 transition-colors">
                      {chat.lastMessage === "Attachment" ? (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>Attachment</span>
                        </span>
                      ) : (
                        chat.lastMessage || "No messages yet"
                      )}
                    </p>

                    {(chat.unreadCount || 0) > 0 && (
                      <span className="bg-[#8b5cf6] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
