import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Smile,
  Paperclip,
  Send,
  Check,
  CheckCheck,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Download,
  Eye,
  ChevronDown,
  Copy,
  Edit3,
  Trash2,
  CheckSquare,
  Loader2,
  FileText,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import MediaPreviewModal from "./MediaPreviewModal";
import MessageItem from "./MessageItem";
import { downloadMedia, formatFileSize, getMediaType } from "../lib/downloadHelper";
import { uploadMedia } from "../lib/cloudinary";
import {
  REACTION_ICONS,
  canEditMessage,
  formatCalendarDate,
  getDocumentIcon,
} from "../lib/messageUtils";

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
    setActiveTab,
    setMediaContactFilter,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  // Message action states
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [menuOpensUpward, setMenuOpensUpward] = useState(false);
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

  // Close message menus on scroll within the message container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setActiveMenuMessageId(null);
      setActiveReactionMessageId(null);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
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

  useEffect(() => {
    return () => {
      if (selectedFile?.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
    };
  }, [selectedFile?.previewUrl]);

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

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() && !previewImage && !previewVideo && !selectedFile) return;

    try {
      setIsUploading(true);
      let uploadedUrl = null;
      let uploadedResourceType = null;

      if (selectedFile?.file) {
        const uploaded = await uploadMedia(selectedFile.file);
        uploadedUrl = uploaded.url;
        uploadedResourceType = uploaded.resourceType;
      }

      await sendMessage({
        text: inputMessage.trim(),
        image: uploadedResourceType === "image" ? uploadedUrl : null,
        video: uploadedResourceType === "video" ? uploadedUrl : null,
        file: uploadedResourceType === "auto" ? uploadedUrl : null,
        fileName: selectedFile?.name || null,
        fileSize: selectedFile?.size || null,
        fileType: selectedFile?.type || null,
      });

      setInputMessage("");
      setPreviewImage(null);
      setPreviewVideo(null);
      setSelectedFile(null);
      setShowEmojiMenu(false);
    } catch (error) {
      toast.error(error.message || "Unable to upload attachment");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = getMediaType(file.name);
    const formattedSize = formatFileSize(file.size);

    const previewUrl = mediaType === "image" || mediaType === "video"
      ? URL.createObjectURL(file)
      : null;

    setSelectedFile({
      file,
      name: file.name,
      size: formattedSize,
      type: file.type,
      previewUrl,
    });
    setPreviewImage(mediaType === "image" ? previewUrl : null);
    setPreviewVideo(mediaType === "video" ? previewUrl : null);
    e.target.value = "";
  };

  const quickEmojis = ["💜", "✨", "😂", "👍", "❤️", "🔥", "🎨", "🎉"];

  if (!selectedUser) return null;

  return (
    <main className="flex-1 min-w-0 h-full max-h-[100dvh] flex flex-col relative select-none overflow-hidden bg-[#0e0e11]">
      {/* 1. Header Bar: Multi-Select Mode vs Normal Header */}
      {isSelectionMode ? (
        <header className="h-14 md:h-15 px-3 sm:px-4 md:px-6 bg-[#141418] border-b border-[#202026] flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              title="Close selection"
              className="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-zinc-200">
              {selectedMessageIds.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteMultipleMessages(selectedMessageIds, "me")}
              disabled={selectedMessageIds.length === 0}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded-lg transition cursor-pointer border border-zinc-700/50"
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
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-xs font-medium text-rose-300 rounded-lg transition cursor-pointer border border-rose-900/50"
            >
              Delete for everyone
            </button>
          </div>
        </header>
      ) : (
        <header className="h-14 md:h-15 px-3 sm:px-4 md:px-6 bg-[#121215] border-b border-[#202026] flex items-center justify-between shrink-0 z-20 relative">
          {/* Left: Back button (mobile) + User Avatar & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile Back Button */}
            <button
              onClick={() => setSelectedUser(null)}
              title="Back to chats"
              className="md:hidden p-1.5 -ml-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 text-xs font-medium overflow-hidden">
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

            <div className="flex flex-col justify-center min-w-0 h-9 md:h-10">
              <h2
                className={`text-xs md:text-sm font-medium text-zinc-100 leading-tight truncate transition-all duration-300 ease-out ${
                  selectedUser.online ? "-translate-y-0.5" : "translate-y-0"
                }`}
              >
                {selectedUser.fullName}
              </h2>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out flex items-center gap-1.5 ${
                  selectedUser.online
                    ? "max-h-5 opacity-100 mt-0.5 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] md:text-[11px] font-normal text-zinc-400 leading-tight">
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toast("Search in conversation", { icon: "🔍" })}
              title="Search conversation"
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setMediaContactFilter(selectedUser._id);
                setActiveTab("files");
              }}
              title="Shared media & files"
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSelectionMode(true)}
              title="Select messages"
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 flex items-center justify-center transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}


      {/* 2. Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 sm:px-4 md:px-6 py-3 md:py-4 flex flex-col gap-3 scrollbar-thin overscroll-y-contain relative z-10"
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
              <div key={group.label} className="flex flex-col gap-2">
                {/* Sticky Calendar Day Divider Pill */}
                <div className="flex justify-center my-1.5 sticky top-1 z-10 pointer-events-none">
                  <span className="bg-[#18181f]/95 text-zinc-400 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-zinc-800/80">
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
                    <MessageItem
                      key={msg._id}
                      msg={msg}
                      isMe={isMe}
                      isSelectionMode={isSelectionMode}
                      isSelected={isSelected}
                      onSelect={toggleSelectMessage}
                    >
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
                            className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700/40"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>

                          {/* Reaction Icons Floating Bar */}
                          {isReactionOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute bottom-full mb-1.5 ${
                                isMe ? "right-0" : "left-0"
                              } z-40 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#18181f] border border-zinc-800 shadow-xl`}
                            >
                              {REACTION_ICONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    toggleReaction(msg._id, emoji);
                                    setActiveReactionMessageId(null);
                                  }}
                                  className="text-base hover:scale-125 transition-transform cursor-pointer p-0.5"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Bubble Container */}
                      <div
                        className={`relative rounded-2xl px-3 py-2 text-[13px] leading-relaxed max-w-[85%] sm:max-w-[75%] md:max-w-[68%] select-text transition-colors duration-150 ${
                          isMe
                            ? "bg-[#38334c] text-white rounded-tr-xs"
                            : "bg-[#1e1e24] text-zinc-100 rounded-tl-xs border border-zinc-800/60"
                        } ${isSelected ? "ring-1 ring-indigo-400/80" : ""}`}
                      >
                        {/* Downward Chevron Arrow inside bubble on hover */}
                        {!msg.isDeletedForEveryone && !isSelectionMode && (
                          <div className="absolute top-1.5 right-1.5 z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const isOpening = activeMenuMessageId !== msg._id;
                                if (isOpening) {
                                  const buttonRect = e.currentTarget.getBoundingClientRect();
                                  const containerRect = messagesContainerRef.current?.getBoundingClientRect();
                                  if (containerRect) {
                                    const spaceBelow = containerRect.bottom - buttonRect.bottom;
                                    const spaceAbove = buttonRect.top - containerRect.top;
                                    // Open upwards if near the bottom and there is more room above
                                    setMenuOpensUpward(spaceBelow < 220 && spaceAbove > spaceBelow);
                                  } else {
                                    const spaceBelow = window.innerHeight - buttonRect.bottom;
                                    setMenuOpensUpward(spaceBelow < 220);
                                  }
                                }
                                setActiveMenuMessageId(isMenuOpen ? null : msg._id);
                                setActiveReactionMessageId(null);
                              }}
                              title="Message options"
                              className={`w-5 h-5 rounded hover:bg-black/30 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer ${
                                isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute ${
                                  menuOpensUpward ? "bottom-full mb-1" : "top-6"
                                } ${
                                  isMe ? "right-0" : "left-0"
                                } z-40 w-44 rounded-xl bg-[#1c1c22] border border-zinc-800 shadow-xl py-1 text-xs text-zinc-200 flex flex-col`}
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
                                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800/80 hover:text-white transition cursor-pointer text-left"
                                  >
                                    <Copy className="w-4 h-4 text-zinc-400" />
                                    <span>Copy</span>
                                  </button>
                                )}

                                {/* Edit message (within 5 min) */}
                                {canEditMessage(msg, authUser?._id) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMessageId(msg._id);
                                      setEditingText(msg.text || "");
                                      setActiveMenuMessageId(null);
                                    }}
                                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800/80 hover:text-white transition cursor-pointer text-left"
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
                                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800/80 hover:text-white transition cursor-pointer text-left"
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
                                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800/80 hover:text-white transition cursor-pointer text-left text-zinc-300"
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
                                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/10 transition cursor-pointer text-left text-rose-400 hover:text-rose-300"
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
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/60 p-1 rounded-lg">
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
                                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadMedia(msg.image, msg.fileName || "Photo.jpg");
                                    }}
                                    className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer"
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
                              <div className="bg-black/25 p-2.5 rounded-xl flex items-center gap-3 text-white mb-1 min-w-[200px] border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                                  {getDocumentIcon(msg.fileName || msg.file?.name)}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1 pr-1">
                                  <span className="font-medium text-xs text-white truncate">
                                    {msg.fileName || msg.file?.name || "Document"}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">
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
                                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer"
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
                                  className="bg-[#17171e] text-white text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500"
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
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium rounded-lg cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Message Text with INLINE Timing & Status */
                              msg.text && (
                                <div className="break-words select-text">
                                  <span>{msg.text}</span>
                                  {/* Inline timing tag on right corner */}
                                  <span
                                    className={`float-right inline-flex items-center gap-1 pl-2.5 pt-0.5 text-[10px] select-none pointer-events-none ${
                                      isMe ? "text-zinc-300/80" : "text-zinc-500"
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
                                            className="w-3.5 h-3.5 text-sky-400"
                                            title="Read"
                                          />
                                        ) : msg.status === "delivered" ? (
                                          <CheckCheck
                                            className="w-3.5 h-3.5 text-zinc-300"
                                            title="Delivered"
                                          />
                                        ) : (
                                          <Check
                                            className="w-3.5 h-3.5 text-zinc-300"
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
                                  className={`flex items-center justify-center rounded-full bg-[#18181f] border border-zinc-800 px-1.5 py-0.5 text-xs transition cursor-pointer ${
                                    isMyReaction ? "ring-1 ring-indigo-400/60" : ""
                                  }`}
                                >
                                  <span>{r.emoji}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </MessageItem>
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
        <div className="mx-3 sm:mx-6 p-2.5 bg-[#16161b] border border-zinc-800 rounded-xl flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 min-w-0">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-11 h-11 rounded-lg object-cover border border-zinc-700 shrink-0"
              />
            ) : previewVideo ? (
              <div className="w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300">
                <ImageIcon className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                {getDocumentIcon(selectedFile?.name, "w-5 h-5")}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-white truncate">
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
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick emoji palette popover */}
      {showEmojiMenu && (
        <div className="absolute bottom-16 left-4 z-30 bg-[#18181f] border border-zinc-800 rounded-xl p-2 shadow-xl flex items-center gap-1">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputMessage((prev) => prev + emoji);
                setShowEmojiMenu(false);
              }}
              className="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-sm transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 4. Bottom Message Input Bar */}
      <footer
        className="px-3 sm:px-4 md:px-6 py-2.5 md:py-3 bg-[#121215] flex items-center gap-2 md:gap-3 shrink-0 relative border-t border-[#202026] z-20"
        style={{
          paddingTop: "0.65rem",
          paddingBottom: "max(0.65rem, calc(0.65rem + env(safe-area-inset-bottom, 0px)))",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
        />

        <form
          onSubmit={handleSendMessage}
          className="flex-1 min-h-[40px] md:min-h-[42px] bg-[#1a1a20] rounded-xl px-3.5 py-1.5 flex items-center gap-2 md:gap-2.5 border border-zinc-800/80 focus-within:border-zinc-700 transition-colors"
        >
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            title="Insert emoji"
            className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Paperclip attachment */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach photo, video or document"
            className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Message input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs md:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none py-1 leading-normal"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isUploading || (!inputMessage.trim() && !previewImage && !previewVideo && !selectedFile)}
            title="Send message"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              !isUploading && (inputMessage.trim() || previewImage || previewVideo || selectedFile)
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "text-zinc-600 cursor-not-allowed"
            }`}
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          title="Help & Info"
          className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <span className="text-xs font-semibold">?</span>
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
