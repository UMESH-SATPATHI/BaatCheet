import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Music,
  Download,
  Eye,
  MessageSquare,
  LayoutGrid,
  List,
  RefreshCw,
  FolderOpen,
  Filter,
  Play,
  FileSpreadsheet,
  FileArchive,
  File,
  X,
  User as UserIcon,
  HardDrive,
  Calendar,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import MediaPreviewModal from "./MediaPreviewModal";
import { downloadMedia, formatFileSize } from "../lib/downloadHelper";
import { getDocumentIcon } from "../lib/messageUtils";

export default function MediaFilesView({ onOpenHelp }) {
  const {
    allMedia,
    isMediaLoading,
    getAllMediaFiles,
    mediaFilterType,
    setMediaFilterType,
    mediaContactFilter,
    setMediaContactFilter,
    mediaSearchQuery,
    setMediaSearchQuery,
    mediaSortOrder,
    setMediaSortOrder,
    mediaViewMode,
    setMediaViewMode,
    chats,
    setSelectedUser,
    setActiveTab,
    openDownloadModal,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const [previewItem, setPreviewItem] = useState(null);

  // Fetch all media when the view mounts
  useEffect(() => {
    getAllMediaFiles(mediaContactFilter);
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: allMedia.length,
      image: 0,
      video: 0,
      doc: 0,
      audio: 0,
    };

    allMedia.forEach((item) => {
      if (item.type === "image") counts.image++;
      else if (item.type === "video") counts.video++;
      else if (item.type === "audio") counts.audio++;
      else counts.doc++;
    });

    return counts;
  }, [allMedia]);

  // Filter and sort items
  const filteredMedia = useMemo(() => {
    let result = [...allMedia];

    // 1. Filter by category
    if (mediaFilterType === "image") {
      result = result.filter((item) => item.type === "image");
    } else if (mediaFilterType === "video") {
      result = result.filter((item) => item.type === "video");
    } else if (mediaFilterType === "doc") {
      result = result.filter((item) =>
        ["pdf", "doc", "sheet", "archive", "file"].includes(item.type)
      );
    } else if (mediaFilterType === "audio") {
      result = result.filter((item) => item.type === "audio");
    }

    // 2. Filter by search query
    if (mediaSearchQuery.trim()) {
      const q = mediaSearchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(q);
        const captionMatch = item.caption?.toLowerCase().includes(q);
        const senderMatch = item.sender?.fullName?.toLowerCase().includes(q);
        const receiverMatch = item.receiver?.fullName?.toLowerCase().includes(q);
        return nameMatch || captionMatch || senderMatch || receiverMatch;
      });
    }

    // 3. Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (mediaSortOrder === "oldest") {
        return dateA - dateB;
      }
      return dateB - dateA;
    });

    return result;
  }, [allMedia, mediaFilterType, mediaSearchQuery, mediaSortOrder]);

  const handleJumpToChat = (e, item) => {
    e.stopPropagation();
    const partner = item.otherUser || (item.isSender ? item.receiver : item.sender);
    if (partner) {
      setSelectedUser(partner);
      setActiveTab("chats");
    }
  };

  const handlePreview = (e, item) => {
    e.stopPropagation();
    setPreviewItem({
      url: item.url,
      name: item.name,
      size: item.size,
      type: item.type,
    });
  };

  const handleDownload = (e, item) => {
    e.stopPropagation();
    openDownloadModal({
      url: item.url,
      name: item.name || "download",
      size: item.size,
      type: item.type,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const renderItemIcon = (type, className = "w-5 h-5") => {
    switch (type) {
      case "image":
        return <ImageIcon className={`${className} text-purple-400`} />;
      case "video":
        return <VideoIcon className={`${className} text-cyan-400`} />;
      case "audio":
        return <Music className={`${className} text-emerald-400`} />;
      case "pdf":
      case "doc":
        return <FileText className={`${className} text-rose-400`} />;
      case "sheet":
        return <FileSpreadsheet className={`${className} text-emerald-400`} />;
      case "archive":
        return <FileArchive className={`${className} text-amber-400`} />;
      default:
        return <File className={`${className} text-indigo-400`} />;
    }
  };

  return (
    <main className="flex-1 h-full max-h-[100dvh] bg-[#0e0e11] flex flex-col relative select-none overflow-hidden text-zinc-100">
      {/* 1. Header Bar */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-[#202026] bg-[#121215] shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Mobile back button & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setActiveTab("chats")}
              title="Back to chats"
              className="md:hidden p-1.5 -ml-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-400 shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-zinc-100 tracking-tight leading-tight">
                  Shared Media & Files
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700/60 shrink-0">
                  {allMedia.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight hidden sm:block">
                All photos, videos and documents shared across conversations
              </p>
            </div>
          </div>

          {/* Right Controls: Refresh & View Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => getAllMediaFiles(mediaContactFilter)}
              disabled={isMediaLoading}
              title="Refresh files"
              className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isMediaLoading ? "animate-spin text-indigo-400" : ""}`}
              />
            </button>

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-[#18181f] border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setMediaViewMode("grid")}
                title="Grid view"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                  mediaViewMode === "grid"
                    ? "bg-zinc-700 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMediaViewMode("list")}
                title="List view"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                  mediaViewMode === "list"
                    ? "bg-zinc-700 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Conversation Filter Row */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="flex-1 bg-[#18181f] rounded-lg flex items-center px-3 py-1.5 gap-2 border border-zinc-800 focus-within:border-zinc-700 transition-colors">
            <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <input
              type="text"
              value={mediaSearchQuery}
              onChange={(e) => setMediaSearchQuery(e.target.value)}
              placeholder="Search by file name or sender..."
              className="bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none w-full"
            />
            {mediaSearchQuery && (
              <button
                onClick={() => setMediaSearchQuery("")}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Conversation Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative min-w-[150px] sm:min-w-[180px]">
              <select
                value={mediaContactFilter}
                onChange={(e) => setMediaContactFilter(e.target.value)}
                className="w-full bg-[#18181f] text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-700 focus:outline-none cursor-pointer appearance-none pr-7 truncate"
              >
                <option value="all">💬 All Conversations</option>
                {chats.map((chat) => (
                  <option key={chat._id} value={chat._id}>
                    {chat.fullName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <Filter className="w-3 h-3" />
              </div>
            </div>

            {/* Sort Toggle */}
            <select
              value={mediaSortOrder}
              onChange={(e) => setMediaSortOrder(e.target.value)}
              className="bg-[#18181f] text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* 2. Media Type Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setMediaFilterType("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              mediaFilterType === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                mediaFilterType === "all"
                  ? "bg-indigo-700/80 text-white"
                  : "bg-zinc-700/60 text-zinc-400"
              }`}
            >
              {categoryCounts.all}
            </span>
          </button>

          <button
            onClick={() => setMediaFilterType("image")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              mediaFilterType === "image"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Photos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                mediaFilterType === "image"
                  ? "bg-indigo-700/80 text-white"
                  : "bg-zinc-700/60 text-zinc-400"
              }`}
            >
              {categoryCounts.image}
            </span>
          </button>

          <button
            onClick={() => setMediaFilterType("video")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              mediaFilterType === "video"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Videos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                mediaFilterType === "video"
                  ? "bg-indigo-700/80 text-white"
                  : "bg-zinc-700/60 text-zinc-400"
              }`}
            >
              {categoryCounts.video}
            </span>
          </button>

          <button
            onClick={() => setMediaFilterType("doc")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              mediaFilterType === "doc"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Documents</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                mediaFilterType === "doc"
                  ? "bg-indigo-700/80 text-white"
                  : "bg-zinc-700/60 text-zinc-400"
              }`}
            >
              {categoryCounts.doc}
            </span>
          </button>

          {categoryCounts.audio > 0 && (
            <button
              onClick={() => setMediaFilterType("audio")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                mediaFilterType === "audio"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audio</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  mediaFilterType === "audio"
                    ? "bg-indigo-700/80 text-white"
                    : "bg-zinc-700/60 text-zinc-400"
                }`}
              >
                {categoryCounts.audio}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* 3. Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
        {isMediaLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-[#16161c] rounded-xl border border-zinc-800/80 animate-pulse flex flex-col justify-end p-3 gap-2"
              >
                <div className="h-3 w-3/4 bg-zinc-800 rounded-sm" />
                <div className="h-2 w-1/2 bg-zinc-800/60 rounded-sm" />
              </div>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#1b1b22] border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 shadow-lg">
              <FolderOpen className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">No media files found</h3>
            <p className="text-xs text-zinc-400 mt-1">
              {mediaSearchQuery
                ? "No media matching your search criteria."
                : mediaContactFilter !== "all"
                ? "No media files shared in this conversation yet."
                : "Photos, videos, and documents sent in your chats will appear right here."}
            </p>
            {(mediaSearchQuery || mediaContactFilter !== "all" || mediaFilterType !== "all") && (
              <button
                onClick={() => {
                  setMediaSearchQuery("");
                  setMediaContactFilter("all");
                  setMediaFilterType("all");
                }}
                className="mt-4 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded-lg transition-colors cursor-pointer border border-zinc-700/60"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : mediaViewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredMedia.map((item) => {
              const partner =
                item.otherUser || (item.isSender ? item.receiver : item.sender);

              return (
                <div
                  key={item._id}
                  onClick={(e) => handlePreview(e, item)}
                  className="group relative bg-[#16161b] border border-zinc-800/80 hover:border-indigo-500/50 rounded-xl overflow-hidden flex flex-col transition-all duration-150 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Media Visual Area */}
                  <div className="relative aspect-4/3 sm:aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : item.type === "video" ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-black">
                        <video
                          src={item.url}
                          preload="metadata"
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Document / File Preview Thumbnail */
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#1c1c24] to-[#141419]">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mb-2 shadow-inner">
                          {renderItemIcon(item.type, "w-6 h-6")}
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-0.5 bg-zinc-800/60 rounded-md">
                          {item.type}
                        </span>
                      </div>
                    )}

                    {/* Top right Type Badge on hover or default for docs */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {item.size && (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-black/60 backdrop-blur-xs text-zinc-300 rounded border border-white/10">
                          {item.size}
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay Action Bar */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                      <button
                        onClick={(e) => handlePreview(e, item)}
                        title="Preview"
                        className="w-8 h-8 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDownload(e, item)}
                        title="Download"
                        className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {partner && (
                        <button
                          onClick={(e) => handleJumpToChat(e, item)}
                          title={`Chat with ${partner.fullName}`}
                          className="w-8 h-8 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item Metadata Footer */}
                  <div className="p-2.5 flex flex-col gap-1 min-w-0">
                    <span
                      title={item.name}
                      className="text-xs font-medium text-zinc-200 truncate group-hover:text-indigo-400 transition-colors"
                    >
                      {item.name}
                    </span>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="truncate max-w-[110px]" title={partner?.fullName}>
                        {item.isSender ? "Sent by you" : partner?.fullName || "Received"}
                      </span>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="flex flex-col gap-1 bg-[#141418] border border-zinc-800/80 rounded-xl overflow-hidden p-1.5">
            {filteredMedia.map((item) => {
              const partner =
                item.otherUser || (item.isSender ? item.receiver : item.sender);

              return (
                <div
                  key={item._id}
                  onClick={(e) => handlePreview(e, item)}
                  className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  {/* Left: Thumbnail & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        renderItemIcon(item.type, "w-5 h-5")
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                        <span className="uppercase font-semibold text-[10px] px-1 py-0.2 bg-zinc-800 rounded">
                          {item.type}
                        </span>
                        {item.size && <span>{item.size}</span>}
                        <span>•</span>
                        <span className="truncate">
                          {item.isSender ? "Sent by you" : `From ${partner?.fullName || "partner"}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Date & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-zinc-500 hidden sm:inline mr-2">
                      {formatDate(item.createdAt)}
                    </span>

                    <button
                      onClick={(e) => handlePreview(e, item)}
                      title="Preview"
                      className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/80 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDownload(e, item)}
                      title="Download"
                      className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/80 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {partner && (
                      <button
                        onClick={(e) => handleJumpToChat(e, item)}
                        title={`Open chat with ${partner.fullName}`}
                        className="w-7 h-7 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-700/80 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Help Button at Bottom Right */}
      <button
        onClick={onOpenHelp}
        title="Help & Info"
        className="absolute bottom-5 right-5 w-8 h-8 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shadow-lg"
      >
        <span className="text-xs font-semibold">?</span>
      </button>

      {/* Fullscreen Media Preview Modal */}
      {previewItem && (
        <MediaPreviewModal
          media={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </main>
  );
}
