import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findById(userId).select("-password");
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) return done(null, false);

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            authProvider: "google",
            email,
            fullName: profile.displayName || email.split("@")[0],
            profilePic: profile.photos?.[0]?.value || "",
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.authProvider = "google";
          if (!user.profilePic && profile.photos?.[0]?.value) {
            user.profilePic = profile.photos[0].value;
          }
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

export default passport;