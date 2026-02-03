// --------------------
// Load environment variables
// --------------------
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: '.env.development' });
} else {
    require('dotenv').config({ path: '.env.production' });
}

const User = require("../models/user");
const crypto = require("crypto");

// Importing the User model
const {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetSuccessEmail
} = require("../mailtrap/mails");


// --------------------
// CHECK AUTHENTICATION STATUS
// --------------------
module.exports.checkAuth = (req, res) => {
    // If user is authenticated, return user details
    if (req.isAuthenticated()) {
        return res.status(200).json({
            authenticated: true,
            user: req.user
        });
    } else {
        // If not authenticated, return null
        return res.status(200).json({
            authenticated: false,
            user: null
        });
    }
};

// --------------------
// SIGNUP USER
// --------------------
module.exports.signupUser = async (req, res, next) => {
    try {
        // Extract username, email, and password from request body
        const { username, email, password } = req.body;

        // Check if all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Create new user object
        const newUser = new User({ username, email });

        // Register new user with password
        const registeredUser = await User.register(newUser, password);

        // Generate verification token (6-digit code as string)
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save token & expiry in DB
        registeredUser.verificationToken = hashToken(code);
        registeredUser.verificationExpiresAt = Date.now() + 60 * 60 * 1000; // Token valid for 1 hour
        registeredUser.lastVerificationSentAt = Date.now(); // Track when last email was sent
        await registeredUser.save();

        // Send verification email
        await sendVerificationEmail(registeredUser.email, {
            code: code,
            username: registeredUser.username,
            expiryMinutes: 60
        });

        res.status(201).json({
            success: true,
            message: "Signup successfully! Please verify your email to activate your account.",
            user: {
                id: registeredUser._id,
                username: registeredUser.username,
                email: registeredUser.email,
                isVerified: registeredUser.isVerified
            },
        });

    } catch (error) {
        // Log error in server console
        console.error("Signup Error: ", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// EMAIL VERIFICATION
// --------------------
module.exports.verifyEmail = async (req, res, next) => {
    // Extract username and verification code from request body
    const { code } = req.body;

    try {
        // Find the user whose verification token and username match
        // and make sure the token hasn't expired yet
        const user = await User.findOne({
            verificationToken: hashToken(code),
            verificationExpiresAt: { $gt: Date.now() }
        });

        // If no valid user found, return error response
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
        }

        // Mark user as verified and clear verification fields
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpiresAt = undefined;
        user.lastVerificationSentAt = undefined;
        await user.save();

        // Send a welcome email after successful verification
        await sendWelcomeEmail(user.email, user.username);

        // Auto-login user now that they’re verified
        req.login(user, (err) => {
            if (err) return next(err);

            return res.status(200).json({
                success: true,
                message: "Email verified successfully! You can now log in.",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified
                },
            });
        });

    } catch (error) {
        // Handle unexpected server errors gracefully
        console.error("Error in verifyEmail:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// RESEND VERIFICATION EMAIL
// --------------------
module.exports.resendVerificationEmail = async (req, res) => {
    try {
        const { username, email } = req.body;

        // Find user by username and email
        const user = await User.findOne({ username, email });

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with that username and email." });        
        }

        // Prevent resending for already verified users
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email already verified!" });
        }

        // Optional cooldown: prevent spamming resend (every 30 secs)
        if (user.lastVerificationSentAt) {
            const timeSinceLast = Date.now() - user.lastVerificationSentAt;
            if (timeSinceLast < 30 * 1000) {
                const secondsLeft = Math.ceil((30 * 1000 - timeSinceLast) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${secondsLeft}s before requesting another verification email.`,
                });
            }
        }

        // Generate a new verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        user.verificationToken = hashToken(code);
        user.verificationExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour validity
        await user.save();

        // send verification email
        await sendVerificationEmail(user.email, {
            code: code,
            username: user.username,
            expiryMinutes: 60
        });

        return res.status(200).json({ success: true, message: "Verification email resent successfully." });

    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// LOGIN USER
// --------------------
module.exports.loginUser = async (req, res, next) => {
    try {
        // Extract authenticated user from passport middleware
        const user = req.authUser;  
        const info = req.authInfo;

        // If user is not found, return error
        if (!user) {
            return res.status(401).json({ success: false, message: info?.message || "Invalid username or password" });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        // Log the user in and establish a session
        req.logIn(user, (err) => {
            if (err) return next(err);

            // Only send necessary user data back to client
            const userData = {
                _id: user._id,
                username: user.username,
                email: user.email,
                funMode: user.funMode,
                notificationsEnabled: user.notificationsEnabled
            };

            return res.status(200).json({
                success: true,
                message: "Login successful",
                user: userData
            });
        });

    } catch (error) {
        // Pass error to global error handler
        next(error); 
    }
};

// --------------------
// LOGOUT USER
// --------------------
module.exports.logoutUser = (req, res, next) => {
    try {
        // Passport logout method
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({ success: true, message: "Logout Successfully!" });
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// SET FUN MODE AFTER SIGNUP
// --------------------
module.exports.updateNotifications = async (req, res) => {
    try {
        const userId = req.user._id;  // Get logged-in user ID
        const { funMode } = req.body; // Extract fun mode value

        // Only allow "fun" or "control" values
        if (!["fun", "control"].includes(funMode)) {
            return res.status(400).json({ error: "Invalid mode selected." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Prevent user from changing funMode once locked
        if (user.funModeLocked) {
            return res.status(403).json({ error: "You have already selected your mode. This can't be changed." });
        }

        // Save fun mode and lock it
        user.funMode = funMode;
        user.funModeLocked = true;
        await user.save();

        return res.status(200).json({ success: true, message: "Notification mode selected successfully.", funMode: user.funMode });

    } catch (error) {
        console.error("Error in setFunMode:", error);
        return res.status(500).json({ success: false, error: "Server error." });
    }
};

// --------------------
// SAVE SUBSCRIPTION (for push notifications)
// --------------------
module.exports.saveSubscription = async (req, res) => {
    try {
        const userId = req.user._id;  // Get logged-in user ID
        const { subscription, notificationsEnabled } = req.body; // Extract subscription details

        // console.log("📩 Received subscription:", subscription);
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Always save the subscription object
        user.notificationSubscription = subscription;

        // Fun mode = notifications always ON
        if (user.funMode === "fun") {
            user.notificationsEnabled = true;   

        // Control mode = user can enable/disable notifications
        } else if (user.funMode === "control") {
            if (typeof notificationsEnabled === "boolean") {
                user.notificationsEnabled = notificationsEnabled;
            }
        }

        await user.save();
        
        res.status(200).json({ message: "Subscription saved." });
    } catch (error) {
        console.log(`ERROR : ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// TOGGLE NOTIFICATIONS (Control mode only)
// --------------------
module.exports.toggleNotifications = async (req, res) => {
    try {
        const userId = req.user._id;   // Get logged-in user ID
        const { enabled } = req.body;  // Boolean value for notifications

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fun mode users cannot toggle notifications
        if (user.funMode === "fun") {
            res.status(400).json({ error: "Fun mode users cannot toggle notifications (always ON)" });
        }

        // Validate enabled value
        if (typeof enabled !== "boolean") {
            return res.status(400).json({ error: "enabled must be true or false" });
        }

        // Save notification preference
        user.notificationsEnabled = enabled;
        await user.save();

        res.status(200).json({
            message: `Notifications ${enabled ? "enabled" : "disabled"}.`,
            notificationsEnabled: user.notificationsEnabled
        });

    } catch (error) {
        console.log(`ERROR : ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// CHANGE PASSWORD
// --------------------
module.exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const isMatch = await user.authenticate(oldPassword);
        if (!isMatch) return res.status(400).json({ success: false, message: "Old password is incorrect." });

        await user.setPassword(newPassword);
        await user.save();

        await sendPasswordResetSuccessEmail(user.email, user.username);

        return res.status(200).json({ success: true, message: "Password updated successfully!" });

    } catch (error) {
        console.log(`ERROR : ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }

};

// --------------------
// FORGOT PASSWORD
// --------------------
module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "No account with that email found." });
        }

        // Generate a secure random reset token (40 characters)
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = Date.now() + 30 * 60 * 1000; // Token valid for 30 mins

        // Save token and expiry in user document
        user.resetPasswordToken = hashToken(resetToken);
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        // Send email with reset link
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, user.username, resetUrl);

        return res.status(200).json({
            success: true,
            message: "Password reset email sent successfully!",
        });

    } catch (error) {
        console.log(`ERROR in Forgot Password : ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// RESET PASSWORD
// --------------------
module.exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params; // Extract token from URL
        const { newPassword } = req.body; // Extract new password from request body

        const user = await User.findOne({
            resetPasswordToken: hashToken(token),
            resetPasswordExpiresAt: { $gt: Date.now() } // Ensure token is not expired
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired password reset token." });
        }

        // Set the new password using Passport's setPassword method
        await user.setPassword(newPassword);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendPasswordResetSuccessEmail(user.email, user.username);

        return res.status(200).json({ success: true, message: "Password has been reset successfully. You can now log in with your new password." });

    } catch (error) {
        console.log(`ERROR in reset Password : ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// HELPER FUNCTION FOR HASHED THE TOKENS
// --------------------
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

