import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getChatPartners,
  getAllContacts,
  getMessages,
  sendMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteMultipleMessages,
  editMessage,
  reactToMessage,
  markMessagesAsRead,
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);

router.post("/batch-delete", deleteMultipleMessages);
router.put("/read/:id", markMessagesAsRead);
router.put("/:id/react", reactToMessage);
router.put("/:id/edit", editMessage);
router.delete("/:id/me", deleteMessageForMe);
router.delete("/:id/everyone", deleteMessageForEveryone);

export default router;
