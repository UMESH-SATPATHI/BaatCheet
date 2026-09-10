import React from "react";
import { X, ShieldCheck, MessageSquare, Heart, Lock, Volume2 } from "lucide-react";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#181820] border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#8b5cf6] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">BaatCheet Desktop</h3>
            <p className="text-xs text-zinc-400">Secure modern messaging</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-zinc-300">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#131317] border border-zinc-800/80">
            <ShieldCheck className="w-4 h-4 text-[#22d3ee] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">End-to-End Encrypted</span>
              Your messages and shared media are protected and private.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#131317] border border-zinc-800/80">
            <Lock className="w-4 h-4 text-[#8b5cf6] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Privacy First</span>
              Designed with state-of-the-art dark theme and zero data tracking.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#131317] border border-zinc-800/80">
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
            className="px-5 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-semibold transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
