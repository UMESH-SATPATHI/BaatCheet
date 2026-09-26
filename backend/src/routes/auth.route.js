import express from "express";
import jwt from "jsonwebtoken";
import passport from "../lib/passport.js";
import { logout, checkAuth, updateProfile, deleteAccount } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

const getFrontendUrl = () =>
	(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "baatcheet_default_secret_key";

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${getFrontendUrl()}/login`,
	}),
	(req, res) => {
		const token = jwt.sign(
			{ userId: req.user._id },
			JWT_SECRET,
			{ expiresIn: "7d" }
		);

		req.session.save((err) => {
			if (err) {
				console.error("Error saving session before redirect:", err);
			}
			res.redirect(`${getFrontendUrl()}/chat?token=${token}`);
		});
	},
);
router.post("/logout", logout);
router.delete("/delete", protectRoute, deleteAccount);

router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
