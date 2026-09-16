import React from "react";
import { Check } from "lucide-react";

export default function MessageItem({
  msg,
  isMe,
  isSelectionMode,
  isSelected,
  onSelect,
  children,
}) {
  return (
    <div
      className={`group flex items-center gap-2 relative ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {isSelectionMode && (
        <button
          type="button"
          onClick={() => onSelect(msg._id)}
          aria-label={`Select message ${msg._id}`}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
            isSelected
              ? "bg-[#8b5cf6] border-[#8b5cf6] text-white"
              : "border-zinc-600 hover:border-zinc-400"
          } ${isMe ? "order-2" : "order-first"}`}
        >
          {isSelected && <Check className="w-3.5 h-3.5" />}
        </button>
      )}
      {children}
    </div>
  );
}
