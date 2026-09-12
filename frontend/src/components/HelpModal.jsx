import React from "react";
import { X, ShieldCheck, MessageSquare, Lock, Volume2 } from "lucide-react";
import { AnimatedShinyText } from "./magicui";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-zinc-800 p-6 shadow-2xl overflow-hidden backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(24, 24, 32, 0.85)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px -10px rgba(139, 92, 246, 0.2)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer hover:bg-zinc-700"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-900/40">
            <MessageSquare className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              <AnimatedShinyText shimmerWidth={100}>
                BaatCheet Desktop
              </AnimatedShinyText>
            </h3>
            <p className="text-xs text-zinc-400">Secure modern messaging</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-zinc-300">
          <div
            className="flex items-start gap-2.5 p-3 rounded-2xl border border-zinc-800/80"
            style={{ backgroundColor: "rgba(19, 19, 23, 0.7)" }}
          >
            <ShieldCheck className="w-4 h-4 text-[#22d3ee] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">End-to-End Encrypted</span>
              Your messages and shared media are protected and private.
            </div>
          </div>

          <div
            className="flex items-start gap-2.5 p-3 rounded-2xl border border-zinc-800/80"
            style={{ backgroundColor: "rgba(19, 19, 23, 0.7)" }}
          >
            <Lock className="w-4 h-4 text-[#8b5cf6] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Privacy First</span>
              Designed with state-of-the-art dark aesthetics and zero data tracking.
            </div>
          </div>

          <div
            className="flex items-start gap-2.5 p-3 rounded-2xl border border-zinc-800/80"
            style={{ backgroundColor: "rgba(19, 19, 23, 0.7)" }}
          >
            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Sound Notifications</span>
              Toggle message sound effects anytime using the speaker icon in the bottom rail.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
