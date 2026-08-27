import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const logout = (req, res) => {
  req.logout((error) => {
    if (error) return res.status(500).json({ message: "Logout failed" });

    req.session.destroy((sessionError) => {
      if (sessionError) return res.status(500).json({ message: "Logout failed" });

      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    req.logout((logoutError) => {
      if (logoutError) {
        return res.status(500).json({ message: "Account deletion logout failed" });
      }

      req.session.destroy((sessionError) => {
        if (sessionError) {
          return res.status(500).json({ message: "Account deletion session cleanup failed" });
        }

        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Account deleted successfully" });
      });
    });
  } catch (error) {
    console.error("Error in deleteAccount controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
