import React, { useState } from "react";
import { Search, Users, ArrowLeft } from "lucide-react";
import { useChatStore } from "../store/chatStore";

export default function ContactsView({ onOpenHelp }) {
  const [failedProfilePics, setFailedProfilePics] = useState(new Set());
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
    <main className="flex-1 h-full bg-[#0e0e11] flex flex-col relative select-none overflow-hidden">
      {/* Top Header */}
      <header className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("chats")}
            title="Back to chats"
            className="md:hidden p-1.5 -ml-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Contacts</h1>
        </div>

        {/* Search Contacts input */}
        <div className="mt-3 bg-[#18181f] rounded-lg flex items-center px-3 py-2 gap-2 border border-zinc-800 focus-within:border-zinc-700 transition-colors">
          <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={contactSearchQuery}
            onChange={(e) => setContactSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none w-full"
          />
        </div>
      </header>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-2 space-y-0.5">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-500 mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-zinc-400">No contacts yet</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 max-w-[200px]">
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
              className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-zinc-800/40 cursor-pointer transition-colors"
            >
              {/* Avatar with Status Dot */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 text-xs font-medium overflow-hidden">
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

                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0e0e11]" />
                )}
              </div>

              {/* Name & Status */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-medium text-zinc-200 leading-tight">
                  {contact.fullName}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 leading-tight">
                  {contact.online ? "Online" : contact.statusText || "Offline"}
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
        className="absolute bottom-5 right-5 w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold">?</span>
      </button>
    </main>
  );
}

