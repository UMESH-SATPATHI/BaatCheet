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
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function ChatArea({ onOpenHelp }) {
  const { selectedUser, messages, sendMessage, addReaction, isMessageLoading } = useChatStore();
  const { authUser } = useAuthStore();

  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
    if (!inputMessage.trim() && !previewImage && !selectedFile) return;

    const payload = {
      text: inputMessage.trim(),
      image: previewImage || null,
      file: selectedFile || null,
    };

    setInputMessage("");
    setPreviewImage(null);
    setSelectedFile(null);
    setShowEmojiMenu(false);

    await sendMessage(payload);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setSelectedFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      });
      setPreviewImage(null);
    }
  };

  const quickEmojis = ["💜", "✨", "😂", "👍", "❤️", "🔥", "🎨", "🎉"];

  if (!selectedUser) return null;

  return (
    <main className="flex-1 min-w-0 h-full bg-[#131316] flex flex-col relative select-none overflow-hidden">
      {/* Header Bar */}
      <header className="h-16 px-6 bg-[#131316] border-b border-zinc-800/60 flex items-center justify-between shrink-0 z-10 relative">
        {/* Left: User Avatar & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">

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
            <h2 className="text-sm font-semibold text-white leading-tight">
              {selectedUser.fullName}
            </h2>
            <span className="text-[11px] font-medium text-[#22d3ee] leading-tight">
              {selectedUser.online ? "online" : selectedUser.statusText || "offline"}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast("Search in chat", { icon: "🔍" })}
            title="Search conversation"
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202028] flex items-center justify-center transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast("Voice call starting...", { icon: "📞" })}
            title="Voice Call"
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202028] flex items-center justify-center transition cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast("Video call starting...", { icon: "📹" })}
            title="Video Call"
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202028] flex items-center justify-center transition cursor-pointer"
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
        className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-3"
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
                    <div className="flex flex-col items-end max-w-[70%]">
                      {/* Image Attachment Preview */}
                      {msg.image && (
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 mb-1 max-w-sm group">
                          <img
                            src={msg.image}
                            alt="attachment"
                            className="w-full h-auto object-cover max-h-72 rounded-2xl"
                          />
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs flex items-center gap-1 text-[10px] text-white font-medium select-none shadow-md">
                            <span>{msg.displayTime || "12:00 PM"}</span>
                            <CheckCheck className="w-3 h-3 text-[#22d3ee]" />
                          </div>
                        </div>
                      )}

                      {/* Document / File Card */}
                      {msg.file && (
                        <div className="bg-[#8b5cf6] p-3 rounded-2xl flex items-center gap-3 text-white shadow-md shadow-purple-950/40 mb-1 min-w-[230px] relative pb-5">
                          <div className="w-10 h-10 rounded-xl bg-purple-950/40 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-semibold text-xs text-white truncate">
                              {msg.file.name || "Document.pdf"}
                            </span>
                            <span className="text-[10px] text-purple-200">
                              {msg.file.size || "2.4 MB"}
                            </span>
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
                    <div className="flex flex-col items-start max-w-[70%]">
                      {/* Incoming Image */}
                      {msg.image && (
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 mb-1 max-w-sm group">
                          <img
                            src={msg.image}
                            alt="attachment"
                            className="w-full h-auto object-cover max-h-72 rounded-2xl"
                          />
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs flex items-center gap-1 text-[10px] text-white font-medium select-none shadow-md">
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
      {(previewImage || selectedFile) && (
        <div className="mx-6 p-2.5 bg-[#1c1c24] border border-zinc-800 rounded-2xl flex items-center justify-between mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-300" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">
                {selectedFile?.name || "Image ready to send"}
              </span>
              <span className="text-[10px] text-zinc-400">
                {selectedFile?.size || "Click send to upload"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setPreviewImage(null);
              setSelectedFile(null);
            }}
            className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
      <footer className="p-4 bg-[#131316] flex items-center gap-3 shrink-0 relative">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.zip"
        />

        {/* Input Wrapper Container */}
        <form
          onSubmit={handleSendMessage}
          className="flex-1 bg-[#222228] rounded-full px-4 py-2.5 flex items-center gap-3 border border-zinc-800/60 focus-within:border-[#8b5cf6]/60 transition"
        >
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            title="Insert emoji"
            className="text-zinc-400 hover:text-zinc-200 transition cursor-pointer shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file or photo"
            className="text-zinc-400 hover:text-zinc-200 transition cursor-pointer shrink-0"
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
            disabled={!inputMessage.trim() && !previewImage && !selectedFile}
            title="Send message"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
              inputMessage.trim() || previewImage || selectedFile
                ? "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-md shadow-purple-900/40"
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
          className="w-9 h-9 rounded-full bg-[#202028] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#292934] flex items-center justify-center shadow-lg transition cursor-pointer shrink-0"
        >
          <span className="text-sm font-semibold">?</span>
        </button>
      </footer>
    </main>
  );
}
