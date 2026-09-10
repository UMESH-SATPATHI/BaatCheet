import express from "express";
import passport from "../lib/passport.js";
import { logout, checkAuth, updateProfile, deleteAccount } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

const getFrontendUrl = () =>
	(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${getFrontendUrl()}/login`,
	}),
	(req, res) => res.redirect(`${getFrontendUrl()}/chat`),
);
router.post("/logout", logout);
router.delete("/delete", protectRoute, deleteAccount);

router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
