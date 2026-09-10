import React, { useState } from "react";
import { MessageSquare, HelpCircle } from "lucide-react";

export default function EmptyChatState({ onOpenHelp }) {
  return (
    <main className="flex-1 h-full bg-[#131316] flex flex-col items-center justify-center relative select-none p-6">
      {/* Center Content */}
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* App Logo Big Squircle */}
        <div className="w-20 h-20 rounded-3xl bg-[#8b5cf6] flex items-center justify-center shadow-2xl shadow-purple-900/50 mb-4 animate-in fade-in zoom-in-90 duration-300">
          <MessageSquare className="w-10 h-10 text-white fill-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white tracking-tight">BaatCheet</h2>

        {/* Subtitle */}
        <p className="text-base font-medium text-zinc-300 mt-2">
          Select a conversation
        </p>

        {/* Secondary description */}
        <p className="text-xs text-zinc-400 mt-1">
          Choose from your existing chats or start a new one
        </p>

        {/* End-to-end Encrypted Pill */}
        <div className="mt-6 flex items-center gap-2 bg-[#1c1c23] border border-zinc-800/90 px-4 py-2 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
          <span className="text-xs text-zinc-300 font-medium">
            End-to-end encrypted
          </span>
        </div>
      </div>

      {/* Floating Help Button at Bottom Right */}
      <button
        onClick={onOpenHelp}
        title="Help & Info"
        className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-[#1f1f26] border border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-[#282832] flex items-center justify-center shadow-lg transition cursor-pointer"
      >
        <span className="text-sm font-semibold">?</span>
      </button>
    </main>
  );
}
