import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

const getInitials = (fullName) =>
  fullName
    ? fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "BC";

// Audio synthesized effects using Web Audio API for zero-dependency sound
const playBeep = (frequency = 600, duration = 0.08, type = "sine") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // audio not allowed before user interaction
  }
};

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats", // "chats" | "contacts" | "calls" | "files" | "settings"
  activeFilter: "all", // "all" | "unread" | "favorites"
  searchQuery: "",
  contactSearchQuery: "",
  selectedUser: null,
  isUserLoading: false,
  isUserTyping: false,
  isMessageLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") !== "false",

  toggleSound: () => {
    const current = get().isSoundEnabled;
    const next = !current;
    localStorage.setItem("isSoundEnabled", next ? "true" : "false");
    set({ isSoundEnabled: next });
    if (next) {
      playBeep(700, 0.1);
      toast.success("Sound notifications enabled", { id: "sound-toast" });
    } else {
      toast("Sound notifications muted", { id: "sound-toast", icon: "🔇" });
    }
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },

  setContactSearchQuery: (contactSearchQuery) => {
    set({ contactSearchQuery });
  },

  syncOnlineUsers: (onlineUserIds) => {
    const onlineUsers = new Set(onlineUserIds.map(String));
    const updatePresence = (user) => ({
      ...user,
      online: onlineUsers.has(String(user._id)),
      statusText: onlineUsers.has(String(user._id)) ? "online" : "offline",
    });

    set((state) => ({
      allContacts: state.allContacts.map(updatePresence),
      chats: state.chats.map(updatePresence),
      selectedUser: state.selectedUser ? updatePresence(state.selectedUser) : null,
    }));
  },

  setSelectedUser: (user) => {
    const current = get().selectedUser;
    if (user && current && String(current._id) === String(user._id)) {
      return;
    }
    set({ selectedUser: user, messages: [] });
    if (user) {
      get().getMessages(user._id);
      // Mark as read in chats list
      set((state) => ({
        chats: state.chats.map((c) =>
          String(c._id) === String(user._id) ? { ...c, unreadCount: 0 } : c
        ),
      }));
    }
  },

  getAllContacts: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get("/messages/contacts");
      if (Array.isArray(response.data)) {
        const formatted = response.data.map((contact) => {
          const online = useAuthStore
            .getState()
            .onlineUsers
            .map(String)
            .includes(String(contact._id));
          return {
            ...contact,
            initials: getInitials(contact.fullName),
            online,
            statusText: online ? "online" : "offline",
          };
        });
        set({ allContacts: formatted });
      } else {
        set({ allContacts: [] });
      }
    } catch (error) {
      console.log("No contacts loaded:", error.message);
      set({ allContacts: [] });
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get("/messages/chats");
      if (Array.isArray(response.data)) {
        const formatted = response.data.map((c) => {
          const online = useAuthStore
            .getState()
            .onlineUsers
            .map(String)
            .includes(String(c._id));
          return {
            ...c,
            initials: getInitials(c.fullName),
            online,
            statusText: online ? "online" : "offline",
            unreadCount: c.unreadCount || 0,
            lastMessage: c.lastMessage || "",
            lastMessageTime: formatTime(c.lastMessageAt),
          };
        });

        // Ensure chats are sorted by latest message descending
        formatted.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });

        set({ chats: formatted });
      } else {
        set({ chats: [] });
      }
    } catch (error) {
      console.log("No chat partners loaded:", error.message);
      set({ chats: [] });
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      if (Array.isArray(response.data)) {
        const formatted = response.data.map((msg) => ({
          ...msg,
          displayTime: formatTime(msg.createdAt),
        }));
        set({ messages: formatted });
      } else {
        set({ messages: [] });
      }
    } catch (error) {
      console.log("No messages loaded:", error.message);
      set({ messages: [] });
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, isSoundEnabled } = get();
    if (!selectedUser) return;

    const myUser = useAuthStore.getState().authUser;
    const now = new Date();
    const displayTime = formatTime(now);
    const targetId = String(selectedUser._id);

    const tempMessage = {
      _id: "temp_" + Date.now(),
      senderId: myUser?._id || "me",
      receiverId: targetId,
      text: messageData.text || "",
      image: messageData.image || null,
      file: messageData.file || null,
      createdAt: now.toISOString(),
      displayTime,
      status: "read",
    };

    // Optimistic local update
    const updatedMessages = [...messages, tempMessage];
    const chatPreview =
      messageData.text || (messageData.image ? "📷 Photo" : "📎 File");

    const currentChats = get().chats;
    const existing = currentChats.find((c) => String(c._id) === targetId);

    const updatedChat = {
      ...selectedUser,
      ...(existing || {}),
      _id: targetId,
      lastMessage: chatPreview,
      lastMessageTime: displayTime,
      lastMessageAt: now.toISOString(),
      online: selectedUser.online || false,
      unreadCount: 0,
    };

    // Deduplicate and move to top of chats list
    const remainingChats = currentChats.filter(
      (c) => String(c._id) !== targetId
    );

    set({
      messages: updatedMessages,
      chats: [updatedChat, ...remainingChats],
    });

    if (isSoundEnabled) {
      playBeep(850, 0.06, "triangle");
    }

    try {
      const payload = {
        text: messageData.text,
        image: messageData.image,
      };
      const response = await axiosInstance.post(`/messages/send/${targetId}`, payload);
      if (response.data) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === tempMessage._id
              ? {
                  ...response.data,
                  displayTime: formatTime(response.data.createdAt),
                }
              : m
          ),
        }));
      }
    } catch (error) {
      console.log("Error sending message to server:", error.message);
    }
  },

  addReaction: (messageId, emoji) => {
    const { messages } = get();
    const updated = messages.map((m) => {
      if (m._id === messageId) {
        const reactions = m.reactions ? [...m.reactions] : [];
        if (!reactions.includes(emoji)) {
          reactions.push(emoji);
        }
        return { ...m, reactions };
      }
      return m;
    });

    set({ messages: updated });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Prevent duplicate event listeners
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled } = get();

      if (isSoundEnabled) {
        playBeep(520, 0.1, "sine");
      }

      const senderId = String(newMessage.senderId);
      const selectedUserId = selectedUser ? String(selectedUser._id) : null;
      const formattedTime = formatTime(newMessage.createdAt || new Date());
      const previewText =
        newMessage.text || (newMessage.image ? "📷 Photo" : "📎 File");

      // 1. If currently chatting with this user, append message to the open conversation
      if (selectedUserId && senderId === selectedUserId) {
        const formatted = {
          ...newMessage,
          displayTime: formattedTime,
        };
        set((state) => ({ messages: [...state.messages, formatted] }));
      }

      // 2. Real-time update sidebar: update preview, time, and move chat to the TOP
      const currentChats = get().chats;
      const contact = get().allContacts.find(
        (candidate) => String(candidate._id) === senderId,
      );
      const existingChat = currentChats.find(
        (chat) => String(chat._id) === senderId,
      );

      const updatedChat = {
        ...(contact || {}),
        ...(existingChat || {}),
        ...(newMessage.sender || {}),
        _id: senderId,
        fullName:
          newMessage.sender?.fullName ||
          existingChat?.fullName ||
          contact?.fullName ||
          "User",
        profilePic:
          newMessage.sender?.profilePic ||
          existingChat?.profilePic ||
          contact?.profilePic ||
          "",
        initials: getInitials(
          newMessage.sender?.fullName ||
            existingChat?.fullName ||
            contact?.fullName,
        ),
        lastMessage: previewText,
        lastMessageTime: formattedTime,
        lastMessageAt: newMessage.createdAt || new Date().toISOString(),
        online: true,
        statusText: "online",
        unreadCount:
          selectedUserId === senderId
            ? 0
            : (existingChat?.unreadCount || 0) + 1,
      };

      // Filter out any previous instance of this chat and prepend to index 0
      const remainingChats = currentChats.filter(
        (chat) => String(chat._id) !== senderId,
      );

      set({
        chats: [updatedChat, ...remainingChats],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
}));


