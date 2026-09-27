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
      {isSelectionMode && !msg.isDeletedForEveryone && (
        <button
          type="button"
          onClick={() => onSelect(msg._id)}
          aria-label={`Select message ${msg._id}`}
          className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer shrink-0 ${
            isSelected
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-zinc-700 hover:border-zinc-500 bg-zinc-800/40"
          } ${isMe ? "order-2" : "order-first"}`}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </button>
      )}
      {children}
    </div>
  );
}
