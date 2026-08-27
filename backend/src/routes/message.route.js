import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getChatPartners, getAllContacts, getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);

export default router;
