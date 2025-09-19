// --------------------
// Regex: Valid usernames
// Letters, numbers, dots, underscores; length 3-30
// --------------------
const usernameRegex = /^[A-Za-z0-9._]{3,30}$/;

// --------------------
// Middleware: Validate username from request body
// --------------------
module.exports.validateUsername = (req, res, next) => {
    const { username } = req.body; // Extract username from request

    // ❌ Invalid username: empty or fails regex check
    if (!username || !usernameRegex.test(username)) {
        return res.status(400).json({
            success: false,
            error: "Invalid username. Only letters, numbers, dots (.) and underscores (_) allowed, 3-30 characters."
        });
    }

    // ✅ Username is valid → continue to next middleware/controller
    next();
};
