import express from "express";
import passport from "../lib/passport.js";
import { logout, checkAuth, updateProfile, deleteAccount } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${process.env.FRONTEND_URL}/login`,
	}),
	(req, res) => res.redirect(`${process.env.FRONTEND_URL}/chat`),
);
router.post("/logout", logout);
router.delete("/delete", protectRoute, deleteAccount);

router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
