import React, { useEffect } from "react";
import {
  Download,
  X,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileArchive,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { downloadMedia, formatFileSize, getMediaType } from "../lib/downloadHelper";

export default function DownloadConfirmModal() {
  const { downloadModalItem, closeDownloadModal } = useChatStore();

  useEffect(() => {
    if (!downloadModalItem) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeDownloadModal();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [downloadModalItem, closeDownloadModal]);

  if (!downloadModalItem) return null;

  const { url, name, size, type } = downloadModalItem;
  const fileName = name || "download";
  const detectedType = type || getMediaType(fileName || url);

  const displaySize =
    typeof size === "number" ? formatFileSize(size) : size || null;

  const handleConfirm = () => {
    closeDownloadModal();
    downloadMedia(url, fileName);
  };

  const renderFileIcon = () => {
    switch (detectedType) {
      case "image":
        return <ImageIcon className="w-6 h-6 text-purple-400" />;
      case "video":
        return <VideoIcon className="w-6 h-6 text-cyan-400" />;
      case "audio":
        return <Music className="w-6 h-6 text-emerald-400" />;
      case "pdf":
      case "doc":
        return <FileText className="w-6 h-6 text-red-400" />;
      case "sheet":
        return <FileSpreadsheet className="w-6 h-6 text-emerald-400" />;
      case "archive":
        return <FileArchive className="w-6 h-6 text-amber-400" />;
      default:
        return <File className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDownloadModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#16161b] p-5 sm:p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={closeDownloadModal}
          title="Cancel"
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Download Icon Badge */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h3
              id="download-modal-title"
              className="text-sm sm:text-base font-semibold text-zinc-100 leading-tight"
            >
              Download File?
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Do you want to download this file to your device?
            </p>
          </div>
        </div>

        {/* File Preview Card */}
        <div className="bg-[#1c1c22] border border-zinc-800/80 rounded-xl p-3.5 flex items-center gap-3.5 my-4">
          {detectedType === "image" && url ? (
            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-700/60 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={url}
                alt={fileName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
              {renderFileIcon()}
            </div>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="text-xs sm:text-sm font-medium text-zinc-100 truncate"
              title={fileName}
            >
              {fileName}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                {detectedType}
              </span>
              {displaySize && (
                <span className="text-[11px] text-zinc-400">{displaySize}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeDownloadModal}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            autoFocus
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
