import React, { useState } from "react";
import { X, Search, MessageSquare, UserPlus } from "lucide-react";
import { useChatStore } from "../store/chatStore";

export default function NewChatModal({ isOpen, onClose }) {
  const { allContacts, setSelectedUser, setActiveTab } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filtered = allContacts.filter((c) =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartChat = (contact) => {
    setSelectedUser(contact);
    setActiveTab("chats");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#181820] border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-white mb-1">Start New Chat</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Select a contact to begin a conversation
        </p>

        {/* Search input */}
        <div className="bg-[#24242c] rounded-2xl flex items-center px-4 py-2.5 gap-2.5 border border-zinc-800 focus-within:border-[#8b5cf6]/50 mb-4">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name..."
            className="bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none w-full"
            autoFocus
          />
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filtered.map((contact) => (
            <div
              key={contact._id}
              onClick={() => handleStartChat(contact)}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#22222d] cursor-pointer transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shrink-0">

                {contact.initials || "BC"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-white truncate">
                  {contact.fullName}
                </span>
                <span className="text-[11px] text-zinc-400 truncate">
                  {contact.email || (contact.online ? "Online" : "Offline")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
