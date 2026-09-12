import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Smile,
  Paperclip,
  Send,
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Download,
  Eye,
  FileArchive,
  FileSpreadsheet,
  File,
  ChevronDown,
  Copy,
  Edit3,
  Trash2,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import MediaPreviewModal from "./MediaPreviewModal";
import { downloadMedia, formatFileSize, getMediaType } from "../lib/downloadHelper";

// 5 reaction emojis as requested in Item 4 (no "+" button)
const REACTION_ICONS = ["👍", "❤️", "😂", "😮", "😢"];

// Helper to format calendar dates for group headers
const formatCalendarDate = (dateStr) => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return "Today";
  if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";

  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function ChatArea({ onOpenHelp }) {
  const {
    selectedUser,
    setSelectedUser,
    messages,
    sendMessage,
    toggleReaction,
    editMessage,
    deleteForMe,
    deleteForEveryone,
    deleteMultipleMessages,
    isMessageLoading,
    isSelectionMode,
    selectedMessageIds,
    toggleSelectMessage,
    clearSelection,
    setIsSelectionMode,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  // Message action states
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevChatUserIdRef = useRef(null);
  const isInitialLoadForChatRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const prevLastMsgIdRef = useRef(null);

  // Close menus when clicking anywhere outside
  useEffect(() => {
    const handleWindowClick = () => {
      setActiveMenuMessageId(null);
      setActiveReactionMessageId(null);
    };
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  // Track chat change to reset initial load status
  useEffect(() => {
    if (selectedUser?._id !== prevChatUserIdRef.current) {
      prevChatUserIdRef.current = selectedUser?._id;
      isInitialLoadForChatRef.current = true;
      prevMessagesLengthRef.current = 0;
      prevLastMsgIdRef.current = null;
    }
  }, [selectedUser?._id]);

  // Robust Scroll Management:
  // 1. Instant jump on chat open (no sliding animation from top down)
  // 2. Smooth scroll only on new messages sent or received near bottom
  // 3. Frozen scroll on reactions, edits, deletes, status ticks
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (messages.length === 0) {
      prevMessagesLengthRef.current = 0;
      prevLastMsgIdRef.current = null;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    const isNewMessageAppended =
      messages.length > prevMessagesLengthRef.current &&
      lastMsg?._id !== prevLastMsgIdRef.current;

    if (isInitialLoadForChatRef.current) {
      isInitialLoadForChatRef.current = false;
      prevMessagesLengthRef.current = messages.length;
      prevLastMsgIdRef.current = lastMsg?._id;

      container.scrollTop = container.scrollHeight;
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    } else if (isNewMessageAppended) {
      prevMessagesLengthRef.current = messages.length;
      prevLastMsgIdRef.current = lastMsg?._id;

      const isMyMessage =
        lastMsg?.senderId === "me" ||
        lastMsg?.senderId === authUser?._id;

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 250;

      if (isMyMessage || isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      prevMessagesLengthRef.current = messages.length;
      prevLastMsgIdRef.current = lastMsg?._id;
    }
  }, [messages, authUser?._id]);

  useEffect(() => {
    setProfileImageFailed(false);
    clearSelection();
  }, [selectedUser?._id, selectedUser?.profilePic]);

  // Group messages by calendar day
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const label = formatCalendarDate(msg.createdAt);
      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, messages: [msg] };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  const canEditMessage = (msg) => {
    if (!msg || msg.isDeletedForEveryone) return false;
    const isMe = msg.senderId === "me" || msg.senderId === authUser?._id;
    if (!isMe) return false;
    if (!msg.createdAt) return true;
    const diffMs = Date.now() - new Date(msg.createdAt).getTime();
    return diffMs <= 5 * 60 * 1000; // 5 minutes
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() && !previewImage && !previewVideo && !selectedFile) return;

    const payload = {
      text: inputMessage.trim(),
      image: previewImage || null,
      video: previewVideo || null,
      file: selectedFile?.dataUrl || null,
      fileName: selectedFile?.name || null,
      fileSize: selectedFile?.size || null,
      fileType: selectedFile?.type || null,
    };

    setInputMessage("");
    setPreviewImage(null);
    setPreviewVideo(null);
    setSelectedFile(null);
    setShowEmojiMenu(false);

    await sendMessage(payload);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = getMediaType(file.name);
    const formattedSize = formatFileSize(file.size);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;

      if (mediaType === "image") {
        setPreviewImage(dataUrl);
        setPreviewVideo(null);
        setSelectedFile({
          name: file.name,
          size: formattedSize,
          type: file.type,
          dataUrl,
        });
      } else if (mediaType === "video") {
        setPreviewVideo(dataUrl);
        setPreviewImage(null);
        setSelectedFile({
          name: file.name,
          size: formattedSize,
          type: file.type,
          dataUrl,
        });
      } else {
        setSelectedFile({
          name: file.name,
          size: formattedSize,
          type: file.type,
          dataUrl,
        });
        setPreviewImage(null);
        setPreviewVideo(null);
      }
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const getDocumentIcon = (name, className = "w-5 h-5") => {
    const type = getMediaType(name);
    if (type === "pdf") return <FileText className={`${className} text-rose-400`} />;
    if (type === "doc") return <FileText className={`${className} text-blue-400`} />;
    if (type === "sheet") return <FileSpreadsheet className={`${className} text-emerald-400`} />;
    if (type === "archive") return <FileArchive className={`${className} text-amber-400`} />;
    return <File className={`${className} text-purple-300`} />;
  };

  const quickEmojis = ["💜", "✨", "😂", "👍", "❤️", "🔥", "🎨", "🎉"];

  if (!selectedUser) return null;

  return (
    <main className="flex-1 min-w-0 h-full max-h-[100dvh] bg-[#121214] flex flex-col relative select-none overflow-hidden">
      {/* 1. Header Bar: Multi-Select Mode vs Normal Header (Phone icon removed) */}
      {isSelectionMode ? (
        <header className="h-14 md:h-16 px-3 sm:px-4 md:px-6 bg-[#1a1a24] border-b border-zinc-800 flex items-center justify-between shrink-0 z-20 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              title="Close selection"
              className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white">
              {selectedMessageIds.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteMultipleMessages(selectedMessageIds, "me")}
              disabled={selectedMessageIds.length === 0}
              className="px-3 py-1.5 bg-[#202028] hover:bg-[#282834] text-xs font-semibold text-zinc-200 rounded-xl transition cursor-pointer border border-zinc-700/60"
            >
              Delete for me
            </button>
            <button
              onClick={() => {
                if (window.confirm("Delete selected messages for everyone?")) {
                  deleteMultipleMessages(selectedMessageIds, "everyone");
                }
              }}
              disabled={selectedMessageIds.length === 0}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-xs font-semibold text-rose-300 rounded-xl transition cursor-pointer border border-rose-500/30"
            >
              Delete for everyone
            </button>
          </div>
        </header>
      ) : (
        <header className="h-14 md:h-16 px-3 sm:px-4 md:px-6 bg-[#131316]/95 backdrop-blur-sm border-b border-zinc-800/60 flex items-center justify-between shrink-0 z-10 relative">
          {/* Left: Back button (mobile) + User Avatar & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 min-w-0">
            {/* Mobile Back Button */}
            <button
              onClick={() => setSelectedUser(null)}
              title="Back to chats"
              className="md:hidden p-1.5 -ml-1 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
                {selectedUser.profilePic && !profileImageFailed ? (
                  <img
                    src={selectedUser.profilePic}
                    alt={selectedUser.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setProfileImageFailed(true)}
                  />
                ) : (
                  selectedUser.initials || "BC"
                )}
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <h2 className="text-xs md:text-sm font-semibold text-white leading-tight truncate">
                {selectedUser.fullName}
              </h2>
              <span className="text-[10px] md:text-[11px] font-medium text-[#22d3ee] leading-tight">
                {selectedUser.online ? "online" : selectedUser.statusText || "offline"}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => toast("Search in conversation", { icon: "🔍" })}
              title="Search conversation"
              className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202028] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSelectionMode(true)}
              title="Select messages"
              className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202028] flex items-center justify-center transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* 2. Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 sm:px-4 md:px-6 py-3 md:py-4 flex flex-col gap-3 scrollbar-thin overscroll-y-contain"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >

        {isMessageLoading && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#8b5cf6]" />
            <span className="text-xs text-zinc-500 font-medium">Loading conversation...</span>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-zinc-500">
                <p className="text-xs font-semibold text-zinc-400">No messages yet</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Say hello to {selectedUser.fullName}!
                </p>
              </div>
            )}

            {/* Calendar Date Grouped Message List */}
            {groupedMessages.map((group) => (
              <div key={group.label} className="flex flex-col gap-2.5">
                {/* Sticky Calendar Day Divider Pill */}
                <div className="flex justify-center my-2 sticky top-1 z-10 pointer-events-none">
                  <span className="bg-[#1c1c24]/90 backdrop-blur-md text-zinc-400 text-[11px] font-medium px-3.5 py-1 rounded-full shadow-md border border-zinc-800/80">
                    {group.label}
                  </span>
                </div>

                {/* Messages within this calendar day */}
                {group.messages.map((msg) => {
                  const isMe = msg.senderId === "me" || msg.senderId === authUser?._id;
                  const isSelected = selectedMessageIds.includes(String(msg._id));
                  const isReactionOpen = activeReactionMessageId === msg._id;
                  const isMenuOpen = activeMenuMessageId === msg._id;

                  return (
                    <div
                      key={msg._id}
                      className={`group flex items-center gap-2 relative ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Selection Checkbox */}
                      {isSelectionMode && (
                        <button
                          type="button"
                          onClick={() => toggleSelectMessage(msg._id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                            isSelected
                              ? "bg-[#8b5cf6] border-[#8b5cf6] text-white"
                              : "border-zinc-600 hover:border-zinc-400"
                          } ${isMe ? "order-2" : "order-first"}`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Emote Button (Smiley icon on hover/touch) */}
                      {!msg.isDeletedForEveryone && !isSelectionMode && (
                        <div
                          className={`relative shrink-0 transition-opacity duration-150 ${
                            isReactionOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          } ${isMe ? "order-first" : "order-last"}`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReactionMessageId(isReactionOpen ? null : msg._id);
                              setActiveMenuMessageId(null);
                            }}
                            title="React"
                            className="w-7 h-7 rounded-full bg-[#1e1e26] hover:bg-[#282834] text-zinc-400 hover:text-purple-300 flex items-center justify-center transition cursor-pointer shadow-md border border-zinc-800/60"
                          >
                            <Smile className="w-4 h-4" />
                          </button>

                          {/* 5 Reaction Icons Floating Bar */}
                          {isReactionOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute bottom-full mb-1.5 ${
                                isMe ? "right-0" : "left-0"
                              } z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#17171e] border border-zinc-800 shadow-2xl animate-in zoom-in-90 duration-150 backdrop-blur-md`}
                            >
                              {REACTION_ICONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    toggleReaction(msg._id, emoji);
                                    setActiveReactionMessageId(null);
                                  }}
                                  className="text-lg hover:scale-130 active:scale-95 transition-transform cursor-pointer p-0.5"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Bubble Container (Project Theme: Purple for outgoing, Dark card for incoming) */}
                      <div
                        className={`relative rounded-2xl p-2.5 sm:p-3 text-xs leading-relaxed max-w-[85%] sm:max-w-[75%] md:max-w-[70%] shadow-md select-text transition-colors duration-150 ${
                          isMe
                            ? "bg-[#8b5cf6] text-white rounded-tr-xs shadow-purple-950/20"
                            : "bg-[#222228] text-zinc-100 rounded-tl-xs border border-zinc-800/80"
                        } ${isSelected ? "ring-2 ring-purple-400" : ""}`}
                      >
                        {/* Downward Chevron Arrow inside bubble on hover */}
                        {!msg.isDeletedForEveryone && !isSelectionMode && (
                          <div className="absolute top-1.5 right-1.5 z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuMessageId(isMenuOpen ? null : msg._id);
                                setActiveReactionMessageId(null);
                              }}
                              title="Message options"
                              className={`w-5 h-5 rounded-full bg-black/20 hover:bg-black/40 text-purple-100 hover:text-white flex items-center justify-center transition cursor-pointer ${
                                isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute top-6 ${
                                  isMe ? "right-0" : "left-0"
                                } z-40 w-48 rounded-2xl bg-[#17171e] border border-zinc-800 shadow-2xl py-1.5 text-xs text-zinc-200 flex flex-col animate-in zoom-in-95 duration-150 backdrop-blur-md`}
                              >
                                {/* Copy */}
                                {msg.text && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.text);
                                      toast.success("Message copied");
                                      setActiveMenuMessageId(null);
                                    }}
                                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-purple-500/10 hover:text-purple-300 transition cursor-pointer text-left"
                                  >
                                    <Copy className="w-4 h-4 text-zinc-400" />
                                    <span>Copy</span>
                                  </button>
                                )}

                                {/* Edit message (within 5 min) */}
                                {canEditMessage(msg) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMessageId(msg._id);
                                      setEditingText(msg.text || "");
                                      setActiveMenuMessageId(null);
                                    }}
                                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-purple-500/10 hover:text-purple-300 transition cursor-pointer text-left"
                                  >
                                    <Edit3 className="w-4 h-4 text-zinc-400" />
                                    <span>Edit message</span>
                                  </button>
                                )}

                                {/* Select */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleSelectMessage(msg._id);
                                    setIsSelectionMode(true);
                                    setActiveMenuMessageId(null);
                                  }}
                                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-purple-500/10 hover:text-purple-300 transition cursor-pointer text-left"
                                >
                                  <CheckSquare className="w-4 h-4 text-zinc-400" />
                                  <span>Select</span>
                                </button>

                                {/* Delete for me */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteForMe(msg._id);
                                    setActiveMenuMessageId(null);
                                  }}
                                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-purple-500/10 hover:text-purple-300 transition cursor-pointer text-left text-zinc-300"
                                >
                                  <Trash2 className="w-4 h-4 text-zinc-400" />
                                  <span>Delete for me</span>
                                </button>

                                {/* Delete for everyone */}
                                {isMe && !msg.isDeletedForEveryone && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm("Delete this message for everyone?")) {
                                        deleteForEveryone(msg._id);
                                      }
                                      setActiveMenuMessageId(null);
                                    }}
                                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-500/10 transition cursor-pointer text-left text-rose-400 hover:text-rose-300"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-400" />
                                    <span>Delete for everyone</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Deleted Message State */}
                        {msg.isDeletedForEveryone ? (
                          <div className="flex items-center gap-1.5 py-1 text-xs italic text-zinc-400">
                            <span className="opacity-70">🚫</span>
                            <span>This message was deleted</span>
                          </div>
                        ) : (
                          <>
                            {/* Image Attachment */}
                            {msg.image && (
                              <div className="relative rounded-xl overflow-hidden mb-1 max-w-sm group">
                                <img
                                  src={msg.image}
                                  alt="attachment"
                                  onClick={() =>
                                    setPreviewMedia({
                                      type: "image",
                                      url: msg.image,
                                      name: msg.fileName || "Photo.jpg",
                                      size: msg.fileSize,
                                    })
                                  }
                                  className="w-full h-auto object-cover max-h-72 rounded-xl cursor-pointer hover:brightness-105 transition"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/65 backdrop-blur-md p-1 rounded-xl">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewMedia({
                                        type: "image",
                                        url: msg.image,
                                        name: msg.fileName || "Photo.jpg",
                                        size: msg.fileSize,
                                      });
                                    }}
                                    className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadMedia(msg.image, msg.fileName || "Photo.jpg");
                                    }}
                                    className="w-7 h-7 rounded-lg bg-[#8b5cf6] text-white flex items-center justify-center transition cursor-pointer shadow"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Video Attachment */}
                            {msg.video && (
                              <div className="relative rounded-xl overflow-hidden mb-1 max-w-sm bg-black">
                                <video
                                  src={msg.video}
                                  controls
                                  playsInline
                                  className="w-full h-auto max-h-72 rounded-xl"
                                />
                              </div>
                            )}

                            {/* Document / File Card */}
                            {(msg.fileUrl || msg.file) && (
                              <div className="bg-black/25 p-2.5 rounded-xl flex items-center gap-3 text-white mb-1 min-w-[220px]">
                                <div className="w-9 h-9 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                                  {getDocumentIcon(msg.fileName || msg.file?.name)}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1 pr-1">
                                  <span className="font-semibold text-xs text-white truncate">
                                    {msg.fileName || msg.file?.name || "Document"}
                                  </span>
                                  <span className="text-[10px] text-zinc-300">
                                    {msg.fileSize || msg.file?.size || "Attachment"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadMedia(
                                      msg.fileUrl || msg.file?.dataUrl || msg.file,
                                      msg.fileName || msg.file?.name || "Document"
                                    )
                                  }
                                  className="w-7 h-7 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center transition cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Inline Edit Mode */}
                            {editingMessageId === msg._id ? (
                              <div className="flex flex-col gap-2 p-1 min-w-[200px]">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="bg-[#17171e] text-white text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-[#8b5cf6]"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      editMessage(msg._id, editingText);
                                      setEditingMessageId(null);
                                    } else if (e.key === "Escape") {
                                      setEditingMessageId(null);
                                    }
                                  }}
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-2 py-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      editMessage(msg._id, editingText);
                                      setEditingMessageId(null);
                                    }}
                                    className="px-3 py-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[11px] font-semibold rounded-lg cursor-pointer shadow"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Fix 2: Message Text with INLINE Timing & Status in Right Corner */
                              msg.text && (
                                <div className="break-words select-text">
                                  <span>{msg.text}</span>
                                  {/* Inline timing tag on right corner */}
                                  <span
                                    className={`float-right inline-flex items-center gap-1 pl-2.5 pt-0.5 text-[10px] select-none pointer-events-none ${
                                      isMe ? "text-purple-200" : "text-zinc-400"
                                    }`}
                                  >
                                    {msg.isEdited && (
                                      <span className="italic opacity-80 mr-0.5">
                                        Edited
                                      </span>
                                    )}
                                    <span>{msg.displayTime || "11:24"}</span>
                                    {isMe && !msg.isDeletedForEveryone && (
                                      <span className="inline-flex items-center ml-0.5">
                                        {msg.status === "read" ? (
                                          <CheckCheck
                                            className="w-3.5 h-3.5 text-[#22d3ee]"
                                            title="Read"
                                          />
                                        ) : msg.status === "delivered" ? (
                                          <CheckCheck
                                            className="w-3.5 h-3.5 text-purple-200"
                                            title="Delivered"
                                          />
                                        ) : (
                                          <Check
                                            className="w-3.5 h-3.5 text-purple-200"
                                            title="Sent"
                                          />
                                        )}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </>
                        )}

                        {/* Reaction Badge Overlapping Bottom Corner */}
                        {msg.reactions && msg.reactions.length > 0 && !msg.isDeletedForEveryone && (
                          <div
                            className={`absolute -bottom-2.5 ${
                              isMe ? "right-2" : "left-2"
                            } z-10 flex items-center gap-1`}
                          >
                            {msg.reactions.map((r, i) => {
                              const isMyReaction = String(r.userId) === String(authUser?._id);
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReaction(msg._id, r.emoji);
                                  }}
                                  title={
                                    isMyReaction
                                      ? "Click to remove reaction"
                                      : `Reacted with ${r.emoji}`
                                  }
                                  className={`flex items-center justify-center rounded-full bg-[#181820] border border-zinc-800 px-1.5 py-0.5 shadow-md text-xs hover:scale-110 active:scale-95 transition-transform cursor-pointer ${
                                    isMyReaction ? "ring-1 ring-purple-400" : ""
                                  }`}
                                >
                                  <span>{r.emoji}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} className="h-0 w-0 shrink-0" />
      </div>

      {/* 3. Media Preview Bar Before Sending */}
      {(previewImage || previewVideo || selectedFile) && (
        <div className="mx-3 sm:mx-6 p-2.5 bg-[#181820] border border-zinc-800 rounded-2xl flex items-center justify-between mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3 min-w-0">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
              />
            ) : previewVideo ? (
              <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-700/40 flex items-center justify-center shrink-0 text-purple-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#202028] border border-zinc-800 flex items-center justify-center shrink-0">
                {getDocumentIcon(selectedFile?.name, "w-6 h-6")}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {selectedFile?.name || (previewImage ? "Photo" : "Video")}
              </span>
              <span className="text-[10px] text-zinc-400">
                {selectedFile?.size || "Ready to send"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPreviewImage(null);
              setPreviewVideo(null);
              setSelectedFile(null);
            }}
            className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick emoji palette popover */}
      {showEmojiMenu && (
        <div className="absolute bottom-16 left-4 z-30 bg-[#181820] border border-zinc-800 rounded-2xl p-2.5 shadow-2xl flex items-center gap-1.5 animate-in zoom-in-90 duration-150">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputMessage((prev) => prev + emoji);
                setShowEmojiMenu(false);
              }}
              className="w-8 h-8 rounded-xl hover:bg-[#282834] flex items-center justify-center text-base hover:scale-125 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 4. Bottom Message Input Bar */}
      <footer className="p-2.5 sm:p-3 md:p-4 pb-safe bg-[#131316]/95 backdrop-blur-sm flex items-center gap-2 md:gap-3 shrink-0 relative border-t border-zinc-800/60">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
        />

        <form
          onSubmit={handleSendMessage}
          className="flex-1 bg-[#222228] rounded-full px-3.5 md:px-4 py-2 md:py-2.5 flex items-center gap-2.5 md:gap-3 border border-zinc-800/80 focus-within:border-[#8b5cf6]/70 focus-within:shadow-[0_0_16px_rgba(139,92,246,0.18)] transition-all duration-200"
        >
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            title="Insert emoji"
            className="text-zinc-400 hover:text-yellow-400 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Paperclip attachment */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach photo, video or document"
            className="text-zinc-400 hover:text-purple-400 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() && !previewImage && !previewVideo && !selectedFile}
            title="Send message"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              inputMessage.trim() || previewImage || previewVideo || selectedFile
                ? "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-md shadow-purple-900/40 hover:scale-110 active:scale-95"
                : "text-zinc-600 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          title="Help & Info"
          className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#202028] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#282834] flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer shrink-0"
        >
          <span className="text-sm font-semibold">?</span>
        </button>
      </footer>

      {/* Media Preview Modal */}
      {previewMedia && (
        <MediaPreviewModal
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </main>
  );
}
