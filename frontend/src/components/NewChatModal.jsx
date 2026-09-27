import React, { useState, useEffect } from "react";
import { X, Search, MessageSquare, UserPlus } from "lucide-react";
import { useChatStore } from "../store/chatStore";

export default function NewChatModal({ isOpen, onClose }) {
  const { allContacts, setSelectedUser, setActiveTab } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [failedProfilePics, setFailedProfilePics] = useState(new Set());

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
        setSearchTerm("");
      }, 200);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle escape key
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

  const filtered = allContacts.filter((c) =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartChat = (contact) => {
    setSelectedUser(contact);
    setActiveTab("chats");
    onClose();
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
        className={`border border-zinc-800 bg-[#16161b] w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl relative flex flex-col max-h-[85vh] transition-all duration-150 ease-out overflow-hidden ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-98 translate-y-1 pointer-events-none"
        }`}
      >
        <button
          onClick={onClose}
          title="Close (Esc)"
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-semibold text-zinc-100">Start New Chat</h3>
        <p className="text-xs text-zinc-400 mb-3.5 mt-0.5">
          Select a contact to begin a conversation
        </p>

        {/* Search input */}
        <div className="bg-[#1c1c22] rounded-lg flex items-center px-3 py-2 gap-2 border border-zinc-800 focus-within:border-zinc-700 mb-3 transition-colors">
          <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name..."
            className="bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none w-full"
            autoFocus
          />
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-none">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No contacts found
            </div>
          ) : (
            filtered.map((contact) => (
              <div
                key={contact._id}
                onClick={() => handleStartChat(contact)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/40 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 text-xs font-medium shrink-0 overflow-hidden">
                  {contact.profilePic && !failedProfilePics.has(contact._id) ? (
                    <img
                      src={contact.profilePic}
                      alt={contact.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedProfilePics((failed) =>
                          new Set([...failed, contact._id]),
                        )
                      }
                    />
                  ) : (
                    contact.initials || "BC"
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-zinc-200 truncate">
                    {contact.fullName}
                  </span>
                  <span className="text-[11px] text-zinc-500 truncate">
                    {contact.email || (contact.online ? "Online" : "Offline")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

