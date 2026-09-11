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
      ]
    });
    const chatPartnerIds = messages.map((msg) => {
      return msg.senderId.toString() === loggedInUserId ?
        msg.receiverId.toString() :
        msg.senderId.toString();
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
        })
          .sort({ createdAt: -1 })
          .lean();

        let preview = "";
        if (latestMessage?.text) {
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
    });

    res.status(200).json(messages);
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
    });

    await newMessage.save();

    // Real-time socket notification if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);
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
