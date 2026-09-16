import React from "react";
import {
  FileText,
  FileArchive,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { getMediaType } from "./downloadHelper";

export const REACTION_ICONS = ["👍", "❤️", "😂", "😮", "😢"];

export const formatCalendarDate = (dateStr) => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return "Today";
  if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";

  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const canEditMessage = (msg, authUserId) => {
  if (!msg || msg.isDeletedForEveryone) return false;
  const isMe = msg.senderId === "me" || msg.senderId === authUserId;
  if (!isMe) return false;
  if (!msg.createdAt) return true;
  const diffMs = Date.now() - new Date(msg.createdAt).getTime();
  return diffMs <= 5 * 60 * 1000;
};

export const getDocumentIcon = (name, className = "w-5 h-5") => {
  const type = getMediaType(name);
  if (type === "pdf") return React.createElement(FileText, { className: `${className} text-rose-400` });
  if (type === "doc") return React.createElement(FileText, { className: `${className} text-blue-400` });
  if (type === "sheet") return React.createElement(FileSpreadsheet, { className: `${className} text-emerald-400` });
  if (type === "archive") return React.createElement(FileArchive, { className: `${className} text-amber-400` });
  return React.createElement(File, { className: `${className} text-purple-300` });
};
