import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getAllContacts controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId }
      ],
      deletedFor: { $ne: req.user._id },
    });

    const chatPartnerIds = messages.map((msg) => {
      return msg.senderId.toString() === loggedInUserId
        ? msg.receiverId.toString()
        : msg.senderId.toString();
    });
    const uniqueChatPartnerIds = [...new Set(chatPartnerIds)];
    const chatPartners = await User.find({ _id: { $in: uniqueChatPartnerIds } })
      .select("-password")
      .lean();

    const chatPartnersWithPreviews = await Promise.all(
      chatPartners.map(async (chatPartner) => {
        const latestMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: chatPartner._id },
            { senderId: chatPartner._id, receiverId: loggedInUserId },
          ],
          deletedFor: { $ne: req.user._id },
        })
          .sort({ createdAt: -1 })
          .lean();

        // Count only unread messages sent by this partner to the logged-in user
        const unreadCount = await Message.countDocuments({
          senderId: chatPartner._id,
          receiverId: req.user._id,
          status: { $in: ["sent", "delivered"] },
          deletedFor: { $ne: req.user._id },
          isDeletedForEveryone: { $ne: true },
        });

        let preview = "";
        if (latestMessage?.isDeletedForEveryone) {
          preview = "🚫 This message was deleted";
        } else if (latestMessage?.text) {
          preview = latestMessage.text;
        } else if (latestMessage?.image) {
          preview = "📷 Photo";
        } else if (latestMessage?.video) {
          preview = "🎥 Video";
        } else if (latestMessage?.fileName) {
          preview = `📎 ${latestMessage.fileName}`;
        } else if (latestMessage?.fileUrl) {
          preview = "📎 Attachment";
        }

        return {
          ...chatPartner,
          lastMessage: preview,
          lastMessageAt: latestMessage?.createdAt || null,
          unreadCount,
        };
      }),
    );

    // Sort conversations with the most recent message at the top
    chatPartnersWithPreviews.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });

    res.status(200).json(chatPartnersWithPreviews);
  } catch (error) {
    console.error("Error in getChatPartners controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedFor: { $ne: myId },
    }).sort({ createdAt: 1 });

    // Mark unread messages from this partner as read
    const unreadMessages = await Message.find({
      senderId: userToChatId,
      receiverId: myId,
      status: { $ne: "read" },
    }).select("_id");

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { senderId: userToChatId, receiverId: myId, status: { $ne: "read" } },
        { status: "read" }
      );

      const partnerSocketId = getReceiverSocketId(userToChatId);
      if (partnerSocketId) {
        io.to(partnerSocketId).emit("messagesRead", {
          readerId: myId.toString(),
          messageIds: unreadMessages.map((m) => m._id.toString()),
        });
      }
    }

    // Mask deleted messages
    const sanitizedMessages = messages.map((msg) => {
      if (msg.isDeletedForEveryone) {
        return {
          ...msg,
          text: "🚫 This message was deleted",
          image: null,
          video: null,
          fileUrl: null,
          fileName: null,
          fileSize: null,
        };
      }
      return msg;
    });

    res.status(200).json(sanitizedMessages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, video, file, fileName, fileSize, fileType } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ error: "You cannot send a message to yourself" });
    }

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const cleanedText = typeof text === "string" ? text.trim() : "";

    if (!cleanedText && !image && !video && !file) {
      return res.status(400).json({ error: "Message content or attachment is required" });
    }

    let imageUrl;
    let videoUrl;
    let fileUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      imageUrl = uploadResponse.secure_url;
    }

    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video",
      });
      videoUrl = uploadResponse.secure_url;
    }

    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
      });
      fileUrl = uploadResponse.secure_url;
    }

    // Check if receiver is online to determine initial status
    const receiverSocketId = getReceiverSocketId(receiverId);
    const initialStatus = receiverSocketId ? "delivered" : "sent";

    const newMessage = new Message({
      senderId,
      receiverId,
      text: cleanedText,
      image: imageUrl,
      video: videoUrl,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      status: initialStatus,
    });

    await newMessage.save();

    // Real-time socket notification if receiver is online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage.toObject(),
        sender: {
          _id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          profilePic: req.user.profilePic,
        },
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessageForMe = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!message.deletedFor.includes(myId)) {
      message.deletedFor.push(myId);
      await message.save();
    }

    res.status(200).json({ success: true, messageId: id });
  } catch (error) {
    console.error("Error in deleteMessageForMe:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== myId.toString()) {
      return res.status(403).json({ error: "You can only delete your own messages for everyone" });
    }

    message.isDeletedForEveryone = true;
    message.text = "🚫 This message was deleted";
    message.image = null;
    message.video = null;
    message.fileUrl = null;
    message.fileName = null;
    message.fileSize = null;
    await message.save();

    const payload = {
      messageId: id,
      isDeletedForEveryone: true,
      text: "🚫 This message was deleted",
    };

    // Notify receiver and sender
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", payload);
    }
    const senderSocketId = getReceiverSocketId(myId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", payload);
    }

    res.status(200).json({ success: true, message: payload });
  } catch (error) {
    console.error("Error in deleteMessageForEveryone:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMultipleMessages = async (req, res) => {
  try {
    const { messageIds, type } = req.body;
    const myId = req.user._id;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: "No messages selected for deletion" });
    }

    if (type === "everyone") {
      // Only delete messages where sender is current user
      await Message.updateMany(
        { _id: { $in: messageIds }, senderId: myId },
        {
          isDeletedForEveryone: true,
          text: "🚫 This message was deleted",
          image: null,
          video: null,
          fileUrl: null,
          fileName: null,
          fileSize: null,
        }
      );

      // Find affected messages to notify receivers
      const affected = await Message.find({ _id: { $in: messageIds }, senderId: myId });
      affected.forEach((msg) => {
        const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageDeleted", {
            messageId: msg._id.toString(),
            isDeletedForEveryone: true,
            text: "🚫 This message was deleted",
          });
        }
      });
    } else {
      // Delete for me
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { deletedFor: myId } }
      );
    }

    res.status(200).json({ success: true, messageIds, type });
  } catch (error) {
    console.error("Error in deleteMultipleMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const myId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text cannot be empty" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== myId.toString()) {
      return res.status(403).json({ error: "You can only edit your own messages" });
    }

    if (message.isDeletedForEveryone) {
      return res.status(400).json({ error: "Cannot edit a deleted message" });
    }

    // 5-minute edit window check
    const diffMs = Date.now() - new Date(message.createdAt).getTime();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (diffMs > fiveMinutesMs) {
      return res.status(400).json({ error: "Messages can only be edited within 5 minutes of sending" });
    }

    message.text = text.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const payload = {
      messageId: id,
      text: message.text,
      isEdited: true,
      editedAt: message.editedAt,
    };

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", payload);
    }
    const senderSocketId = getReceiverSocketId(myId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageEdited", payload);
    }

    res.status(200).json({ success: true, message: payload });
  } catch (error) {
    console.error("Error in editMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const myId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ error: "Emoji is required" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === myId.toString()
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Toggle reaction off
        message.reactions.splice(existingIndex, 1);
      } else {
        // Change reaction emoji
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ userId: myId, emoji });
    }

    await message.save();

    const payload = {
      messageId: id,
      reactions: message.reactions,
    };

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", payload);
    }
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReaction", payload);
    }

    res.status(200).json({ success: true, reactions: message.reactions });
  } catch (error) {
    console.error("Error in reactToMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    const unread = await Message.find({
      senderId,
      receiverId: myId,
      status: { $ne: "read" },
    }).select("_id");

    if (unread.length > 0) {
      await Message.updateMany(
        { senderId, receiverId: myId, status: { $ne: "read" } },
        { status: "read" }
      );

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
          readerId: myId.toString(),
          messageIds: unread.map((m) => m._id.toString()),
        });
      }
    }

    res.status(200).json({ success: true, count: unread.length });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
