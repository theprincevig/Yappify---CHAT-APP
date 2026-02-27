const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloud.Config.js"); // Cloudinary storage config
const asyncHandler = require("../utils/asyncHandler.js"); // Async handler for error handling
const profileController = require("../controller/profile.controller.js"); // Profile controller
const { requireProfileOwner } = require("../middleware/profile.middleware.js"); // Middleware to check if user is profile owner
const { requireAuth } = require("../middleware/auth.middleware.js"); // Middleware to check if user is authenticated
const { validateUsername } = require("../middleware/validator.middleware.js"); // Validate username rules
const upload = multer({ storage }); // Multer instance for handling profile picture uploads

// --------------------
// /me routes (shortcuts for logged-in user)
// --------------------
router
  .route("/me")
  .get(requireAuth, asyncHandler(profileController.showOwnProfile))   // Get the logged-in user's own profile
  .patch(   // Update the logged-in user's own profile (username, bio, profilePic)
    requireAuth,
    upload.single("profilePic"), // handle profile picture upload
    validateUsername, // validate username format
    asyncHandler(profileController.updateOwnProfile),
  );

// --------------------
// /:profileId routes (for viewing or updating other users' profiles)
// --------------------
router
  .route("/:userId")
  .get(requireAuth, asyncHandler(profileController.showProfile))  // View a specific user's profile by ID
  .patch(   // Update a specific user's profile (only allowed if owner)
    requireAuth,
    requireProfileOwner, // check if current user is the owner of this profile
    upload.single("profilePic"), // handle profile picture upload
    validateUsername, // validate username format
    asyncHandler(profileController.updateProfile),
  );

// Export router to use in main app
module.exports = router;
