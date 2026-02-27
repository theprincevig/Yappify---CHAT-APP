// =======================
// Imports
// =======================
const { cloudinary } = require("../config/cloud.Config.js");
const User = require("../models/user.model.js");
const mongoose = require("mongoose");

// =======================
// Helpers
// =======================
const SAFE_FIELDS = "fullName username bio profilePic";

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("res.cloudinary.com")) return;

  try {
    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn("Cloudinary delete failed:", error.message);
  }
};

const applyProfileUpdates = async (user, req) => {
  const { fullName, username, bio, profilePic } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;

  if (username !== undefined && username !== user.username) {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: user._id }  // Exclude current user
    });

    if (existingUser) throw new Error("Username has been already taken");

    user.username = username.toLowerCase();
  }

  // Reset to default avatar
  if (profilePic === "/avatar.png") {
    await deleteFromCloudinary(user.profilePic);
    user.profilePic = "/avatar.png";
  }

  // New image uploaded
  if (req.file) {
    await deleteFromCloudinary(user.profilePic);
    user.profilePic = req.file.path;
  }
};

// =======================
// GET /api/users/:userId
// Public profile
// =======================
module.exports.showProfile = async (req, res) => {
  try {
    const { userId } = req.params; // ← Extract profileId from request parameters

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user id",
      });
    }

    const user = await User.findById(userId).select(SAFE_FIELDS);

    if (!user) {
      // ← If user not found
      return res.status(404).json({ success: false, error: "user not found." }); // ← Send 404 response
    }

    res.status(200).json({ success: true, user }); // ← Return found user
  } catch (error) {
    console.error("Show profile error:", error); // Would log the caught error
    res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
  }
};

// =======================
// GET /api/users/me
// Own profile
// =======================
module.exports.showOwnProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select(SAFE_FIELDS);

    if (!user) {
      // ← If user record not found
      return res.status(404).json({ success: false, error: "user not found." }); // ← Send 404 response
    }

    res.status(200).json({ success: true, user }); // ← Return the user's profile
  } catch (error) {
    console.error("Show own profile error:", error); // Would log the caught error
    res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
  }
};

// =======================
// PATCH /api/users/me
// Update own profile
// =======================
module.exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });


    await applyProfileUpdates(user, req); // ← Update fields via helper
    await user.save(); // ← Save changes

    const updateUser = await User.findById(user._id).select(SAFE_FIELDS);

    res.status(200).json({ success: true, user: updateUser }); // ← Return updated profile
  } catch (error) {
    if (error.message === "Username already taken") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    console.error("Update own profile error:", error); // Would log the caught error
    res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
  }
};

// =======================
// PATCH /api/users/:userId
// Update profile by ID (owner only)
// =======================
module.exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params; // ← Get profileId from params
    const user = await User.findById(userId); // ← Load user document by ID

    if (!user) {
      // ← If user doesn't exist
      return res.status(404).json({ success: false, error: "User not found." }); // ← Send 404
    }

    await applyProfileUpdates(user, req); // ← Update fields using helper
    await user.save(); // ← Persist changes to DB

    const updatedUser = await User.findById(userId).select(SAFE_FIELDS);

    res.status(200).json({ success: true, user: updatedUser }); // ← Return updated user
  } catch (error) {
    if (error.message === "Username already taken") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    console.error("Update profile error:", error); // Would log the caught error
    res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
  }
};
