import React from "react";
import { X, ShieldCheck, MessageSquare, Lock, Volume2 } from "lucide-react";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#16161b] p-5 sm:p-6 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-200">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
              BaatCheet Desktop
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Secure, quiet messaging</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-zinc-300">
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-800/80 bg-[#1c1c22]">
            <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-zinc-200 block">End-to-End Encrypted</span>
              <span className="text-zinc-400 text-[11px]">Your messages and shared media remain private.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-800/80 bg-[#1c1c22]">
            <Lock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-zinc-200 block">Privacy Focused</span>
              <span className="text-zinc-400 text-[11px]">Minimal footprint with no tracking or third-party cookies.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-800/80 bg-[#1c1c22]">
            <Volume2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-zinc-200 block">Sound Notifications</span>
              <span className="text-zinc-400 text-[11px]">Toggle sound anytime using the audio button in the sidebar.</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

