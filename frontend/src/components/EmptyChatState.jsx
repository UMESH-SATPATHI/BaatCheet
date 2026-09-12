import React from "react";
import { MessageSquare, ShieldCheck } from "lucide-react";
import { Ripple, AnimatedShinyText } from "./magicui";

export default function EmptyChatState({ onOpenHelp }) {
  return (
    <main
      className="relative flex-1 h-full flex flex-col items-center justify-center select-none p-6 overflow-hidden"
      style={{
        backgroundColor: "#131316",
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.07), transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.04), transparent 45%)
        `,
      }}
    >
      {/* 1. Magic UI Ripple concentric wave animation */}
      <Ripple
        mainCircleSize={220}
        mainCircleOpacity={0.18}
        numCircles={6}
        className="opacity-80"
      />

      {/* 2. Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* App Logo Big Squircle with glowing aura */}
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] shadow-2xl shadow-purple-900/60 p-0.5 overflow-hidden">
          <div className="w-full h-full rounded-[22px] flex items-center justify-center bg-gradient-to-tr from-[#7c3aed] to-[#9333ea]">
            <MessageSquare className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        {/* Title with Magic UI Animated Shiny Text */}
        <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
          <AnimatedShinyText shimmerWidth={100}>
            BaatCheet
          </AnimatedShinyText>
        </h2>

        {/* Subtitle */}
        <p className="text-sm font-semibold text-zinc-300 mt-1">
          Select a conversation
        </p>

        {/* Secondary description */}
        <p className="text-xs text-zinc-400 mt-1 max-w-[240px] leading-relaxed">
          Choose from your existing chats or start a new one to begin messaging
        </p>

        {/* End-to-end Encrypted Pill with subtle glow */}
        <div
          className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: "rgba(28, 28, 35, 0.7)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#22d3ee] online-dot" />
          <span className="text-xs text-zinc-300 font-medium">
            End-to-end encrypted
          </span>
        </div>
      </div>

      {/* Floating Help Button at Bottom Right */}
      <button
        onClick={onOpenHelp}
        title="Help & Info"
        className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-[#1f1f26] border border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-[#282832] flex items-center justify-center shadow-lg transition cursor-pointer z-10 hover:scale-105 active:scale-95"
      >
        <span className="text-sm font-semibold">?</span>
      </button>
    </main>
  );
}
