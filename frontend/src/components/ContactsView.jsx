import React from "react";
import { Search, Users } from "lucide-react";
import { useChatStore } from "../store/chatStore";

export default function ContactsView({ onOpenHelp }) {
  const {
    allContacts,
    contactSearchQuery,
    setContactSearchQuery,
    setSelectedUser,
    setActiveTab,
  } = useChatStore();

  const filteredContacts = allContacts.filter((contact) => {
    return contact.fullName
      ?.toLowerCase()
      .includes(contactSearchQuery.toLowerCase());
  });

  const handleSelectContact = (contact) => {
    setSelectedUser(contact);
    setActiveTab("chats");
  };

  return (
    <main className="flex-1 h-full bg-[#131316] flex flex-col relative select-none overflow-hidden">
      {/* Top Header */}
      <header className="px-8 pt-6 pb-2 shrink-0">
        <h1 className="text-xl font-bold text-white tracking-tight">Contacts</h1>

        {/* Search Contacts input */}
        <div className="mt-4 bg-[#24242c] rounded-2xl flex items-center px-4 py-3 gap-3 border border-transparent focus-within:border-[#8b5cf6]/50 transition shadow-sm">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={contactSearchQuery}
            onChange={(e) => setContactSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none w-full"
          />
        </div>
      </header>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#24242c] flex items-center justify-center text-zinc-500 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-zinc-400">No contacts yet</p>
            <p className="text-[11px] text-zinc-600 mt-1 max-w-[220px]">
              {contactSearchQuery
                ? "No contacts match your search"
                : "Your contact list is currently empty"}
            </p>
          </div>
        ) : (

          filteredContacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => handleSelectContact(contact)}
              className="flex items-center gap-4 py-3 px-3 rounded-2xl hover:bg-[#1e1e26] cursor-pointer transition-all border border-transparent"
            >
              {/* Avatar with Status Dot */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">

                  {contact.profilePic ? (
                    <img
                      src={contact.profilePic}
                      alt={contact.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    contact.initials || "BC"
                  )}
                </div>

                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22d3ee] ring-2 ring-[#131316] online-dot" />
                )}
              </div>

              {/* Name & Status */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white leading-tight">
                  {contact.fullName}
                </span>
                <span
                  className={`text-xs mt-0.5 leading-tight ${
                    contact.online
                      ? "text-[#22d3ee] font-medium"
                      : "text-zinc-400"
                  }`}
                >
                  {contact.online ? "online" : contact.statusText || "offline"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Help Button at Bottom Right */}
      <button
        onClick={onOpenHelp}
        title="Help & Info"
        className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-[#1f1f26] border border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-[#282832] flex items-center justify-center shadow-lg transition cursor-pointer"
      >
        <span className="text-sm font-semibold">?</span>
      </button>
    </main>
  );
}
