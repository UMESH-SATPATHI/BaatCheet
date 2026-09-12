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

  // Multi-select message state
  isSelectionMode: false,
  selectedMessageIds: [],

  setIsSelectionMode: (val) => {
    set({ isSelectionMode: val, selectedMessageIds: [] });
  },

  toggleSelectMessage: (id) => {
    const { selectedMessageIds } = get();
    const strId = String(id);
    if (selectedMessageIds.includes(strId)) {
      const next = selectedMessageIds.filter((item) => item !== strId);
      set({
        selectedMessageIds: next,
        isSelectionMode: next.length > 0,
      });
    } else {
      set({
        selectedMessageIds: [...selectedMessageIds, strId],
        isSelectionMode: true,
      });
    }
  },

  clearSelection: () => {
    set({ isSelectionMode: false, selectedMessageIds: [] });
  },

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
    set({
      selectedUser: user,
      messages: [],
      isSelectionMode: false,
      selectedMessageIds: [],
    });
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
      const data = response.data;
      const rawMessages = Array.isArray(data) ? data : data.messages || [];

      const formatted = rawMessages.map((msg) => ({
        ...msg,
        displayTime: formatTime(msg.createdAt),
      }));

      set({ messages: formatted });
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

    const initialStatus = selectedUser.online ? "delivered" : "sent";

    const tempMessage = {
      _id: "temp_" + Date.now(),
      senderId: myUser?._id || "me",
      receiverId: targetId,
      text: messageData.text || "",
      image: messageData.image || null,
      video: messageData.video || null,
      fileUrl: messageData.fileUrl || messageData.file || null,
      fileName: messageData.fileName || null,
      fileSize: messageData.fileSize || null,
      fileType: messageData.fileType || null,
      file: messageData.file || null,
      createdAt: now.toISOString(),
      displayTime,
      status: initialStatus,
      reactions: [],
      isDeletedForEveryone: false,
    };

    // Optimistic local update
    const updatedMessages = [...messages, tempMessage];
    const chatPreview =
      messageData.text ||
      (messageData.image
        ? "📷 Photo"
        : messageData.video
        ? "🎥 Video"
        : messageData.fileName
        ? `📎 ${messageData.fileName}`
        : "📎 Attachment");

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
        video: messageData.video,
        file: messageData.file,
        fileName: messageData.fileName,
        fileSize: messageData.fileSize,
        fileType: messageData.fileType,
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

  toggleReaction: async (messageId, emoji) => {
    const myId = useAuthStore.getState().authUser?._id;
    if (!myId) return;

    // Optimistic reaction update
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m._id === messageId) {
          const currentReactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
          const existingIdx = currentReactions.findIndex(
            (r) => String(r.userId) === String(myId)
          );

          if (existingIdx > -1) {
            if (currentReactions[existingIdx].emoji === emoji) {
              currentReactions.splice(existingIdx, 1);
            } else {
              currentReactions[existingIdx] = { userId: myId, emoji };
            }
          } else {
            currentReactions.push({ userId: myId, emoji });
          }
          return { ...m, reactions: currentReactions };
        }
        return m;
      }),
    }));

    try {
      await axiosInstance.put(`/messages/${messageId}/react`, { emoji });
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  },

  editMessage: async (messageId, newText) => {
    const trimmed = (newText || "").trim();
    if (!trimmed) return;

    try {
      const res = await axiosInstance.put(`/messages/${messageId}/edit`, { text: trimmed });
      if (res.data?.message) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === messageId
              ? {
                  ...m,
                  text: trimmed,
                  isEdited: true,
                  editedAt: res.data.message.editedAt,
                }
              : m
          ),
        }));
        toast.success("Message edited");
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || "Error editing message";
      toast.error(errMsg);
    }
  },

  deleteForMe: async (messageId) => {
    set((state) => ({
      messages: state.messages.filter((m) => String(m._id) !== String(messageId)),
    }));
    try {
      await axiosInstance.delete(`/messages/${messageId}/me`);
      toast.success("Message deleted for you");
    } catch (error) {
      console.error("Error in deleteForMe:", error);
    }
  },

  deleteForEveryone: async (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        String(m._id) === String(messageId)
          ? {
              ...m,
              text: "🚫 This message was deleted",
              isDeletedForEveryone: true,
              image: null,
              video: null,
              fileUrl: null,
              fileName: null,
            }
          : m
      ),
    }));
    try {
      await axiosInstance.delete(`/messages/${messageId}/everyone`);
      toast.success("Message deleted for everyone");
    } catch (error) {
      const errMsg = error.response?.data?.error || "Error deleting message";
      toast.error(errMsg);
    }
  },

  deleteMultipleMessages: async (messageIds, type = "me") => {
    if (!messageIds || messageIds.length === 0) return;

    if (type === "everyone") {
      set((state) => ({
        messages: state.messages.map((m) =>
          messageIds.includes(String(m._id)) && (m.senderId === "me" || m.senderId === useAuthStore.getState().authUser?._id)
            ? {
                ...m,
                text: "🚫 This message was deleted",
                isDeletedForEveryone: true,
                image: null,
                video: null,
                fileUrl: null,
                fileName: null,
              }
            : m
        ),
        isSelectionMode: false,
        selectedMessageIds: [],
      }));
    } else {
      set((state) => ({
        messages: state.messages.filter(
          (m) => !messageIds.includes(String(m._id))
        ),
        isSelectionMode: false,
        selectedMessageIds: [],
      }));
    }

    try {
      await axiosInstance.post("/messages/batch-delete", { messageIds, type });
      toast.success(
        type === "everyone"
          ? "Messages deleted for everyone"
          : "Messages deleted for you"
      );
    } catch (error) {
      console.error("Error in batch delete:", error);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Prevent duplicate event listeners
    socket.off("newMessage");
    socket.off("messageReaction");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("messagesRead");
    socket.off("messagesDelivered");

    // 1. New Incoming Message
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled } = get();

      if (isSoundEnabled) {
        playBeep(520, 0.1, "sine");
      }

      const senderId = String(newMessage.senderId);
      const selectedUserId = selectedUser ? String(selectedUser._id) : null;
      const formattedTime = formatTime(newMessage.createdAt || new Date());
      let previewText = newMessage.text;
      if (!previewText) {
        if (newMessage.image) previewText = "📷 Photo";
        else if (newMessage.video) previewText = "🎥 Video";
        else if (newMessage.fileName) previewText = `📎 ${newMessage.fileName}`;
        else if (newMessage.fileUrl) previewText = "📎 Attachment";
        else previewText = "Message";
      }

      // If currently chatting with this sender, append and mark read
      if (selectedUserId && senderId === selectedUserId) {
        const formatted = {
          ...newMessage,
          displayTime: formattedTime,
        };
        set((state) => ({ messages: [...state.messages, formatted] }));

        // Mark as read immediately on server
        axiosInstance.put(`/messages/read/${senderId}`).catch(() => {});
      }

      // Update sidebar chats list: preview, time, unread badge, and move to TOP
      const currentChats = get().chats;
      const contact = get().allContacts.find(
        (candidate) => String(candidate._id) === senderId
      );
      const existingChat = currentChats.find(
        (chat) => String(chat._id) === senderId
      );

      const isCurrentChat = selectedUserId === senderId;

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
            contact?.fullName
        ),
        lastMessage: previewText,
        lastMessageTime: formattedTime,
        lastMessageAt: newMessage.createdAt || new Date().toISOString(),
        online: true,
        statusText: "online",
        unreadCount: isCurrentChat ? 0 : (existingChat?.unreadCount || 0) + 1,
      };

      const remainingChats = currentChats.filter(
        (chat) => String(chat._id) !== senderId
      );

      set({
        chats: [updatedChat, ...remainingChats],
      });
    });

    // 2. Message Reaction Updated
    socket.on("messageReaction", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(messageId) ? { ...m, reactions } : m
        ),
      }));
    });

    // 3. Message Edited
    socket.on("messageEdited", ({ messageId, text, isEdited, editedAt }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, text, isEdited, editedAt }
            : m
        ),
      }));
    });

    // 4. Message Deleted (For Everyone)
    socket.on("messageDeleted", ({ messageId, isDeletedForEveryone, text }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(messageId)
            ? {
                ...m,
                isDeletedForEveryone: true,
                text: text || "🚫 This message was deleted",
                image: null,
                video: null,
                fileUrl: null,
                fileName: null,
              }
            : m
        ),
      }));
    });

    // 5. Messages Read (Double blue ticks)
    socket.on("messagesRead", ({ readerId, messageIds }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          messageIds.includes(String(m._id))
            ? { ...m, status: "read" }
            : m
        ),
      }));
    });

    // 6. Messages Delivered (Double grey ticks)
    socket.on("messagesDelivered", ({ messageIds }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          messageIds.includes(String(m._id)) && m.status !== "read"
            ? { ...m, status: "delivered" }
            : m
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messageReaction");
      socket.off("messageEdited");
      socket.off("messageDeleted");
      socket.off("messagesRead");
      socket.off("messagesDelivered");
    }
  },
}));

if (typeof window !== "undefined") {
  window.__useChatStore = useChatStore;
}
