const express = require('express');
const router = express.Router();

const userController = require('../controller/user.js');        // User controller
const wrapAsync = require('../middleware/wrapAsync.js');        // Async wrapper for error handling
const { isLoggedIn } = require('../middleware/auth.js');        // Middleware to check if user is authenticated
const { validateUsername } = require('../middleware/validateUsername.js'); // Middleware to validate username
const authenticateLocal = require('../middleware/passportAuth.js'); // Passport local authentication middleware

// --------------------
// Check if user is logged in
// --------------------
router.get("/checkAuth", isLoggedIn, wrapAsync(userController.checkAuth));

// --------------------
// User signup
// --------------------
router.post("/signup", validateUsername, wrapAsync(userController.signupUser));

// --------------------
// User login
// --------------------
router.post("/login", authenticateLocal, wrapAsync(userController.loginUser));

// --------------------
// User logout
// --------------------
router.post("/logout", userController.logoutUser);

// --------------------
// Set fun mode after signup (protected route)
// --------------------
router.post("/set-fun-mode", isLoggedIn, wrapAsync(userController.setFunMode));

// --------------------
// Save push notification subscription (protected route)
// --------------------
router.post("/save-subscription", isLoggedIn, wrapAsync(userController.saveSubscription));

// --------------------
// Toggle notifications (only applicable for "control" mode users)
// --------------------
router.post("/toggle-notifications", isLoggedIn, wrapAsync(userController.toggleNotifications));

module.exports = router;
