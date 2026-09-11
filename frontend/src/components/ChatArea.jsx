import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  X,
  Heart,
  Flame,
  ArrowLeft,
  Download,
  Eye,
  Maximize2,
  FileArchive,
  FileSpreadsheet,
  File,
  Play,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import MediaPreviewModal from "./MediaPreviewModal";
import { downloadMedia, formatFileSize, getMediaType } from "../lib/downloadHelper";

export default function ChatArea({ onOpenHelp }) {
  const { selectedUser, setSelectedUser, messages, sendMessage, addReaction, isMessageLoading } = useChatStore();
  const { authUser } = useAuthStore();

  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll strictly within messages container to prevent window horizontal scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [selectedUser?._id, selectedUser?.profilePic]);

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

    const mediaType = getMediaType(file);
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
    if (type === "pdf") return <FileText className={`${className} text-red-400`} />;
    if (type === "doc") return <FileText className={`${className} text-blue-400`} />;
    if (type === "sheet") return <FileSpreadsheet className={`${className} text-emerald-400`} />;
    if (type === "archive") return <FileArchive className={`${className} text-amber-400`} />;
    return <File className={`${className} text-purple-300`} />;
  };

  const quickEmojis = ["💜", "✨", "😂", "👍", "❤️", "🔥", "🎨", "🎉"];

  if (!selectedUser) return null;

  return (
    <main className="flex-1 min-w-0 h-full max-h-[100dvh] bg-[#131316] flex flex-col relative select-none overflow-hidden">
      {/* Header Bar */}
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
                selectedUser.initials || "PR"
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-xs md:text-sm font-semibold text-white leading-tight">
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
            onClick={() => toast("Search in chat", { icon: "🔍" })}
            title="Search conversation"
            className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-[#22222c] hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast("Voice call starting...", { icon: "📞" })}
            title="Voice Call"
            className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-[#22222c] hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast("Video call starting...", { icon: "📹" })}
            title="Video Call"
            className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-[#22222c] hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating subtle sync pill if reloading in background */}
      {isMessageLoading && messages.length > 0 && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in duration-200">
          <div className="bg-[#1f1f28]/95 backdrop-blur-md border border-zinc-800/90 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] bouncing-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] bouncing-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] bouncing-dot-3" />
            </div>
            <span className="text-[10px] font-medium text-zinc-300">Syncing...</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-6 py-3 md:py-4 flex flex-col gap-3"
      >
        {isMessageLoading && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] bouncing-dot-1" />
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] bouncing-dot-2" />
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] bouncing-dot-3" />
            </div>
            <span className="text-xs text-zinc-500 font-medium">Loading conversation...</span>
          </div>
        ) : (
          <>
            {/* Date Divider Pill */}
            <div className="flex justify-center my-1 sticky top-0 z-10 pointer-events-none">
              <span className="bg-[#202028]/90 backdrop-blur-xs text-zinc-400 text-[11px] font-medium px-3.5 py-1 rounded-full shadow-sm border border-zinc-800/60">
                Today
              </span>
            </div>

            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-zinc-500">
                <p className="text-xs font-semibold text-zinc-400">No messages yet</p>
                <p className="text-[11px] text-zinc-600 mt-1">Send a message to say hello to {selectedUser.fullName}!</p>
              </div>
            )}

            {/* Message Items */}
            {messages.map((msg) => {
              const isMe = msg.senderId === "me" || msg.senderId === authUser?._id;

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${
                    isMe ? "items-end animate-message-right" : "items-start animate-message-left"
                  }`}
                >
                  {/* Outgoing Message */}
                  {isMe ? (
                    <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                      {/* Image Attachment Preview */}
                      {msg.image && (
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 mb-1 max-w-sm group">
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
                            className="w-full h-auto object-cover max-h-72 rounded-2xl cursor-pointer hover:brightness-105 transition"
                          />
                          {/* Top-right overlay actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/65 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/10 z-10">
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
                              title="Preview image"
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
                              title="Download image"
                              className="w-7 h-7 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center transition cursor-pointer shadow-md"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs flex items-center gap-1 text-[10px] text-white font-medium select-none shadow-md pointer-events-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                            <CheckCheck className="w-3 h-3 text-[#22d3ee]" />
                          </div>
                        </div>
                      )}

                      {/* Video Attachment Preview */}
                      {msg.video && (
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 mb-1 max-w-sm group bg-black">
                          <video
                            src={msg.video}
                            controls
                            playsInline
                            className="w-full h-auto max-h-72 rounded-2xl"
                          />
                          {/* Top-right overlay actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/65 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/10 z-10">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewMedia({
                                  type: "video",
                                  url: msg.video,
                                  name: msg.fileName || "Video.mp4",
                                  size: msg.fileSize,
                                })
                              }
                              title="Fullscreen theater"
                              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadMedia(msg.video, msg.fileName || "Video.mp4")}
                              title="Download video"
                              className="w-7 h-7 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center transition cursor-pointer shadow-md"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs flex items-center gap-1 text-[10px] text-white font-medium select-none shadow-md pointer-events-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                            <CheckCheck className="w-3 h-3 text-[#22d3ee]" />
                          </div>
                        </div>
                      )}

                      {/* Document / File Card */}
                      {(msg.fileUrl || msg.file) && (
                        <div className="bg-[#8b5cf6] p-3 rounded-2xl flex items-center gap-3 text-white shadow-md shadow-purple-950/40 mb-1 min-w-[240px] max-w-sm relative pb-6 group">
                          <div className="w-10 h-10 rounded-xl bg-purple-950/40 flex items-center justify-center shrink-0">
                            {getDocumentIcon(msg.fileName || msg.file?.name)}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 pr-1">
                            <span className="font-semibold text-xs text-white truncate" title={msg.fileName || msg.file?.name || "Document"}>
                              {msg.fileName || msg.file?.name || "Document"}
                            </span>
                            <span className="text-[10px] text-purple-200">
                              {msg.fileSize || msg.file?.size || "Attachment"}
                            </span>
                          </div>
                          {/* Preview & Download action buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewMedia({
                                  type: getMediaType(msg.fileName || msg.file?.name),
                                  url: msg.fileUrl || msg.file?.dataUrl || msg.file,
                                  name: msg.fileName || msg.file?.name || "Document",
                                  size: msg.fileSize || msg.file?.size,
                                })
                              }
                              title="Preview document"
                              className="w-7 h-7 rounded-lg bg-purple-900/50 hover:bg-purple-900/80 text-white flex items-center justify-center transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                downloadMedia(
                                  msg.fileUrl || msg.file?.dataUrl || msg.file,
                                  msg.fileName || msg.file?.name || "Document"
                                )
                              }
                              title="Download document"
                              className="w-7 h-7 rounded-lg bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[10px] text-purple-200 font-medium select-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                            <CheckCheck className="w-3 h-3 text-[#22d3ee]" />
                          </div>
                        </div>
                      )}

                      {/* Text Message Bubble with Integrated Time Label */}
                      {msg.text && (
                        <div className="bg-[#8b5cf6] text-white px-3.5 py-2 rounded-2xl rounded-tr-sm text-xs leading-relaxed shadow-md shadow-purple-950/30 max-w-full overflow-hidden">
                          <span className="break-words select-text">{msg.text}</span>
                          <span className="float-right inline-flex items-center gap-1 pl-2.5 pt-1 text-[10px] text-purple-200/90 font-medium select-none pointer-events-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                            <CheckCheck className="w-3 h-3 text-[#22d3ee]" />
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Incoming Message */
                    <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                      {/* Incoming Image */}
                      {msg.image && (
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 mb-1 max-w-sm group">
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
                            className="w-full h-auto object-cover max-h-72 rounded-2xl cursor-pointer hover:brightness-105 transition"
                          />
                          {/* Top-right overlay actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/65 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/10 z-10">
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
                              title="Preview image"
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
                              title="Download image"
                              className="w-7 h-7 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center transition cursor-pointer shadow-md"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs flex items-center gap-1 text-[10px] text-white font-medium select-none shadow-md pointer-events-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                          </div>
                        </div>
                      )}

                      {/* Incoming Video */}
                      {msg.video && (
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 mb-1 max-w-sm group bg-black">
                          <video
                            src={msg.video}
                            controls
                            playsInline
                            className="w-full h-auto max-h-72 rounded-2xl"
                          />
                          {/* Top-right overlay actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/65 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/10 z-10">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewMedia({
                                  type: "video",
                                  url: msg.video,
                                  name: msg.fileName || "Video.mp4",
                                  size: msg.fileSize,
                                })
                              }
                              title="Fullscreen theater"
                              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadMedia(msg.video, msg.fileName || "Video.mp4")}
                              title="Download video"
                              className="w-7 h-7 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center transition cursor-pointer shadow-md"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs flex items-center gap-1 text-[10px] text-white font-medium select-none shadow-md pointer-events-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                          </div>
                        </div>
                      )}

                      {/* Incoming Document / File */}
                      {(msg.fileUrl || msg.file) && (
                        <div className="bg-[#24242a] border border-zinc-800/80 p-3 rounded-2xl flex items-center gap-3 text-zinc-100 shadow-md mb-1 min-w-[240px] max-w-sm relative pb-6 group">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800/90 flex items-center justify-center shrink-0 border border-zinc-700/50">
                            {getDocumentIcon(msg.fileName || msg.file?.name)}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 pr-1">
                            <span className="font-semibold text-xs text-white truncate" title={msg.fileName || msg.file?.name || "Document"}>
                              {msg.fileName || msg.file?.name || "Document"}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {msg.fileSize || msg.file?.size || "Attachment"}
                            </span>
                          </div>
                          {/* Preview & Download action buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewMedia({
                                  type: getMediaType(msg.fileName || msg.file?.name),
                                  url: msg.fileUrl || msg.file?.dataUrl || msg.file,
                                  name: msg.fileName || msg.file?.name || "Document",
                                  size: msg.fileSize || msg.file?.size,
                                })
                              }
                              title="Preview document"
                              className="w-7 h-7 rounded-lg bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                downloadMedia(
                                  msg.fileUrl || msg.file?.dataUrl || msg.file,
                                  msg.fileName || msg.file?.name || "Document"
                                )
                              }
                              title="Download document"
                              className="w-7 h-7 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center transition cursor-pointer shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[10px] text-zinc-400 font-medium select-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                          </div>
                        </div>
                      )}

                      {/* Incoming Text Bubble with Integrated Time Label */}
                      {msg.text && (
                        <div className="bg-[#24242a] text-zinc-100 px-3.5 py-2 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-sm max-w-full overflow-hidden border border-zinc-800/40">
                          <span className="break-words select-text">{msg.text}</span>
                          <span className="float-right inline-flex items-center pl-2.5 pt-1 text-[10px] text-zinc-400 font-medium select-none pointer-events-none">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                          </span>
                        </div>
                      )}

                      {/* Reactions Pill */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="mt-1 bg-[#202028] border border-zinc-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          {msg.reactions.map((emoji, i) => (
                            <span key={i} className="text-xs leading-none">
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Attachment / File Preview Bar */}
      {(previewImage || previewVideo || selectedFile) && (
        <div className="mx-3 sm:mx-6 p-2.5 bg-[#1c1c24] border border-zinc-800 rounded-2xl flex items-center justify-between mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3 min-w-0">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                onClick={() =>
                  setPreviewMedia({
                    type: "image",
                    url: previewImage,
                    name: selectedFile?.name || "Photo.jpg",
                    size: selectedFile?.size,
                  })
                }
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700 cursor-pointer hover:opacity-80 transition shrink-0"
              />
            ) : previewVideo ? (
              <div
                onClick={() =>
                  setPreviewMedia({
                    type: "video",
                    url: previewVideo,
                    name: selectedFile?.name || "Video.mp4",
                    size: selectedFile?.size,
                  })
                }
                className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-700/40 flex items-center justify-center cursor-pointer hover:opacity-80 transition shrink-0 text-cyan-400"
              >
                <Video className="w-5 h-5" />
              </div>
            ) : (
              <div
                onClick={() => {
                  if (selectedFile?.dataUrl) {
                    setPreviewMedia({
                      type: getMediaType(selectedFile.name),
                      url: selectedFile.dataUrl,
                      name: selectedFile.name,
                      size: selectedFile.size,
                    });
                  }
                }}
                className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center cursor-pointer hover:opacity-80 transition shrink-0"
              >
                {getDocumentIcon(selectedFile?.name, "w-6 h-6")}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {selectedFile?.name || (previewImage ? "Image ready to send" : previewVideo ? "Video ready to send" : "File ready to send")}
              </span>
              <span className="text-[10px] text-zinc-400">
                {selectedFile?.size || "Click send to upload"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* Quick Preview button */}
            <button
              type="button"
              onClick={() => {
                const targetUrl = previewImage || previewVideo || selectedFile?.dataUrl;
                if (targetUrl) {
                  setPreviewMedia({
                    type: previewImage ? "image" : previewVideo ? "video" : getMediaType(selectedFile?.name),
                    url: targetUrl,
                    name: selectedFile?.name || (previewImage ? "Photo.jpg" : previewVideo ? "Video.mp4" : "Attachment"),
                    size: selectedFile?.size,
                  });
                }
              }}
              title="Preview attachment"
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => {
                setPreviewImage(null);
                setPreviewVideo(null);
                setSelectedFile(null);
              }}
              title="Remove attachment"
              className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker Flyout */}
      {showEmojiMenu && (
        <div className="absolute bottom-20 left-6 bg-[#1f1f28] border border-zinc-800 rounded-2xl shadow-2xl p-2.5 flex items-center gap-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputMessage((prev) => prev + emoji);
                setShowEmojiMenu(false);
              }}
              className="w-8 h-8 rounded-xl hover:bg-[#2c2c38] flex items-center justify-center text-base hover:scale-125 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <footer className="p-3 md:p-4 pb-safe bg-[#131316]/95 backdrop-blur-sm flex items-center gap-2 md:gap-3 shrink-0 relative border-t border-zinc-800/40">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.tar,.mp3,.wav"
        />

        {/* Input Wrapper Container */}
        <form
          onSubmit={handleSendMessage}
          className="flex-1 bg-[#222228] rounded-full px-3.5 md:px-4 py-2 md:py-2.5 flex items-center gap-2.5 md:gap-3 border border-zinc-800/60 focus-within:border-[#8b5cf6]/70 focus-within:shadow-[0_0_16px_rgba(139,92,246,0.18)] transition-all duration-200"
        >
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            title="Insert emoji"
            className="text-zinc-400 hover:text-yellow-400 hover:scale-115 active:scale-90 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file, photo or video"
            className="text-zinc-400 hover:text-purple-400 hover:scale-115 active:scale-90 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() && !previewImage && !previewVideo && !selectedFile}
            title="Send message"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              inputMessage.trim() || previewImage || previewVideo || selectedFile
                ? "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-md shadow-purple-900/40 hover:shadow-purple-500/50 hover:scale-110 active:scale-95"
                : "text-zinc-600 hover:text-zinc-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom-right help button */}
        <button
          onClick={onOpenHelp}
          title="Help & Info"
          className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#202028] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#2a2a36] hover:border-purple-500/40 hover:scale-110 active:scale-90 flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer shrink-0"
        >
          <span className="text-sm font-semibold">?</span>
        </button>
      </footer>

      {/* Fullscreen Media Preview Modal */}
      {previewMedia && (
        <MediaPreviewModal
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </main>
  );
}
