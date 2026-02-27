// Importing the User model
const User = require("../models/user.js");

// --------------------
// CHECK AUTHENTICATION STATUS
// --------------------
module.exports.session = (req, res) => {
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

        // Log the user in after signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(201).json(registeredUser);
        });

    } catch (error) {
        // Log error in server console
        console.error("Signup Error: ", error);
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
        console.error("Login Error: ", error);
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
        console.error("Logout Error: ", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --------------------
// UPDATE NOTIFICATION MODE AFTER SIGNUP
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
        if (!user) return res.status(404).json({ error: "User not found." });

        // Prevent user from changing funMode once locked
        if (user.funModeLocked) {
            return res.status(403).json({ error: "You have already selected your mode. This can't be changed." });
        }

        // Save fun mode and lock it
        user.funMode = funMode;
        user.funModeLocked = true;
        await user.save();

        return res.status(200).json({
            success: true, 
            message: "Notification mode selected successfully.", 
            funMode: user.funMode
        });

    } catch (error) {
        console.error("Error in update notification mode error: ", error);
        return res.status(500).json({ error: "Server error." });
    }
};

// --------------------
// SAVE SUBSCRIPTION (for push notifications)
// --------------------
module.exports.saveSubscription = async (req, res) => {
    try {
        const userId = req.user._id;  // Get logged-in user ID
        const { subscription, notificationsEnabled } = req.body; // Extract subscription details
        
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: "User not found" });

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
        console.error("Save subscription error: ", error);
        res.status(500).json({ error: error.message });
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

        if (!user) return res.status(404).json({ error: "User not found" });

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
        console.error("Toggle notification error: ", error);
        res.status(500).json({ error: error.message });
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

        return res.status(200).json({ success: true, message: "Password updated successfully!" });

    } catch (error) {
        console.error("Change password error: ", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
