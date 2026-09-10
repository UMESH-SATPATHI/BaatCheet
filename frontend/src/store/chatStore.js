import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

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

  setSelectedUser: (user) => {
    set({ selectedUser: user });
    if (user) {
      get().getMessages(user._id);
      // Mark as read in chats list
      set((state) => ({
        chats: state.chats.map((c) =>
          c._id === user._id ? { ...c, unreadCount: 0 } : c
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
          const initials = contact.fullName
            ? contact.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "BC";
          return {
            ...contact,
            initials,
            online: false,
            statusText: "offline",
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
          const initials = c.fullName
            ? c.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "BC";
          return {
            ...c,
            initials,
            online: false,
            unreadCount: 0,
            lastMessage: c.lastMessage || "",
            lastMessageTime: c.updatedAt
              ? new Date(c.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
          };
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
          displayTime: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
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
    const { selectedUser, messages, isSoundEnabled, chats } = get();
    if (!selectedUser) return;

    const myUser = useAuthStore.getState().authUser;
    const now = new Date();
    const displayTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tempMessage = {
      _id: "temp_" + Date.now(),
      senderId: myUser?._id || "me",
      receiverId: selectedUser._id,
      text: messageData.text || "",
      image: messageData.image || null,
      file: messageData.file || null,
      createdAt: now.toISOString(),
      displayTime,
      status: "read",
    };

    // Optimistic local update
    const updatedMessages = [...messages, tempMessage];
    set({
      messages: updatedMessages,
      chats: chats.map((c) =>
        c._id === selectedUser._id
          ? {
              ...c,
              lastMessage: messageData.text || (messageData.image ? "📷 Photo" : "📎 File"),
              lastMessageTime: displayTime,
            }
          : c
      ),
    });

    if (isSoundEnabled) {
      playBeep(850, 0.06, "triangle");
    }

    try {
      const payload = {
        text: messageData.text,
        image: messageData.image,
      };
      await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
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

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled, chats } = get();

      if (isSoundEnabled) {
        playBeep(520, 0.1, "sine");
      }

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        const formatted = {
          ...newMessage,
          displayTime: new Date(newMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        set({ messages: [...get().messages, formatted] });
      }

      // Update chats list last message
      set({
        chats: chats.map((c) =>
          c._id === newMessage.senderId
            ? {
                ...c,
                lastMessage: newMessage.text || "Attachment",
                lastMessageTime: new Date(newMessage.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                unreadCount:
                  selectedUser?._id === newMessage.senderId
                    ? 0
                    : (c.unreadCount || 0) + 1,
              }
            : c
        ),
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


