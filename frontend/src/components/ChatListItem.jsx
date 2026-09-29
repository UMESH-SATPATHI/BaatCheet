import React from "react";
import { motion } from "motion/react"; // Motion is already in your package.json

export default function ChatListItem({
  chat,
  isSelected,
  onSelect,
  children,
}) {
  return (
    <motion.div
      layout
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        mass: 0.8,
      }}
      onClick={() => onSelect(chat)}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 select-none ${
        isSelected
          ? "bg-zinc-800/80 text-white"
          : "hover:bg-zinc-800/40 text-zinc-300"
      }`}
    >
      {children}
    </motion.div>
  );
}