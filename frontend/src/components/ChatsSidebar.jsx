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
  Loader2,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import ChatListItem from "./ChatListItem";

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
    isChatsLoading,
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
    return true;
  });

  const totalUnreadCount = chats.reduce(
    (acc, chat) => acc + (chat.unreadCount || 0),
    0
  );

  return (
    <aside className="w-full sm:w-[300px] md:w-[310px] lg:w-[340px] flex-1 sm:flex-initial h-full max-h-[100dvh] bg-[#17171c] border-r border-[#22222b] flex flex-col select-none shrink-0 z-10 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-5 pt-4 pb-2 flex flex-col shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-semibold">
              BaatCheet
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight leading-none">
                Chats
              </h1>
              {totalUnreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#8b5cf6] text-white rounded-full shadow-sm animate-in zoom-in-75 duration-150">
                  {totalUnreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => {
                if (onOpenNewChat) onOpenNewChat();
                else setActiveTab("contacts");
              }}
              title="New Chat"
              className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-900/30 transition-colors duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
              className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202028] flex items-center justify-center transition-colors duration-150 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
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
      </div>

      {/* Chat List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
        {isChatsLoading ? (
          <div className="flex flex-col gap-1.5 px-1 py-1 animate-in fade-in duration-200" aria-label="Loading chats">
            {/* Top status banner */}
            <div className="flex items-center justify-between px-3 py-1 mb-0.5 text-zinc-500">
              <span className="text-[11px] font-medium tracking-wide text-zinc-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8b5cf6]" />
                Loading chats...
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">syncing</span>
            </div>

            {/* Skeleton chat item list */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-2xl bg-[#1d1d25]/50 border border-zinc-800/30 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Avatar Skeleton */}
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-zinc-800/80 shrink-0" />

                {/* Info Column Skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="h-3.5 bg-zinc-800/90 rounded-md"
                      style={{ width: `${i % 3 === 0 ? 115 : i % 2 === 0 ? 90 : 135}px` }}
                    />
                    <div className="h-2.5 w-9 bg-zinc-800/60 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="h-2.5 bg-zinc-800/50 rounded-md"
                      style={{ width: `${i % 2 === 0 ? 140 : 175}px` }}
                    />
                    {i === 2 && (
                      <div className="w-4 h-4 rounded-full bg-purple-900/40 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
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
              <ChatListItem
                key={chat._id}
                chat={chat}
                isSelected={isSelected}
                onSelect={(selectedChat) => {
                  setSelectedUser(selectedChat);
                  setActiveTab("chats");
                }}
              >
                {/* Avatar with Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
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
                    <span
                      className={`text-[10px] md:text-[11px] shrink-0 font-medium transition-colors ${
                        (chat.unreadCount || 0) > 0
                          ? "text-[#22d3ee] font-bold"
                          : "text-zinc-400"
                      }`}
                    >
                      {chat.lastMessageTime || ""}
                    </span>
                  </div>

                  {/* Bottom line: Last Message Snippet + Unread Badge */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p
                      className={`text-[11px] md:text-xs truncate flex-1 leading-snug transition-colors ${
                        (chat.unreadCount || 0) > 0
                          ? "text-zinc-200 font-medium"
                          : "text-zinc-400 group-hover:text-zinc-300"
                      }`}
                    >
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
                      <span className="bg-[#8b5cf6] text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-purple-950/40 animate-in zoom-in-75 duration-150">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </ChatListItem>
            );
          })
        )}
      </div>
    </aside>
  );
}
