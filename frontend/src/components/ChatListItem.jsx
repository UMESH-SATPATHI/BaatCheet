import React from "react";

export default function ChatListItem({
  chat,
  isSelected,
  onSelect,
  children,
}) {
  return (
    <div
      onClick={() => onSelect(chat)}
      className={`group flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-2xl cursor-pointer transition-colors duration-150 chat-card-interactive ${
        isSelected
          ? "bg-[#241c33] border border-[#8b5cf6]/40 shadow-sm shadow-purple-950/20"
          : "hover:bg-[#1e1e26] border border-transparent"
      }`}
    >
      {children}
    </div>
  );
}
