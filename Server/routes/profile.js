const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudConfig.js');      // Cloudinary storage config
const wrapAsync = require('../middleware/wrapAsync.js');      // Async wrapper for error handling
const profileController = require('../controller/profile.js'); // Profile controller
const isOwner = require('../middleware/isOwner.js');          // Middleware to check if user is profile owner
const { isLoggedIn } = require('../middleware/auth.js');      // Middleware to check if user is authenticated
const { validateUsername } = require('../middleware/validateUsername.js'); // Validate username rules
const upload = multer({ storage });                           // Multer instance for handling profile picture uploads

// --------------------
// /me routes (shortcuts for logged-in user)
// --------------------
router.route("/me")
    // Get the logged-in user's own profile
    .get(
        isLoggedIn,
        wrapAsync(profileController.showOwnProfile)
    )
    // Update the logged-in user's own profile (username, bio, profilePic)
    .patch(
        isLoggedIn,
        upload.single("profilePic"), // handle profile picture upload
        validateUsername,            // validate username format
        wrapAsync(profileController.updateOwnProfile)
    );

// --------------------
// /:profileId routes (for viewing or updating other users' profiles)
// --------------------
router.route("/:userId")
    // View a specific user's profile by ID
    .get(
        isLoggedIn,
        wrapAsync(profileController.showProfile)
    )
    // Update a specific user's profile (only allowed if owner)
    .patch(
        isLoggedIn,
        isOwner,                     // check if current user is the owner of this profile
        upload.single("profilePic"), // handle profile picture upload
        validateUsername,            // validate username format
        wrapAsync(profileController.updateProfile)
    );

// Export router to use in main app
module.exports = router;
