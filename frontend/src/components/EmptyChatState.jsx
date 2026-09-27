import React from "react";
import { MessageSquare, Lock } from "lucide-react";

export default function EmptyChatState({ onOpenHelp }) {
  return (
    <main className="relative flex-1 h-full flex flex-col items-center justify-center select-none p-6 bg-[#0e0e11]">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* App Icon */}
        <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3.5">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
          BaatCheet
        </h2>

        {/* Description */}
        <p className="text-xs text-zinc-400 mt-1 max-w-[240px] leading-relaxed">
          Select a chat to begin messaging, or start a new conversation.
        </p>

        {/* Quiet Encrypted Badge */}
        <div className="mt-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-800 bg-[#141418] text-[11px] text-zinc-500 font-medium">
          <Lock className="w-3 h-3 text-zinc-500" />
          <span>End-to-end encrypted</span>
        </div>
      </div>

      {/* Floating Help Button at Bottom Right */}
      <button
        onClick={onOpenHelp}
        title="Help & Info"
        className="absolute bottom-5 right-5 w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold">?</span>
      </button>
    </main>
  );
}

