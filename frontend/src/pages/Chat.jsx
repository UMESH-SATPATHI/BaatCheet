import React, { useEffect, useState } from "react";
import SidebarNav from "../components/SidebarNav";
import ChatsSidebar from "../components/ChatsSidebar";
import ChatArea from "../components/ChatArea";
import EmptyChatState from "../components/EmptyChatState";
import ContactsView from "../components/ContactsView";
import HelpModal from "../components/HelpModal";
import NewChatModal from "../components/NewChatModal";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

export default function Chat() {
  const {
    activeTab,
    selectedUser,
    getAllContacts,
    getMyChatPartners,
    subscribeToMessages,
    unsubscribeFromMessages,
    syncOnlineUsers,
  } = useChatStore();

  const { connectSocket, onlineUsers, socket } = useAuthStore();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    // Initial fetch of contacts and chat partners
    getAllContacts();
    getMyChatPartners();

    // Connect socket if not connected
    connectSocket();

  }, []);

  useEffect(() => {
    if (!socket) return;

    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    syncOnlineUsers(onlineUsers);
  }, [onlineUsers, syncOnlineUsers]);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-[100dvh] w-full max-w-full bg-[#121214] text-zinc-100 overflow-hidden select-none">
      {/* 1. Leftmost Navigation Rail */}
      <div className={`${selectedUser ? "hidden md:flex" : "flex"} shrink-0 h-full`}>
        <SidebarNav />
      </div>

      {/* 2. Middle Chats Sidebar */}
      <div
        className={`${
          selectedUser || activeTab === "contacts"
            ? "hidden md:flex"
            : "flex flex-1 md:flex-initial"
        } h-full overflow-hidden`}
      >
        <ChatsSidebar onOpenNewChat={() => setIsNewChatOpen(true)} />
      </div>

      {/* 3. Main Center Content Area */}
      <div
        className={`${
          !selectedUser && activeTab !== "contacts"
            ? "hidden md:flex"
            : "flex"
        } flex-1 min-w-0 h-full overflow-hidden`}
      >
        {activeTab === "contacts" ? (
          <ContactsView onOpenHelp={() => setIsHelpOpen(true)} />
        ) : selectedUser ? (
          <ChatArea onOpenHelp={() => setIsHelpOpen(true)} />
        ) : (
          <EmptyChatState onOpenHelp={() => setIsHelpOpen(true)} />
        )}
      </div>

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </div>
  );
}

