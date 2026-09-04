import {create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
    allContatcts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUserLoading: false,
    isUserTyping: false,
    isMessageLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === true,

    toggleSound: () => {
        const currentSoundSetting = get().isSoundEnabled;
        localStorage.setItem("isSoundEnabled", !currentSoundSetting);
        set({ isSoundEnabled: !currentSoundSetting });
    },
    getAllContacts: async () => {
        set({ isUserLoading: true });
        try {
            const response = await axiosInstance.get("/messages/contacts");
            set({ allContatcts: response.data });
            toast.success("Contacts fetched successfully");
        } catch (error) { 
            console.error("Error fetching contacts:", error);
            toast.error("Error fetching contacts");
        } finally {
            set({ isUserLoading: false });
        }
    },
    setActiveTab: (tab) => {
        set({ activeTab: tab });
    },
    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },
    getMyChatPartners: async () => {
        set({ isUserLoading: true });
        try {
            const response = await axiosInstance.get("/messages/chats");
            set({ chats: response.data });
            toast.success("Chat partners fetched successfully");
        } catch (error) {
            toast.error("Error fetching chat partners");
            console.error("Error fetching chat partners:", error);
        } finally {
            set({ isUserLoading: false });
        }
    },
    getMessages: async (userId) => {
        set({ isMessageLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/chats/${userId}`);
            set({ messages: response.data });
            toast.success("Messages fetched successfully");
        } catch (error) {
            toast.error("Error fetching messages");
            console.error("Error fetching messages:", error);
        } finally {
            set({ isMessageLoading: false });
        }
    },
}));
