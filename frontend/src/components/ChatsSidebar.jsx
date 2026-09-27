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
    <aside className="w-full sm:w-[300px] md:w-[310px] lg:w-[330px] flex-1 sm:flex-initial h-full max-h-[100dvh] bg-[#141418] border-r border-[#202026] flex flex-col select-none shrink-0 z-10 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2.5 flex flex-col shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
              Chats
            </h1>
            {totalUnreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700/60">
                {totalUnreadCount}
              </span>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => {
                if (onOpenNewChat) onOpenNewChat();
                else setActiveTab("contacts");
              }}
              title="New Chat"
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 bg-[#1b1b22] rounded-lg flex items-center px-3 py-2 gap-2 border border-zinc-800/80 focus-within:border-zinc-700 transition-colors">
          <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start chat"
            className="bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-0.5">
        {isChatsLoading ? (
          <div className="flex flex-col gap-1 px-1 py-1" aria-label="Loading chats">
            <div className="flex items-center justify-between px-2 py-1 text-zinc-500 text-xs">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                Loading chats...
              </span>
            </div>

            {/* Skeleton chat item list */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/20 border border-zinc-800/30"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-800/60 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="h-3 bg-zinc-800/80 rounded"
                      style={{ width: `${i % 3 === 0 ? 100 : 120}px` }}
                    />
                    <div className="h-2 w-8 bg-zinc-800/60 rounded" />
                  </div>
                  <div
                    className="h-2.5 bg-zinc-800/40 rounded"
                    style={{ width: `${i % 2 === 0 ? 130 : 160}px` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-500 mb-2">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-zinc-400">No chats yet</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 max-w-[190px]">
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
                {/* Avatar with Quiet Status Dot */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 text-xs font-medium overflow-hidden">
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
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#141418]" />
                  )}
                </div>

                {/* Details Column */}
                <div className="flex-1 min-w-0">
                  {/* Top line: Pin + Name + Time */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      {chat.isPinned && (
                        <Pin className="w-3 h-3 text-zinc-400 fill-zinc-400 -rotate-45 shrink-0" />
                      )}
                      <span className="text-xs md:text-sm font-medium text-zinc-200 truncate group-hover:text-white">
                        {chat.fullName}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] shrink-0 ${
                        (chat.unreadCount || 0) > 0
                          ? "text-zinc-200 font-medium"
                          : "text-zinc-500"
                      }`}
                    >
                      {chat.lastMessageTime || ""}
                    </span>
                  </div>

                  {/* Bottom line: Last Message Snippet + Unread Badge */}
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                      className={`text-xs truncate flex-1 leading-snug ${
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
                      <span className="bg-indigo-600 text-white text-[10px] font-medium min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shrink-0">
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

