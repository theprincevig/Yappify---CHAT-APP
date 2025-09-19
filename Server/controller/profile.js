// Import Cloudinary instance (configured in ../config/cloudConfig)
const { cloudinary } = require("../config/cloudConfig"); // ← Cloudinary helper for image deletion/upload
// Import User model (Mongoose)
const User = require("../models/user"); // ← User schema (DB model)

// --------------------
// PUBLIC VIEW (by ID)
// --------------------
module.exports.showProfile = async (req, res) => {
    try {
        let { profileId } = req.params; // ← Extract profileId from request parameters

        const user = await User.findById(profileId) // ← Fetch user by ID
            .select("fullName username bio profilePic"); // ← Only return safe fields

        if (!user) { // ← If user not found
            return res.status(404).json({ success: false, error: "user not found." }); // ← Send 404 response
        }

        res.status(200).json({ success: true, user }); // ← Return found user
    } catch (error) {
        console.error("Show profile error:", error); // ⚠️ Would log the caught error
        res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
    }
};

// --------------------
// OWN PROFILE (shortcut /me)
// --------------------
module.exports.showOwnProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._1d) // ← Fetch logged-in user by ID
            .select("fullName username bio profilePic"); // ← Only return safe fields

        if (!user) { // ← If user record not found
            return res.status(404).json({ success: false, error: "user not found." }); // ← Send 404 response
        }

        res.status(200).json({ success: true, user }); // ← Return the user's profile
    } catch (error) {
        console.error("Show own profile error:", error); // ⚠️ Would log the caught error
        res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
    }
};

// --------------------
// UPDATE PROFILE BY ID (old way)
// --------------------
module.exports.updateProfile = async (req, res) => {
    try {
        let { profileId } = req.params; // ← Get profileId from params
        const user = await User.findById(profileId); // ← Load user document by ID

        if (!user) { // ← If user doesn't exist
            return res.status(404).json({ success: false, error: "User not found." }); // ← Send 404
        }

        await updateUserFields(user, req); // ← Update fields using helper
        await user.save(); // ← Persist changes to DB

        res.status(200).json({ success: true, user }); // ← Return updated user
    } catch (error) {
        console.error("Update profile error:", error); // ⚠️ Would log the caught error
        res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
    }
};

// --------------------
// UPDATE OWN PROFILE (/me shortcut)
// --------------------
module.exports.updateOwnProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // ← Load currently logged-in user

        if (!user) { // ← If user not found
            return res.status(404).json({ success: false, error: "User not found." }); // ← Send 404
        }

        await updateUserFields(user, req); // ← Update fields via helper
        await user.save(); // ← Save changes

        res.status(200).json({ success: true, user }); // ← Return updated profile
    } catch (error) {
        console.error("Update own profile error:", error); // ⚠️ Would log the caught error
        res.status(500).json({ success: false, error: "Server Error." }); // ← Return 500 on exception
    }
};

// --------------------
// Helper function to update fields & cloudinary cleanup
// --------------------
async function updateUserFields(user, req) {
    const { fullName, username, bio, profilePic } = req.body; // ← Destructure body fields

    if (fullName !== undefined) user.fullName = fullName; // ← Update fullName if provided
    if (bio !== undefined) user.bio = bio; // ← Update bio if provided
    if (username !== undefined) user.username = username; // ← Update username if provided

    // --------------------
    // Remove profilePic if explicitly set to default
    // --------------------
    if (profilePic === "/avatar.png") { // ← If request explicitly sets default avatar
        if (user.profilePic && user.profilePic.includes("res.cloudinary.com")) { // ← If current pic is from Cloudinary
            try {
                const segments = user.profilePic.split("/"); // ← Split URL into path segments
                const publicIdWithExt = segments[segments.length - 1]; // ← Get filename with extension (e.g., abc.jpg)
                const publicId = `yappify_Chat_App/${publicIdWithExt.split(".")[0]}`; // ← Build Cloudinary public ID
                await cloudinary.uploader.destroy(publicId); // ← Delete old image from Cloudinary
            } catch (err) {
                console.warn("Cloudinary deletion warning:", err.message); // ⚠️ Would warn about delete failure
            }
        }
        user.profilePic = "/avatar.png"; // ← Reset to default avatar
    }

    // --------------------
    // Replace old profile pic if new one is uploaded
    // --------------------
    if (req.file) { // ← If a new file was uploaded in the request
        if (user.profilePic && user.profilePic.includes("res.cloudinary.com")) { // ← If there is an old Cloudinary pic
            try {
                const segments = user.profilePic.split("/"); // ← Split URL to get filename
                const publicIdWithExt = segments[segments.length - 1]; // ← Extract filename.ext
                const publicId = `yappify_Chat_App/${publicIdWithExt.split(".")[0]}`; // ← Construct public ID
                await cloudinary.uploader.destroy(publicId); // ← Delete old image from Cloudinary
            } catch (err) {
                console.warn("Cloudinary deletion warning:", err.message); // ⚠️ Would warn about delete failure
            }
        }
        user.profilePic = req.file.path; // ← Save new Cloudinary URL to user's profilePic
    }
}
