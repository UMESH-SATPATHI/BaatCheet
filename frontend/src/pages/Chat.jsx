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

  const { connectSocket, onlineUsers } = useAuthStore();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    // Initial fetch of contacts and chat partners
    getAllContacts();
    getMyChatPartners();

    // Connect socket if not connected
    connectSocket();

    // Subscribe to socket messages
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, []);

  useEffect(() => {
    syncOnlineUsers(onlineUsers);
  }, [onlineUsers, syncOnlineUsers]);

  return (
    <div className="flex h-screen w-screen bg-[#121214] text-zinc-100 overflow-hidden select-none">
      {/* 1. Leftmost Navigation Rail */}
      <SidebarNav />

      {/* 2. Middle Chats Sidebar */}
      <ChatsSidebar onOpenNewChat={() => setIsNewChatOpen(true)} />

      {/* 3. Main Center Content Area */}
      {activeTab === "contacts" ? (
        <ContactsView onOpenHelp={() => setIsHelpOpen(true)} />
      ) : selectedUser ? (
        <ChatArea onOpenHelp={() => setIsHelpOpen(true)} />
      ) : (
        <EmptyChatState onOpenHelp={() => setIsHelpOpen(true)} />
      )}

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </div>
  );
}

