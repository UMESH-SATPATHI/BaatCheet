import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  FileText,
  Video as VideoIcon,
  Image as ImageIcon,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  File,
} from "lucide-react";
import { downloadMedia, getMediaType } from "../lib/downloadHelper";

export default function MediaPreviewModal({ media, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((prev) => Math.min(prev + 0.25, 3));
      } else if (e.key === "-") {
        setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === "0") {
        setZoomLevel(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!media || !media.url) return null;

  const detectedType = media.type || getMediaType(media.name || media.url);
  const fileName = media.name || (detectedType === "image" ? "Photo.jpg" : detectedType === "video" ? "Video.mp4" : "Attachment");

  const handleDownload = () => {
    downloadMedia(media.url, fileName);
  };

  const handleOpenExternal = () => {
    window.open(media.url, "_blank", "noopener,noreferrer");
  };

  const renderFileIcon = () => {
    switch (detectedType) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case "video":
        return <VideoIcon className="w-5 h-5 text-cyan-400" />;
      case "pdf":
      case "doc":
        return <FileText className="w-5 h-5 text-red-400" />;
      case "sheet":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case "archive":
        return <FileArchive className="w-5 h-5 text-amber-400" />;
      default:
        return <File className="w-5 h-5 text-purple-300" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Header Bar */}
      <header className="h-16 px-4 md:px-6 bg-[#121216]/90 border-b border-zinc-800/80 flex items-center justify-between shrink-0 z-10">
        {/* Left: File Info */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <div className="w-9 h-9 rounded-xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center shrink-0">
            {renderFileIcon()}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
              {fileName}
            </h3>
            {media.size && (
              <span className="text-[11px] text-zinc-400 font-medium">
                {media.size}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls for images */}
          {detectedType === "image" && (
            <div className="hidden sm:flex items-center bg-zinc-800/90 border border-zinc-700/60 rounded-xl p-0.5 mr-1">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                title="Zoom Out (-)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-semibold text-zinc-300 px-2 min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
                title="Zoom In (+)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom (0)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition cursor-pointer ml-0.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Open in new window / tab */}
          <button
            onClick={handleOpenExternal}
            title="Open in new window"
            className="w-9 h-9 rounded-xl bg-zinc-800/90 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-700 hover:scale-105 active:scale-95 flex items-center justify-center transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            title="Download file"
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-semibold shadow-md shadow-purple-900/40 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="w-9 h-9 rounded-xl bg-zinc-800/90 border border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-700 hover:scale-105 active:scale-95 flex items-center justify-center transition cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-auto">
        {detectedType === "image" ? (
          <div className="relative flex items-center justify-center max-w-full max-h-full transition-transform duration-150">
            <img
              src={media.url}
              alt={fileName}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.15s ease-out",
              }}
              className="max-w-[90vw] max-h-[78vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
            />
          </div>
        ) : detectedType === "video" ? (
          <div className="w-full max-w-4xl max-h-[80vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black border border-zinc-800">
            <video
              src={media.url}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[75vh] object-contain"
            />
          </div>
        ) : detectedType === "pdf" ? (
          <div className="w-full h-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col">
            <iframe
              src={media.url}
              title={fileName}
              className="w-full flex-1 bg-white rounded-t-xl"
            />
            <div className="p-3 bg-[#18181c] border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">{fileName}</span>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8b5cf6] text-white text-xs font-medium hover:bg-[#7c3aed] transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        ) : (
          /* General Document / Archive / Audio Preview Card */
          <div className="max-w-md w-full bg-[#18181e] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 rounded-2xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center mb-4 text-[#a78bfa]">
              {renderFileIcon()}
            </div>
            <h4 className="text-base font-semibold text-white mb-1 break-all">
              {fileName}
            </h4>
            <p className="text-xs text-zinc-400 mb-6">
              {media.size ? `File size: ${media.size}` : "Ready to download"}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleOpenExternal}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700/60 transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Open File
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
