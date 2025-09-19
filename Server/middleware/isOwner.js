// --------------------
// Middleware: Allow only profile owner to access/modify
// --------------------
module.exports = async (req, res, next) => {
    // Compare logged-in user's ID with the profileId from URL params
    if (req.user._id.toString() !== req.params.profileId) {
        // If IDs don't match, block access
        return res.status(403).json({ success: false, error: "You are not allowed to access this profile." });
    }
    // If IDs match, allow request to continue
    next();
}
