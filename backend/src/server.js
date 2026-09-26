import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./lib/passport.js";

import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
const getAllowedOrigins = () => {
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((u) => u.trim().replace(/\/$/, ""))
    : [];
  return ["http://localhost:5173", "http://localhost:5174", ...envOrigins].filter(Boolean);
};

app.use(
  cors({
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
  })
);


const isProduction =
  process.env.NODE_ENV === "production" ||
  (process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith("https://"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      partitioned:isProduction, //Enable cross-site cookie partitioning
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", arcjetMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "BaatCheet API is running" });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});