// --------------------
// Regex: Valid usernames, emails and passwords
// --------------------
const usernameRegex = /^(?![._])(?!.*[._]{2})[a-zA-Z0-9._]{3,30}(?<![._])$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

// --------------------
// Middleware: Validate username from request body
// --------------------
module.exports.validateUsername = (req, res, next) => {
    const { username } = req.body; // Extract username from request

    // If username is not provided, skip validation (for update cases)
    if (username === undefined) {
        return next();
    }

    // Invalid username: fails regex check
    if (!usernameRegex.test(username)) {
        return res.status(400).json({
            success: false,
            error: "Invalid username format!"
        });
    }
    next();     // If it is valid → continue to next middleware/controller
};

// --------------------
// Middleware: Validate email from request body
// --------------------
module.exports.validateEmail = (req, res, next) => {
    const { email } = req.body;

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: "Invalid email format!"
        });
    }
    next();
};

// --------------------
// Middleware: Validate email from request body
// --------------------
module.exports.validatePassword = (req, res, next) => {
    const { password } = req.body;

    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            error: "Invalid password format!"
        });
    }
    next();
};
