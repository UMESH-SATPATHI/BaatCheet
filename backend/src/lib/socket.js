import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const getAllowedOrigins = () => {
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((u) => u.trim().replace(/\/$/, ""))
    : [];
  return ["http://localhost:5173", "http://localhost:5174", ...envOrigins].filter(Boolean);
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      const allowed = getAllowedOrigins();
      if (allowed.includes(cleanOrigin) || cleanOrigin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  },
});

// Used to store online users: { userId: socketId }
const userSocketMap = {};

export function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;

    // Asynchronously update pending messages for this user to "delivered"
    import("../models/message.model.js")
      .then(({ default: Message }) => {
        Message.find({ receiverId: userId, status: "sent" })
          .select("_id senderId")
          .then((messagesToDeliver) => {
            if (messagesToDeliver.length > 0) {
              Message.updateMany(
                { receiverId: userId, status: "sent" },
                { status: "delivered" }
              ).exec();

              // Notify each sender that their messages were delivered
              const messagesBySender = {};
              messagesToDeliver.forEach((m) => {
                const sId = m.senderId.toString();
                if (!messagesBySender[sId]) messagesBySender[sId] = [];
                messagesBySender[sId].push(m._id.toString());
              });

              Object.entries(messagesBySender).forEach(([sId, mIds]) => {
                const senderSocketId = userSocketMap[sId];
                if (senderSocketId) {
                  io.to(senderSocketId).emit("messagesDelivered", {
                    messageIds: mIds,
                  });
                }
              });
            }
          })
          .catch((err) => console.error("Error updating delivered status:", err));
      })
      .catch((err) => console.error("Error importing Message model:", err));
  }

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
